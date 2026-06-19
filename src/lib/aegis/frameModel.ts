import { Box3, Object3D, PerspectiveCamera, SkinnedMesh, Vector3 } from "three"

export function frameModel(root: Object3D, camera: PerspectiveCamera, margin = 1.2) {
    root.traverse(child => {
        if (child instanceof SkinnedMesh) {
            child.skeleton.update()
        }
    })
    root.updateWorldMatrix(true, true)

    const box = new Box3().setFromObject(root, true)
    const center = box.getCenter(new Vector3())
    const size = box.getSize(new Vector3())

    root.position.sub(center)

    const maxDim = Math.max(size.x, size.y, size.z)
    const fovRad = (camera.fov * Math.PI) / 180
    const distance = (maxDim / 2 / Math.tan(fovRad / 2)) * margin

    camera.position.set(0, 0, distance)
    camera.near = distance / 100
    camera.far = distance * 100
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
}
