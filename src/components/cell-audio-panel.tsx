import { useEffect, useRef, useState } from 'react'
import {
  AUDIO_PRESETS, configFromPreset,
  type AudioEngine, type AudioPresetKey, type CellAudioConfig, type CellAudioDebug, type CellCoord,
} from '../lib/audio'

type Props = {
  engine: AudioEngine
  config: CellAudioConfig
  onConfig: (config: CellAudioConfig) => void
  selected: CellCoord | null
  debug: CellAudioDebug | null
  debugRing: boolean
  onDebugRing: (v: boolean) => void
}

const box: React.CSSProperties = {
  position: 'absolute', left: 12, bottom: 12, zIndex: 20, width: 344, maxHeight: '72vh',
  overflow: 'auto', padding: 12, background: 'rgba(15,16,20,0.94)', color: '#eee',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, font: '12px system-ui',
  boxShadow: '0 18px 50px rgba(0,0,0,0.35)', backdropFilter: 'blur(14px)',
}
const row: React.CSSProperties = { display: 'grid', gridTemplateColumns: '92px 1fr 48px', gap: 8, alignItems: 'center', marginTop: 7 }
const input: React.CSSProperties = { width: '100%', background: '#22242b', color: '#eee', border: '1px solid #393c46', borderRadius: 6, padding: '4px 6px' }
const button: React.CSSProperties = { background: '#2a2d35', color: '#eee', border: '1px solid #414551', borderRadius: 6, padding: '5px 8px', cursor: 'pointer' }

