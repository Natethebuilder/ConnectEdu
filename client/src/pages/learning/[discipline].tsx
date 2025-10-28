// client/src/pages/learning/[discipline].tsx
import React, { lazy, Suspense } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

/**
 * Dynamic loader for discipline-specific learning hubs.
 * Each discipline can have its own Apple+ level experience (like PhysicsLearningHub).
 * Falls back to a generic LearningHubPage if none exists.
 */

const PhysicsLearningHub = lazy(() => import("./PhysicsLearningHub"));
const GenericLearningHub = lazy(() => import("./GenericLearningHub")); // optional fallback, explained below
const ChemistryLearningHub = lazy(() => import("./ChemistryLearningHub"));

export default function LearningHubRouter() {
  const { discipline = "" } = useParams<{ discipline: string }>();
  const lower = discipline.toLowerCase();

  // Map discipline slugs to their custom components
  const DisciplineComponents: Record<string, React.LazyExoticComponent<React.FC>> = {
    physics: PhysicsLearningHub,
    chemistry: ChemistryLearningHub,
    // add more when ready:
    // chemistry: ChemistryLearningHub,
    // biology: BiologyLearningHub,
    // ...
  };

  const SelectedHub = DisciplineComponents[lower] || GenericLearningHub;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white/80">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading {discipline} hub…
          </div>
        </div>
      }
    >
      <SelectedHub />
    </Suspense>
  );
}
