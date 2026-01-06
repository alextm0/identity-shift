"use client";

import { useRouter } from "next/navigation";
import { SprintWithDetails } from "@/lib/types"; // Changed import
import { SprintCard } from "@/components/sprints/sprint-card";

interface SprintHistoryProps {
  sprints: SprintWithDetails[]; // Changed type
}

export function SprintHistory({ sprints }: SprintHistoryProps) {
  const router = useRouter();

  const handleUpdate = () => {
    router.refresh();
  };

  const inactiveSprints = sprints.filter(sprint => !sprint.active);

  if (inactiveSprints.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/5" />
        <h3 className="text-sm font-mono text-white/20 uppercase tracking-[0.3em]">
          Archived Sprints
        </h3>
        <div className="h-px flex-1 bg-white/5" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inactiveSprints.map((sprint) => (
          <SprintCard
            key={sprint.id}
            sprint={sprint}
            isActive={false}
            onUpdate={handleUpdate}
          />
        ))}
      </div>
    </div>
  );
}

