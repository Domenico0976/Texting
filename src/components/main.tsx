// main.tsx - the variant: props -> uniforms, the cell grid (a DataTexture the pointer paints into), the stage
// and an optional HUD (off by default: the scene is the picture alone). Breathing corners and the hover
// tint are also off by default so a composition holds perfectly still and has no UI colour in it.
// The picture is in src/lib/shader.ts; the glyph presets in src/lib/glyphs.ts.
// quoin: paint cells on a grid; filled blocks round into a smooth letterform. Shift / right button erases.
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three/webgpu'
import { mountStage, type Stage } from '../lib/stage'
import { makeUniforms, buildPicture, GRID_MAX } from '../lib/shader'
import { CYCLE, rasterGlyph } from '../lib/glyphs'
import {
  configFromPreset, createFollowerState, resolveCellScale, shapeCellSignal,
  type AudioEngine, type CellAudioConfig, type CellAudioDebug, type CellCoord,
} from '../lib/audio'

type Look = 'custom' | 'paper' | 'night' | 'blueprint' | 'riso' | 'mint'
type Glyph = 'reference' | 'heart' | 'arrow' | 'smiley' | 'A' | 'S' | 'random' | 'clear'
type Props = {
  glyph?: Glyph; columns?: number; rows?: number; presetScale?: boolean; randomDensity?: number; seed?: number; outside?: 'empty' | 'filled' | 'wrap'; fillSpeed?: number
  cornerRadius?: number; innerCorners?: boolean; innerRadius?: number; padding?: number; breathe?: number; breatheRate?: number; cycle?: boolean; cyclePeriod?: number; cycleStagger?: number
  gridlines?: boolean; gridWidth?: number; border?: boolean; borderWidth?: number; lineFollowsInk?: boolean; lineColor?: string; lineOpacity?: number; gridOverInk?: boolean
  circles?: boolean; circleStroke?: number; circleScale?: number; circleFill?: number; circleFillColor?: string; circleInFilled?: boolean
  look?: Look; inkColor?: string; paperColor?: string; invert?: boolean; grain?: number; grainScale?: number; grainFine?: number; inkGrain?: number; grainAnimate?: boolean
  effect?: 'none' | 'shadow' | 'glow'; effectColor?: string; effectOpacity?: number; effectSize?: number; shadowX?: number; shadowY?: number
  tool?: 'toggle' | 'draw' | 'erase' | 'select' | 'off'; brushSize?: number; hover?: number; hoverColor?: string; hoverEase?: number; paintFlash?: number
  brightness?: number; contrast?: number; gamma?: number; saturation?: number; hueShift?: number
  speed?: number; paused?: boolean; timeOffset?: number; respectReducedMotion?: boolean
  exposure?: number; tone?: 'neutral' | 'agx' | 'aces' | 'linear'; vignette?: number; vignetteRadius?: number; filmGrain?: number; dither?: number
  resolutionScale?: number; pixelRatioCap?: number; framePadding?: number; offsetX?: number; offsetY?: number; zoom?: number; antialias?: number
  hud?: boolean; title?: string; subtitle?: string; note?: string; hudColor?: 'auto' | 'light' | 'dark'; hudPosition?: 'bottom-left' | 'top-left' | 'bottom-right' | 'top-right'; hudScale?: number
  showField?: boolean; showCells?: boolean; fps?: boolean
  audioEngine?: AudioEngine | null
  audioConfig?: CellAudioConfig
  selectedCell?: CellCoord | null
  selectedCells?: CellCoord[]
  shapeSelected?: boolean
  debugRing?: boolean
  onCellSelect?: (cell: CellCoord | null) => void
  onAudioDebug?: (debug: CellAudioDebug) => void
}
type RenderProps = Required<Omit<Props, 'audioEngine' | 'audioConfig' | 'selectedCell' | 'selectedCells' | 'shapeSelected' | 'debugRing' | 'onCellSelect' | 'onAudioDebug'>>
const DEFAULTS: RenderProps = {
  glyph: 'reference', columns: 5, rows: 5, presetScale: true, randomDensity: 0.45, seed: 7, outside: 'empty', fillSpeed: 10,
  cornerRadius: 1, innerCorners: true, innerRadius: 1, padding: 0, breathe: 0, breatheRate: 0.25, cycle: false, cyclePeriod: 4, cycleStagger: 0.5,
  gridlines: true, gridWidth: 1.2, border: true, borderWidth: 1.6, lineFollowsInk: true, lineColor: '#2c2c2c', lineOpacity: 0.9, gridOverInk: true,
  circles: true, circleStroke: 1.8, circleScale: 1, circleFill: 0, circleFillColor: '#ffffff', circleInFilled: false,
  look: 'custom', inkColor: '#202020', paperColor: '#e8e5e8', invert: false, grain: 0.35, grainScale: 1.5, grainFine: 0.15, inkGrain: 0.08, grainAnimate: false,
  effect: 'none', effectColor: '#000000', effectOpacity: 0.5, effectSize: 24, shadowX: 6, shadowY: -6,
  tool: 'toggle', brushSize: 1, hover: 0, hoverColor: '#ff5a3c', hoverEase: 12, paintFlash: 0.6,
  brightness: 1, contrast: 1, gamma: 1, saturation: 1, hueShift: 0,
  speed: 1, paused: false, timeOffset: 0, respectReducedMotion: true,
  exposure: 1, tone: 'neutral', vignette: 0.15, vignetteRadius: 0.4, filmGrain: 0.02, dither: 1,
  resolutionScale: 1, pixelRatioCap: 2, framePadding: 6, offsetX: 0, offsetY: 0, zoom: 1, antialias: 0.8,
  hud: false, title: 'quoin // three.js tsl', subtitle: 'modular grid glyphs | realtime, webgpu', note: 'click or drag to draw · shift or right button erases', hudColor: 'auto', hudPosition: 'bottom-left', hudScale: 1,
  showField: false, showCells: false, fps: false,
}
const DEFAULT_AUDIO: CellAudioConfig = { ...configFromPreset('level'), enabled: false }
// A look sets colours (and a few line / effect values) at once; `custom` leaves everything to the controls.
const LOOKS: Record<Look, Partial<Props>> = {
  custom: {},
  paper: { inkColor: '#202020', paperColor: '#e8e5e8', lineFollowsInk: false, lineColor: '#2c2c2c' },
  night: { inkColor: '#f0ece4', paperColor: '#131316', lineFollowsInk: true, effect: 'glow', effectColor: '#f0ece4', effectOpacity: 0.25, effectSize: 30 },
  blueprint: { inkColor: '#eef4ff', paperColor: '#1d3f8c', lineFollowsInk: false, lineColor: '#9ab4ea', grain: 0.2 },
  riso: { inkColor: '#e9432c', paperColor: '#f5ecd7', lineFollowsInk: false, lineColor: '#2a5cab', inkGrain: 0.3 },
  mint: { inkColor: '#0d3b2f', paperColor: '#d9f1e3', lineFollowsInk: true, circleFill: 0.35, circleFillColor: '#ffffff' },
}
const TONES: Record<string, THREE.ToneMapping> = { neutral: THREE.NeutralToneMapping, agx: THREE.AgXToneMapping, aces: THREE.ACESFilmicToneMapping, linear: THREE.LinearToneMapping }
const D = Math.PI / 180
const N = GRID_MAX

