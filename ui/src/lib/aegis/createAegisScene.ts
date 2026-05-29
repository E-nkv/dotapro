import { AegisScene } from "./AegisScene"
import type { AegisSceneHandle, AegisSceneOptions } from "./types"

export function createAegisScene(container: HTMLElement, options?: AegisSceneOptions): AegisSceneHandle {
    const scene = new AegisScene(container, options)
    return {
        dispose: () => scene.dispose(),
    }
}
