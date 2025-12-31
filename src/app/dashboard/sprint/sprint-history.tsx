"use client";

import { useRouter } from "next/navigation";
import { SprintWithDetails } from "@/lib/types"; // Changed import
import { SprintCard } from "@/components/sprints/sprint-card";

interface SprintHistoryProps {
  sprints: SprintWithDetails[]; // Changed type
  activeSprintId?: string;
}

export function SprintHistory({ sprints, activeSprintId }: SprintHistoryProps) {
  const router = useRouter();

  const handleUpdate = () => {
    router.refresh();
  };

  const filteredSprints = sprints.filter(sprint => sprint.id !== activeSprintId);

  if (filteredSprints.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white uppercase tracking-tight">
        Sprint History
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSprints.map((sprint) => (
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

