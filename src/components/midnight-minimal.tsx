// midnight-minimal.tsx - "Midnight Minimal": the Main grid shaper as a dark poster. Cream ink on near-black,
// no border and no inscribed rings, only a ghost grid at low opacity (enough to draw on), a wide margin so
// the glyph floats, and a deep vignette. Same tool, same controls as Main; only the starting values differ.
// The picture and every behaviour come from Main (via src/lib/look.tsx).
import { withLook, type ShaperProps } from '../lib/look'

const LOOK: ShaperProps = {
  glyph: 'reference', columns: 5, rows: 5, presetScale: true, randomDensity: 0.47, outside: 'empty',
  cornerRadius: 1, innerCorners: true, innerRadius: 1, padding: 0, breathe: 0,
  gridlines: true, gridWidth: 0.3, border: false, borderWidth: 0.3, lineFollowsInk: true, lineColor: '#f1ece2',
  lineOpacity: 0.14, gridOverInk: false,
  circles: false, circleStroke: 0.3, circleScale: 1, circleFill: 0, circleInFilled: false,
  look: 'custom', inkColor: '#f1ece2', paperColor: '#0e0e11', invert: false,
  grain: 0.2, grainScale: 1.5, grainFine: 0.1, inkGrain: 0.04,
  effect: 'none', hover: 0, hud: false,
  vignette: 0.6, vignetteRadius: 0.3, filmGrain: 0.03, framePadding: 16,
}
export default withLook(LOOK)
