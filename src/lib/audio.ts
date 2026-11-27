// Focused browser audio engine for selected-cell reactivity.
// The public surface is intentionally small: load/transport/analysis plus pure
// signal shaping that can be tested without Web Audio.

export type ReactionKey = 'db' | 'low-freq' | 'high-freq' | 'kick' | 'snare' | 'hihat' | 'freq-band' | 'bpm' | 'snap-hold' | 'stem' | 'harmony' | 'automation' | 'pulse-attack' | 'pulse-sustain'
export type SnapTrigger = 'level' | 'kick' | 'snare' | 'hihat'
export type Stem = 'drums' | 'bass' | 'vocals' | 'other'
/** Stem proxies: without a separated source each stem is a frequency share of the same signal. */
export const STEM_RANGES: Record<Stem, [number, number]> = {
  drums: [30, 150],
  bass: [150, 500],
  vocals: [500, 3000],
  other: [3000, 12000],
}
export type CellCoord = { x: number; y: number }
export type CellAudioDebug = {
  selected: CellCoord | null
  filled: boolean
  raw: number
  shaped: number
  scale: number
  /** warp amount actually sent to the shader, signed -1..1 */
  amount: number
  /** size at the current signal, from the signed range */
  size: number
  /** the signal after the curve, before the auto-gain: where a plateau shows up */
  curve: number
  /** hi − lo of the auto-gain window: 0 means "constant signal, nothing to normalise" */
  gainRange: number
  /** raw band level used for the radius, 0..1 */
  band: number
  enabled: boolean
  reaction: ReactionKey
  engineReady: boolean
  configEnabled: boolean
  hasSelection: boolean
  engineId: string
}

export type ModCurve = 'linear' | 'exp' | 'spring'
/** [silent, peak] sizes. 1 is the reference size: end < 1 shrinks, end > 1 grows. */
export type ModulationRange = [number, number]

export type CellAudioConfig = {
  enabled: boolean
  preset: AudioPresetKey
  /** dev-panel selection (ten-voice rail), independent from the engine preset key */
  devPreset?: string
  reactTo: ReactionKey
  sensitivity: number
  minScale: number
  maxScale: number
  steps: number
  wave?: 'sine' | 'saw' | 'triangle' | 'quad'
  roamSeed?: number
  roamBand?: number
  roamSpeed?: number
  attack: number
  release: number
  threshold: number
  band?: [number, number]
  trigger?: SnapTrigger
  stem?: Stem
  /** normalise the signal over the track's own range; default on */
  autoGain?: boolean
  /**
   * Two-channel presets (Pulse): each channel is normalised on its own, then mixed. Weights 0..1, they
   * are renormalised to their sum. Without this block the preset reads a single `reactTo` key.
   */
  channels?: { attack: number; sustain: number }
  /** signed range used by the dev bench; when absent the legacy min/max scale path runs */
  range?: ModulationRange
  /** multiplicative force 0..1 (overrides sensitivity when present) */
  force?: number
  curve?: ModCurve
  /** global trims: they bound the whole chain, so a control at 1 stays playable */
  global?: Partial<GlobalConfig>
}

export type GlobalConfig = {
  /** ceiling on the warp amount, 0..1 (default 0.55) */
  depth: number
  /** spread of the affected radius, 0..1, hard-capped in cells (default 0.45) */
  scatter: number
  /** rate multiplier with a curve, 0..1 (default 0.5) */
  speed: number
  /** final glide in seconds, 0..1 (default 0.35) */
  response: number
}

/** Glide default: response 0.2 is tau ≈ 20 ms (50 ms to 90%). At 0.5 it was 104 ms, i.e. 216 ms of the
 * 250 ms end-to-end delay — the sound arrived and the shape moved a quarter second later. */
export const DEFAULT_GLOBAL: GlobalConfig = { depth: 0.5, scatter: 0.4, speed: 0.45, response: 0.2 }

/** Merge a partial global block over the defaults. */
export const globalOf = (config: CellAudioConfig): GlobalConfig => ({ ...DEFAULT_GLOBAL, ...(config.global ?? {}) })

