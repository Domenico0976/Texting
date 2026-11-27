// reactivity-dev-panel.tsx - the dev bench for the reactivity panel.
// Same logic as the Figma panel, minimal design: core sections in signal order
// (Band -> Response -> Range -> Force), the preset section adds/replaces/hides,
// roam calibration last, live readout at the bottom.
// One file, native controls, no tokens and no components: this is the bench, not the design.
import { useEffect, useRef, useState } from 'react'
import {
  configFromPreset, DEFAULT_CHANNELS, DEFAULT_GLOBAL, globalOf, radiusCells, SNAP_HOLD_MS,
  type AudioEngine, type AudioPresetKey, type CellAudioConfig, type CellAudioDebug, type CellCoord, type ModCurve,
} from '../lib/audio'

import { PRESET_COPY, presetCopy, type ExtraKind } from '../lib/preset-copy'

type Props = {
  engine: AudioEngine
  config: CellAudioConfig
  onConfig: (c: CellAudioConfig) => void
  selected: CellCoord | null
  shapeSelected: boolean
  onShapeSelected: (v: boolean) => void
  debug: CellAudioDebug | null
  /** error reported by the audio panel (decode, context); the bench shows the same Error state */
  error?: string
}

type Extra = ExtraKind
type DevPreset = {
  id: string
  engine: AudioPresetKey
  reactTo: CellAudioConfig['reactTo']
  extra?: Extra
  verb: 'core' | 'add' | 'replace' | 'hide'
  wired: boolean
  note?: string
}

// One source of truth with the Figma cards: copy, verb and plan live in lib/preset-copy.ts.
const PRESETS: DevPreset[] = PRESET_COPY.filter((p) => !p.hidden).map((p) => ({
  id: p.id,
  engine: p.engine,
  reactTo: p.reactTo,
  extra: p.kind,
  verb: p.verb,
  wired: p.wired,
  note: p.note,
}))

const CURVES: ModCurve[] = ['linear', 'exp', 'spring']

