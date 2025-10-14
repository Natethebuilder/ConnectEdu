import React, { lazy, Suspense } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

const PhysicsLearningHub = lazy(() => import("./PhysicsLearningHub"));
const ChemistryLearningHub = lazy(() => import("./ChemistryLearningHub"));
const GenericLearningHub = lazy(() => import("./GenericLearningHub")); // your fallback

export default function LearningHubRouter() {
  const { discipline = "" } = useParams<{ discipline: string }>();
  const map: Record<string, React.LazyExoticComponent<React.FC>> = {
    physics: PhysicsLearningHub,
    chemistry: ChemistryLearningHub,
  };
  const Selected = map[discipline.toLowerCase()] || GenericLearningHub;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center bg-gradient-to-br from-teal-900 via-emerald-900 to-black text-white/80">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading {discipline} hub…
          </div>
        </div>
      }
    >
      <Selected />
    </Suspense>
  );
}
