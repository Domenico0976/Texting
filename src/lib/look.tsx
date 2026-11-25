// look.tsx - helpers for variants that reuse Main's grid shaper with their own starting values.
// withLook(look) returns a component that renders Main with `look` under the story's values (a value the
// story sets wins; an undefined one never erases a look value), on a backdrop of the resolved paper colour.
import { useEffect, useRef, type ReactNode } from 'react'
import Main from '../variants/main'

export type ShaperProps = Parameters<typeof Main>[0]

export function withLook(look: ShaperProps) {
  return function Look(props: ShaperProps) {
    const p: Record<string, unknown> = { ...look }
    for (const [k, v] of Object.entries(props ?? {})) if (v !== undefined) p[k] = v
    const m = p as ShaperProps
    const paper = (m.invert ? m.inkColor : m.paperColor) ?? '#000'
    return <Settled paper={paper}><Main {...m} /></Settled>
  }
}

// The shader's uniforms start from Main's palette and ease toward the look's; hold the canvas on the paper
// colour while that settles (about half a second), then fade it in, so the first frames never flash the
// wrong colours or show the frame easing into place.
function Settled({ paper, children }: { paper: string; children: ReactNode }) {
  const el = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const a = el.current?.animate([{ opacity: 0 }, { opacity: 0, offset: 0.6 }, { opacity: 1 }], { duration: 1000, easing: 'ease-out', fill: 'both' })
    return () => a?.cancel()
  }, [])
  return (
    <div className="h-full w-full" style={{ background: paper }}>
      <div ref={el} className="h-full w-full" style={{ opacity: 0 }}>{children}</div>
    </div>
  )
}
