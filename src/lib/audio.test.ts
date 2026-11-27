import test from 'node:test'
import assert from 'node:assert/strict'
import {
  AUDIO_PRESETS,
  amountFromForce,
  amountFromSize,
  applyCurve,
  autoGain,
  computeWaveformPeaks,
  configFromPreset,
  createFollowerState,
  createGainState,
  createOnsetState,
  detectOnset,
  easeControl,
  glide,
  isSelectedCell,
  mixChannels,
  radiusCells,
  rateFromSpeed,
  resolveCellScale,
  responseTau,
  scaleFromSignal,
  shapeCellSignal,
  sizeFromSignal,
  SNAP_HOLD_MS,
  snapHoldValue,
  type CellAudioConfig,
  type OnsetState,
} from './audio.ts'

const base: CellAudioConfig = {
  enabled: true,
  preset: 'level',
  reactTo: 'db',
  sensitivity: 50,
  minScale: 0.4,
  maxScale: 0.9,
  steps: 0,
  attack: 0,
  release: 0,
  threshold: 0,
}

test('threshold gates quiet signals to zero', () => {
  const state = createFollowerState()
  const value = shapeCellSignal(0.1, { ...base, threshold: 0.2 }, 1 / 60, state)
  assert.equal(value, 0)
})

test('the threshold is applied once, by shapeCellSignal', () => {
  // applying it again downstream squared the gate: with threshold 0.15 a raw 0.30 became 0.12 instead
  // of 0.25, and everything between 0.15 and 0.30 was swallowed
  const state = createFollowerState()
  const once = shapeCellSignal(0.3, { ...base, threshold: 0.15 }, 1 / 60, state)
  const stretched = (0.3 - 0.15) / 0.85
  assert.ok(Math.abs(once - Math.pow(stretched, 0.8)) < 1e-6, `expected one stretch, got ${once}`)
  const twice = Math.max(0, (once - 0.15) / 0.85)
  assert.ok(twice < once * 0.6, 'the double application is what we must not do again')
})

test('attack follower reaches the worked 63.2 percent point after 100 ms', () => {
  const state = createFollowerState()
  const value = shapeCellSignal(1, { ...base, attack: 0.3, sensitivity: 0 }, 0.1, state)
  // sensitivity 0 -> gamma 4, so 0.6321205588 ^ 4 = 0.159661...
  assert.ok(Math.abs(value - 0.159661) < 0.00001, `unexpected value ${value}`)
})

test('release follower falls instead of jumping to silence', () => {
  const state = createFollowerState()
  shapeCellSignal(1, { ...base, sensitivity: 37.5 }, 0.1, state)
  const value = shapeCellSignal(0, { ...base, release: 0.3, sensitivity: 37.5 }, 0.1, state)
  // sensitivity 37.5 -> gamma 1; the follower retains exp(-1) = 0.367879...
  assert.ok(Math.abs(value - 0.367879) < 0.00001, `unexpected release value ${value}`)
})

test('step quantisation lands on fixed stops', () => {
  const state = createFollowerState()
  const value = shapeCellSignal(0.5, { ...base, steps: 4 }, 1 / 60, state)
  assert.ok(Math.abs(value - 2 / 3) < 0.00001, `unexpected quantised value ${value}`)
})

test('scale mapping uses the configured range', () => {
  assert.equal(scaleFromSignal(0.5, base), 0.65)
  assert.equal(scaleFromSignal(0, base), 0.4)
  assert.equal(scaleFromSignal(1, base), 0.9)
})

test('reactivity is gated by enabled state, selection, and a filled cell', () => {
  assert.equal(resolveCellScale(null, true, base, 1), 1)
  assert.equal(resolveCellScale({ x: 2, y: 3 }, false, base, 1), 1)
  assert.equal(resolveCellScale({ x: 2, y: 3 }, true, { ...base, enabled: false }, 1), 1)
  assert.equal(resolveCellScale({ x: 2, y: 3 }, true, base, 1), 0.9)
})

