import { useMemo, useState } from "react";
import type { University, ProgramInfo } from "../types";

// helper: region detection
function getRegion([lon, lat]: [number, number]): string {
  if (lon >= -10 && lon <= 2 && lat >= 49 && lat <= 59) return "United Kingdom";
  if (lon >= -10 && lon <= 40 && lat >= 35 && lat <= 70) return "Europe";
  if (lon >= -125 && lon <= -66 && lat >= 25 && lat <= 49) return "United States";
  return "Other";
}

export default function DetailsDrawer({
  uni,
  discipline,
  onClose,
}: {
  uni: University | null;
  discipline: string;
  onClose: () => void;
}) {
  if (!uni) return null;

  const prog: ProgramInfo | undefined = uni.programs?.[discipline];
  const region = getRegion(uni.location.coordinates);

  return (
    <aside className="absolute right-0 top-0 h-full w-[380px] bg-white border-l p-4 overflow-y-auto z-40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{uni.name}</h2>
          {typeof uni.rank === "number" && (
            <p className="text-xs text-gray-600 mt-1">
              Global rank: #{uni.rank}
            </p>
          )}
          <p className="text-xs text-gray-500">Region: {region}</p>
        </div>
        <button onClick={onClose} className="text-sm underline">
          Close
        </button>
      </div>

      {/* Program details */}
      {prog ? (
        <>
          {prog.entryRequirements && (
            <div className="mt-5">
              <h3 className="font-semibold">Entry requirements</h3>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                {Object.entries(prog.entryRequirements).map(([label, detail]) => (
                  <li key={label}>
                    <b>{label}:</b> <span className="text-sm">{detail}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 mt-2">
                ({region}-specific requirements for {discipline})
              </p>
            </div>
          )}

          {prog.applicationFee && (
            <p className="mt-4"><b>Application fee:</b> {prog.applicationFee}</p>
          )}
          {prog.annualTuition && (
            <p><b>Annual tuition:</b> {prog.annualTuition}</p>
          )}
          {prog.applicationProcess && (
            <div className="mt-4">
              <h3 className="font-semibold">Application process</h3>
              <p className="text-sm">{prog.applicationProcess}</p>
            </div>
          )}
        </>
      ) : (
        <p className="mt-4 text-sm text-gray-600">
          This university doesn’t offer {discipline}.
        </p>
      )}

      {/* Scholarships */}
      {uni.scholarships && uni.scholarships.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold">Scholarships</h3>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            {uni.scholarships.map((s, i) => (
              <li key={i} className="text-sm">{s}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Resources */}
      {uni.resources && uni.resources.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold">Learn &amp; prepare</h3>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            {uni.resources.map((r, i) => (
              <li key={i} className="text-sm">
                <a href={r.url} target="_blank" rel="noreferrer" className="underline">
                  {r.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
