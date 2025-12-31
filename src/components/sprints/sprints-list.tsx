"use client";

import { useRouter } from "next/navigation";
import { SprintWithDetails } from "@/lib/types";
import { SprintCard } from "@/components/sprints/sprint-card";
import { GlassPanel } from "@/components/dashboard/glass-panel";

interface SprintsListProps {
  sprints: SprintWithDetails[];
  activeSprintId?: string;
}

export function SprintsList({ sprints, activeSprintId }: SprintsListProps) {
  const router = useRouter();

  const handleUpdate = () => {
    router.refresh();
  };

  if (sprints.length === 0) {
    return (
      <GlassPanel className="col-span-full p-12 flex flex-col items-center justify-center text-center space-y-4 border-dashed border-white/10">
        <p className="font-mono text-sm text-white/20 uppercase tracking-widest">No sprint data detected</p>
        <p className="text-white/40 max-w-xs">Initialize your first sprint to start tracking progress.</p>
      </GlassPanel>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sprints.map((sprint) => (
        <SprintCard
          key={sprint.id}
          sprint={sprint}
          isActive={sprint.id === activeSprintId}
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  );
}

