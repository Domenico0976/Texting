// Focused browser audio engine for selected-cell reactivity.
// The public surface is intentionally small: load/transport/analysis plus pure
// signal shaping that can be tested without Web Audio.

export type ReactionKey = 'db' | 'low-freq' | 'high-freq' | 'kick' | 'snare' | 'hihat' | 'freq-band' | 'bpm' | 'snap-hold'
export type SnapTrigger = 'level' | 'kick' | 'snare' | 'hihat'
export type CellCoord = { x: number; y: number }
export type CellAudioDebug = {
  selected: CellCoord | null
  filled: boolean
  raw: number
  shaped: number
  scale: number
  enabled: boolean
  reaction: ReactionKey
  engineReady: boolean
  configEnabled: boolean
  hasSelection: boolean
  engineId: string
}

export type CellAudioConfig = {
  enabled: boolean
  preset: AudioPresetKey
  reactTo: ReactionKey
  sensitivity: number
  minScale: number
  maxScale: number
  steps: number
  wave?: 'sine' | 'saw' | 'triangle' | 'quad'
  roamSeed?: number
  roamBand?: number
  attack: number
  release: number
  threshold: number
  band?: [number, number]
  trigger?: SnapTrigger
}

export const AUDIO_PRESETS = [
  { key: 'level', label: 'Level', reactTo: 'db', hint: 'Whole-track loudness', attack: 0.05, release: 0.3, threshold: 0.08, minScale: 0.55, maxScale: 1, steps: 0 },
  { key: 'bass', label: 'Bass', reactTo: 'low-freq', hint: '20–500 Hz body', attack: 0.025, release: 0.22, threshold: 0.12, minScale: 0.5, maxScale: 1, steps: 0 },
  { key: 'kick', label: 'Kick', reactTo: 'kick', hint: '60–100 Hz transients', attack: 0.005, release: 0.18, threshold: 0.15, minScale: 0.45, maxScale: 1, steps: 0 },
  { key: 'snare', label: 'Snare', reactTo: 'snare', hint: '150–250 Hz + 2.5–3.5 kHz', attack: 0.002, release: 0.12, threshold: 0.18, minScale: 0.5, maxScale: 1, steps: 0 },
  { key: 'hihat', label: 'Hi-hat', reactTo: 'hihat', hint: '10–16 kHz transients', attack: 0.001, release: 0.07, threshold: 0.2, minScale: 0.6, maxScale: 1, steps: 0 },
  { key: 'band', label: 'Frequency band', reactTo: 'freq-band', hint: 'Custom 80–500 Hz band', attack: 0.02, release: 0.2, threshold: 0.1, minScale: 0.5, maxScale: 1, steps: 0, band: [80, 500] as [number, number] },
  { key: 'bpm', label: 'BPM', reactTo: 'bpm', hint: 'Tempo pulse', attack: 0, release: 0, threshold: 0, minScale: 0.65, maxScale: 1, steps: 0 },
  { key: 'snap-hold', label: 'Snap & hold', reactTo: 'snap-hold', hint: 'Eight held steps on kick', attack: 0, release: 0, threshold: 0, minScale: 0.4, maxScale: 1, steps: 8, trigger: 'kick' as SnapTrigger },
] as const

export type AudioPresetKey = typeof AUDIO_PRESETS[number]['key']

export function configFromPreset(key: AudioPresetKey): CellAudioConfig {
  const p = AUDIO_PRESETS.find((x) => x.key === key) ?? AUDIO_PRESETS[0]
  return {
    enabled: true,
    preset: p.key,
    reactTo: p.reactTo,
    sensitivity: 50,
    minScale: p.minScale,
    maxScale: p.maxScale,
    steps: p.steps,
    attack: p.attack,
    release: p.release,
    threshold: p.threshold,
    ...('band' in p ? { band: p.band } : {}),
    ...('trigger' in p ? { trigger: p.trigger } : {}),
  }
}

export type FollowerState = { value: number }

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const finite = (v: unknown, fallback: number) => (Number.isFinite(Number(v)) ? Number(v) : fallback)

export function createFollowerState(): FollowerState {
  return { value: 0 }
}