export const AUDIO_PRESETS = [
  // The Pulse/Kick threshold is 0.05, not 0.15: the band floor of a sustained passage sits around
  // 0.19, and a 0.15 gate mapped it to 0.07 — a tenth of the range, so the sustain never moved while
  // the hits took everything. A low gate keeps the ratio between sustain and attack usable.
  { key: 'level', label: 'Level', reactTo: 'db', hint: 'Whole-track loudness', attack: 0.05, release: 0.3, threshold: 0.08, minScale: 0.55, maxScale: 1, steps: 0 },
  { key: 'bass', label: 'Bass', reactTo: 'low-freq', hint: '20–500 Hz body', attack: 0.025, release: 0.22, threshold: 0.12, minScale: 0.5, maxScale: 1, steps: 0 },
  { key: 'kick', label: 'Kick', reactTo: 'kick', hint: '60–100 Hz transients', attack: 0.005, release: 0.18, threshold: 0.05, minScale: 0.45, maxScale: 1, steps: 0 },
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
    // Pulse is the one preset with two sources: the onset attack and the band's sustain
    ...(p.key === 'kick' ? { channels: { ...DEFAULT_CHANNELS } } : {}),
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

/**
 * Easing applied to the shaped signal before it becomes a size. Every curve must be monotone and
 * must not reach 1 before its input does: a plateau at the top is a constant signal, and the
 * auto-gain turns a constant into zero — the shape then reads "waiting for signal" in the loudest
 * part of the track. `spring` used to do exactly that (everything above 0.35 was 1.0).
 */
export const applyCurve = (signal: number, curve: ModCurve = 'linear'): number => {
  const s = clamp01(finite(signal, 0))
  if (curve === 'exp') return clamp01(Math.pow(s, 2.2))
  // elastic ease: leads the linear response in the middle, rejoins it at both ends (slope 1 at 1)
  if (curve === 'spring') return clamp01(s + SPRING_LIFT * Math.sin(Math.PI * s) * s * (1 - s))
  return s
}

/** Size at a signal: silence -> range[0], peak -> range[1]. Signed, 1 is the reference. */
export const sizeFromSignal = (signal: number, range: ModulationRange): number => {
  const a = finite(range[0], 1)
  const b = finite(range[1], 0.55)
  return a + (b - a) * clamp01(finite(signal, 0))
}

/**
 * Warp amount in -1..1: distance travelled from the *silent* size, divided by the reference travel
 * (1 -> 0.55). Using the silent size as the zero point is what makes a non-1 silent value still
 * return to rest: `amount = (silent - size) / 0.45`, so silence is always 0.
 * Sign is direction: peak below silent shrinks (positive), above grows (negative).
 */
export const RANGE_REFERENCE = 0.45
export const amountFromSize = (size: number, silent = 1): number => {
  const amt = (finite(silent, 1) - finite(size, 1)) / RANGE_REFERENCE
  return Math.max(-1, Math.min(1, amt))
}

/**
 * A control's own travel, eased so the top of the slider is still usable: 0.4 of a slider is
 * ~0.2 of the gain, 1 stays 1. gamma 1 is linear.
 */
export const easeControl = (value: number, gamma = 1.7): number => Math.pow(clamp01(finite(value, 0)), Math.max(0.1, gamma))

/** Effective warp amount sent to the shader: signal x eased force x global depth ceiling. */
export const amountFromForce = (amount: number, force: number, depth: number): number => {
  const v = finite(amount, 0) * easeControl(force) * clamp01(finite(depth, 0))
  return Math.max(-1, Math.min(1, v))
}

/**
 * Radius of the affected band, in cells, bounded on purpose: scatter sets the ceiling and the
 * band can only widen inside it. Without the cap a loud band takes the whole grid and reads as a
 * snap instead of a modulation.
 */
export const radiusCells = (amount: number, band: number, scatter: number): number => {
  const s = clamp01(finite(scatter, 0))
  const base = 0.75 + 0.35 * s
  const drive = (0.5 + 1.3 * s) * Math.abs(Math.max(-1, Math.min(1, finite(amount, 0))))
  const side = 0.9 * s * clamp01(finite(band, 0))
  const cap = 0.9 + 2.1 * s
  return Math.min(cap, base + drive + side)
}

/** Global rate with a curve: 0 -> 0.3x, 0.5 -> ~0.8x, 1 -> 1.6x (fast, never frantic). */
export const rateFromSpeed = (speed: number): number => 0.3 + 1.3 * Math.pow(clamp01(finite(speed, 0)), 1.6)

/** One-pole glide used as the final response trim. tau in seconds; 0 passes through. */
export const glide = (current: number, target: number, dt: number, tau: number): number => {
  const t = Math.max(0, finite(tau, 0))
  if (!(dt > 0) || t <= 0) return finite(target, 0)
  return finite(current, 0) + (finite(target, 0) - finite(current, 0)) * (1 - Math.exp(-dt / t))
}

/** Response trim to a time constant: 0 -> nothing, 1 -> 0.4 s. */
export const responseTau = (response: number): number => {
  const r = clamp01(finite(response, 0))
  return r <= 0 ? 0 : 0.004 + 0.4 * r * r
}

export type GainState = {
  /** ring of the last frames; the clamp is the min/max of this window, not of the whole track */
  ring: Float32Array
  head: number
  fill: number
  /** smoothed clamp, so a peak leaving the window cannot step the output */
  hi: number
  lo: number
  ready: boolean
}

/** Length of the window the clamp is taken from, seconds. */
export const GAIN_WINDOW_S = 2.5
/** Below this the signal is noise, not music: never amplify it to full range. */
export const GAIN_DEADBAND = 0.006
/** Absolute floor on the span, so a band that sits near zero is not zoomed into its own dither. */
export const GAIN_SPAN_MIN = 0.02
/** Headroom on the observed range: the peak maps to ~0.87, never to a clamped 1. */
export const GAIN_HEADROOM = 1.15

export const createGainState = (): GainState => ({
  ring: new Float32Array(256), head: 0, fill: 0, hi: 0, lo: 1, ready: false,
})

/**
 * Auto gain: maps the *local* range of the signal to 0..1. The clamp is the min/max of the last
 * `GAIN_WINDOW_S` seconds, smoothed by ~80 ms so a peak leaving the window cannot step the output.
 *
 * Why a window and not a leaky follower: on loud, dense material the level barely moves (a limited
 * mix varies by 2% of full scale), and a follower that chases the *value* closes the range onto it
 * until the shape stops moving. The window puts the clamp on the peaks and troughs that are actually
 * there, so a 2% excursion still becomes a full one. A constant signal still maps to 0: the window's
 * min and max are the same number, and the span floor keeps it there.
 */
export const autoGain = (state: GainState, value: number, dt: number): number => {
  const v = clamp01(finite(value, 0))
  const d = Math.max(0, Math.min(0.25, finite(dt, 0)))
  const len = state.ring.length
  state.ring[state.head] = v
  state.head = (state.head + 1) % len
  if (state.fill < len) state.fill++

  // frames that fit in the window at this frame rate (dt 0 uses 60 fps)
  const perSecond = d > 0 ? 1 / d : 60
  const window = Math.max(8, Math.min(len, Math.round(GAIN_WINDOW_S * perSecond)))
  const count = Math.min(state.fill, window)
  let lo = 1, hi = 0
  for (let i = 0; i < count; i++) {
    const s = state.ring[(state.head - 1 - i + len * 2) % len]
    if (s < lo) lo = s
    if (s > hi) hi = s
  }

  if (!state.ready) { state.lo = lo; state.hi = hi; state.ready = true }
  else {
    // a new extreme is taken at once (so a jump cannot clip), a stale one leaves slowly (so a peak
    // falling out of the window does not step the output)
    if (lo < state.lo) state.lo = lo
    if (hi > state.hi) state.hi = hi
    const k = d > 0 ? 1 - Math.exp(-d / 0.08) : 1
    if (lo > state.lo) state.lo += (lo - state.lo) * k
    if (hi < state.hi) state.hi += (hi - state.hi) * k
  }

  const range = Math.max(0, state.hi - state.lo)
  const span = Math.max(GAIN_SPAN_MIN, range * GAIN_HEADROOM)
  // a range under the deadband is dither, not music: fade the modulation in instead of zooming into it
  const gate = Math.min(1, range / GAIN_DEADBAND)
  return clamp01((v - state.lo) / span) * gate
}

/** How far `spring` leads the linear response at its midpoint. */
export const SPRING_LIFT = 1

/**
 * Snap & Hold: the sampled value latches on the hit and releases `SNAP_HOLD_MS` later. Without the
 * release the held value is permanent, so the preset reads 1.0 forever and the scroll never moves.
 * 0.25 s is an eighth note at 120 BPM: on a 2 Hz kick the value is on half the time, on a slow
 * ambient hit it is a short stab.
 */
export const SNAP_HOLD_MS = 250

/**
 * Two-channel Pulse mix. Each channel arrives already normalised (own auto-gain), so this is only a
 * weighted average: weights are renormalised to their sum, so `{attack: 0.65, sustain: 0.35}` and
 * `{attack: 6.5, sustain: 3.5}` mix identically, and `{attack: 0, sustain: 0}` falls back to the attack.
 */
/**
 * Two-channel Pulse mix. Each channel arrives already normalised on its own window, so this is a
 * weighted *maximum*, not an average: averaging halves each channel (a sustain at 0.87 alone would
 * come out at 0.30 and the shape would move less than with one channel). With a maximum the weights
 * are ceilings — the attack leads, the sustain can fill up to its share — and the chain's own
 * auto-gain then puts the blended range back on the full scale.
 */
export const mixChannels = (attack: number, sustain: number, mix: { attack: number; sustain: number }): number => {
  // weights are amounts, not fractions: only the lower bound matters
  const wa = Math.max(0, finite(mix.attack, 0))
  const ws = Math.max(0, finite(mix.sustain, 0))
  const a = clamp01(finite(attack, 0)) * wa
  const s = clamp01(finite(sustain, 0)) * ws
  return clamp01(Math.max(a, s))
}

/** Default Pulse mix: the hit leads, the sustain fills underneath. */
export const DEFAULT_CHANNELS = { attack: 1, sustain: 0.7 }
export const snapHoldValue = (armed: boolean, held: number, elapsedMs: number): number => {
  if (!armed) return 0
  const elapsed = Number.isFinite(elapsedMs) ? elapsedMs : Infinity
  return elapsed <= SNAP_HOLD_MS ? clamp01(finite(held, 0)) : 0
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

/**
 * Onset detector: two channels on the same band.
 * - attack: relative spectral flux (how much the band's spectrum rose) against its own recent
 *   history. Relative, so a quiet intro and a loud chorus are judged on the same scale.
 * - entrance: the band's energy rising above a slow baseline, so a swell or a fade-in — a sound
 *   with no transient at all — still opens the envelope. It re-arms only after the energy falls
 *   back, otherwise a long fade would fire a pulse every debounce window.
 * Both feed the same 0..1 envelope, so Pulse, Snap & Hold and the BPM estimate see one signal.
 */
export type OnsetConfig = {
  /** relative flux that counts as an attack */
  attackFloor: number
  /** standard deviations above the recent relative flux */
  sigma: number
  /** multiple of the recent relative flux */
  ratio: number
  /** energy rise above the slow baseline */
  riseAbs: number
  /** ...plus this fraction of the baseline, so a loud passage needs a bigger jump */
  riseRel: number
  /** baseline time constant, seconds */
  tau: number
  /** minimum gap between two hits, ms */
  debounceMs: number
}

export const DEFAULT_ONSET: OnsetConfig = {
  attackFloor: 0.2, sigma: 1, ratio: 1.35, riseAbs: 0.03, riseRel: 0.25, tau: 0.45, debounceMs: 70,
}

export type OnsetState = {
  /** recent relative flux, ring buffer */
  hist: Float32Array
  head: number
  fill: number
  /** slow follower of the band energy, the baseline an entrance is measured against */
  base: number
  /** false between an entrance hit and the energy falling back */
  armed: boolean
  last: number
}

export const createOnsetState = (): OnsetState => ({
  hist: new Float32Array(HISTORY), head: 0, fill: 0, base: 0, armed: true, last: -1e9,
})

const ONSET_EPS = 0.02

/** Pure detector: one frame in, one hit out. No Web Audio, no clock: the caller advances the state. */
export const detectOnset = (
  state: OnsetState,
  input: { energy: number; flux: number; level: number; dt: number; nowMs: number },
  config: OnsetConfig = DEFAULT_ONSET,
): boolean => {
  const energy = clamp01(finite(input.energy, 0))
  const flux = Math.max(0, finite(input.flux, 0))
  const level = clamp01(finite(input.level, 0))
  const dt = Math.max(0, Math.min(0.25, finite(input.dt, 0)))

  const rel = flux / (energy + ONSET_EPS)
  const hist = state.hist
  let mean = 0
  for (let i = 0; i < state.fill; i++) mean += hist[i]
  if (state.fill) mean /= state.fill
  let variance = 0
  for (let i = 0; i < state.fill; i++) variance += (hist[i] - mean) ** 2
  const sd = state.fill ? Math.sqrt(variance / state.fill) : 0
  const attack = state.fill >= 9 && rel > config.attackFloor && rel > mean + config.sigma * sd && rel > mean * config.ratio
  hist[state.head] = rel
  state.head = (state.head + 1) % hist.length
  if (state.fill < hist.length) state.fill++

  const rise = energy - state.base
  const riseFloor = config.riseAbs + config.riseRel * state.base
  if (!state.armed && rise <= riseFloor * 0.2) state.armed = true
  const entrance = state.armed && rise > riseFloor
  state.base += (energy - state.base) * (1 - Math.exp(-dt / Math.max(0.05, config.tau)))

  // silence is not a source: the gate is on the whole track, so a stray filter tail cannot fire
  if (level <= 0.02 || !(attack || entrance)) return false
  if (input.nowMs - state.last < config.debounceMs) return false
  state.last = input.nowMs
  if (entrance) state.armed = false
  return true
}

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
  /** second analyser, no smoothing: onset detection needs the raw frame-to-frame rise */
  private onset: AnalyserNode | null = null
  private gain: GainNode | null = null
  private source: AudioBufferSourceNode | null = null
  private buffer: AudioBuffer | null = null
  private _peaks: Float32Array = new Float32Array(512)
  private wave = new Float32Array(WAVE_SIZE)
  private freq = new Uint8Array(BIN_COUNT)
  private onsetFreq = new Uint8Array(BIN_COUNT)
  private prevOnsetFreq = new Uint8Array(BIN_COUNT)
  private onsets = Array.from({ length: 4 }, () => createOnsetState())
  private env = new Float32Array(4)
  private snap = new Float32Array(4)
  private snapArmed = new Uint8Array(4)
  private snapAt = new Float64Array(4).fill(-1e9)
  /** level of each band on the unsmoothed window, 0..1: the floor under the onset envelope */
  private bandEnergy = new Float32Array(4)
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
    // onset window: the same spectrum with no temporal smoothing. With 0.8 every frame's rise is
    // kept at a fifth, which saturates the detector on loud drums and silences it on a quiet intro.
    const onset = ctx.createAnalyser()
    onset.fftSize = FFT_SIZE
    onset.smoothingTimeConstant = 0
    onset.minDecibels = -90
    onset.maxDecibels = -10
    const gain = ctx.createGain()
    gain.gain.value = 0
    analyser.connect(gain)
    gain.connect(ctx.destination)
    this.ctx = ctx
    this.analyser = analyser
    this.onset = onset
    this.gain = gain
    this.binHz = ctx.sampleRate / FFT_SIZE
    this.bands = [
      this.range(40, 250),
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
    if (this.onset) source.connect(this.onset)
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
    const onset = this.onset
    if (onset) onset.getByteFrequencyData(this.onsetFreq)

    const bands = this.bands!
    const e0 = this.onsetEnergy(bands[0])
    const e1 = this.onsetEnergy(bands[1])
    const e2 = this.onsetEnergy(bands[2])
    const e3 = this.onsetEnergy(bands[3])
    this.bandEnergy[0] = e0; this.bandEnergy[1] = e1; this.bandEnergy[2] = e2; this.bandEnergy[3] = e3
    const hitK = this.detect(0, bands[0], e0, nowMs, levelTarget, dt)
    const hitS = this.detect(1, bands[1], e1, nowMs, levelTarget, dt)
    const hitH = this.detect(2, bands[2], e2, nowMs, levelTarget, dt)
    const hitL = this.detect(3, bands[3], e3, nowMs, levelTarget, dt)
    this.prevOnsetFreq.set(this.onsetFreq)

    this.level = approach(this.level, levelTarget, dt, 0.05, 0.28)
    this.low = approach(this.low, this.bandLevel(20, 500), dt, 0.04, 0.2)
    this.high = approach(this.high, this.bandLevel(500, Math.min(20000, this.ctx!.sampleRate / 2)), dt, 0.04, 0.2)
    for (let i = 0; i < 4; i++) {
      const hit = i === 0 ? hitK : i === 1 ? hitS : i === 2 ? hitH : hitL
      this.env[i] = hit ? 1 : this.env[i] * Math.exp(-dt / RELEASE[i])
      if (hit) {
        this.snap[i] = Math.random()
        this.snapArmed[i] = 1
        this.snapAt[i] = nowMs
      }
    }
    if (hitL) this.pushOnset(nowMs / 1000)
  }

  value(key: ReactionKey, opts: { band?: [number, number]; trigger?: SnapTrigger; stem?: Stem } = {}) {
    switch (key) {
      case 'db': return this.level
      case 'low-freq': return this.low
      case 'high-freq': return this.high
      // Onset envelope with the band's own level as a floor. A pure onset envelope reads 0 through a
      // sustained pad (no attacks), so a loud section with no transients left the shape still. The
      // floor keeps the signal alive there; the auto-gain window then normalises its small swing.
      case 'kick': return Math.max(this.env[0], this.bandEnergy[0])
      // the same two sources, kept apart: the attack is the onset envelope, the sustain is the band's
      // own level. Each channel gets its own clamp in the chain, so neither steals the range.
      case 'pulse-attack': return this.env[0]
      case 'pulse-sustain': return this.bandEnergy[0]
      case 'snare': return Math.max(this.env[1], this.bandEnergy[1])
      case 'hihat': return Math.max(this.env[2], this.bandEnergy[2])
      case 'freq-band': return this.bandLevel(opts.band?.[0] ?? 20, opts.band?.[1] ?? 500)
      case 'stem': {
        const r = STEM_RANGES[opts.stem ?? 'drums']
        return this.bandLevel(r[0], r[1])
      }
      // proxy: how much of the loudness sits in the selected band. No pitch detection, so this is
      // a tonal share, not a chord.
      case 'harmony': {
        const b = this.bandLevel(opts.band?.[0] ?? 500, opts.band?.[1] ?? 3000)
        return clamp01(b / Math.max(0.08, this.level))
      }
      // automation will read the transport curve here; until it exists, no preset uses this key
      case 'automation': return 0
      case 'bpm': return this.bpmPulse()
      case 'snap-hold': {
        const i = SNAP_INDEX[opts.trigger ?? 'level']
        return snapHoldValue(this.snapArmed[i] === 1, this.snap[i], performance.now() - this.snapAt[i])
      }
      default: return 0
    }
  }

  stop() {
    this.stopSource()
    this.playing = false
    if (this.gain) this.gain.gain.value = 0
    try { this.analyser?.disconnect() } catch { /* already disconnected */ }
    try { this.onset?.disconnect() } catch { /* already disconnected */ }
    try { this.gain?.disconnect() } catch { /* already disconnected */ }
    try { void this.ctx?.close() } catch { /* already closed */ }
    this.ctx = null
    this.analyser = null
    this.onset = null
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
    this.snap.fill(0)
    this.snapArmed.fill(0)
    this.snapAt.fill(-1e9)
    this.onsetTimes.length = 0
    this.detectedBpm = null
    this.onsetFreq.fill(0)
    this.prevOnsetFreq.fill(0)
    this.bandEnergy.fill(0)
    this.onsets.forEach((s) => Object.assign(s, createOnsetState()))
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

  /** Mean level of the band on the unsmoothed window, 0..1 (bytes / 255). */
  private onsetEnergy(band: Int32Array) {
    let sum = 0, n = 0
    for (let k = 0; k + 1 < band.length; k += 2) {
      for (let i = band[k]; i < band[k + 1]; i++) { sum += this.onsetFreq[i]; n++ }
    }
    return n ? sum / (255 * n) : 0
  }

  /** Positive spectral flux on the unsmoothed window: how much each bin rose since the last frame. */
  private onsetFlux(band: Int32Array) {
    let sum = 0, n = 0
    for (let k = 0; k + 1 < band.length; k += 2) {
      for (let i = band[k]; i < band[k + 1]; i++) {
        const d = this.onsetFreq[i] - this.prevOnsetFreq[i]
        if (d > 0) sum += d
        n++
      }
    }
    return n ? sum / (255 * n) : 0
  }

  private detect(index: number, band: Int32Array, energy: number, nowMs: number, level: number, dt: number) {
    return detectOnset(this.onsets[index], {
      energy,
      flux: this.onsetFlux(band),
      level,
      dt,
      nowMs,
    })
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

