import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // See lib/vendor/mediapipe-face-mesh-shim.ts for why this is needed.
      "@mediapipe/face_mesh": "./lib/vendor/mediapipe-face-mesh-shim.ts",
    },
  },
};

export default nextConfig;