/** Threshold -> attack/release follower -> sensitivity curve -> optional steps. */
export function shapeCellSignal(raw: number, config: CellAudioConfig, dt: number, state: FollowerState): number {
  let v = clamp01(finite(raw, 0))
  const threshold = clamp01(finite(config.threshold, 0))
  if (threshold > 0) v = v >= threshold ? (v - threshold) / (1 - threshold) : 0

  const attack = Math.max(0, finite(config.attack, 0))
  const release = Math.max(0, finite(config.release, 0))
  const tau = v > state.value ? attack : release
  if (tau <= 0 || !(dt > 0)) state.value = v
  else state.value = clamp01(state.value + (v - state.value) * (1 - Math.exp(-dt / (tau / 3))))

  const sensitivity = Math.max(0, Math.min(100, finite(config.sensitivity, 50)))
  const gamma = 1 / (0.25 + sensitivity / 50)
  v = Math.pow(clamp01(state.value), gamma)

  const steps = Math.floor(finite(config.steps, 0))
  if (steps >= 2) v = Math.round(v * (steps - 1)) / (steps - 1)
  return clamp01(v)
}

export function scaleFromSignal(signal: number, config: CellAudioConfig): number {
  const lo = Math.max(0.05, Math.min(1, finite(config.minScale, 0.5)))
  const hi = Math.max(lo, Math.min(1, finite(config.maxScale, 1)))
  return lo + (hi - lo) * clamp01(finite(signal, 0))
}

export function isSelectedCell(selected: CellCoord | null, x: number, y: number): boolean {
  return !!selected && selected.x === x && selected.y === y
}

export function resolveCellScale(selected: CellCoord | null, filled: boolean, config: CellAudioConfig, signal: number): number {
  if (!config.enabled || !selected || !filled) return 1
  return scaleFromSignal(signal, config)
}

export type PCMData = {
  numberOfChannels: number
  length: number
  sampleRate: number
  getChannelData(channel: number): Float32Array
}

/** Peak magnitude per bucket across every channel. */
export function computeWaveformPeaks(buffer: PCMData, buckets = 512): Float32Array {
  const n = Math.max(1, Math.floor(finite(buckets, 512)))
  const out = new Float32Array(n)
  const length = Math.max(0, Math.floor(finite(buffer.length, 0)))
  const channels = Math.max(0, Math.floor(finite(buffer.numberOfChannels, 0)))
  if (!length || !channels) return out
  const data: Float32Array[] = []
  for (let c = 0; c < channels; c++) data.push(buffer.getChannelData(c))
  for (let i = 0; i < n; i++) {
    const start = Math.floor((i * length) / n)
    const end = Math.max(start + 1, Math.floor(((i + 1) * length) / n))
    let peak = 0
    for (let j = start; j < end && j < length; j++) {
      for (let c = 0; c < data.length; c++) {
        const v = Math.abs(data[c][j] || 0)
        if (v > peak) peak = v
      }
    }
    out[i] = clamp01(peak)
  }
  return out
}

const FFT_SIZE = 2048
const WAVE_SIZE = 1024
const BIN_COUNT = FFT_SIZE / 2
const HISTORY = 43
const SNAP_INDEX: Record<SnapTrigger, number> = { level: 0, kick: 1, snare: 2, hihat: 3 }
const RELEASE = [0.14, 0.12, 0.09, 0.08]

export type AudioSnapshot = {
  name: string
  duration: number
  sourceKind: 'none' | 'file'
  playing: boolean
  currentTime: number
  level: number
  low: number
  high: number
  bpm: number | null
}

