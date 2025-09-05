// GlobeDiscipline.tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import http from "../api/http";
import type { University } from "../types";
import Globe, { Region } from "../components/Globe";

// ✅ Regions
const regions: Region[] = [
  { name: "United Kingdom", bounds: [[-10, 49], [2, 59]] },
  { name: "Europe", bounds: [[-10, 35], [40, 70]] },
  { name: "United States", bounds: [[-125, 25], [-66, 49]] },
];

type View = { region?: string; university?: University };

export default function GlobeDiscipline() {
  const { discipline } = useParams();
  const [universities, setUniversities] = useState<University[]>([]);
  const [topUniversities, setTopUniversities] = useState<Record<string, University[]>>({});
  const [view, setView] = useState<View>({});

  useEffect(() => {
    http.get("/universities", { params: { course: discipline } }).then((res) => {
      setUniversities(res.data);

      // ✅ Precompute top 10 per region
      const regionMap: Record<string, University[]> = {};
      for (const region of regions) {
        const filtered: University[] = res.data.filter((u: University) => {
          const [lon, lat] = u.location.coordinates;
          return (
            lon >= region.bounds[0][0] &&
            lat >= region.bounds[0][1] &&
            lon <= region.bounds[1][0] &&
            lat <= region.bounds[1][1]
          );
        });

        const sorted = filtered.sort(
          (a: University, b: University) => (a.rank || 9999) - (b.rank || 9999)
        );

        regionMap[region.name] = sorted.slice(0, 10);
      }
      setTopUniversities(regionMap);
    });
  }, [discipline]);

  // 👉 Decide what to focus on
  let focus: { coords: [number, number]; level: "region" | "university" } | undefined;
  if (view.university) {
    focus = { coords: view.university.location.coordinates, level: "university" };
  } else if (view.region) {
    // center of region
    const region = regions.find((r) => r.name === view.region);
    if (region) {
      const [[lon1, lat1], [lon2, lat2]] = region.bounds;
      focus = { coords: [(lon1 + lon2) / 2, (lat1 + lat2) / 2], level: "region" };
    }
  }

  return (
    <div className="relative h-full">
      {/* Dashboard */}
      <div className="absolute top-0 left-0 w-full bg-white/90 z-10 p-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">{discipline}</h2>

          {view.region && !view.university && (
            <div className="text-sm text-gray-600">
              {view.region} – Top 10 Universities in {discipline}
            </div>
          )}

          {view.university && (
            <div className="text-sm text-gray-600">
              <strong>{view.university.name}</strong>
              <div>
                Entry requirements:
                <ul className="list-disc ml-4">
                  {Object.entries(
                    view.university.programs?.[discipline!]?.entryRequirements ?? {}
                  ).map(([key, val]) => (
                    <li key={key}>
                      <strong>{key}:</strong> {val}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <button className="bg-yellow-500 text-white px-4 py-2 rounded">
          Chat with Alumni (Paid)
        </button>
      </div>

      {/* Globe */}
      <Globe
        regions={!view.region ? regions : []}
        universities={view.region && !view.university ? topUniversities[view.region] : []}
        focus={focus}
        onRegionSelect={(regionName) => setView({ region: regionName })}
        onUniversitySelect={(uni) => setView({ region: view.region, university: uni })}
      />
    </div>
  );
}
