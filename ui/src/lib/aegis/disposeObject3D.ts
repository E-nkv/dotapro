import { Material, Mesh, Object3D, SkinnedMesh, Texture } from "three"

function disposeMaterial(material: Material | Material[]) {
    const materials = Array.isArray(material) ? material : [material]
    for (const mat of materials) {
        for (const value of Object.values(mat)) {
            if (value instanceof Texture) {
                value.dispose()
            }
        }
        mat.dispose()
    }
}

export function disposeObject3D(root: Object3D) {
    root.traverse(obj => {
        if (obj instanceof Mesh || obj instanceof SkinnedMesh) {
            obj.geometry?.dispose()
            if (obj.material) {
                disposeMaterial(obj.material)
            }
        }
    })
}