export default function Quoin(raw: Props) {
  const props = { ...DEFAULTS, ...raw }
  const host = useRef<HTMLDivElement>(null)
  const live = useRef(props)
  live.current = props
  const selectedRef = useRef<CellCoord | null>(props.selectedCell ?? null)
  selectedRef.current = props.selectedCell ?? null
  const debugCb = useRef(props.onAudioDebug)
  debugCb.current = props.onAudioDebug
  const [failed, setFailed] = useState<string | null>(null)
  const [stats, setStats] = useState({ fps: 0, backend: 'starting', w: 0, h: 0 })

  useEffect(() => {
    const el = host.current!

    // the cell grid: target state, eased fill, hover and flash per cell, packed into one RGBA8 texture
    const target = new Float32Array(N * N), fill = new Float32Array(N * N)
    const hov = new Float32Array(N * N), flash = new Float32Array(N * N)
    const pendAt = new Float32Array(N * N).fill(-1), pendVal = new Float32Array(N * N)
    const scratch = new Float32Array(N * N)
    const data = new Uint8Array(N * N * 4)
    const tex = new THREE.DataTexture(data, N, N, THREE.RGBAFormat, THREE.UnsignedByteType)
    tex.needsUpdate = true

    const U = makeUniforms(tex)
    const material = new THREE.MeshBasicNodeMaterial()
    material.colorNode = buildPicture(U)

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const resolved = (p: RenderProps) => ({ ...p, ...LOOKS[p.look] })
    const goal = new THREE.Color(), goalOffset = new THREE.Vector2(), goalShadow = new THREE.Vector2()
    const ease = (u: { value: number }, to: number, k: number) => { u.value += (to - u.value) * k }
    const idx = (x: number, y: number) => y * N + x            // texel index, y from the bottom

    let cols = 5, rows = 5, userDirty = false, current: string = props.glyph, cycleIdx = 0, cycleT = 0
    let seenGlyph = '', seenSeed = NaN, seenDensity = NaN, seenScale: boolean | null = null
    let tone = '', statAt = 0, dragAction = -1, lastCx = NaN, lastCy = NaN, eraseMod = false
    let clock = 0
    const follower = createFollowerState()
    let lastAudioDebug = 0

    // write a preset (row 0 at the top) into the pending or the target grid, centred, scaled
    const applyGlyph = (name: string, stagger: number) => {
      const p = live.current
      const k = p.presetScale ? Math.max(1, Math.floor(Math.min(cols, rows) / 5)) : 1
      rasterGlyph(scratch, cols, rows, name, k, p.randomDensity, Math.round(p.seed))
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const v = scratch[(rows - 1 - y) * cols + x]           // flip: texel y grows upward
        const i = idx(x, y)
        if (stagger > 0) { pendVal[i] = v; pendAt[i] = clock + stagger * ((x + (rows - 1 - y)) / Math.max(1, cols + rows - 2)) }
        else { target[i] = v; pendAt[i] = -1 }
      }
    }
    const paint = (cx: number, cy: number, v: number, brush: number) => {
      const b = Math.max(1, Math.round(brush)), o = Math.floor((b - 1) / 2)
      const x0 = Math.floor(cx) - o, y0 = Math.floor(cy) - o
      for (let y = y0; y < y0 + b; y++) for (let x = x0; x < x0 + b; x++) {
        if (x < 0 || y < 0 || x >= cols || y >= rows) continue
        const i = idx(x, y)
        if (target[i] !== v) { target[i] = v; flash[i] = 1; userDirty = true }
        pendAt[i] = -1
      }
    }

    // modifier keys, the right button and the exact press position are not in stage.ts's pointer: read
    // them off the same events (the press position decides the drag's action even if the pointer has
    // already moved on, or been released, by the time the next frame runs)
    const presses: { x: number; y: number; erase: boolean }[] = []
    const onDown = (e: PointerEvent) => {
      eraseMod = e.shiftKey || e.button === 2
      const r = el.getBoundingClientRect()
      presses.push({ x: (e.clientX - r.left) / Math.max(1, r.width), y: 1 - (e.clientY - r.top) / Math.max(1, r.height), erase: eraseMod })
    }
    const onMove = (e: PointerEvent) => { if (e.buttons) eraseMod = e.shiftKey || (e.buttons & 2) !== 0 }
    const onCtx = (e: Event) => e.preventDefault()
    el.addEventListener('pointerdown', onDown); el.addEventListener('pointermove', onMove); el.addEventListener('contextmenu', onCtx)

    const stage: Stage = mountStage({
      host: el, material,
      onError: err => setFailed(String((err as any)?.message ?? err)),
      onFrame: (dt, real) => {
        const raw = live.current
        const p = resolved(raw)
        const k = 1 - Math.exp(-real * 9)

        const still = p.paused || (p.respectReducedMotion && reduced)
        if (!still) { U.time.value += dt * p.speed; clock += dt * p.speed }
        const tAt = U.time.value + p.timeOffset

        // grid size and presets (edge-triggered so a drawing survives until the next change)
        const nc = Math.min(N, Math.max(2, Math.round(p.columns))), nr = Math.min(N, Math.max(2, Math.round(p.rows)))
        let reapply = false
        if (nc !== cols || nr !== rows) { cols = nc; rows = nr; reapply = !userDirty }
        if (p.presetScale !== seenScale) { seenScale = p.presetScale; reapply = reapply || (seenGlyph !== '' && !userDirty) }
        if (p.glyph !== seenGlyph) { seenGlyph = p.glyph; current = p.glyph; userDirty = false; reapply = true }
        if (p.seed !== seenSeed || p.randomDensity !== seenDensity) { seenSeed = p.seed; seenDensity = p.randomDensity; if (current === 'random' && !userDirty) reapply = true }
        if (p.cycle && !still) {
          cycleT += dt * p.speed
          if (cycleT >= p.cyclePeriod) { cycleT = 0; cycleIdx = (cycleIdx + 1) % CYCLE.length; current = CYCLE[cycleIdx]; userDirty = false; applyGlyph(current, p.cycleStagger * p.cyclePeriod * 0.5) }
        }
        if (reapply) applyGlyph(current, 0)
        U.cols.value = cols; U.rows.value = rows
        U.outsideFill.value = p.outside === 'filled' ? 1 : 0
        U.outsideWrap.value = p.outside === 'wrap' ? 1 : 0

        // pointer -> cell coordinates (same layout maths as the shader, in physical pixels)
        const { w, h, pw, ph } = stage.size()
        const short = Math.min(pw, ph), padPx = (p.framePadding / 100) * short
        const cellPx = Math.max(1, Math.min((pw - 2 * padPx) / cols, (ph - 2 * padPx) / rows) * p.zoom)
        const ox = (pw - cols * cellPx) / 2 + p.offsetX * short, oy = (ph - rows * cellPx) / 2 + p.offsetY * short
        const pt = stage.pointer
        const cx = (pt.x * pw - ox) / cellPx, cy = (pt.y * ph - oy) / cellPx
        const inGrid = pt.inside && cx >= 0 && cy >= 0 && cx < cols && cy < rows
        const hx = Math.floor(cx), hy = Math.floor(cy)
        // every press since the last frame (even ones already released): decide the action from the cell
        // under the press itself, paint it, then continue from there to wherever the pointer is now
        const pressed = presses.length > 0
        if (p.tool === 'select') {
          for (const pr of presses) {
            const dx = (pr.x * pw - ox) / cellPx, dy = (pr.y * ph - oy) / cellPx
            if (dx >= 0 && dy >= 0 && dx < cols && dy < rows) {
              live.current.onCellSelect?.({ x: Math.floor(dx), y: Math.floor(dy) })
            }
          }
          presses.length = 0
          dragAction = -1
        } else {
          for (const pr of presses) {
            const dx = (pr.x * pw - ox) / cellPx, dy = (pr.y * ph - oy) / cellPx
            const onGrid = dx >= 0 && dy >= 0 && dx < cols && dy < rows
            const base = p.tool === 'draw' ? 1 : p.tool === 'erase' ? 0 : p.tool === 'toggle' ? (onGrid && target[idx(Math.floor(dx), Math.floor(dy))] > 0.5 ? 0 : 1) : -1
            dragAction = base < 0 ? -1 : pr.erase ? 1 - base : base
            lastCx = dx; lastCy = dy
            if (dragAction >= 0) paint(dx, dy, dragAction, p.brushSize)
          }
          presses.length = 0
        }
        if ((pt.down || pressed) && dragAction >= 0 && pt.inside) {
          // paint along the segment since the last frame so a fast drag leaves no gaps
          const steps = Math.max(1, Math.ceil(Math.hypot(cx - lastCx, cy - lastCy) * 2))
          for (let s = 1; s <= steps; s++) paint(lastCx + ((cx - lastCx) * s) / steps, lastCy + ((cy - lastCy) * s) / steps, dragAction, p.brushSize)
          lastCx = cx; lastCy = cy
        }
        if (!pt.down) dragAction = -1

        // ease every cell: pending preset cells, fill toward target, hover toward the pointer, flash decay
        const mark = new Set<string>((raw.selectedCells ?? []).map(c => c.x + ':' + c.y))
        const kf = p.fillSpeed >= 30 ? 1 : 1 - Math.exp(-real * p.fillSpeed)
        const kh = 1 - Math.exp(-real * p.hoverEase), kd = Math.exp(-real * 4)
        let changed = false
        for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
          const i = idx(x, y)
          if (pendAt[i] >= 0 && clock >= pendAt[i]) { target[i] = pendVal[i]; pendAt[i] = -1 }
          let f = fill[i] + (target[i] - fill[i]) * kf
          if (Math.abs(target[i] - f) < 0.003) f = target[i]
          fill[i] = f
          const ht = inGrid && x === hx && y === hy ? 1 : 0
          let hv = hov[i] + (ht - hov[i]) * kh; if (hv < 0.002) hv = 0
          hov[i] = hv
          let fl = flash[i] * kd; if (fl < 0.002) fl = 0
          flash[i] = fl
          const o = i * 4, r = Math.round(f * 255), g = Math.round(hv * 255), b = Math.round(fl * 255)
          const a = mark.has(x + ':' + y) ? 255 : 0
          if (data[o] !== r || data[o + 1] !== g || data[o + 2] !== b || data[o + 3] !== a) { data[o] = r; data[o + 1] = g; data[o + 2] = b; data[o + 3] = a; changed = true }
        }
        if (changed) tex.needsUpdate = true

        // selected-cell (or whole-shape) audio: the analysis runs on the existing frame loop; the
        // scale is then applied as a warp of the grid space, never as a scale of the cell body.
        const audio = raw.audioEngine
        const audioConfig = raw.audioConfig ?? DEFAULT_AUDIO
        const selected = selectedRef.current
        const shapeOn = !!raw.shapeSelected
        const selectedFilled = !!selected && selected.x >= 0 && selected.y >= 0 && selected.x < cols && selected.y < rows && fill[idx(selected.x, selected.y)] > 0.5
        const audioActive = !!audio?.ready && audioConfig.enabled && (shapeOn || !!selected)
        if (audio) audio.update(performance.now())
        const rawSignal = audioActive ? audio.value(audioConfig.reactTo, { band: audioConfig.band, trigger: audioConfig.trigger }) : 0
        const shapedRaw = audioActive ? shapeCellSignal(rawSignal, audioConfig, real, follower) : 0
        const wv = audioConfig.wave ?? 'sine'
        let shaped = wv === 'saw' ? shapedRaw : wv === 'triangle' ? 1 - Math.abs(2 * shapedRaw - 1) : wv === 'quad' ? (shapedRaw < 0.5 ? 0 : 1) : shapedRaw
        const thr = Math.max(0, Math.min(0.95, audioConfig.threshold))
        shaped = Math.max(0, Math.min(1, (shaped - thr) / Math.max(0.01, 1 - thr)))
        const stp = Math.round(audioConfig.steps)
        if (stp > 0) shaped = Math.round(shaped * stp) / stp
        const probe = shapeOn ? { x: 0, y: 0 } : selected
        const cellScale = audioActive ? resolveCellScale(probe, true, audioConfig, shaped) : 1
        if (!audioActive) follower.value = 0
        if (selected) U.selectedCell.value.set(selected.x, selected.y)
        else U.selectedCell.value.set(-1, -1)
        U.selectedOn.value = selected ? 1 : 0
        U.shapeOn.value = shapeOn ? 1 : 0
        U.selectedScale.value = cellScale
        const cfgs = raw.audioConfig ?? DEFAULT_AUDIO
        const sens = Math.max(0, Math.min(1, cfgs.sensitivity / 100))
        const amtAudio = Math.max(0, Math.min(1, (cellScale - cfgs.minScale) / Math.max(0.05, cfgs.maxScale - cfgs.minScale)))
        U.audioAmt.value = audioActive ? amtAudio * sens : 0
        U.ringOn.value = raw.debugRing ? 1 : 0
        U.shapeAmt.value = audioActive && shapeOn ? Math.max(0, Math.min(1, shaped)) * sens : 0
        U.bandAmt.value = audioActive ? Math.max(0, Math.min(1, audio!.value('low-freq'))) * sens : 0
        U.roamSeed.value = raw.audioConfig?.roamSeed ?? 0
        U.roamSpeed.value = 1 + 0.9 * U.bandAmt.value * (raw.audioConfig?.roamBand ?? 0.5)
        const audioNow = performance.now()
        if (debugCb.current && audioNow - lastAudioDebug > 100) {
          lastAudioDebug = audioNow
          debugCb.current({ selected, filled: shapeOn || selectedFilled, raw: rawSignal, shaped, scale: cellScale, enabled: audioActive, reaction: audioConfig.reactTo, engineReady: !!audio?.ready, configEnabled: audioConfig.enabled, hasSelection: shapeOn || !!selected, engineId: audio?.id ?? '' })
        }

        // corners: radius in cell units (half a cell at 1), breathing on a cosine
        const bf = 1 - p.breathe * (0.5 - 0.5 * Math.cos(tAt * p.breatheRate * Math.PI * 2))
        ease(U.cornerRadius, 0.5 * p.cornerRadius * bf, k)
        ease(U.innerRadius, p.innerCorners ? 0.5 * p.innerRadius * bf : 0, k)
        ease(U.padding, p.padding, k)

        // colours: invert swaps ink and paper; lines follow the ink unless given their own colour
        const inkHex = p.invert ? p.paperColor : p.inkColor, paperHex = p.invert ? p.inkColor : p.paperColor
        U.ink.value.lerp(goal.set(inkHex), k); U.paper.value.lerp(goal.set(paperHex), k)
        U.lineColor.value.lerp(goal.set(p.lineFollowsInk ? inkHex : p.lineColor), k)
        U.circleFillColor.value.lerp(goal.set(p.circleFillColor), k); U.hoverColor.value.lerp(goal.set(p.hoverColor), k)
        U.effectColor.value.lerp(goal.set(p.effectColor), k)
        ease(U.lineOpacity, p.lineOpacity, k); ease(U.gridOn, p.gridlines ? 1 : 0, k); ease(U.borderOn, p.border ? 1 : 0, k)
        ease(U.gridWidth, p.gridWidth, k); ease(U.borderWidth, p.borderWidth, k); ease(U.gridOverInk, p.gridOverInk ? 1 : 0, k)
        ease(U.circles, p.circles ? 1 : 0, k); ease(U.circleStroke, p.circleStroke, k); ease(U.circleScale, p.circleScale, k)
        ease(U.circleFill, p.circleFill, k); ease(U.circleInFilled, p.circleInFilled ? 1 : 0, k)
        ease(U.grain, p.grain, k); ease(U.grainScale, p.grainScale, k); ease(U.grainFine, p.grainFine, k); ease(U.inkGrain, p.inkGrain, k)
        U.grainTime.value = p.grainAnimate ? tAt : 0
        ease(U.shadowAmt, p.effect === 'shadow' ? p.effectOpacity : 0, k); ease(U.glowAmt, p.effect === 'glow' ? p.effectOpacity : 0, k)
        ease(U.effectSize, Math.max(1, p.effectSize), k); U.shadowOffset.value.lerp(goalShadow.set(p.shadowX, p.shadowY), k)
        ease(U.hover, p.hover, k); ease(U.flash, p.paintFlash, k)
        ease(U.brightness, p.brightness, k); ease(U.contrast, p.contrast, k); ease(U.gamma, Math.max(0.2, p.gamma), k); ease(U.saturation, p.saturation, k); ease(U.hueShift, p.hueShift * D, k)
        ease(U.vignette, p.vignette, k); ease(U.vignetteRadius, p.vignetteRadius, k); ease(U.filmGrain, p.filmGrain, k); ease(U.dither, p.dither, k)
        ease(U.framePadding, p.framePadding / 100, k); U.offset.value.lerp(goalOffset.set(p.offsetX, p.offsetY), k); ease(U.zoom, Math.max(0.1, p.zoom), k)
        U.aa.value = Math.max(0.2, p.antialias); U.px.value = h > 0 ? ph / h : 1
        ease(U.showField, p.showField ? 1 : 0, k); ease(U.showCells, p.showCells ? 1 : 0, k)

        // renderer-level params
        stage.renderer.toneMappingExposure = p.exposure
        if (p.tone !== tone) { tone = p.tone; stage.renderer.toneMapping = TONES[p.tone] ?? THREE.NeutralToneMapping; material.needsUpdate = true }
        stage.setResolution(Math.min(1, Math.max(0.1, p.resolutionScale)), Math.max(0.5, p.pixelRatioCap))

        const now = performance.now()
        if (raw.fps && now - statAt > 500) { statAt = now; const s = stage.size(); setStats({ fps: stage.fps(), backend: stage.backend(), w: s.pw, h: s.ph }) }
        void w
      },
    })
    return () => {
      el.removeEventListener('pointerdown', onDown); el.removeEventListener('pointermove', onMove); el.removeEventListener('contextmenu', onCtx)
      stage.dispose(); material.dispose(); tex.dispose()
    }
  }, [])

  // HUD colour follows the paper unless forced
  const p = { ...props, ...LOOKS[props.look] }
  const paperHex = p.invert ? p.inkColor : p.paperColor
  const bg = new THREE.Color(paperHex)
  const lum = 0.2126 * bg.r + 0.7152 * bg.g + 0.0722 * bg.b
  const dark = props.hudColor === 'dark' || (props.hudColor === 'auto' && lum > 0.4)
  const fg = dark ? 'rgba(10,10,14,0.85)' : 'rgba(255,255,255,0.88)'
  const hudScale = props.hudScale
  const pos: Record<string, string> = {
    'bottom-left': 'left-5 bottom-5 items-start text-left', 'top-left': 'left-5 top-5 items-start text-left',
    'bottom-right': 'right-5 bottom-5 items-end text-right', 'top-right': 'right-5 top-5 items-end text-right',
  }

  return (
    <div className="relative h-full w-full overflow-hidden select-none" style={{ background: paperHex }}>
      <div ref={host} className="absolute inset-0" style={{ cursor: props.tool === 'off' ? 'default' : props.tool === 'select' ? 'pointer' : 'crosshair' }} />
      {props.hud && (
        <div className={`pointer-events-none absolute flex flex-col gap-1 font-mono ${pos[props.hudPosition] ?? pos['bottom-left']}`}
             style={{ color: fg, transform: 'scale(' + hudScale + ')', transformOrigin: props.hudPosition.replace('-', ' ') }}>
          <div className="text-[13px] font-semibold tracking-wide">{props.title}</div>
          <div className="text-[11px] opacity-80">{props.subtitle}</div>
          <div className="text-[11px] opacity-60">{props.note}</div>
          {props.fps && <div className="text-[11px] opacity-60">{stats.fps} fps · {stats.backend} · {stats.w}×{stats.h}</div>}
        </div>
      )}
      {failed && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6 text-center font-mono text-xs text-red-300">
          shader failed to start: {failed}
        </div>
      )}
    </div>
  )
}
