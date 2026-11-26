// shader.ts - quoin: a modular grid of cells on grainy paper. Filled cells fuse into a rounded letterform:
// exposed corners get a convex quarter circle, empty cells wedged between two filled neighbours get the
// matching concave fillet, and two cells that only touch diagonally join through an hourglass neck
// (square corners at the shared point, fillets on both empty sides), so blocks read as one smooth glyph.
// Empty cells carry an inscribed circle.
// The signed distance is exact for every 2x2 junction and continuous across cell and quadrant
// boundaries, so antialiasing, glow and shadow never show a seam.
// The cell state is a 64x64 RGBA8 DataTexture written from the React side (R fill, G hover, B flash).
// Everything tunable reads a uniform from U; nothing is a bare number the owner might want to move.
import * as THREE from 'three/webgpu'
import {
  Fn, uniform, float, vec2, vec3, vec4, uv, screenSize, screenCoordinate, texture, mx_noise_float,
  mix, clamp, smoothstep, pow, abs, length, exp, dot, cross, sin, cos, fract, floor, mod, step, min, max, luminance,
} from 'three/tsl'

// The grid texture is fixed at GRID_MAX x GRID_MAX texels: columns and rows can never exceed it (4096
// cells, 16 KiB). A bigger grid would need a bigger texture and the React loop that eases every cell.
export const GRID_MAX = 64

export const makeUniforms = (tex: THREE.DataTexture) => ({
  time: uniform(0), px: uniform(1),
  // grid
  cols: uniform(5), rows: uniform(5), outsideFill: uniform(0), outsideWrap: uniform(0),
  // corners (radii already in cell units, 0..0.5)
  cornerRadius: uniform(0.5), innerRadius: uniform(0.5), padding: uniform(0),
  // lines
  gridOn: uniform(1), gridWidth: uniform(1.2), borderOn: uniform(1), borderWidth: uniform(1.6),
  lineColor: uniform(new THREE.Color('#202020')), lineOpacity: uniform(0.9), gridOverInk: uniform(1),
  // circles
  circles: uniform(1), circleStroke: uniform(1.8), circleScale: uniform(1), circleFill: uniform(0),
  circleFillColor: uniform(new THREE.Color('#ffffff')), circleInFilled: uniform(0),
  // look
  ink: uniform(new THREE.Color('#202020')), paper: uniform(new THREE.Color('#e8e5e8')),
  grain: uniform(0.35), grainScale: uniform(1.5), grainFine: uniform(0.15), inkGrain: uniform(0.08), grainTime: uniform(0),
  // effect
  effectColor: uniform(new THREE.Color('#000000')), shadowAmt: uniform(0), glowAmt: uniform(0), effectSize: uniform(24),
  shadowOffset: uniform(new THREE.Vector2(6, -6)),
  // pointer
  hover: uniform(0.5), hoverColor: uniform(new THREE.Color('#ff5a3c')), flash: uniform(0.6),
  // shading
  brightness: uniform(1), contrast: uniform(1), gamma: uniform(1), saturation: uniform(1), hueShift: uniform(0),
  // film
  vignette: uniform(0.15), vignetteRadius: uniform(0.4), filmGrain: uniform(0.02), dither: uniform(1),
  // frame
  framePadding: uniform(0.06), offset: uniform(new THREE.Vector2(0, 0)), zoom: uniform(1), aa: uniform(0.8),
  // selected-cell audio reactivity
  selectedCell: uniform(new THREE.Vector2(-1, -1)), selectedOn: uniform(0), selectedScale: uniform(1), shapeOn: uniform(0), audioAmt: uniform(0), ringOn: uniform(0),
  // debug
  showField: uniform(0), showCells: uniform(0),
  // the cell grid
  grid: texture(tex),
})
export type Uniforms = ReturnType<typeof makeUniforms>

const hueRotate = (c: any, a: any) => {
  const k = vec3(0.57735)
  const ca = cos(a), sa = sin(a)
  return c.mul(ca).add(cross(k, c).mul(sa)).add(k.mul(dot(k, c)).mul(float(1).sub(ca)))
}

