"use client";

import { useState } from "react";
import { Sprint } from "@/lib/types";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { cn } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";
import { Calendar, Target, CheckCircle2, Clock, Edit2, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteSprintAction } from "@/actions/sprints";
import { toast } from "sonner";
import { SprintForm } from "./sprint-form";
import { toSprintWithPriorities } from "@/lib/type-helpers";

interface SprintCardProps {
  sprint: Sprint;
  isActive: boolean;
  onUpdate?: () => void;
}

export function SprintCard({ sprint, isActive, onUpdate }: SprintCardProps) {
  const sprintWithPriorities = toSprintWithPriorities(sprint);
  const priorities = sprintWithPriorities.priorities;
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteSprintAction(sprint.id);
      toast.success("Sprint deleted successfully");
      onUpdate?.();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete sprint");
      setIsDeleting(false);
    }
  };

  if (showEditForm) {
    return (
      <SprintForm 
        sprintToEdit={sprint} 
        onSuccess={() => {
          setShowEditForm(false);
          onUpdate?.();
        }}
      />
    );
  }

  // Calculate days left, ensuring it's never negative for expired sprints
  const endDate = new Date(sprint.endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = Math.max(0, differenceInDays(endDate, today));

  return (
    <GlassPanel 
      className={cn(
        "p-6 flex flex-col space-y-6 transition-all duration-500",
        isActive 
          ? "border-action-emerald/30 bg-action-emerald/[0.02] shadow-[0_0_40px_rgba(16,185,129,0.05)]" 
          : "border-white/5 opacity-60 hover:opacity-100"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-white tracking-tight">{sprint.name}</h3>
            {isActive && (
              <span className="flex h-2 w-2 rounded-full bg-action-emerald animate-pulse" />
            )}
          </div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
            {format(new Date(sprint.startDate), "MMM d")} — {format(new Date(sprint.endDate), "MMM d, yyyy")}
          </p>
        </div>
        
        {isActive ? (
          <div className="px-2 py-1 rounded bg-action-emerald/10 border border-action-emerald/20">
            <p className="text-[8px] font-mono font-bold text-action-emerald uppercase tracking-tighter">ACTIVE_NODE</p>
          </div>
        ) : (
          <div className="px-2 py-1 rounded bg-white/5 border border-white/10">
            <p className="text-[8px] font-mono font-bold text-white/20 uppercase tracking-tighter">ARCHIVED</p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-mono uppercase tracking-widest text-white/20">Focus Core</p>
        <div className="space-y-2">
          {priorities.map((p, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-focus-violet" />
                <span className="text-xs text-white/80">{p.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-white/40 uppercase">{p.weeklyTargetUnits} {p.unitDefinition}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 mt-auto border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4 text-white/20">
           <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              <span className="text-[10px] font-mono uppercase tracking-tighter">
                {daysLeft}d left
              </span>
           </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowEditForm(true)}
            className="h-7 px-2 text-white/40 hover:text-white hover:bg-white/5"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
          {!isActive && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="h-7 px-2 text-white/40 hover:text-bullshit-crimson hover:bg-bullshit-crimson/10"
              >
                {isDeleting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
              </Button>
              <ConfirmDialog
                open={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
                title="Delete Sprint"
                description={`Are you sure you want to delete "${sprint.name}"? This action cannot be undone and all associated data will be permanently removed.`}
                confirmText="Delete Sprint"
                cancelText="Cancel"
                onConfirm={handleDelete}
                variant="destructive"
                isLoading={isDeleting}
              />
            </>
          )}
          {isActive && (
            <p className="text-[8px] font-mono text-white/10 uppercase tracking-widest">Active Sprint</p>
          )}
        </div>
      </div>
    </GlassPanel>
  );
}

