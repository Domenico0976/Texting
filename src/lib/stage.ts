// stage.ts - the plumbing every shader fragment needs and no shader should have to re-solve:
// a WebGPURenderer (WebGL2 fallback is automatic), a fullscreen quad for 2D shaders or a scene of your
// own, resize with a resolution scale, a pointer tracked in the canvas, pausing when hidden or scrolled
// out of view, a frame loop with a clamped dt, and a dispose that returns the GPU memory.
//
// Nothing in here knows what the picture is. The picture is a node material (src/lib/shader.ts) and the
// params live in the variant (src/variants/main.tsx).
import * as THREE from 'three/webgpu'

export type Pointer = {
  x: number; y: number          // 0..1 across the canvas, y up (Shadertoy convention)
  px: number; py: number        // physical pixels from the bottom-left (iMouse.xy)
  down: boolean; inside: boolean
  downAt: number                // performance.now() of the last press, -1 if never
}

export type StageOptions = {
  host: HTMLElement
  // Either a material for the built-in fullscreen quad, or your own scene + camera. Not both.
  material?: THREE.Material
  scene?: THREE.Scene
  camera?: THREE.Camera
  // Called once per rendered frame before render(): dt is clamped to 50 ms, real is the unclamped
  // wall-clock step, t the accumulated (clamped) time in seconds.
  onFrame: (dt: number, real: number, t: number) => void
  // Optional: called after the renderer initialised (build post chains, compute passes here).
  onReady?: (renderer: THREE.WebGPURenderer) => void
  // Optional: replaces renderer.render(scene, camera) (e.g. a RenderPipeline or compute + render).
  render?: (renderer: THREE.WebGPURenderer, scene: THREE.Scene, camera: THREE.Camera) => void
  onError?: (err: unknown) => void
}

export type Stage = {
  renderer: THREE.WebGPURenderer
  scene: THREE.Scene
  camera: THREE.Camera
  pointer: Pointer
  // Resolution: physical pixels = CSS px * min(devicePixelRatio, dprCap) * scale. Cheap way to make a
  // heavy shader run everywhere: the canvas upscales the smaller buffer in CSS.
  setResolution(scale: number, dprCap: number): void
  backend(): 'webgpu' | 'webgl2' | 'starting'
  fps(): number
  size(): { w: number; h: number; pw: number; ph: number }
  dispose(): void
}

export function mountStage(o: StageOptions): Stage {
  const host = o.host
  let alive = true, visible = true, onScreen = true
  let scale = 1, dprCap = 2
  let fps = 0, frames = 0, fpsAt = performance.now()
  let last = performance.now(), t = 0
  let w = 1, h = 1

  const renderer = new THREE.WebGPURenderer({ antialias: false })
  renderer.setPixelRatio(Math.min(devicePixelRatio, dprCap))
  const canvas = renderer.domElement
  Object.assign(canvas.style, { width: '100%', height: '100%', display: 'block', touchAction: 'none' })
  host.appendChild(canvas)

  // fullscreen quad: PlaneGeometry(2,2) with an orthographic camera gives uv() with (0,0) bottom-left,
  // the Shadertoy convention, so `uv().mul(screenSize)` is fragCoord.
  let scene = o.scene!, camera = o.camera!
  let quad: THREE.Mesh | null = null
  if (!scene) {
    scene = new THREE.Scene()
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 2)
    cam.position.z = 1
    camera = cam
    quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), o.material ?? new THREE.MeshBasicNodeMaterial())
    quad.frustumCulled = false
    scene.add(quad)
  }

  const pointer: Pointer = { x: 0.5, y: 0.5, px: 0, py: 0, down: false, inside: false, downAt: -1 }
  const track = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect()
    pointer.x = (e.clientX - r.left) / r.width
    pointer.y = 1 - (e.clientY - r.top) / r.height
    const { pw, ph } = size()
    pointer.px = pointer.x * pw; pointer.py = pointer.y * ph
  }
  const onDown = (e: PointerEvent) => { track(e); pointer.down = true; pointer.inside = true; pointer.downAt = performance.now(); canvas.setPointerCapture(e.pointerId) }
  const onMove = (e: PointerEvent) => { track(e); pointer.inside = true }
  const onUp = (e: PointerEvent) => { track(e); pointer.down = false }
  const onLeave = () => { pointer.inside = false; pointer.down = false }
  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerup', onUp)
  canvas.addEventListener('pointercancel', onUp)
  canvas.addEventListener('pointerleave', onLeave)

  const size = () => {
    const pr = renderer.getPixelRatio()
    return { w, h, pw: Math.max(1, Math.round(w * pr)), ph: Math.max(1, Math.round(h * pr)) }
  }
  const applySize = () => {
    w = host.clientWidth || 1; h = host.clientHeight || 1
    renderer.setPixelRatio(Math.min(devicePixelRatio, dprCap) * scale)
    renderer.setSize(w, h, false)
    if (camera instanceof THREE.PerspectiveCamera) { camera.aspect = w / h; camera.updateProjectionMatrix() }
  }
  const ro = new ResizeObserver(applySize)
  ro.observe(host)

  // pause when the tab is hidden or the fragment is scrolled out of view: no GPU work for nobody
  const onVis = () => { visible = document.visibilityState !== 'hidden'; last = performance.now() }
  document.addEventListener('visibilitychange', onVis)
  const io = new IntersectionObserver(es => { onScreen = es.some(e => e.isIntersecting); last = performance.now() })
  io.observe(host)

  const frame = () => {
    if (!alive) return
    if (!visible || !onScreen) { last = performance.now(); return }
    const now = performance.now(), real = (now - last) / 1000, dt = Math.min(real, 0.05)
    last = now; t += dt
    frames++
    if (now - fpsAt > 500) { fps = Math.round((frames * 1000) / (now - fpsAt)); frames = 0; fpsAt = now }
    try {
      o.onFrame(dt, real, t)
      if (o.render) o.render(renderer, scene, camera)
      else renderer.render(scene, camera)
    } catch (err) { o.onError?.(err); renderer.setAnimationLoop(null); alive = false }
  }

  let backendName: 'webgpu' | 'webgl2' | 'starting' = 'starting'
  renderer.init().then(() => {
    if (!alive) return
    backendName = (renderer.backend as any)?.isWebGPUBackend ? 'webgpu' : 'webgl2'
    host.dataset.backend = backendName        // readable from the console: document.querySelector('[data-backend]').dataset.backend
    applySize()
    o.onReady?.(renderer)
    renderer.setAnimationLoop(frame)
  }).catch(err => o.onError?.(err))

  return {
    renderer, scene, camera, pointer, size,
    setResolution(s, cap) { if (s !== scale || cap !== dprCap) { scale = s; dprCap = cap; applySize() } },
    backend: () => backendName,
    fps: () => fps,
    dispose() {
      alive = false
      renderer.setAnimationLoop(null)
      ro.disconnect(); io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); canvas.removeEventListener('pointerleave', onLeave)
      quad?.geometry.dispose()
      ;(quad?.material as THREE.Material | undefined)?.dispose()
      renderer.dispose()
      canvas.remove()
    },
  }
}
