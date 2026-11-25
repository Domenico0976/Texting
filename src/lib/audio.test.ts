import test from 'node:test'
import assert from 'node:assert/strict'
import {
  AUDIO_PRESETS,
  computeWaveformPeaks,
  createFollowerState,
  isSelectedCell,
  resolveCellScale,
  scaleFromSignal,
  shapeCellSignal,
  type CellAudioConfig,
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
