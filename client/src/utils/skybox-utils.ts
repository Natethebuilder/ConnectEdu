import * as Cesium from "cesium";

/**
 * Preload an array of image URLs before swapping skyboxes
 */
function preloadImages(urls: string[]): Promise<void> {
  return Promise.all(
    urls.map(
      (src) =>
        new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject(`Failed to load ${src}`);
          img.src = src;
        })
    )
  ).then(() => undefined);
}

/**
 * Build the URLs for a given quality (2k or 4k)
 */
function getSkyboxUrls(quality: "2k" | "4k") {
  const base = `/stars/${quality}`;
  return {
    positiveX: `${base}/px.png`,
    negativeX: `${base}/nx.png`,
    positiveY: `${base}/py.png`,
    negativeY: `${base}/ny.png`,
    positiveZ: `${base}/pz.png`,
    negativeZ: `${base}/nz.png`,
  };
}

/**
 * Create a skybox with optional progressive upgrade.
 *
 * @param scene Cesium.Scene
 * @param quality "2k" | "4k" | "auto" (default "auto")
 * @param progressiveUpgrade whether to start with 2k and upgrade (default true)
 */
export async function createSkybox(
  scene: Cesium.Scene,
  quality: "2k" | "4k" | "auto" = "auto",
  progressiveUpgrade: boolean = true
) {
  // Always start with 2k for fast load
  const urls2k = getSkyboxUrls("2k");
  scene.skyBox = new Cesium.SkyBox({ sources: urls2k });
  console.log("🌌 Loaded 2K skybox");

  if (!progressiveUpgrade) {
    if (quality === "2k") return;

    if (quality === "4k") {
      const urls4k = getSkyboxUrls("4k");
      await preloadImages(Object.values(urls4k));
      scene.skyBox = new Cesium.SkyBox({ sources: urls4k });
      console.log("🌌 Loaded 4K skybox");
      return;
    }

    // auto quality selection
    const gl = (scene as any).context._gl as WebGLRenderingContext;
    const maxCubeSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
    const chosen = maxCubeSize >= 4096 ? "4k" : "2k";

    if (chosen === "4k") {
      const urls4k = getSkyboxUrls("4k");
      await preloadImages(Object.values(urls4k));
      scene.skyBox = new Cesium.SkyBox({ sources: urls4k });
      console.log("🌌 Loaded 4K skybox (auto)");
    }
    return;
  }

  // Progressive mode: auto-upgrade to 4k if supported
  const gl = (scene as any).context._gl as WebGLRenderingContext;
  const maxCubeSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);

  if (maxCubeSize >= 4096) {
    const urls4k = getSkyboxUrls("4k");

    // preload in background, then swap
    preloadImages(Object.values(urls4k))
      .then(() => {
        scene.skyBox = new Cesium.SkyBox({ sources: urls4k });
        console.log("🌌 Upgraded skybox → 4K");
      })
      .catch((err) => console.warn("4K preload failed:", err));
  }
}
