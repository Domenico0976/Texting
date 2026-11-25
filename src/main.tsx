import { StrictMode, useEffect, useRef, useState } from 'react'
import type { ComponentType } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import Variant0 from './components/main.tsx'
import Variant1 from './components/dense-riso.tsx'
import Variant2 from './components/midnight-minimal.tsx'
import { ControlsPanel, useControls } from './controls-ui'
import CellAudioPanel from './components/cell-audio-panel'
import { AudioEngine, configFromPreset, type CellAudioConfig, type CellAudioDebug, type CellCoord } from './lib/audio'
import rawSchema from '../controls/main.json'
const schema = (rawSchema as any).story

const values0 = {"glyph":"reference","presetScale":true,"randomDensity":0.47,"outside":"empty","gridWidth":0.3,"borderWidth":0.3,"lineOpacity":0.44,"circleScale":1,"circleStroke":0.3,"circleInFilled":false,"invert":false,"effect":"none","paused":false,"hud":false,"showField":false,"showCells":false,"fps":false,"offsetX":0.105,"framePadding":13.5,"tone":"neutral","gamma":0.85,"brushSize":2,"tool":"toggle"}
const values1 = {"glyph":"reference","columns":15,"rows":15,"presetScale":true,"outside":"empty","gridWidth":0.3,"borderWidth":0.6,"lineFollowsInk":false,"lineColor":"#2a5cab","lineOpacity":0.38,"gridOverInk":false,"circleScale":1,"circleStroke":0.3,"circleInFilled":false,"inkColor":"#e8442e","paperColor":"#f4ecd8","invert":false,"effect":"none","paused":false,"hud":false,"showField":false,"showCells":false,"fps":false}
const values2 = {"glyph":"reference","presetScale":true,"outside":"empty","gridWidth":0.3,"border":false,"borderWidth":0.3,"lineOpacity":0.14,"gridOverInk":false,"circles":false,"circleStroke":0.3,"circleInFilled":false,"inkColor":"#f1ece2","paperColor":"#0e0e11","invert":false,"effect":"none","vignette":0.6,"framePadding":16,"paused":false,"hud":false,"showField":false,"showCells":false,"fps":false}

const variants: Record<string, ComponentType<any>> = {
  "var_76b859b6-a75a-41da-95d8-91908139cde9": Variant0,
  "var_99b619b5-168a-484b-a4ae-f312f490c260": Variant1,
  "var_b76cb20b-8691-4990-adbb-46322c7561bf": Variant2,
}
const byName: Record<string, string> = {
  "Main": "var_76b859b6-a75a-41da-95d8-91908139cde9",
  "Dense Riso": "var_99b619b5-168a-484b-a4ae-f312f490c260",
  "Midnight Minimal": "var_b76cb20b-8691-4990-adbb-46322c7561bf",
}
const initialById: Record<string, any> = {
  "var_76b859b6-a75a-41da-95d8-91908139cde9": values0,
  "var_99b619b5-168a-484b-a4ae-f312f490c260": values1,
  "var_b76cb20b-8691-4990-adbb-46322c7561bf": values2,
}

function App() {
  const requested = new URLSearchParams(location.search).get('variant')
  const [variantId, setVariantId] = useState<string>(
    (requested && (variants[requested] ? requested : byName[requested])) || "var_76b859b6-a75a-41da-95d8-91908139cde9"
  )
  const { values, set, reset } = useControls(schema as any, initialById[variantId])
  const audioRef = useRef<AudioEngine | null>(null)
  if (!audioRef.current) audioRef.current = new AudioEngine()
  const [selectedCell, setSelectedCell] = useState<CellCoord | null>(null)
  const [audioConfig, setAudioConfig] = useState<CellAudioConfig>({ ...configFromPreset('level'), enabled: false })
  const [audioDebug, setAudioDebug] = useState<CellAudioDebug | null>(null)
  useEffect(() => () => audioRef.current?.stop(), [])
  const Variant = variants[variantId] ?? (() => null)

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 10, display: 'flex', gap: 6 }}>
          {Object.keys(byName).map(name => (
            <button key={name} onClick={() => setVariantId(byName[name])}
              style={{ padding: '4px 10px', background: variantId === byName[name] ? '#fff' : '#333', color: variantId === byName[name] ? '#000' : '#eee', border: 'none', cursor: 'pointer', borderRadius: 4 }}>
              {name}
            </button>
          ))}
        </div>
        <Variant
          {...values}
          audioEngine={audioRef.current}
          audioConfig={audioConfig}
          selectedCell={selectedCell}
          onCellSelect={setSelectedCell}
          onAudioDebug={setAudioDebug}
        />
        <CellAudioPanel
          engine={audioRef.current}
          config={audioConfig}
          onConfig={setAudioConfig}
          selected={selectedCell}
          debug={audioDebug}
        />
      </div>
      <ControlsPanel schema={schema as any} values={values} set={set} onReset={reset} />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>,
)