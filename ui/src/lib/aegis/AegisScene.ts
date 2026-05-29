import {
    AmbientLight,
    Clock,
    DirectionalLight,
    Group,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
} from "three"
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { disposeObject3D } from "./disposeObject3D"
import { frameModel } from "./frameModel"
import { TurntableController } from "./TurntableController"
import type { AegisSceneOptions } from "./types"

export class AegisScene {
    private readonly container: HTMLElement
    private readonly options: Required<Pick<AegisSceneOptions, "modelUrl" | "dracoPath" | "margin">> &
        Pick<AegisSceneOptions, "onReady">

    private disposed = false
    private rafId = 0
    private running = false

    private readonly renderer: WebGLRenderer
    private readonly scene: Scene
    private readonly camera: PerspectiveCamera
    private readonly pivot: Group
    private readonly clock: Clock
    private readonly dracoLoader: DRACOLoader
    private readonly loader: GLTFLoader

    private turntable: TurntableController | null = null
    private modelRoot: Group | null = null

    private readonly resizeObserver: ResizeObserver
    private readonly onVisibilityChange: () => void

    constructor(container: HTMLElement, options: AegisSceneOptions = {}) {
        this.container = container
        this.options = {
            modelUrl: options.modelUrl ?? "/aegis-transformed.glb",
            dracoPath: options.dracoPath ?? "/draco/",
            margin: options.margin ?? 1.2,
            onReady: options.onReady,
        }

        this.renderer = new WebGLRenderer({ antialias: true, alpha: true })
        this.renderer.setClearColor(0x000000, 0)
        this.renderer.domElement.className = "block size-full"
        this.renderer.domElement.style.opacity = "0"
        this.renderer.domElement.style.transition = "opacity 0.5s ease"
        this.container.appendChild(this.renderer.domElement)

        this.scene = new Scene()
        this.camera = new PerspectiveCamera(50, 1, 0.1, 100)
        this.pivot = new Group()
        this.scene.add(this.pivot)
        this.clock = new Clock()

        this.scene.add(new AmbientLight(undefined, 2))
        const keyLight = new DirectionalLight(undefined, 2)
        keyLight.position.set(4, 6, 4)
        this.scene.add(keyLight)
        const fillLight = new DirectionalLight(undefined, 1)
        fillLight.position.set(-3, 2, -2)
        this.scene.add(fillLight)

        this.dracoLoader = new DRACOLoader()
        this.dracoLoader.setDecoderPath(this.options.dracoPath)
        this.loader = new GLTFLoader()
        this.loader.setDRACOLoader(this.dracoLoader)

        this.resizeObserver = new ResizeObserver(() => this.handleResize())
        this.resizeObserver.observe(this.container)
        this.handleResize()

        this.onVisibilityChange = () => {
            if (document.hidden) {
                this.stopLoop()
            } else if (this.modelRoot) {
                this.startLoop()
            }
        }
        document.addEventListener("visibilitychange", this.onVisibilityChange)

        void this.loadModel()
    }

    private async loadModel() {
        try {
            const gltf = await this.loader.loadAsync(this.options.modelUrl)
            if (this.disposed) {
                disposeObject3D(gltf.scene)
                return
            }

            this.modelRoot = gltf.scene
            this.pivot.add(this.modelRoot)
            frameModel(this.modelRoot, this.camera, this.options.margin)

            this.turntable = new TurntableController(this.pivot, this.renderer.domElement, {
                autoRotateX: true,
            })
            this.handleResize()
            this.renderer.domElement.style.opacity = "1"
            this.options.onReady?.()
            this.startLoop()
        } catch (err) {
            console.error("Failed to load Aegis model:", err)
            this.options.onReady?.()
        }
    }

    private handleResize() {
        if (this.disposed) return

        const { clientWidth: width, clientHeight: height } = this.container
        if (width === 0 || height === 0) return

        const dpr = Math.min(window.devicePixelRatio, 2)
        this.renderer.setPixelRatio(dpr)
        this.renderer.setSize(width, height, false)
        this.camera.aspect = width / height
        this.camera.updateProjectionMatrix()
        this.turntable?.setSize(width, height)
    }

    private tick = () => {
        if (!this.running || this.disposed) return

        const delta = this.clock.getDelta()
        this.turntable?.update(delta)
        this.renderer.render(this.scene, this.camera)
        this.rafId = requestAnimationFrame(this.tick)
    }

    private startLoop() {
        if (this.running || this.disposed) return
        this.running = true
        this.clock.start()
        this.rafId = requestAnimationFrame(this.tick)
    }

    private stopLoop() {
        this.running = false
        cancelAnimationFrame(this.rafId)
        this.clock.stop()
    }

    dispose() {
        if (this.disposed) return
        this.disposed = true

        this.stopLoop()
        this.resizeObserver.disconnect()
        document.removeEventListener("visibilitychange", this.onVisibilityChange)

        this.turntable?.dispose()
        this.turntable = null

        if (this.modelRoot) {
            this.pivot.remove(this.modelRoot)
            disposeObject3D(this.modelRoot)
            this.modelRoot = null
        }

        this.dracoLoader.dispose()
        this.renderer.dispose()
        this.renderer.domElement.remove()
    }
}