test('only the exact selected cell is reactive', () => {
  assert.equal(isSelectedCell({ x: 2, y: 3 }, 2, 3), true)
  assert.equal(isSelectedCell({ x: 2, y: 3 }, 3, 3), false)
  assert.equal(isSelectedCell({ x: 2, y: 3 }, 2, 2), false)
  assert.equal(isSelectedCell(null, 2, 3), false)
})

test('waveform peaks are bounded and preserve silent buckets', () => {
  const samples = new Float32Array([0, 0.5, -1, 0.25, 0, 0, 0, 0])
  const pcm = {
    numberOfChannels: 1,
    length: samples.length,
    sampleRate: 48000,
    getChannelData: () => samples,
  }
  const peaks = computeWaveformPeaks(pcm, 4)
  assert.deepEqual(Array.from(peaks), [0.5, 1, 0, 0])
})

test('empty PCM produces a zeroed peak buffer', () => {
  const pcm = {
    numberOfChannels: 0,
    length: 0,
    sampleRate: 48000,
    getChannelData: () => new Float32Array(0),
  }
  const peaks = computeWaveformPeaks(pcm, 8)
  assert.deepEqual(Array.from(peaks), new Array(8).fill(0))
})

test('audio presets expose distinct reactions for different passages', () => {
  const keys = new Set(AUDIO_PRESETS.map((p) => p.key))
  for (const key of ['level', 'bass', 'kick', 'snare', 'hihat', 'band', 'bpm', 'snap-hold']) {
    assert.ok(keys.has(key as never), `missing preset ${key}`)
  }
})

test('signed range: 1 is the reference, below shrinks and the depth follows the range', () => {
  const shrink: [number, number] = [1, 0.5]
  assert.equal(sizeFromSignal(0, shrink), 1)
  assert.equal(sizeFromSignal(1, shrink), 0.5)
  assert.ok(amountFromSize(sizeFromSignal(1, shrink)) >= 0.99, 'a 0.5 peak reaches full depth')

  const shallow: [number, number] = [1, 0.9]
  const a = amountFromSize(sizeFromSignal(1, shallow))
  assert.ok(a > 0 && a < 0.3, `a 0.9 peak must stay shallow, got ${a}`)

  assert.equal(amountFromSize(sizeFromSignal(1, [1, 1])), 0, 'a range that ends on the reference carries nothing')
  assert.ok(amountFromSize(1.2) < 0, 'above the reference the sign flips')
})

test('a silent size below 1 still rests at zero', () => {
  const offset: [number, number] = [0.7, 0.54]
  assert.equal(amountFromSize(sizeFromSignal(0, offset), offset[0]), 0, 'silence is the zero point')
  const peak = amountFromSize(sizeFromSignal(1, offset), offset[0])
  assert.ok(peak > 0 && peak < 1, `the travel, not the offset, is the depth: ${peak}`)
  assert.equal(amountFromSize(0.7, 0.7), 0)
})

test('curve eases the signal before it becomes a size', () => {
  assert.equal(applyCurve(0.5), 0.5)
  assert.ok(applyCurve(0.5, 'exp') < 0.5)
  assert.ok(applyCurve(0.5, 'spring') > 0.5)
})

test('no curve saturates before its input does', () => {
  // a curve that reaches 1.0 early is a constant signal for everything above it, and the auto-gain
  // turns a constant into zero: exactly the "waiting for signal" in the loudest part of the track
  for (const curve of ['linear', 'exp', 'spring'] as const) {
    assert.equal(applyCurve(0, curve), 0, `${curve} at 0`)
    assert.equal(applyCurve(1, curve), 1, `${curve} at 1`)
    let prev = -1
    for (let i = 0; i <= 100; i++) {
      const y = applyCurve(i / 100, curve)
      assert.ok(y >= prev - 1e-9, `${curve} must be monotone, dipped at ${i / 100}`)
      prev = y
    }
    assert.ok(applyCurve(0.9, curve) < 0.999, `${curve} must still have room at 0.9, got ${applyCurve(0.9, curve)}`)
    assert.ok(applyCurve(0.95, curve) - applyCurve(0.85, curve) > 0.02, `${curve} must move between 0.85 and 0.95`)
  }
})

