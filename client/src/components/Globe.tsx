// client/src/components/Globe.tsx
import { useState, useEffect } from "react";
import * as Cesium from "cesium";
import {
  Viewer,
  Entity,
  CameraFlyTo,
  PointGraphics,
} from "resium";
import type { University } from "../types";

Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN;

export type Region = {
  name: string;
  bounds: [[number, number], [number, number]];
};

export default function Globe({
  regions = [],
  universities = [],
  focus,
  onRegionSelect,
  onUniversitySelect,
}: {
  regions?: Region[];
  universities?: University[];
  focus?: { coords: [number, number]; level: "region" | "university" };
  onRegionSelect?: (regionName: string) => void;
  onUniversitySelect?: (u: University) => void;
}) {
  const [target, setTarget] = useState<{ coords: [number, number]; level: "region" | "university" } | null>(null);

  useEffect(() => {
    if (focus) {
      setTarget(focus);
    }
  }, [focus]);

  return (
    <div className="absolute inset-0 z-0">
      <Viewer
        full
        geocoder={false}
        homeButton={false}
        sceneModePicker={false}
        timeline={false}
        animation={false}
        baseLayerPicker={false}
        navigationHelpButton={false}
        infoBox={false}
        selectionIndicator={false}
      >
        {/* Camera fly-to */}
        {target && (
          <CameraFlyTo
            duration={1.8}
            destination={Cesium.Cartesian3.fromDegrees(
              target.coords[0],
              target.coords[1],
              target.level === "region" ? 2_000_000 : 80_000 // 👈 altitude by level
            )}
            onComplete={() => setTarget(null)}
          />
        )}

        {/* Region polygons */}
        {regions.map((r) => {
          const [[lon1, lat1], [lon2, lat2]] = r.bounds;
          const coords = [
            Cesium.Cartesian3.fromDegrees(lon1, lat1),
            Cesium.Cartesian3.fromDegrees(lon2, lat1),
            Cesium.Cartesian3.fromDegrees(lon2, lat2),
            Cesium.Cartesian3.fromDegrees(lon1, lat2),
          ];
          const center: [number, number] = [(lon1 + lon2) / 2, (lat1 + lat2) / 2];

          return (
            <Entity
              key={r.name}
              name={r.name}
              polygon={{
                hierarchy: new Cesium.PolygonHierarchy(coords),
                material: Cesium.Color.YELLOW.withAlpha(0.25),
                outline: true,
                outlineColor: Cesium.Color.YELLOW,
              }}
              onClick={() => {
                onRegionSelect?.(r.name);
                setTarget({ coords: center, level: "region" });
              }}
            />
          );
        })}

        {/* University dots */}
        {universities.map((u) => (
          <Entity
            key={u._id}
            name={u.name}
            position={Cesium.Cartesian3.fromDegrees(
              u.location.coordinates[0],
              u.location.coordinates[1]
            )}
            onClick={() => {
              onUniversitySelect?.(u);
              setTarget({ coords: u.location.coordinates, level: "university" });
            }}
          >
            <PointGraphics pixelSize={10} color={Cesium.Color.CYAN} />
          </Entity>
        ))}
      </Viewer>
    </div>
  );
}
