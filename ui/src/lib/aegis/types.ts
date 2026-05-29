export type AegisSceneOptions = {
    modelUrl?: string
    dracoPath?: string
    margin?: number
    onReady?: () => void
}

export type AegisSceneHandle = {
    dispose: () => void
}