test('force is eased so the top of the slider stays playable', () => {
  assert.equal(easeControl(1), 1)
  assert.ok(Math.abs(easeControl(0.5) - Math.pow(0.5, 1.7)) < 1e-9)
  assert.ok(easeControl(0.4) < 0.25, 'four tenths of the slider must stay near a fifth of the gain')
  assert.ok(easeControl(0.4, 1) > 0.39, 'gamma 1 is linear')
})

test('global depth caps the amount, so a control at 1 is still bounded', () => {
  assert.equal(amountFromForce(0.45, 1, 1), 0.45)
  assert.ok(Math.abs(amountFromForce(0.45, 1, 0.55) - 0.2475) < 1e-9)
  assert.equal(amountFromForce(0.45, 0, 1), 0)
  assert.ok(amountFromForce(-0.6, 1, 0.5) < 0, 'sign survives the trims')
})

test('scatter caps the radius instead of letting band take the grid', () => {
  const tight = radiusCells(1, 1, 0.2)
  const wide = radiusCells(1, 1, 1)
  assert.ok(tight < wide, 'scatter widens the band')
  assert.ok(wide <= 0.9 + 2.1, `hard cap must hold, got ${wide}`)
  assert.ok(radiusCells(0, 1, 0.45) < radiusCells(1, 1, 0.45), 'silence must stay under the loud radius')
})

test('auto gain spreads the track range and ignores a flat signal', () => {
  const flat = createGainState()
  for (let i = 0; i < 400; i++) autoGain(flat, 0.6, 1 / 60)
  const flatOut = autoGain(flat, 0.6, 1 / 60)
  assert.ok(flatOut < 0.3, `a constant signal must stay near zero, got ${flatOut}`)

  const range = createGainState()
  let lo = 1, hi = 0
  for (let i = 0; i < 300; i++) {
    const v = 0.58 + 0.04 * Math.sin(i / 9)
    autoGain(range, v, 1 / 60)
  }
  for (let i = 0; i < 300; i++) {
    const v = 0.58 + 0.04 * Math.sin(i / 9)
    const out = autoGain(range, v, 1 / 60)
    lo = Math.min(lo, out); hi = Math.max(hi, out)
  }
  assert.ok(hi > 0.5, `the track range must reach the top, got ${hi}`)
  assert.ok(lo < 0.25, `and the bottom, got ${lo}`)
})

test('dense loud material still modulates: the clamp is the local peaks, not the average', () => {
  // a limited, loud mix: the level moves by 2% of full scale and nothing else. A follower that chases
  // the value closes the range onto it and the shape freezes; the window keeps the clamp on the peaks.
  const state = createGainState()
  let min = 1, max = 0
  const outs: number[] = []
  for (let i = 0; i < 600; i++) {                 // 10 s
    const v = 0.62 + 0.008 * Math.sin(i / 22)
    const out = autoGain(state, v, 1 / 60)
    if (i > 240) { outs.push(out); min = Math.min(min, out); max = Math.max(max, out) }
  }
  const mean = outs.reduce((a, b) => a + b, 0) / outs.length
  const sd = Math.sqrt(outs.reduce((s, v) => s + (v - mean) ** 2, 0) / outs.length)
  assert.ok(max - min > 0.55, `a 2% excursion must open the range, got ${(max - min).toFixed(2)}`)
  assert.ok(sd > 0.15, `and must modulate, got sd ${sd.toFixed(2)}`)
})

test('a steady signal with electrical noise is not amplified into jitter', () => {
  const state = createGainState()
  let min = 1, max = 0
  for (let i = 0; i < 900; i++) {
    const out = autoGain(state, 0.9 + 0.001 * Math.sin(i / 5), 1 / 60)
    if (i > 300) { min = Math.min(min, out); max = Math.max(max, out) }
  }
  assert.ok(max - min < 0.15, `noise below the floor must not swing the output, got ${(max - min).toFixed(2)}`)
})

