// glyphs.ts - the preset glyphs, drawn on a 5x5 module and scaled by an integer factor for larger grids.
// Rows are top to bottom, 'X' = filled. The reference is the "P" from the screenshot.
export const GLYPHS: Record<string, string[]> = {
  reference: ['.XXX.', 'X...X', 'X...X', 'XXXX.', 'X....'],
  heart: ['.X.X.', 'XXXXX', 'XXXXX', '.XXX.', '..X..'],
  arrow: ['..X..', '...X.', 'XXXXX', '...X.', '..X..'],
  smiley: ['.....', '.X.X.', '.....', 'X...X', '.XXX.'],
  A: ['.XXX.', 'X...X', 'XXXXX', 'X...X', 'X...X'],
  S: ['.XXXX', 'X....', '.XXX.', '....X', 'XXXX.'],
}
export const CYCLE = ['reference', 'heart', 'arrow', 'smiley', 'A', 'S']

// small seeded PRNG so a `seed` param re-rolls the random fill deterministically
export const mulberry32 = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

// Fills `out` (cols x rows, row 0 at the TOP) with a glyph, centred, scaled by `k`. Cells outside stay 0.
export function rasterGlyph(out: Float32Array, cols: number, rows: number, name: string, k: number, density: number, seed: number) {
  out.fill(0)
  if (name === 'clear') return
  if (name === 'random') {
    const rnd = mulberry32(seed * 7919 + 13)
    for (let i = 0; i < cols * rows; i++) out[i] = rnd() < density ? 1 : 0
    return
  }
  const g = GLYPHS[name] ?? GLYPHS.reference
  const gw = g[0].length, gh = g.length
  const x0 = Math.floor((cols - gw * k) / 2), y0 = Math.floor((rows - gh * k) / 2)
  for (let r = 0; r < gh; r++) for (let c = 0; c < gw; c++) {
    if (g[r][c] !== 'X') continue
    for (let dy = 0; dy < k; dy++) for (let dx = 0; dx < k; dx++) {
      const x = x0 + c * k + dx, y = y0 + r * k + dy
      if (x >= 0 && x < cols && y >= 0 && y < rows) out[y * cols + x] = 1
    }
  }
}
