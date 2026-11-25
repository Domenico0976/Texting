// dense-riso.tsx - "Dense Riso": the Main grid shaper at print density. A 15 x 15 module grid (presets scale
// up 3x, so a glyph reads as chunky blocks with small soft corners), riso red ink on warm cream stock, blue
// hairline rules that sit under the ink, and heavy paper and ink grain. Same tool, same controls as Main;
// only the starting values differ. The picture and every behaviour come from Main (via src/lib/look.tsx).
import { withLook, type ShaperProps } from '../lib/look'

const LOOK: ShaperProps = {
  glyph: 'reference', columns: 15, rows: 15, presetScale: true, randomDensity: 0.47, outside: 'empty',
  cornerRadius: 1, innerCorners: true, innerRadius: 1, padding: 0, breathe: 0,
  gridlines: true, gridWidth: 0.3, border: true, borderWidth: 0.6, lineFollowsInk: false, lineColor: '#2a5cab',
  lineOpacity: 0.38, gridOverInk: false,
  circles: true, circleStroke: 0.3, circleScale: 1, circleFill: 0, circleInFilled: false,
  look: 'custom', inkColor: '#e8442e', paperColor: '#f4ecd8', invert: false,
  grain: 0.55, grainScale: 2.5, grainFine: 0.28, inkGrain: 0.32,
  effect: 'none', hover: 0, hud: false,
  vignette: 0.08, filmGrain: 0.025, framePadding: 5,
}
export default withLook(LOOK)