test('the window forgets an intro: a loud part is normalised on its own range', () => {
  const state = createGainState()
  for (let i = 0; i < 300; i++) autoGain(state, 0.02 + 0.01 * Math.sin(i / 9), 1 / 60)   // 5 s quiet
  let min = 1, max = 0
  for (let i = 0; i < 300; i++) {
    const out = autoGain(state, 0.72 + 0.03 * Math.sin(i / 12), 1 / 60)                   // 5 s loud
    if (i > 180) { min = Math.min(min, out); max = Math.max(max, out) }
  }
  assert.ok(max > 0.6, `the loud part must reach the top of the range, got ${max.toFixed(2)}`)
  assert.ok(min < 0.2, `and use the bottom, got ${min.toFixed(2)}`)
})

test('a loud passage after a quiet one is not clipped at the top', () => {
  // the reported bug: the intro drives `hi` down, then the full section saturates at 1.0 and the
  // grid stops moving exactly where the music is loudest. A new extreme must be taken at once.
  const state = createGainState()
  for (let i = 0; i < 900; i++) autoGain(state, 0.04 + 0.01 * Math.sin(i / 7), 1 / 60)   // 15 s quiet
  const out: number[] = []
  for (let i = 0; i < 180; i++) {
    const v = i % 2 ? 0.35 : 0.85          // 3 s of dense, loud material
    out.push(autoGain(state, v, 1 / 60))
  }
  const clipped = out.filter((v) => v >= 0.999).length
  assert.ok(clipped <= 2, `the loud passage must not sit at 1.0, got ${clipped}/180 frames`)
  const mean = out.reduce((a, b) => a + b, 0) / out.length
  const sd = Math.sqrt(out.reduce((s, v) => s + (v - mean) ** 2, 0) / out.length)
  assert.ok(sd > 0.2, `the loud passage must modulate, got sd ${sd}`)
  assert.ok(mean > 0.2 && mean < 0.85, `and stay inside the range, got mean ${mean}`)
})
test('speed has a curve and response is a glide, not a jump', () => {
  assert.ok(rateFromSpeed(0) < 0.35)
  assert.ok(rateFromSpeed(1) <= 1.61, 'the top speed is fast, not frantic')
  const slow = glide(0, 1, 1 / 60, responseTau(1))
  assert.ok(slow > 0 && slow < 0.2, `a slow response must not snap, got ${slow}`)
  assert.equal(glide(0.3, 1, 1 / 60, 0), 1, 'response 0 passes through')
})

// Onset detector. The bench feeds it one frame of band energy + band flux per animation frame, so
// the tests drive it the same way: a state, a sequence of frames, the hit times that come out.
const clock = new WeakMap<OnsetState, number>()
const frames = (state: OnsetState, seq: Array<[number, number]>, level = 0.6, dt = 1 / 60) => {
  const hits: number[] = []
  let now = clock.get(state) ?? 0
  for (const [energy, flux] of seq) {
    now += dt * 1000
    if (detectOnset(state, { energy, flux, level, dt, nowMs: now })) hits.push(now)
  }
  clock.set(state, now)
  return hits
}

test('onset detector stays quiet on silence and on a constant band', () => {
  const silent = createOnsetState()
  const noLevel = frames(silent, Array.from({ length: 120 }, () => [0.6, 0.4] as [number, number]), 0)
  assert.equal(noLevel.length, 0, 'the level gate must hold a silent track')

  const flat = createOnsetState()
  const flatHits = frames(flat, Array.from({ length: 240 }, () => [0.6, 0] as [number, number]))
  // one hit when the band opens from nothing, then the baseline catches up and it stays shut
  assert.ok(flatHits.length <= 1, `a constant band must not keep firing, got ${flatHits.length}`)
})

test('an attack fires once and respects the 70 ms debounce', () => {
  const state = createOnsetState()
  frames(state, Array.from({ length: 60 }, () => [0.4, 0] as [number, number]))
  const burst = frames(state, [[0.4, 0.2], [0.4, 0.2], [0.4, 0.2]])
  assert.equal(burst.length, 1, 'the same attack twice inside the debounce is one hit')

  // a new attack after the window is a new hit
  frames(state, Array.from({ length: 8 }, () => [0.4, 0] as [number, number]))
  const later = frames(state, [[0.4, 0.2]])
  assert.equal(later.length, 1)
})