const pv = '#8b5cf6'
const box: React.CSSProperties = {
  position: 'absolute', right: 12, top: 12, zIndex: 21, width: 316, maxHeight: 'calc(100vh - 24px)',
  overflow: 'auto', padding: 12, background: 'rgba(14,15,20,0.95)', color: '#e9e9ee',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, font: '12px system-ui',
  boxShadow: '0 18px 50px rgba(0,0,0,0.45)', backdropFilter: 'blur(14px)',
}
const card: React.CSSProperties = { marginTop: 8, padding: '8px 10px', background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8 }
const head: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }
const title: React.CSSProperties = { fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', color: '#9a9aa5', flex: 1 }
const row: React.CSSProperties = { display: 'grid', gridTemplateColumns: '74px 1fr 46px', gap: 8, alignItems: 'center', marginTop: 6 }
const input: React.CSSProperties = { width: '100%', background: '#1c1e26', color: '#e9e9ee', border: '1px solid #343845', borderRadius: 6, padding: '3px 6px', font: '11px system-ui' }
const chip: React.CSSProperties = { textAlign: 'right', font: '11px ui-monospace, SFMono-Regular, Menlo, monospace', color: '#cfcfd8' }
const note: React.CSSProperties = { marginTop: 6, fontSize: 10, lineHeight: 1.35, color: '#8b8f9a' }
const badge = (tone: string): React.CSSProperties => ({
  fontSize: 9, letterSpacing: 0.5, textTransform: 'uppercase', padding: '2px 5px', borderRadius: 4,
  background: tone === 'off' ? 'rgba(255,255,255,0.08)' : 'rgba(139,92,246,0.22)', color: tone === 'off' ? '#9a9aa5' : '#c9b8ff',
})

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
const fmt = (v: number, d = 2) => v.toFixed(d)

export default function ReactivityDevPanel({ engine, config, onConfig, selected, shapeSelected, onShapeSelected, debug, error }: Props) {
  const [open, setOpen] = useState(true)
  const [fps, setFps] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)
  const [localError, setLocalError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let raf = 0, n = 0, t0 = performance.now()
    const tick = () => {
      n++
      const t = performance.now()
      if (t - t0 >= 500) { setFps(Math.round((n * 1000) / (t - t0))); n = 0; t0 = t }
      const p = engine.isPlaying
      setPlaying((v) => (v === p ? v : p))
      setReady((v) => (v === engine.ready ? v : engine.ready))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [engine])

  const pickFile = async (file?: File) => {
    if (!file) return
    setLocalError('')
    try {
      await engine.loadFile(file)
      engine.play()
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : String(e))
    }
  }

  const patch = (p: Partial<CellAudioConfig>) => onConfig({ ...config, ...p })
  const patchGlobal = (p: Partial<typeof DEFAULT_GLOBAL>) => patch({ global: { ...globalOf(config), ...p } })
  const preset = PRESETS.find((p) => p.id === (config.devPreset ?? 'Bass')) ?? PRESETS[0]
  const copy = presetCopy(preset.id)
  const bandOff = (copy.hide ?? []).includes('Band')
  const respOff = (copy.hide ?? []).includes('Response')
  const respReplaced = copy.replace === 'Response'
  const dimCard: React.CSSProperties = { opacity: 0.45, pointerEvents: 'none' }
  const range: [number, number] = config.range ?? [1, config.minScale]
  const force = config.force ?? config.sensitivity / 100
  const glob = globalOf(config)
  const band = config.band ?? [20, 500]
  const curve = config.curve ?? 'linear'
  const ch = config.channels ?? DEFAULT_CHANNELS
  const level = debug?.raw ?? 0
  const shaped = debug?.shaped ?? 0
  const size = debug?.size ?? range[0]
  const amount = debug?.amount ?? 0
  const curveOut = debug?.curve ?? 0
  const gainRange = debug?.gainRange ?? 0
  const bandLevel = debug?.band ?? 0
  const radius = radiusCells(amount, bandLevel, glob.scatter)
  const ceiling = Math.pow(Math.min(1, Math.max(0, force)), 1.7) * glob.depth
  const err = error || localError
  const state = err ? 'Error' : !ready ? 'NoAudio' : 'Live'
  const dim: React.CSSProperties = state === 'Live' ? {} : { opacity: 0.35, pointerEvents: 'none' }
  const target = shapeSelected ? 'Shape' : selected ? `Cell ${selected.x + 1}·${selected.y + 1}` : 'none'
  const status = state === 'Error' ? 'audio error' : state === 'NoAudio' ? 'load audio' : !config.enabled ? 'disabled' : !shapeSelected && !selected ? 'pick a target' : amount === 0 && playing ? 'waiting for signal' : 'live'

  const pickPreset = (id: string) => {
    const next = PRESETS.find((p) => p.id === id)
    if (!next) return
    const base = configFromPreset(next.engine)
    onConfig({
      ...base,
      enabled: config.enabled,
      devPreset: next.id,
      reactTo: next.reactTo,
      // keep the calibration the user dialled in: it is the panel's contract, not the preset's
      range: config.range,
      force: config.force,
      curve: config.curve,
      global: config.global,
      roamSeed: config.roamSeed,
      roamBand: config.roamBand,
      roamSpeed: config.roamSpeed,
    })
  }

  if (!open) {
    return (
      <div style={{ ...box, width: 168, padding: 8 }}>
        <button style={{ ...input, cursor: 'pointer' }} onClick={() => setOpen(true)}>Reactivity dev · {status}</button>
      </div>
    )
  }

  return (
    <div style={box}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <strong style={{ fontSize: 12 }}>Reactivity dev</strong>
        <span style={badge('on')}>{preset.id}</span>
        <span style={{ flex: 1 }} />
        <span style={{ ...chip, color: '#8b8f9a', textAlign: 'left' }}>{fps} fps</span>
        <button style={{ ...input, width: 24, padding: 0, cursor: 'pointer' }} onClick={() => setOpen(false)}>–</button>
      </div>

      {/* states: No audio / Error use the same copy as the Figma notice */}
      {state !== 'Live' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, margin: '8px -12px 0', padding: '10px 12px',
          background: 'rgba(255,255,255,0.04)', borderLeft: state === 'Error' ? '2px solid #f87171' : '2px solid transparent',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: state === 'Error' ? '#f87171' : '#8b8f9a', flex: 'none' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500 }}>{state === 'Error' ? 'Audio could not start' : 'No audio source'}</div>
            <div style={{ fontSize: 11, color: '#8b8f9a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {state === 'Error' ? err : 'Load a file to react to it.'}
            </div>
          </div>
          <button style={{ ...input, width: 'auto', cursor: 'pointer', color: state === 'Error' ? '#f87171' : '#eee' }}
            onClick={() => { setLocalError(''); fileRef.current?.click() }}>
            {state === 'Error' ? 'Retry' : 'Load audio'}
          </button>
        </div>
      )}
      <input ref={fileRef} type="file" accept="audio/*,.mp3,.wav,.m4a,.ogg" hidden
        onChange={(e) => { void pickFile(e.target.files?.[0]); e.currentTarget.value = '' }} />

      <div style={dim}>
      {/* target: the panel is bound to the audio, the target only says where it lands */}
      <div style={{ display: 'flex', gap: 6 }}>
        <Seg options={['Cells', 'Shape']} active={shapeSelected ? 'Shape' : 'Cells'}
          onChange={(v) => onShapeSelected(v === 'Shape')} />
        <span style={{ ...chip, flex: 1, textAlign: 'left', color: '#9a9aa5', overflow: 'hidden', whiteSpace: 'nowrap' }}>{target}</span>
      </div>

      <div style={{ ...row, gridTemplateColumns: '74px 1fr' }}>
        <span style={{ color: '#9a9aa5' }}>Preset</span>
        <select style={input} value={preset.id} onChange={(e) => pickPreset(e.target.value)}>
          {PRESETS.map((p) => <option key={p.id} value={p.id}>{p.id} · {p.verb}{p.wired ? '' : ' · not wired'}</option>)}
        </select>
      </div>

      {/* core 1/4 - Band */}
      <div style={{ ...card, ...(bandOff ? dimCard : {}) }}>
        <div style={head}>
          <span style={title}>1 · Band</span>
          <span style={badge(bandOff ? 'off' : 'off')}>{bandOff ? 'hidden' : config.reactTo}</span>
        </div>
        <Slider label="Lo Hz" value={band[0]} min={20} max={2000} step={10}
          onChange={(v) => patch({ band: [clamp(v, 20, band[1] - 10), band[1]] })} />
        <Slider label="Hi Hz" value={band[1]} min={100} max={16000} step={10}
          onChange={(v) => patch({ band: [band[0], clamp(v, band[0] + 10, 16000)] })} />
        <div style={note}>{copy.bandNote || 'No band for this preset: the source arrives already separated.'}</div>
      </div>

      {/* core 2/4 - Response */}
      <div style={{ ...card, ...((respOff || respReplaced) ? dimCard : {}) }}>
        <div style={head}>
          <span style={title}>2 · Response</span>
          <span style={badge('off')}>{respOff ? 'hidden' : respReplaced ? 'replaced' : 'envelope'}</span>
        </div>
        <Slider label="Threshold" value={config.threshold} min={0} max={0.95} step={0.01} onChange={(v) => patch({ threshold: v })} />
        <Slider label="Attack ms" value={config.attack * 1000} min={0} max={1000} step={1} onChange={(v) => patch({ attack: v / 1000 })} />
        <Slider label="Release ms" value={config.release * 1000} min={0} max={2000} step={1} onChange={(v) => patch({ release: v / 1000 })} />
        <Slider label="Steps" value={config.steps} min={0} max={16} step={1} onChange={(v) => patch({ steps: v })} />
        {(respOff || respReplaced) && (
          <div style={note}>
            {respOff ? 'This preset has no envelope: the curve is the source.' : `Replaced by the ${preset.id} section below.`}
          </div>
        )}
      </div>

      {/* core 3/4 - Range */}
      <div style={card}>
        <div style={head}><span style={title}>3 · Range</span><span style={badge('off')}>{range[1] >= 0.999 ? 'flat' : range[1] < 0.2 ? 'deep' : 'shrink'}</span></div>
        <Slider label="Silent" value={range[0]} min={-1} max={1} step={0.01}
          onChange={(v) => patch({ range: [v, range[1]] })} />
        <Slider label="Peak" value={range[1]} min={-1} max={1} step={0.01}
          onChange={(v) => patch({ range: [range[0], v] })} />
        <Transfer range={range} />
        <div style={note}>Silence is the zero point: the travel Silent → Peak is the depth. Both are sizes, 1 = reference; Peak below Silent shrinks.</div>
      </div>

      {/* core 4/4 - Force */}
      <div style={card}>
        <div style={head}><span style={title}>4 · Force</span><span style={badge('off')}>{fmt(force, 2)}</span></div>
        <Slider label="Force" value={force} min={0} max={1} step={0.01}
          onChange={(v) => patch({ force: v, sensitivity: Math.round(v * 100) })} />
        <div style={note}>Eased: 0.5 on the slider is 0.32 of the gain, 1 is 1. Ceiling now {fmt(ceiling, 2)}.</div>
      </div>

      {/* global power layer: bounds the whole chain so a control at 1 stays playable */}
      <div style={{ ...card, borderColor: 'rgba(139,92,246,0.35)' }}>
        <div style={head}>
          <span style={title}>Global · power</span>
          <span style={badge('on')}>{fmt(glob.depth, 2)}</span>
        </div>
        <Slider label="Depth" value={glob.depth} min={0} max={1} step={0.01} onChange={(v) => patchGlobal({ depth: v })} />
        <Slider label="Scatter" value={glob.scatter} min={0} max={1} step={0.01} onChange={(v) => patchGlobal({ scatter: v })} />
        <Slider label="Speed" value={glob.speed} min={0} max={1} step={0.01} onChange={(v) => patchGlobal({ speed: v })} />
        <Slider label="Glide" value={glob.response} min={0} max={1} step={0.01} onChange={(v) => patchGlobal({ response: v })} />
        <label style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 8 }}>
          <input type="checkbox" checked={config.autoGain !== false} onChange={(e) => patch({ autoGain: e.target.checked })} />
          <span style={{ fontSize: 11, color: '#b9bcc6' }}>auto gain · learn the track range</span>
        </label>
        <div style={note}>
          Depth caps the amount ({fmt(ceiling, 2)}), Scatter caps the radius ({fmt(0.9 + 2.1 * glob.scatter, 2)} cells),
          Speed goes 0.3×–1.6×. Glide is the final smoothing: 0 follows every hit, 1 swells over ~0.4 s.
          Max is fast, not violent.
        </div>
      </div>

      {/* preset section: add / replace / hide, never moves the core */}
      {preset.extra && (
        <div style={{ ...card, borderLeft: `2px solid ${preset.wired ? pv : '#4a4d59'}` }}>
          <div style={head}>
            <span style={{ ...title, color: '#cfcfe0' }}>{preset.id}</span>
            <span style={badge(preset.wired ? 'on' : 'off')}>{preset.verb}</span>
            <span style={{ flex: 1 }} />
            <span style={{ ...chip, color: preset.wired ? '#c9b8ff' : '#8b8f9a', textAlign: 'left' }}>
              {preset.wired ? 'wired' : 'label only'}
            </span>
          </div>
          {preset.extra === 'pulse' && (
            <>
              <Seg options={CURVES} active={curve} onChange={(v) => patch({ curve: v as ModCurve })} />
              <Slider label="Attack" value={ch.attack} min={0} max={1} step={0.01}
                onChange={(v) => patch({ channels: { ...ch, attack: v } })} />
              <Slider label="Sustain" value={ch.sustain} min={0} max={1} step={0.01}
                onChange={(v) => patch({ channels: { ...ch, sustain: v } })} />
              <div style={note}>Two channels, one effect: the attack and the band's sustain are normalised separately, so neither takes the range from the other.</div>
            </>
          )}
          {preset.extra === 'snap' && (
            <>
              <div style={row}><span>Interval</span><span style={{ color: '#8b8f9a' }}>1/8</span><span style={chip}>idle</span></div>
              <div style={row}><span>Hold</span><span style={{ color: '#8b8f9a' }}>{SNAP_HOLD_MS} ms</span><span style={chip}>fixed</span></div>
            </>
          )}
          {preset.extra === 'bpm' && (
            <div style={row}><span>Division</span><span style={{ color: '#8b8f9a' }}>1/4</span><span style={chip}>idle</span></div>
          )}
          {preset.extra === 'stems' && (
            <>
              <span style={{ ...note, marginTop: 2 }}>Stem (band proxy)</span>
              <Seg options={['drums', 'bass', 'vocals', 'other']} active={config.stem ?? 'drums'}
                onChange={(v) => patch({ stem: v as CellAudioConfig['stem'] })} />
            </>
          )}
          {copy.extra?.note && <div style={note}>{copy.extra.note}</div>}
          {!preset.wired && <div style={{ ...note, color: '#7f8391' }}>Params are shown, the engine ignores them.</div>}
        </div>
      )}

      {/* calibration */}
      <div style={card}>
        <div style={head}><span style={title}>Roam</span><span style={badge('off')}>calibration</span></div>
        <Slider label="Seed" value={config.roamSeed ?? 0} min={0} max={64} step={1} onChange={(v) => patch({ roamSeed: v })} />
        <Slider label="Band" value={config.roamBand ?? 0.5} min={0} max={1} step={0.01} onChange={(v) => patch({ roamBand: v })} />
        <Slider label="Speed" value={config.roamSpeed ?? 1} min={0} max={3} step={0.01} onChange={(v) => patch({ roamSpeed: v })} />
      </div>

      {/* live readout */}
      <div style={{ ...card, marginTop: 10, borderColor: 'rgba(139,92,246,0.35)' }}>
        <div style={head}>
          <span style={title}>Live</span>
          <span style={badge(status === 'live' || status === 'waiting for signal' ? 'on' : 'off')}>{status}</span>
        </div>
        <Meter label="level" value={level} />
        <Meter label="curve" value={curveOut} />
        <Meter label="shaped" value={shaped} />
        <Meter label="range" value={Math.min(1, gainRange)} note={fmt(gainRange, 3)} />
        <Meter label="size" value={(size + 1) / 2} note={fmt(size, 2)} />
        <Meter label="amount" value={(amount + 1) / 2} note={fmt(amount, 2)} />
        <div style={{ display: 'flex', gap: 10, marginTop: 6, font: '11px ui-monospace, monospace', color: '#a9adb9' }}>
          <span>radius {fmt(radius, 2)} cells</span>
          <span>engine {engine.id}</span>
          <span>{fmt(fps, 0)} fps</span>
        </div>
      </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        <label style={{ display: 'flex', gap: 6, alignItems: 'center', flex: 1 }}>
          <input type="checkbox" checked={config.enabled} onChange={(e) => patch({ enabled: e.target.checked })} /> enabled
        </label>
        <button style={{ ...input, width: 'auto', cursor: 'pointer' }} onClick={() => onConfig({ ...configFromPreset('level'), enabled: false, devPreset: 'dB', range: [1, 0.55], force: 0.75, global: { ...DEFAULT_GLOBAL } })}>reset</button>
      </div>
      <div style={note}>Drive: the Range end decides depth and direction, Force multiplies it, the curve eases the signal. Power shell: run the dev to see the values move.</div>
    </div>
  )
}

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <label style={row}>
      <span style={{ color: '#b9bcc6' }}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <span style={chip}>{step < 0.1 ? fmt(value, 2) : Math.round(value)}</span>
    </label>
  )
}

