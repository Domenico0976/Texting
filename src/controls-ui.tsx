import { useState, useMemo } from 'react'

export type Control = {
  prop: string
  control: string
  label?: string
  default?: any
  min?: number
  max?: number
  step?: number
  options?: string[]
  visibleWhen?: { prop: string; equals: any }
  collapsible?: boolean
}
export type Section = { title?: string | null; collapsible?: boolean; controls: Control[] }
export type Schema = { sections: Section[]; values?: Record<string, any>; canvas?: any }

function visible(c: Control, values: Record<string, any>) {
  if (!c.visibleWhen) return true
  return values[c.visibleWhen.prop] === c.visibleWhen.equals
}

export function useControls(schema: Schema, initial?: Record<string, any>) {
  const defaults = useMemo(() => {
    const d: Record<string, any> = {}
    for (const s of schema.sections) for (const c of s.controls) {
      if (c.default !== undefined) d[c.prop] = c.default
    }
    return d
  }, [schema])
  const [values, setValues] = useState<Record<string, any>>({ ...defaults, ...(schema.values || {}), ...(initial || {}) })
  const set = (prop: string, v: any) => setValues(prev => ({ ...prev, [prop]: v }))
  const reset = () => setValues({ ...defaults, ...(schema.values || {}), ...(initial || {}) })
  return { values, set, reset }
}

export function ControlsPanel({ schema, values, set, onReset }: { schema: Schema; values: Record<string, any>; set: (p: string, v: any) => void; onReset: () => void }) {
  return (
    <div style={{ width: 320, maxHeight: '100vh', overflow: 'auto', padding: 12, background: '#111', color: '#eee', fontSize: 12, fontFamily: 'system-ui' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <strong>Controls</strong>
        <button onClick={onReset} style={{ background: '#333', color: '#eee', border: 'none', padding: '2px 8px', cursor: 'pointer' }}>Reset</button>
      </div>
      {schema.sections.map((s, i) => (
        <details key={i} open={!s.collapsible} style={{ marginBottom: 10, border: '1px solid #333', borderRadius: 6, padding: 8 }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>{s.title || 'Section'}</summary>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {s.controls.filter(c => visible(c, values)).map(c => (
              <div key={c.prop}>
                <label style={{ display: 'block', marginBottom: 2 }}>{c.label || c.prop}</label>
                {renderControl(c, values[c.prop], (v) => set(c.prop, v))}
              </div>
            ))}
          </div>
        </details>
      ))}
    </div>
  )
}

function renderControl(c: Control, val: any, onChange: (v: any) => void) {
  const v = val ?? c.default
  if (c.control === 'switch') {
    return <input type="checkbox" checked={!!v} onChange={e => onChange(e.target.checked)} />
  }
  if (c.control === 'slider') {
    return (
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input type="range" min={c.min} max={c.max} step={c.step} value={v ?? 0}
          onChange={e => onChange(Number(e.target.value))} style={{ flex: 1 }} />
        <span style={{ width: 48, textAlign: 'right' }}>{typeof v === 'number' ? v.toFixed(3) : v}</span>
      </div>
    )
  }
  if (c.control === 'segmented' || c.control === 'select') {
    return (
      <select value={v} onChange={e => onChange(e.target.value)} style={{ width: '100%' }}>
        {(c.options || []).map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    )
  }
  if (c.control === 'color') {
    return <input type="color" value={v || '#000000'} onChange={e => onChange(e.target.value)} />
  }
  if (c.control === 'text') {
    return <input type="text" value={v ?? ''} onChange={e => onChange(e.target.value)} style={{ width: '100%' }} />
  }
  if (c.control === 'number') {
    return <input type="number" value={v ?? 0} onChange={e => onChange(Number(e.target.value))} style={{ width: '100%' }} />
  }
  return <span style={{ color: '#888' }}>({c.control})</span>
}