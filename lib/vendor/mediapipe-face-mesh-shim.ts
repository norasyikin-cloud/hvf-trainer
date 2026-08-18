/**
 * `@mediapipe/face_mesh`'s npm bundle is a global-mutating UMD script with no
 * real ESM/CJS exports (it only sets `window.FaceMesh` when loaded via a
 * <script> tag). Bundlers that statically resolve `import * as t from
 * "@mediapipe/face_mesh"` (as @tensorflow-models/face-landmarks-detection
 * does) fail to build against it. next.config.ts aliases that import to this
 * file instead; the real script is injected via a <script> tag by
 * lib/useWebGazer.ts, and this proxies construction to the resulting global
 * at call time (after that script has loaded).
 */
type FaceMeshCtor = new (config: unknown) => unknown;

function getGlobalFaceMesh(): FaceMeshCtor {
  const ctor = (globalThis as { FaceMesh?: FaceMeshCtor }).FaceMesh;
  if (!ctor) {
    throw new Error("MediaPipe FaceMesh script has not finished loading yet");
  }
  return ctor;
}

export const FaceMesh = new Proxy(function FaceMesh() {} as unknown as FaceMeshCtor, {
  construct(_target, args) {
    const Ctor = getGlobalFaceMesh();
    return new Ctor(args[0]) as object;
  },
});
