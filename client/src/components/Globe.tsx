import { useEffect, useRef } from "react";
import * as Cesium from "cesium";
import type { University } from "../types";
import { createSkybox } from "../utils/skybox-utils";

Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN;

type Focus = { coords: [number, number]; level: "region" | "university" };

type CameraView = {
  destination: Cesium.Cartesian3;
  orientation: { heading: number; pitch: number; roll: number };
};

function captureView(cam: Cesium.Camera): CameraView {
  return {
    destination: cam.positionWC.clone(),
    orientation: {
      heading: cam.heading,
      pitch: cam.pitch,
      roll: cam.roll,
    },
  };
}

// 🎨 Rank colors
const DOT_COLOR = (rank: number) => {
  if (rank === 1) return "#FACC15"; // gold
  if (rank === 2) return "#CBD5E1"; // silver
  if (rank === 3) return "#F59E0B"; // bronze
  return "#6366F1"; // theme
};

// 🖼 High-quality 1024x1024 SVG with soft anti-aliased edge
function makeDotSVG(rank: number) {
  const color = DOT_COLOR(rank);
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"
         shape-rendering="geometricPrecision" text-rendering="optimizeLegibility">
      <defs>
        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- Circle with glow -->
      <circle cx="512" cy="512" r="440"
              fill="${color}"
              stroke="white" stroke-width="40"
              filter="url(#softGlow)"/>

      <!-- Rank number -->
      <text x="512" y="690"
            text-anchor="middle"
            font-size="360"
            font-family="Inter, sans-serif"
            font-weight="700"
            fill="white"
            stroke="rgba(0,0,0,0.3)" stroke-width="10"
            paint-order="stroke fill">${rank}</text>
    </svg>
  `)}`;
}




export default function Globe({
  universities = [],
  focus,
  onUniversitySelect,
  onUniversityHover,
  hoveredId,
  resetFocus,
}: {
  universities?: University[];
  focus?: Focus;
  onUniversitySelect?: (u: University) => void;
  onUniversityHover?: (id: string | null) => void;
  hoveredId?: string | null;
  resetFocus?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);

  const initialViewRef = useRef<CameraView | null>(null);
  const lastViewBeforeFocusRef = useRef<CameraView | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const viewer = new Cesium.Viewer(containerRef.current, {
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      timeline: false,
      animation: false,
      baseLayerPicker: false,
      navigationHelpButton: false,
      infoBox: false,
      selectionIndicator: false,
      shadows: false,
    });
    viewerRef.current = viewer;

    const { scene, camera } = viewer;

    // 🌌 Skybox + clean globe styling
    createSkybox(scene);
    scene.fog.enabled = false;
    scene.globe.enableLighting = false;
    scene.globe.depthTestAgainstTerrain = true;
    scene.logarithmicDepthBuffer = true;
    scene.skyAtmosphere.show = false;
    scene.globe.showGroundAtmosphere = false;
    scene.globe.translucency.enabled = false;
    scene.globe.baseColor = Cesium.Color.fromCssColorString("#0a0a0a");

    // 🚫 Remove sun/moon artifacts
    scene.sun.show = false;
    scene.moon.show = false;

    scene.requestRenderMode = true;
    scene.maximumRenderTimeChange = Infinity;
    viewer.targetFrameRate = 30;

    // Imagery tweaks
    const layer = scene.globe.imageryLayers.get(0);
    if (layer) {
      (layer as any).anisotropy = 16;
      layer.brightness = 1.4;
      layer.contrast = 1.0;
      layer.gamma = 1.2;
    }

    // 🌍 Initial view
    camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(0, 0, 25_000_000),
      orientation: { heading: 0, pitch: -Cesium.Math.PI_OVER_TWO, roll: 0 },
    });
    initialViewRef.current = captureView(camera);

    // ➕ Add dots
   // ➕ Add dots
universities.forEach((u, i) => {
  const [lon, lat] = u.location.coordinates;
  const carto = Cesium.Cartographic.fromDegrees(lon, lat);
  const surface = Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude);
  const normal = Cesium.Cartesian3.normalize(surface, new Cesium.Cartesian3());

  const dynamicPos = new Cesium.CallbackProperty(() => {
    if (!viewer || !viewer.camera) return surface;

    const camCarto = Cesium.Cartographic.fromCartesian(viewer.camera.positionWC);
    const camAlt = Math.max(camCarto.height, 1);

    let offset = 0;

    if (camAlt > 20_000) {
      // above 20 km → use dynamic float
      offset = Cesium.Math.clamp(camAlt * 0.015, 10_000, 400_000);
    } else {
      // near the ground → stick to the location
      offset = 0;
    }

    if (offset === 0) return surface;

    const radius = Cesium.Cartesian3.magnitude(surface) + offset;
    return Cesium.Cartesian3.multiplyByScalar(normal, radius, new Cesium.Cartesian3());
  }, false);

  viewer.entities.add({
    id: u._id,
    position: dynamicPos as unknown as Cesium.PositionProperty,
    billboard: {
      image: makeDotSVG(i + 1),
      width: 40,
      height: 40,
      scaleByDistance: new Cesium.NearFarScalar(
        300_000, 1.3,     // near
        400_000_000, 0.5  // far (400,000 km)
      ),
      translucencyByDistance: new Cesium.NearFarScalar(
        1_000_000, 1.0,
        400_000_000, 0.0
      ),
      disableDepthTestDistance: 0, // ✅ hides behind globe
    },
  });
});

    // 🖱 Hover → notify
    const handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    handler.setInputAction((movement: any) => {
      const picked = scene.pick(movement.endPosition);
      const localHoveredId: string | null = (picked?.id as any)?.id ?? null;
      onUniversityHover?.(localHoveredId);
      scene.canvas.style.cursor = "default";
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    // 🖱 Click → select
    handler.setInputAction((click: any) => {
      const picked = scene.pick(click.position);
      if (picked?.id) {
        const u = universities.find((x) => x._id === picked.id.id);
        if (u) onUniversitySelect?.(u);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      handler.destroy();
      viewer.destroy();
    };
  }, [universities, onUniversitySelect, onUniversityHover]);

  // 🎥 Fly to focus
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    if (focus) {
      lastViewBeforeFocusRef.current = captureView(viewer.camera); // save current before focus
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          focus.coords[0],
          focus.coords[1],
          focus.level === "university" ? 3500 : 3_800_000
        ),
        duration: 1.6,
      });
    }
  }, [focus]);

  // 🎥 Reset focus → return to last view, not initial
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !resetFocus) return;

    const view = lastViewBeforeFocusRef.current;
    if (view) {
      viewer.camera.flyTo({
        destination: view.destination,
        orientation: view.orientation,
        duration: 1.2,
      });
    }
  }, [resetFocus]);

  // ✨ Highlight hover
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    viewer.entities.values.forEach((ent: any) => {
      if (!ent.billboard) return;
      const highlighted = ent.id === hoveredId;

      if (highlighted) {
        ent.billboard.scale = 1.5;
        ent.billboard.color = Cesium.Color.WHITE.withAlpha(1.0);
        ent.billboard.translucencyByDistance = undefined;
      } else {
        ent.billboard.scale = 1.0;
        ent.billboard.color = Cesium.Color.WHITE;
        ent.billboard.translucencyByDistance = new Cesium.NearFarScalar(
          500_000, 1.0,
          200_000_000, 0.2
        );
      }
    });

    viewer.scene.requestRender();
  }, [hoveredId]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 overflow-hidden"
    />
  );
}