function Seg({ options, active, onChange }: { options: string[]; active: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 2, padding: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)}
          style={{
            flex: 1, padding: '4px 8px', border: 'none', borderRadius: 6, cursor: 'pointer', font: '11px system-ui',
            background: o === active ? pv : 'transparent', color: o === active ? '#fff' : '#a9adb9',
          }}>{o}</button>
      ))}
    </div>
  )
}

function Meter({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr 42px', gap: 8, alignItems: 'center', marginTop: 4 }}>
      <span style={{ fontSize: 10, color: '#8b8f9a' }}>{label}</span>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${clamp(value, 0, 1) * 100}%`, background: pv }} />
      </div>
      <span style={{ ...chip, fontSize: 10 }}>{note ?? fmt(value, 2)}</span>
    </div>
  )
}

// transfer preview: input -> output size, with the reference at 1
function Transfer({ range }: { range: [number, number] }) {
  const w = 100, h = 28
  const y = (v: number) => h - ((clamp(v, -1, 1) + 1) / 2) * h
  return (
    <svg width='100%' height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio='none' style={{ marginTop: 8, display: 'block' }}>
      <line x1={0} y1={y(1)} x2={w} y2={y(1)} stroke='rgba(255,255,255,0.16)' strokeDasharray='2 3' strokeWidth={0.6} />
      <line x1={0} y1={y(range[0])} x2={w} y2={y(range[1])} stroke={pv} strokeWidth={1.4} />
      <circle cx={0} cy={y(range[0])} r={1.8} fill={pv} />
      <circle cx={w} cy={y(range[1])} r={1.8} fill={pv} />
    </svg>
  )
}