export class AudioEngine {
  readonly id = Math.random().toString(36).slice(2, 8)
  private ctx: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private gain: GainNode | null = null
  private source: AudioBufferSourceNode | null = null
  private buffer: AudioBuffer | null = null
  private _peaks: Float32Array = new Float32Array(512)
  private wave = new Float32Array(WAVE_SIZE)
  private freq = new Uint8Array(BIN_COUNT)
  private prevFreq = new Uint8Array(BIN_COUNT)
  private flux = Array.from({ length: 4 }, () => new Float32Array(HISTORY))
  private fluxHead = new Int32Array(4)
  private fluxFill = new Int32Array(4)
  private env = new Float32Array(4)
  private lastOnset = new Float64Array([-1e9, -1e9, -1e9, -1e9])
  private snap = new Float32Array(4)
  private snapArmed = new Uint8Array(4)
  private onsetTimes: number[] = []
  private level = 0
  private low = 0
  private high = 0
  private binHz = 48000 / FFT_SIZE
  private bands: Int32Array[] | null = null
  private _duration = 0
  private base = 0
  private t0 = 0
  private playing = false
  private kind: 'none' | 'file' = 'none'
  private name = ''
  private wall = 0
  private lastNow: number | null = null
  private manualBpm: number | null = null
  private detectedBpm: number | null = null

  get ready() { return this.kind === 'file' && !!this.buffer }
  get sourceKind() { return this.kind }
  get duration() { return this._duration }
  get currentTime() {
    if (this.kind === 'file' && this.buffer) {
      let t = this.playing && this.ctx ? this.base + this.ctx.currentTime - this.t0 : this.base
      if (this._duration > 0) t = ((t % this._duration) + this._duration) % this._duration
      return t
    }
    return this.wall
  }
  get waveform() { return this.wave }
  get peaks() { return this._peaks }
  get bpm() { return this.manualBpm ?? this.detectedBpm }
  get isPlaying() { return this.playing }
  get snapshot(): AudioSnapshot {
    return { name: this.name, duration: this.duration, sourceKind: this.kind, playing: this.playing, currentTime: this.currentTime, level: this.level, low: this.low, high: this.high, bpm: this.bpm }
  }

  private ensureContext() {
    if (this.ctx && this.ctx.state !== 'closed') return this.ctx
    const Ctor = typeof AudioContext !== 'undefined' ? AudioContext : (typeof (globalThis as any).webkitAudioContext !== 'undefined' ? (globalThis as any).webkitAudioContext : null)
    if (!Ctor) throw new Error('Web Audio API is not available')
    const ctx = new Ctor()
    const analyser = ctx.createAnalyser()
    analyser.fftSize = FFT_SIZE
    analyser.smoothingTimeConstant = 0.8
    analyser.minDecibels = -90
    analyser.maxDecibels = -10
    const gain = ctx.createGain()
    gain.gain.value = 0
    analyser.connect(gain)
    gain.connect(ctx.destination)
    this.ctx = ctx
    this.analyser = analyser
    this.gain = gain
    this.binHz = ctx.sampleRate / FFT_SIZE
    this.bands = [
      this.range(60, 100),
      this.range(150, 250, this.range(2500, 3500)),
      this.range(10000, 16000),
      this.range(40, 12000),
    ]
    return ctx
  }

  async loadFile(file: Blob & { name?: string }) {
    if (!file || typeof file.arrayBuffer !== 'function') throw new TypeError('AudioEngine.loadFile: a File or Blob is required')
    this.stop()
    const ctx = this.ensureContext()
    let buffer: AudioBuffer
    try { buffer = await ctx.decodeAudioData(await file.arrayBuffer()) }
    catch { this.resetSource(); throw new Error('Could not decode audio') }
    this.buffer = buffer
    this._peaks = computeWaveformPeaks(buffer, 512)
    this.name = file.name || 'audio'
    this._duration = buffer.duration || 0
    this.kind = 'file'
    this.base = 0
    this.resetAnalysis()
    return { name: this.name, duration: this.duration }
  }

  play() {
    if (!this.buffer) return
    const ctx = this.ensureContext()
    void ctx.resume?.()
    this.stopSource()
    const source = ctx.createBufferSource()
    source.buffer = this.buffer
    source.loop = true
    source.connect(this.analyser!)
    source.start(0, this._duration > 0 ? this.base % this._duration : this.base)
    this.source = source
    this.t0 = ctx.currentTime
    this.playing = true
    if (this.gain) this.gain.gain.value = 1
  }

  pause() {
    if (!this.playing) return
    this.base = this.currentTime
    this.stopSource()
    this.playing = false
    if (this.gain) this.gain.gain.value = 0
  }