export default function CellAudioPanel({ engine, config, onConfig, selected, debug, debugRing, onDebugRing }: Props) {
  const [open, setOpen] = useState(true)
  const [snapshot, setSnapshot] = useState(() => engine.snapshot)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const id = window.setInterval(() => setSnapshot(engine.snapshot), 120)
    return () => window.clearInterval(id)
  }, [engine])

  const load = async (file?: File) => {
    if (!file) return
    setError('')
    try {
      await engine.loadFile(file)
      engine.play()
      setSnapshot(engine.snapshot)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  const patch = (p: Partial<CellAudioConfig>) => onConfig({ ...config, ...p })
  const preset = (key: AudioPresetKey) => onConfig({ ...configFromPreset(key), enabled: true })
  const ready = engine.ready
  const canRun = config.enabled && ready && !!selected && !!debug?.filled
  const status = !selected ? 'Select a cell' : !debug?.filled ? 'Selected cell is empty' : !ready ? 'Load an audio file' : !config.enabled ? 'Audio disabled' : 'Reactive'

  if (!open) {
    return <div style={{ ...box, width: 180, padding: 8 }}><button style={button} onClick={() => setOpen(true)}>Cell audio · {status}</button></div>
  }

  return (
    <div style={box}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <strong>Cell audio</strong>
        <button style={button} onClick={() => setOpen(false)}>—</button>
      </div>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button style={button} onClick={() => fileRef.current?.click()}>Load audio</button>
        <button style={button} onClick={() => (snapshot.playing ? engine.pause() : engine.play())} disabled={!ready}>
          {snapshot.playing ? 'Pause' : 'Play'}
        </button>
        <span style={{ color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{snapshot.name || 'No file'}</span>
      </div>
      <input ref={fileRef} type="file" accept="audio/*,.mp3,.wav,.m4a,.ogg" hidden onChange={(e) => { void load(e.target.files?.[0]); e.currentTarget.value = '' }} />
      {error && <div style={{ color: '#ff8a80', marginTop: 6 }}>{error}</div>}

      <Waveform engine={engine} />

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
        <label>Preset</label>
        <select style={input} value={config.preset} onChange={(e) => preset(e.target.value as AudioPresetKey)}>
          {AUDIO_PRESETS.map((p) => <option key={p.key} value={p.key}>{p.label} — {p.hint}</option>)}
        </select>
      </div>

      <Slider label="Sensitivity" value={config.sensitivity} min={0} max={100} step={1} onChange={(v) => patch({ sensitivity: v })} />
      <Slider label="Min scale" value={config.minScale} min={0.1} max={1} step={0.01} onChange={(v) => patch({ minScale: Math.min(v, config.maxScale) })} />
      <Slider label="Max scale" value={config.maxScale} min={0.1} max={1} step={0.01} onChange={(v) => patch({ maxScale: Math.max(v, config.minScale) })} />
      <Slider label="Steps (0 = off)" value={config.steps} min={0} max={32} step={1} onChange={(v) => patch({ steps: v })} />
      <Slider label="Attack (ms)" value={config.attack * 1000} min={0} max={1000} step={1} onChange={(v) => patch({ attack: v / 1000 })} />
      <Slider label="Release (ms)" value={config.release * 1000} min={0} max={2000} step={1} onChange={(v) => patch({ release: v / 1000 })} />
      <Slider label="Threshold" value={config.threshold} min={0} max={1} step={0.01} onChange={(v) => patch({ threshold: v })} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input type="checkbox" checked={config.enabled} onChange={(e) => patch({ enabled: e.target.checked })} /> Enabled
        </label>
        <button style={button} onClick={() => onConfig({ ...configFromPreset('level'), enabled: false })}>Reset</button>
      </div>
      <div style={{ marginTop: 8 }}>
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input type="checkbox" checked={debugRing} onChange={(e) => onDebugRing(e.target.checked)} /> Debug ring
        </label>
      </div>

      <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid #33363f', color: canRun ? '#8ee6a5' : '#ffcc80' }}>
        <div><b>Status:</b> {status}</div>
        <div><b>Cell:</b> {selected ? `x ${selected.x + 1} · y ${selected.y + 1}` : 'none'}</div>
        <div><b>Raw:</b> {(debug?.raw ?? 0).toFixed(4)} · <b>Shaped:</b> {(debug?.shaped ?? 0).toFixed(4)}</div>
        <div><b>Scale:</b> {(debug?.scale ?? 1).toFixed(3)} · <b>BPM:</b> {snapshot.bpm ?? '—'}</div>
        <div><b>Engine active:</b> {debug?.enabled ? 'yes' : 'no'} · ready {debug?.engineReady ? 'yes' : 'no'} · config {debug?.configEnabled ? 'yes' : 'no'} · selection {debug?.hasSelection ? 'yes' : 'no'}</div>
        <div><b>Engine:</b> {engine.id} / {debug?.engineId || 'none'}</div>
        <div><b>Time:</b> {snapshot.currentTime?.toFixed?.(2) ?? '0.00'} / {snapshot.duration.toFixed(2)} s</div>
      </div>
    </div>
  )
}

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <label style={row}>
      <span>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <span style={{ textAlign: 'right' }}>{step < 0.1 ? value.toFixed(2) : step < 1 ? value.toFixed(1) : Math.round(value)}</span>
    </label>
  )
}

function Waveform({ engine }: { engine: AudioEngine }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    let raf = 0
    const draw = () => {
      const cv = ref.current
      if (cv) {
        const w = Math.max(1, cv.clientWidth), h = Math.max(1, cv.clientHeight), dpr = Math.min(2, window.devicePixelRatio || 1)
        if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
          cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr)
        }
        const g = cv.getContext('2d')!
        g.setTransform(dpr, 0, 0, dpr, 0, 0)
        g.clearRect(0, 0, w, h)
        g.fillStyle = '#0d0f13'; g.fillRect(0, 0, w, h)
        g.strokeStyle = 'rgba(255,255,255,0.08)'; g.lineWidth = 1
        for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo((w * i) / 4, 0); g.lineTo((w * i) / 4, h); g.stroke() }
        g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke()

        const peaks = engine.peaks
        g.strokeStyle = 'rgba(190,198,214,0.55)'; g.lineWidth = 1
        g.beginPath()
        for (let i = 0; i < peaks.length; i++) {
          const x = (i / Math.max(1, peaks.length - 1)) * w
          const a = peaks[i] * (h * 0.46)
          g.moveTo(x, h / 2 - a); g.lineTo(x, h / 2 + a)
        }
        g.stroke()

        const wave = engine.waveform
        g.strokeStyle = '#9dff9a'; g.lineWidth = 1.2; g.beginPath()
        for (let i = 0; i < wave.length; i++) {
          const x = (i / Math.max(1, wave.length - 1)) * w
          const y = h / 2 - wave[i] * (h * 0.45)
          if (i === 0) g.moveTo(x, y); else g.lineTo(x, y)
        }
        g.stroke()

        if (engine.duration > 0) {
          const x = Math.max(0, Math.min(1, engine.currentTime / engine.duration)) * w
          g.strokeStyle = '#ffb86b'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke()
        }
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [engine])
  return (
    <canvas ref={ref} style={{ width: '100%', height: 76, marginTop: 8, borderRadius: 6, cursor: 'pointer' }}
      onClick={(e) => {
        if (engine.duration <= 0) return
        const r = e.currentTarget.getBoundingClientRect()
        engine.seek(((e.clientX - r.left) / r.width) * engine.duration)
      }} />
  )
}