test('a fade-in with no transient still opens the envelope', () => {
  const state = createOnsetState()
  const ramp: Array<[number, number]> = []
  let prev = 0
  for (let i = 0; i < 24; i++) {           // 0.4 s, 0 -> 0.3, exactly the ambient intro
    const e = (0.3 * (i + 1)) / 24
    ramp.push([e, Math.max(0, e - prev)])
    prev = e
  }
  const hits = frames(state, ramp)
  assert.ok(hits.length >= 1, 'a swell is a hit even without a spectral attack')
  assert.ok(hits.length <= 3, `a 0.4 s fade must not stutter, got ${hits.length} hits`)
  // the pad holds: no more hits while the energy stays put
  const hold = frames(state, Array.from({ length: 120 }, () => [0.3, 0.001] as [number, number]))
  assert.equal(hold.length, 0, 'holding the level is not an entrance')
})

test('a quiet intro and a loud chorus are judged on the same relative rise', () => {
  // the ambient intro lives around 0.03 band energy (bytes ~8); the drums around 0.45.
  // The old absolute floor (flux > 0.012) could only ever fire on the loud one.
  const quiet = createOnsetState()
  frames(quiet, Array.from({ length: 40 }, () => [0.03, 0] as [number, number]))
  assert.equal(frames(quiet, [[0.03, 0.012]]).length, 1, 'a quiet band must still attack')

  const loud = createOnsetState()
  frames(loud, Array.from({ length: 40 }, () => [0.45, 0] as [number, number]))
  assert.equal(frames(loud, [[0.45, 0.2]]).length, 1, 'a loud band must attack too')

  const noise = createOnsetState()
  frames(noise, Array.from({ length: 40 }, () => [0.03, 0] as [number, number]))
  assert.equal(frames(noise, [[0.03, 0.001]]).length, 0, 'noise on a quiet band is not an attack')
})

test('the two Pulse channels mix as a weighted maximum, not an average', () => {
  assert.equal(mixChannels(1, 0, { attack: 1, sustain: 0.7 }), 1)
  assert.equal(mixChannels(0, 1, { attack: 1, sustain: 0.7 }), 0.7)
  assert.equal(mixChannels(1, 1, { attack: 1, sustain: 0.7 }), 1)
  // a quiet sustain still shows when the attack is silent, at its own weight
  assert.ok(Math.abs(mixChannels(0, 0.2, { attack: 1, sustain: 0.7 }) - 0.14) < 1e-9)
  // averaging would give 0.35 here and halve the modulation: that is the bug this guards
  assert.equal(mixChannels(0.7, 1, { attack: 0.5, sustain: 0.5 }), 0.5)
  // zero weights only lose their own channel
  assert.equal(mixChannels(0.4, 0.9, { attack: 0, sustain: 0 }), 0)
  assert.equal(mixChannels(0.4, 0.9, { attack: 1, sustain: 0 }), 0.4)
})

test('Pulse ships with two channels and the others do not', () => {
  const pulse = configFromPreset('kick')
  assert.ok(pulse.channels && pulse.channels.attack > 0 && pulse.channels.sustain > 0)
  for (const key of ['level', 'bass', 'band', 'snap-hold'] as const) {
    assert.equal(configFromPreset(key).channels, undefined, `${key} must stay single-channel`)
  }
})

test('snap & hold latches the hit and releases after the hold window', () => {
  // the value is not permanent: after SNAP_HOLD_MS it must fall back to zero, or the preset reads
  // 1.0 for the whole track and the grid never moves again
  assert.equal(snapHoldValue(true, 0.83, 0), 0.83, 'the hit is held')
  assert.equal(snapHoldValue(true, 0.83, SNAP_HOLD_MS), 0.83, 'still held at the window edge')
  assert.equal(snapHoldValue(true, 0.83, SNAP_HOLD_MS + 1), 0, 'released just after')
  assert.equal(snapHoldValue(false, 0.83, 0), 0, 'nothing is held before the first hit')
  assert.equal(snapHoldValue(true, 0.83, Infinity), 0, 'a stale timestamp cannot hold forever')
  assert.ok(SNAP_HOLD_MS > 70 && SNAP_HOLD_MS < 1000, 'the hold sits between the debounce and a beat')
})