  seek(seconds: number) {
    if (!this.buffer) return
    let t = finite(seconds, 0)
    if (t < 0) t = 0
    if (this._duration > 0) t %= this._duration
    this.base = t
    if (this.playing) this.play()
  }

  setManualBpm(bpm: number | null) {
    const n = Number(bpm)
    this.manualBpm = bpm == null || !Number.isFinite(n) || n <= 0 ? null : Math.round(Math.max(20, Math.min(400, n)) * 10) / 10
  }

  update(nowMs: number) {
    const dt = this.lastNow == null ? 1 / 60 : Math.max(0, Math.min(0.25, (nowMs - this.lastNow) / 1000))
    this.lastNow = nowMs
    this.wall += dt
    if (!this.analyser) { this.decay(dt); return }

    this.analyser.getFloatTimeDomainData(this.wave)
    let sum = 0
    for (let i = 0; i < this.wave.length; i++) sum += this.wave[i] * this.wave[i]
    const rms = Math.sqrt(sum / this.wave.length)
    const db = 20 * Math.log10(rms + 1e-9)
    const levelTarget = clamp01((db + 60) / 60)
    this.analyser.getByteFrequencyData(this.freq)

    const bands = this.bands!
    const hitK = this.detect(0, this.fluxFor(bands[0]), nowMs, 0.012, levelTarget)
    const hitS = this.detect(1, this.fluxFor(bands[1]), nowMs, 0.008, levelTarget)
    const hitH = this.detect(2, this.fluxFor(bands[2]), nowMs, 0.006, levelTarget)
    const hitL = this.detect(3, this.fluxFor(bands[3]), nowMs, 0.004, levelTarget)
    this.prevFreq.set(this.freq)

    this.level = approach(this.level, levelTarget, dt, 0.05, 0.28)
    this.low = approach(this.low, this.bandLevel(20, 500), dt, 0.04, 0.2)
    this.high = approach(this.high, this.bandLevel(500, Math.min(20000, this.ctx!.sampleRate / 2)), dt, 0.04, 0.2)
    for (let i = 0; i < 4; i++) {
      const hit = i === 0 ? hitK : i === 1 ? hitS : i === 2 ? hitH : hitL
      this.env[i] = hit ? 1 : this.env[i] * Math.exp(-dt / RELEASE[i])
      if (hit) {
        this.lastOnset[i] = nowMs
        this.snap[i] = Math.random()
        this.snapArmed[i] = 1
      }
    }
    if (hitL) this.pushOnset(nowMs / 1000)
  }

  value(key: ReactionKey, opts: { band?: [number, number]; trigger?: SnapTrigger } = {}) {
    switch (key) {
      case 'db': return this.level
      case 'low-freq': return this.low
      case 'high-freq': return this.high
      case 'kick': return this.env[0]
      case 'snare': return this.env[1]
      case 'hihat': return this.env[2]
      case 'freq-band': return this.bandLevel(opts.band?.[0] ?? 20, opts.band?.[1] ?? 500)
      case 'bpm': return this.bpmPulse()
      case 'snap-hold': {
        const i = SNAP_INDEX[opts.trigger ?? 'level']
        return this.snapArmed[i] ? this.snap[i] : 0
      }
      default: return 0
    }
  }

  stop() {
    this.stopSource()
    this.playing = false
    if (this.gain) this.gain.gain.value = 0
    try { this.analyser?.disconnect() } catch { /* already disconnected */ }
    try { this.gain?.disconnect() } catch { /* already disconnected */ }
    try { void this.ctx?.close() } catch { /* already closed */ }
    this.ctx = null
    this.analyser = null
    this.gain = null
    this.bands = null
    this.resetSource()
    this.resetAnalysis()
  }

  private stopSource() {
    if (!this.source) return
    try { this.source.stop() } catch { /* already stopped */ }
    try { this.source.disconnect() } catch { /* already disconnected */ }
    this.source = null
  }

  private resetSource() {
    this.buffer = null
    this._peaks = new Float32Array(512)
    this._duration = 0
    this.base = 0
    this.kind = 'none'
    this.name = ''
  }

