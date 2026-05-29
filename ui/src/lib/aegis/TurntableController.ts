import type { Group } from "three"

type TurntableOptions = {
    speed?: number
    momentum?: number
    friction?: number
    damping?: number
    autoRotateX?: boolean
}

export class TurntableController {
    private pivot: Group
    private canvas: HTMLCanvasElement
    private width = 1
    private height = 1
    private disposed = false

    private readonly speed: number
    private readonly momentum: number
    private readonly friction: number
    private readonly damping: number

    private autoRotateXEnabled: boolean
    private autoRotatePaused = false

    private targetY = 0
    private targetX = 0
    private velocityY = 0
    private velocityX = 0
    private dragging = false

    private lastX = 0
    private lastY = 0
    private lastTime = 0
    private velocityPointerX = 0
    private velocityPointerY = 0

    private frameCount = 0
    private readonly framesPerRotation = 1800 // fixed-speed auto-rotate: full spin in ~30s at 60fps

    private readonly onPointerDown: (e: PointerEvent) => void
    private readonly onPointerMove: (e: PointerEvent) => void
    private readonly onPointerUp: (e: PointerEvent) => void

    constructor(pivot: Group, canvas: HTMLCanvasElement, options: TurntableOptions = {}) {
        this.pivot = pivot
        this.canvas = canvas
        this.speed = options.speed ?? 0.9
        this.momentum = options.momentum ?? 0.3
        this.friction = options.friction ?? 5
        this.damping = options.damping ?? 0.4

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        this.autoRotateXEnabled = (options.autoRotateX ?? true) && !prefersReducedMotion

        this.onPointerDown = e => {
            if (e.button !== 0) return
            this.autoRotatePaused = true
            this.dragging = true
            this.velocityY = 0
            this.velocityX = 0
            this.lastX = e.clientX
            this.lastY = e.clientY
            this.lastTime = performance.now()
            this.velocityPointerX = 0
            this.velocityPointerY = 0
            canvas.setPointerCapture(e.pointerId)
            canvas.style.cursor = "grabbing"
        }

        this.onPointerMove = e => {
            if (!this.dragging) return
            const now = performance.now()
            const dt = (now - this.lastTime) / 1000
            const dx = e.clientX - this.lastX
            const dy = e.clientY - this.lastY
            if (dt > 0) {
                this.velocityPointerX = dx / dt
                this.velocityPointerY = dy / dt
            }
            this.lastX = e.clientX
            this.lastY = e.clientY
            this.lastTime = now
            this.targetY += (dx / this.width) * Math.PI * this.speed
            this.targetX += (dy / this.height) * Math.PI * this.speed
        }

        this.onPointerUp = e => {
            if (!this.dragging) return
            this.dragging = false
            try {
                canvas.releasePointerCapture(e.pointerId)
            } catch {
                /* already released */
            }
            canvas.style.cursor = "grab"
            const scale = Math.PI * this.speed * this.momentum
            this.velocityY = (this.velocityPointerX / this.width) * scale
            this.velocityX = (this.velocityPointerY / this.height) * scale
        }

        canvas.style.cursor = "grab"
        canvas.addEventListener("pointerdown", this.onPointerDown)
        canvas.addEventListener("pointermove", this.onPointerMove)
        canvas.addEventListener("pointerup", this.onPointerUp)
        canvas.addEventListener("pointercancel", this.onPointerUp)
    }

    setSize(width: number, height: number) {
        this.width = Math.max(width, 1)
        this.height = Math.max(height, 1)
    }

    private isSettled() {
        if (this.dragging) return false
        if (Math.abs(this.velocityY) > 1e-4 || Math.abs(this.velocityX) > 1e-4) return false

        const rotDeltaY = Math.abs(this.targetY - this.pivot.rotation.y)
        const rotDeltaX = Math.abs(this.targetX - this.pivot.rotation.x)
        return rotDeltaY < 1e-3 && rotDeltaX < 1e-3
    }

    update(delta: number) {
        if (this.disposed) return

        if (!this.dragging) {
            if (Math.abs(this.velocityY) > 1e-6) {
                this.targetY += this.velocityY * delta
                this.velocityY = this.velocityY * Math.exp(-this.friction * delta)
                if (Math.abs(this.velocityY) < 1e-4) this.velocityY = 0
            }
            if (Math.abs(this.velocityX) > 1e-6) {
                this.targetX += this.velocityX * delta
                this.velocityX = this.velocityX * Math.exp(-this.friction * delta)
                if (Math.abs(this.velocityX) < 1e-4) this.velocityX = 0
            }
        }

        const k = 1 - Math.exp(-(1 / Math.max(this.damping, 1e-4)) * delta * 60)
        this.pivot.rotation.y += (this.targetY - this.pivot.rotation.y) * k
        this.pivot.rotation.x += (this.targetX - this.pivot.rotation.x) * k
        this.pivot.rotation.z = 0

        if (this.autoRotatePaused && this.isSettled()) {
            this.autoRotatePaused = false
        }

        if (this.autoRotateXEnabled && !this.autoRotatePaused) {
            this.frameCount++
            const rotationPerFrame = (Math.PI * 2) / this.framesPerRotation
            this.targetX += rotationPerFrame
            if (this.frameCount >= this.framesPerRotation) {
                this.frameCount = 0
            }
        }
    }

    dispose() {
        if (this.disposed) return
        this.disposed = true
        this.canvas.removeEventListener("pointerdown", this.onPointerDown)
        this.canvas.removeEventListener("pointermove", this.onPointerMove)
        this.canvas.removeEventListener("pointerup", this.onPointerUp)
        this.canvas.removeEventListener("pointercancel", this.onPointerUp)
        this.canvas.style.cursor = "default"
    }
}
