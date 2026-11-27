// preset-copy.ts - one source of truth for the ten reactivity presets: copy, verb and plan.
// Figma draws these strings, the dev bench reads them, the tests pin them. `reactTo` is the only
// field the audio engine uses; everything else is the contract between design and runtime.
import type { AudioPresetKey, ReactionKey } from './audio'

export type CoreSection = 'Band' | 'Response' | 'Range' | 'Force'
export type PresetVerb = 'core' | 'add' | 'replace' | 'hide'
export type ExtraKind = 'pulse' | 'spectral' | 'stems' | 'midi' | 'bpm' | 'snap' | 'harmony' | 'automation'

export type PresetCopy = {
  id: string
  engine: AudioPresetKey
  reactTo: ReactionKey
  verb: PresetVerb
  /** badge shown on the band card: the detector, not the section */
  badge: string
  /** one line under the band rows */
  bandNote: string
  /** core sections this preset removes entirely */
  hide?: CoreSection[]
  /** core section whose content the preset swaps, same slot */
  replace?: CoreSection
  kind?: ExtraKind
  extra?: { title: string; badge: string; params: string[]; note: string }
  /** false = the params exist in the panel but the engine ignores them */
  wired: boolean
  /** present in the design, not reachable in the runtime */
  hidden?: boolean
  /** where the value comes from: audio analysis, a model, or the transport */
  source?: 'analysis' | 'model' | 'transport'
  note?: string
}

/** The core is the maths of the signal: it never moves, whatever the preset does. */
export const CORE_ORDER: CoreSection[] = ['Band', 'Response', 'Range', 'Force']

export const PRESET_COPY: PresetCopy[] = [
  {
    id: 'dB', engine: 'level', reactTo: 'db', verb: 'core', badge: 'dB',
    bandNote: 'Whole-track loudness: the band is idle.', wired: true,
  },
  {
    id: 'Pulse', engine: 'kick', reactTo: 'kick', verb: 'add', badge: 'KICK',
    bandNote: 'The kick body drives it; the band level is the floor, so sustained parts still move.',
    kind: 'pulse',
    extra: { title: 'Pulse', badge: 'ADD', params: ['Curve', 'Attack', 'Sustain'], note: 'Curve is live. Attack and Sustain are two channels with a clamp each, so the hits and the sustained part both move. Hold and retrigger are not wired.' },
    wired: true,
  },
  {
    id: 'Bass', engine: 'bass', reactTo: 'low-freq', verb: 'core', badge: 'BASS',
    bandNote: 'Reads the fixed 20-500 body: lo/hi are idle.', wired: true,
  },
  {
    id: 'Spectral', engine: 'band', reactTo: 'freq-band', verb: 'replace', badge: 'REPLACE',
    bandNote: 'Bands replaces the single band: split lo/hi pick the range.',
    replace: 'Band', kind: 'spectral',
    extra: { title: 'Bands', badge: 'REPLACE', params: ['Bands', 'Split lo', 'Split hi'], note: 'Fixed to 3 bands; the split range is live.' },
    wired: true,
  },
  {
    id: 'Stems', engine: 'level', reactTo: 'db', verb: 'hide', badge: 'HIDE',
    bandNote: '', hide: ['Band'], kind: 'stems',
    extra: { title: 'Stem', badge: 'ADD', params: ['Stem', 'Gain'], note: 'Needs separated stems: not wired. Each stem becomes its own envelope once the model lands.' },
    wired: false, source: 'model',
  },
  {
    id: 'MIDI', engine: 'level', reactTo: 'db', verb: 'replace', badge: 'REPLACE',
    bandNote: 'Whole-track fallback until a MIDI input is wired.', hidden: true,
    replace: 'Response', kind: 'midi',
    extra: { title: 'MIDI', badge: 'REPLACE', params: ['Channel', 'CC', 'Smoothing'], note: 'No envelope: MIDI values arrive already shaped.' },
    wired: false,
  },
  {
    id: 'BPM', engine: 'bpm', reactTo: 'bpm', verb: 'replace', badge: 'REPLACE',
    bandNote: 'Tempo is synthetic: the band only shapes the LFO.',
    replace: 'Response', kind: 'bpm',
    extra: { title: 'Tempo', badge: 'REPLACE', params: ['Division', 'Swing', 'Quantize'], note: 'The tempo grid replaces the envelope.' },
    wired: true,
  },
  {
    id: 'Snap & Hold', engine: 'snap-hold', reactTo: 'snap-hold', verb: 'replace', badge: 'REPLACE',
    bandNote: 'The trigger picks the band: kick by default.',
    replace: 'Response', kind: 'snap',
    extra: { title: 'Snap', badge: 'REPLACE', params: ['Interval', 'Hold'], note: 'The signal is held for 0.25 s after the trigger, then released. Steps force the hold; interval is not wired.' },
    wired: true,
  },
  {
    id: 'Harmony', engine: 'band', reactTo: 'freq-band', verb: 'add', badge: 'HARM',
    bandNote: 'Tonal share of the selected band.',
    kind: 'harmony',
    extra: { title: 'Harmony', badge: 'ADD', params: ['Scale', 'Confidence'], note: 'Needs chroma and chord detection: not wired. The band above is the fallback.' },
    wired: false, source: 'model',
  },
  {
    id: 'Automation', engine: 'level', reactTo: 'db', verb: 'hide', badge: 'HIDE',
    bandNote: '', hide: ['Band', 'Response'], kind: 'automation',
    extra: { title: 'Automation', badge: 'ADD', params: ['Curve'], note: 'Belongs to the transport, not to the audio analysis: no free pulse in this panel.' },
    wired: false, hidden: true, source: 'transport',
  },
]

export const presetCopy = (id: string): PresetCopy => PRESET_COPY.find((p) => p.id === id) ?? PRESET_COPY[0]

/** Core sections the preset leaves standing, in the fixed order. */
export const coreFor = (id: string): CoreSection[] => {
  const p = presetCopy(id)
  return CORE_ORDER.filter((s) => !(p.hide ?? []).includes(s))
}