  private resetAnalysis() {
    this.level = this.low = this.high = 0
    this.env.fill(0)
    this.wave.fill(0)
    this.freq.fill(0)
    this.prevFreq.fill(0)
    this.snap.fill(0)
    this.snapArmed.fill(0)
    this.onsetTimes.length = 0
    this.detectedBpm = null
    this.fluxHead.fill(0)
    this.fluxFill.fill(0)
    for (const h of this.flux) h.fill(0)
    this.lastOnset.fill(-1e9)
    this.lastNow = null
  }

  private decay(dt: number) {
    this.level = approach(this.level, 0, dt, 0.05, 0.28)
    this.low = approach(this.low, 0, dt, 0.04, 0.2)
    this.high = approach(this.high, 0, dt, 0.04, 0.2)
    for (let i = 0; i < 4; i++) this.env[i] *= Math.exp(-dt / RELEASE[i])
    this.wave.fill(0)
  }

  private range(lo: number, hi: number, extra?: Int32Array) {
    let a = Math.max(1, Math.floor(lo / this.binHz))
    let b = Math.min(BIN_COUNT, Math.ceil(hi / this.binHz))
    if (b <= a) b = Math.min(BIN_COUNT, a + 1)
    const out = new Int32Array(extra ? [a, b, extra[0], extra[1]] : [a, b])
    return out
  }

  private bandLevel(lo: number, hi: number) {
    if (!this.analyser) return 0
    const band = this.range(lo, hi)
    let sum = 0
    for (let i = band[0]; i < band[1]; i++) sum += this.freq[i]
    return sum / ((band[1] - band[0]) * 255)
  }

  private fluxFor(band: Int32Array) {
    let sum = 0, n = 0
    for (let k = 0; k + 1 < band.length; k += 2) {
      for (let i = band[k]; i < band[k + 1]; i++) {
        const d = this.freq[i] - this.prevFreq[i]
        if (d > 0) sum += d
        n++
      }
    }
    return n ? sum / (255 * n) : 0
  }

  private detect(index: number, flux: number, nowMs: number, floor: number, gateLevel: number) {
    const hist = this.flux[index]
    const fill = this.fluxFill[index]
    const head = this.fluxHead[index]
    let mean = 0
    for (let i = 0; i < fill; i++) mean += hist[i]
    if (fill) mean /= fill
    let variance = 0
    for (let i = 0; i < fill; i++) variance += (hist[i] - mean) ** 2
    const sd = fill ? Math.sqrt(variance / fill) : 0
    hist[head] = flux
    this.fluxHead[index] = (head + 1) % HISTORY
    if (fill < HISTORY) this.fluxFill[index] = fill + 1
    if (fill < 9 || flux <= floor || gateLevel <= 0.03 || flux <= mean + 1.5 * sd || flux <= mean * 1.35) return false
    if (nowMs - this.lastOnset[index] < 90) return false
    return true
  }

  private pushOnset(time: number) {
    this.onsetTimes.push(time)
    if (this.onsetTimes.length > 12) this.onsetTimes.shift()
    if (this.onsetTimes.length < 4) return
    const intervals: number[] = []
    for (let i = 1; i < this.onsetTimes.length; i++) {
      let ioi = this.onsetTimes[i] - this.onsetTimes[i - 1]
      if (ioi <= 0.05) continue
      while (ioi < 60 / 180) ioi *= 2
      while (ioi > 60 / 60) ioi /= 2
      intervals.push(ioi)
    }
    if (!intervals.length) return
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length
    const bpm = Math.round((60 / mean) * 10) / 10
    if (bpm >= 60 && bpm <= 180) this.detectedBpm = bpm
  }

  private bpmPulse() {
    const bpm = this.bpm ?? 82
    const phase = (this.currentTime * bpm) / 60
    const v = 1 - (phase - Math.floor(phase))
    return clamp01(v * v)
  }
}

function approach(current: number, target: number, dt: number, attack: number, release: number) {
  if (!(dt > 0)) return current
  const tau = target > current ? attack : release
  return clamp01(current + (target - current) * (1 - Math.exp(-dt / tau)))
}