export const buildPicture = (U: Uniforms) => {
  // one cell: vec4(fill, hover, flash, inside). Outside the grid: empty, filled or wrapped (params).
  const cellAt = Fn(([ij]: any[]) => {
    const g = vec2(U.cols, U.rows)
    const c: any = mix(ij, mod(ij, g), U.outsideWrap)
    const inside = step(0, c.x).mul(step(c.x, g.x.sub(0.5))).mul(step(0, c.y)).mul(step(c.y, g.y.sub(0.5)))
    const t = U.grid.sample(c.add(0.5).div(GRID_MAX))
    const v = mix(U.outsideFill, t.r, inside)
    return vec4(v, t.g.mul(inside), t.b.mul(inside), inside)
  })

  // signed distance to the ink in cell units (negative inside), from the cell's 3x3 neighbourhood.
  // Returns vec2(distance, fillet): fillet is 1 in a quadrant of an empty cell that carries a concave
  // fillet (both orthogonal neighbours filled), where the inscribed ring must yield to the ink edge.
  const big = float(10)
  // the classic iq rounded box: p = |local| - halfSize + r
  const rboxP = (p: any, r: any) => length(max(p, 0)).add(min(max(p.x, p.y), 0)).sub(r)
  // distance from pt to the unit box centred at ctr, corners rounded by r (all in cell units)
  const boxD = (pt: any, ctr: any, r: any) => rboxP(abs(pt.sub(ctr)).sub(0.5).add(r), r)

  const sdf = Fn(([c]: any[]) => {
    const ij = floor(c)
    const q = c.sub(ij).sub(0.5)
    const R = U.cornerRadius, Ri = U.innerRadius
    const C = cellAt(ij).r
    const F = (dx: number, dy: number) => step(0.5, cellAt(ij.add(vec2(dx, dy))).r)
    const L = F(-1, 0), Rt = F(1, 0), T = F(0, 1), B = F(0, -1)
    const TL = F(-1, 1), TR = F(1, 1), BL = F(-1, -1), BR = F(1, -1)
    const not = (x: any) => float(1).sub(x)
    const sxp = step(0, q.x), syp = step(0, q.y)
    const aq: any = abs(q)

    // ---- filled cell: the pixel's quadrant and its three neighbours (H beside, V above/below, D diagonal)
    // decide the local shape. Every case is the exact distance to the exposed ink boundary.
    const H = mix(L, Rt, sxp), V = mix(B, T, syp)
    const D = mix(mix(BL, TL, syp), mix(BR, TR, syp), sxp)
    const hBox = boxD(aq, vec2(1, 0), Ri).negate()          // the empty side cell's paper, filleted at the corner
    const vBox = boxD(aq, vec2(0, 1), Ri).negate()
    const dBox = boxD(aq, vec2(1, 1), Ri).negate()          // the empty diagonal's paper (inside corner)
    const dCorner = rboxP(aq.sub(0.5).add(R), R)            // free corner: convex rounding
    const dNeck = max(hBox, vBox)                            // diagonal-only neighbour: square corner, fillets both sides
    const dNone = mix(dCorner, dNeck, D)                     // H empty, V empty
    const dEdgeX = mix(aq.x.sub(0.5), hBox, D)               // H empty, V filled: straight edge, or H's fillet
    const dEdgeY = mix(aq.y.sub(0.5), vBox, D)               // V empty, H filled
    const dHV = mix(dBox, float(-1), D)                      // both filled: inside corner or interior
    const dFilled = mix(mix(dNone, dEdgeX, V), mix(dEdgeY, dHV, V), H)
    // a cell still filling grows from the inscribed disc out to its full shape (the disc is always inside it)
    const grow = clamp(C.sub(0.5).mul(2), 0, 1)
    const dFilledT = max(dFilled, length(q).sub(mix(0.5, 0.78, grow)))

    // ---- empty cell: the nearest of every neighbour's ink. A neighbour's corner toward this cell is
    // rounded only when the two cells beside that corner are empty too; otherwise it is square and flush.
    const rr = (a: any, b: any) => R.mul(not(a)).mul(not(b))
    const pR = mix(big, boxD(q, vec2(1, 0), mix(rr(BR, B), rr(TR, T), syp)), Rt)
    const pL = mix(big, boxD(q, vec2(-1, 0), mix(rr(BL, B), rr(TL, T), syp)), L)
    const pT = mix(big, boxD(q, vec2(0, 1), mix(rr(TL, L), rr(TR, Rt), sxp)), T)
    const pB = mix(big, boxD(q, vec2(0, -1), mix(rr(BL, L), rr(BR, Rt), sxp)), B)
    const pTR = mix(big, boxD(q, vec2(1, 1), rr(Rt, T)), TR)
    const pTL = mix(big, boxD(q, vec2(-1, 1), rr(L, T)), TL)
    const pBR = mix(big, boxD(q, vec2(1, -1), rr(Rt, B)), BR)
    const pBL = mix(big, boxD(q, vec2(-1, -1), rr(L, B)), BL)
    // the concave fillet between two filled orthogonal neighbours: ink outside the paper's rounded corner
    const c0 = float(0.5).sub(Ri)
    const wedge = (sx: number, sy: number, gate: any) => {
      const l = q.mul(vec2(sx, sy)).sub(c0)
      return mix(big, Ri.sub(length(l)), gate.mul(step(0, l.x)).mul(step(0, l.y)))
    }
    const wTR = wedge(1, 1, Rt.mul(T)), wTL = wedge(-1, 1, L.mul(T)), wBR = wedge(1, -1, Rt.mul(B)), wBL = wedge(-1, -1, L.mul(B))
    // the growing dot of a cell in transition
    const dDot = mix(big, length(q).sub(C), step(0.001, C))
    const dEmpty = min(
      min(min(min(pR, pL), min(pT, pB)), min(min(pTR, pTL), min(pBR, pBL))),
      min(min(min(wTR, wTL), min(wBR, wBL)), dDot),
    )
    const fillet = mix(mix(L.mul(B), L.mul(T), syp), mix(Rt.mul(B), Rt.mul(T), syp), sxp)
    return vec2(mix(dEmpty, dFilledT, step(0.5, C)).add(U.padding), fillet)
  })

  return Fn(() => {
    const S = screenSize
    const pPx = uv().mul(S)
    const short = min(S.x, S.y)
    const padPx = U.framePadding.mul(short)
    const cellPx = min(S.x.sub(padPx.mul(2)).div(U.cols), S.y.sub(padPx.mul(2)).div(U.rows)).mul(U.zoom).max(1)
    const gridPx = vec2(U.cols, U.rows).mul(cellPx)
    const origin = S.sub(gridPx).mul(0.5).add(U.offset.mul(short))
    const cu = pPx.sub(origin).div(cellPx)          // unwarped: the grid before the manipulation
    // Kinetic grid: a cell changes size and the rest of its row/column absorbs the difference, so
    // lines stay straight and the grid keeps its exact extent. WHICH cells are touched is a radius:
    // the nearest selected quadrant is read from the selection channel of the cell texture and the
    // radius grows with the audio level (high = more cells compensate, low = fewer).
    const ixc = floor(cu.x), iyc = floor(cu.y)
    const recalc = (x: any, i: any, s: any, f: any): any => {
      const before = x.mul(f)
      const inside = i.mul(f).add(x.sub(i).mul(s))
      const after = i.mul(f).add(s).add(x.sub(i).sub(1).mul(f))
      return mix(mix(before, inside, step(i, x)), after, step(i.add(1), x))
    }
    // Kinetic grid: per-cell sizes with a cumulative map. Every quadrant has its own width and
    // height, the sizes always sum to the grid extent (compensation built in), and the SDF gets
    // (index + u) from the cumulative, so the lines really move and junctions stay unique.
    const sSel = clamp(U.selectedScale, 0.25, 1.6)
    const level = clamp(U.audioAmt, 0, 1)   // audio quantity: 0 silence, 1 peak (polarity fixed)
    // effect radius (debug + driver): distance from the selected quadrant, widened by the level
    const dSel = vec2(cu.x.sub(floor(U.selectedCell.x).add(0.5)), cu.y.sub(floor(U.selectedCell.y).add(0.5)))
    const radCells = float(0.9).add(level.mul(2.0))
    const hit = U.selectedOn.mul(exp(dSel.x.mul(dSel.x).add(dSel.y.mul(dSel.y)).div(radCells.mul(radCells).negate())))
    const shapeMix = float(U.shapeOn)
    const cellAmt = (d: any): any => U.selectedOn.mul(level).mul(exp(d.mul(d).div(-2.6)))
    const shapeAmtAt = (k: any): any => {
      const kf = float(k)
      const h = fract(sin(kf.mul(27.13)).mul(43758.5453))
      return level.mul(float(0.35).add(h.mul(0.65))).mul(0.7)
    }
    const amtCol = (k: any): any => mix(cellAmt(float(k).sub(floor(U.selectedCell.x))), shapeAmtAt(k), shapeMix)
    const amtRow = (k: any): any => mix(cellAmt(float(k).sub(floor(U.selectedCell.y))), shapeAmtAt(float(k).add(7.3)), shapeMix)
    const mapAxis = (x: any, n: any, amtAt: any): any => {
      let sum: any = float(0)
      for (let k = 0; k < 32; k++) sum = sum.add(amtAt(k).mul(step(float(k), n.sub(1))))
      const mean = sum.div(n.max(1))
      let P: any = float(0), idx: any = float(0), u: any = float(0)
      for (let k = 0; k < 32; k++) {
        const w = float(1).sub(amtAt(k).sub(mean)).max(0.2)
        const inCell = step(P, x).mul(float(1).sub(step(P.add(w), x))).mul(step(float(k), n.sub(1)))
        idx = mix(idx, float(k), inCell)
        u = mix(u, x.sub(P).div(w), inCell)
        P = P.add(w)
      }
      return idx.add(clamp(u, 0, 0.999))
    }
    const c = vec2(mapAxis(cu.x, U.cols, amtCol), mapAxis(cu.y, U.rows, amtRow))
    const ij = floor(c)
    const f = c.sub(ij)
    const q = f.sub(0.5)
    const self = cellAt(ij)
    const Cf = step(0.5, self.r)
    const selected = max(step(abs(ij.x.sub(U.selectedCell.x)), 0.1).mul(step(abs(ij.y.sub(U.selectedCell.y)), 0.1)).mul(U.selectedOn), self.a.div(255))
    const half = vec2(U.cols, U.rows).mul(0.5)
    const rectD = max(abs(cu.sub(half)).sub(half).x, abs(cu.sub(half)).sub(half).y).mul(cellPx)   // px, + outside
    const aaPx = U.aa.mul(U.px)
    const aaC = aaPx.div(cellPx)
    const rectMask = float(1).sub(smoothstep(aaPx.negate(), aaPx, rectD))
    const emptyMask = float(1).sub(Cf).mul(rectMask)

    const field = sdf(c)
    const d = field.x, fillet = field.y
    const inkMask = float(1).sub(smoothstep(aaC.negate(), aaC, d)).mul(rectMask)

    // paper: soft mottling (two octaves of noise) plus fine grain; ink gets a faint speckle
    const pN = pPx.div(short).mul(U.grainScale).mul(6)
    const mottle = mx_noise_float(vec3(pN, U.grainTime)).mul(0.6).add(mx_noise_float(vec3(pN.mul(2.7).add(3.1), U.grainTime.mul(1.3))).mul(0.4))
    const seed = screenCoordinate.xy.add(fract(U.grainTime).mul(61.7))
    const fine = fract(sin(dot(seed, vec2(12.9898, 78.233))).mul(43758.5453)).sub(0.5)
    const paper = U.paper.mul(float(1).add(mottle.mul(U.grain).mul(0.12)).add(fine.mul(U.grainFine).mul(0.25)))
    const col = paper.toVar()

    // inscribed circle in empty cells: optional fill, then the ring (drawn after the ink)
    const circ = length(q).sub(U.circleScale.mul(0.5))
    const strokeHalf = U.circleStroke.mul(U.px).div(cellPx).mul(0.5)
    const ring = float(1).sub(smoothstep(strokeHalf.sub(aaC), strokeHalf.add(aaC), abs(circ)))
    const disc = float(1).sub(smoothstep(aaC.negate(), aaC, circ))
    col.assign(mix(col, U.circleFillColor, disc.mul(U.circleFill).mul(emptyMask)))

    // shadow (second SDF at an offset) or glow, under the ink; allowed to spill past the border
    const sizePx = U.effectSize.mul(U.px)
    const sizeC = sizePx.div(cellPx).max(0.001)
    const d2 = sdf(c.sub(U.shadowOffset.mul(U.px).div(cellPx))).x
    const sh = float(1).sub(smoothstep(0, sizeC, d2)).mul(U.shadowAmt)
    const gl = exp(max(d, 0).div(sizeC).negate()).mul(U.glowAmt)
    const spill = sizePx.add(length(U.shadowOffset).mul(U.px))
    const effectMask = float(1).sub(smoothstep(spill.sub(aaPx), spill.add(aaPx), rectD))
    col.assign(mix(col, U.effectColor, clamp(sh.add(gl), 0, 1).mul(effectMask)))

    // ink
    const inkCol = U.ink.mul(float(1).add(fine.mul(U.inkGrain).mul(0.6)))
    col.assign(mix(col, inkCol, inkMask))

    // circle ring: line colour in empty cells (but not in a fillet quadrant, where the ink edge takes its
    // place), paper colour cut into filled cells when asked
    const circleMask = max(emptyMask.mul(float(1).sub(fillet)), Cf.mul(U.circleInFilled).mul(rectMask)).mul(U.circles)
    const ringCol = mix(U.lineColor, paper, Cf.mul(U.circleInFilled))
    col.assign(mix(col, ringCol, ring.mul(circleMask).mul(U.lineOpacity)))

    // the hovered cell tints (over ink too, so the cell about to be erased is visible); painted cells flash
    col.assign(mix(col, U.hoverColor, self.g.mul(U.hover).mul(0.5).mul(rectMask)))
    col.assign(mix(col, U.hoverColor, self.b.mul(U.flash).mul(rectMask)))
    // gridlines inside the rect and the border on its edge, over or under the ink
    const lf = abs(f.sub(0.5))
    const edgeDist = float(0.5).sub(max(lf.x, lf.y)).mul(cellPx)
    const gw = U.gridWidth.mul(U.px).mul(0.5)
    const gridLine = float(1).sub(smoothstep(gw.sub(aaPx), gw.add(aaPx), edgeDist)).mul(U.gridOn).mul(step(rectD, 0))
    const bw = U.borderWidth.mul(U.px).mul(0.5)
    const border = float(1).sub(smoothstep(bw.sub(aaPx), bw.add(aaPx), abs(rectD))).mul(U.borderOn)
    const lines = max(gridLine, border).mul(U.lineOpacity).mul(mix(float(1).sub(inkMask), 1, U.gridOverInk))
    col.assign(mix(col, U.lineColor, lines))
    // debug: heat of the effect radius + contour at half strength (toggled by showField)
    col.assign(mix(col, vec3(1.0, 0.35, 0.12), hit.mul(U.showField).mul(0.18)))
    const ringD = abs(hit.sub(0.5))
    col.assign(mix(col, vec3(0.55, 0.36, 0.96), float(1).sub(smoothstep(float(0.0), float(0.05), ringD)).mul(U.ringOn).mul(hit.max(0.05))))
    // selected cell keeps a visible frame even when the audio scale is at rest
    const selEdge = float(1).sub(smoothstep(gw, gw.add(aaPx), float(0.5).sub(max(abs(q.x), abs(q.y)))))
    col.assign(mix(col, U.hoverColor, selEdge.mul(selected).mul(rectMask).mul(0.9)))

    // grade: brightness, contrast, gamma, saturation, hue
    col.assign(col.mul(U.brightness))
    col.assign(col.sub(0.5).mul(U.contrast).add(0.5))
    col.assign(pow(max(col, 0), vec3(float(1).div(U.gamma))))
    col.assign(mix(vec3(luminance(col)), col, U.saturation))
    col.assign(hueRotate(col, U.hueShift))

    // film: vignette, grain, dither
    const sc = uv().sub(0.5)
    const vig = float(1).sub(clamp(length(sc).sub(U.vignetteRadius), 0, 1).pow(2).mul(U.vignette))
    col.mulAssign(vig)
    const fseed = screenCoordinate.xy.add(fract(U.time).mul(61.7))
    const fnoise = fract(sin(dot(fseed, vec2(12.9898, 78.233))).mul(43758.5453)).sub(0.5)
    col.addAssign(fnoise.mul(U.filmGrain))
    col.addAssign(fnoise.mul(U.dither.div(255)))

    // debug views: the signed distance (warm inside, cool outside, banded), the raw cell texture
    const fieldVis = mix(vec3(1, 0.45, 0.2), vec3(0.2, 0.55, 1), step(0, d)).mul(float(1).sub(abs(d).mul(1.2)).max(0.15)).add(fract(d.mul(4)).mul(0.15))
    col.assign(mix(col, fieldVis, U.showField))
    const cellVis = vec3(self.r).mul(0.8).add(vec3(self.g, 0, self.b).mul(0.6)).add(vec3(0.1).mul(self.a))
    col.assign(mix(col, cellVis, U.showCells))
    return max(col, 0)
  })()
}
