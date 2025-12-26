"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SprintFormSchema, type SprintFormData } from "@/lib/validators";
import { startSprintAction, updateSprintAction, deleteSprintAction } from "@/actions/sprints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Target, Info, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SprintFormProps {
  activeSprint?: any;
  sprintToEdit?: any;
  onSuccess?: () => void;
}

export function SprintForm({ activeSprint, sprintToEdit, onSuccess }: SprintFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [shake, setShake] = useState(false);
  const isEditMode = !!sprintToEdit;

  const form = useForm<SprintFormData>({
    resolver: zodResolver(SprintFormSchema),
    defaultValues: sprintToEdit ? {
      name: sprintToEdit.name,
      startDate: new Date(sprintToEdit.startDate),
      endDate: new Date(sprintToEdit.endDate),
      priorities: (sprintToEdit.priorities as any[]).map((p: any) => ({
        key: p.key,
        label: p.label,
        type: p.type,
        weeklyTargetUnits: p.weeklyTargetUnits,
        unitDefinition: p.unitDefinition || "",
      })),
    } : {
      name: "",
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
      priorities: [
        { key: "p1", label: "", type: "work", weeklyTargetUnits: 5, unitDefinition: "Pomodoros" }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "priorities",
  });

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  async function onSubmit(data: SprintFormData) {
    setIsPending(true);
    try {
      // Clean up priorities - remove empty unitDefinition
      const cleanedData = {
        ...data,
        priorities: data.priorities.map(p => ({
          ...p,
          unitDefinition: p.unitDefinition?.trim() || undefined,
        })),
      };
      
      if (isEditMode && sprintToEdit) {
        await updateSprintAction(sprintToEdit.id, cleanedData);
        toast.success("Sprint updated successfully");
      } else {
        await startSprintAction(cleanedData);
        toast.success("Sprint started successfully");
      }
      
      setOpen(false);
      form.reset();
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error("Sprint operation error:", error);
      toast.error(error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'start'} sprint`);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isEditMode && (
        <DialogTrigger asChild>
          <Button 
            variant="glass" 
            className="bg-action-emerald/10 border-action-emerald/20 text-action-emerald hover:bg-action-emerald/20 h-12 px-6 rounded-xl emerald-glow"
          >
            <Plus className="h-4 w-4 mr-2" />
            Initialize New Sprint
          </Button>
        </DialogTrigger>
      )}
      {isEditMode && (
        <DialogTrigger asChild>
          <Button 
            variant="glass" 
            className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-12 px-6 rounded-xl"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Sprint
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-2xl border-white/10 text-white rounded-[32px] overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold tracking-tighter uppercase">
            Sprint <span className="text-white/20">//</span> {isEditMode ? 'Edit' : 'Initialization'}
          </DialogTitle>
          {!isEditMode && (
            <p className="text-xs font-mono text-white/40 uppercase tracking-widest mt-2">
              Warning: This will deactivate any existing active sprint.
            </p>
          )}
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Sprint Identifier</Label>
              <Input
                {...form.register("name")}
                placeholder="e.g. Operation Deep Work"
                className="bg-white/5 border-white/10 focus:border-action-emerald/50"
              />
              {form.formState.errors.name && (
                <p className="text-bullshit-crimson text-[10px] font-mono">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Start Date</Label>
                <Input
                  type="date"
                  {...form.register("startDate", { valueAsDate: true })}
                  className="bg-white/5 border-white/10 text-xs h-9"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-mono uppercase tracking-widest text-white/40">End Date</Label>
                <Input
                  type="date"
                  {...form.register("endDate", { valueAsDate: true })}
                  className="bg-white/5 border-white/10 text-xs h-9"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Priorities</Label>
                <span className={cn(
                  "px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase",
                  fields.length >= 3 ? "bg-bullshit-crimson/10 text-bullshit-crimson border border-bullshit-crimson/20" : "bg-action-emerald/10 text-action-emerald border border-action-emerald/20"
                )}>
                  {fields.length}/3
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (fields.length < 3) {
                    append({ key: `p${fields.length + 1}`, label: "", type: "work", weeklyTargetUnits: 5, unitDefinition: "" });
                  } else {
                    triggerShake();
                    toast.error("Constraint Violation: Focus is limited to 3 priorities.");
                  }
                }}
                className="text-[10px] font-mono uppercase tracking-widest h-8 text-white/40 hover:text-white"
              >
                <Plus className="h-3 w-3 mr-2" />
                Add Priority
              </Button>
            </div>

            <div className={cn("space-y-4", shake && "animate-shake")}>
              {fields.map((field, index) => (
                <GlassPanel key={field.id} className="p-4 border-white/5 relative group">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute top-2 right-2 text-white/10 hover:text-bullshit-crimson transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-[8px] font-mono uppercase tracking-widest text-white/20">Label</Label>
                      <Input
                        {...form.register(`priorities.${index}.label`)}
                        placeholder="Priority title"
                        className="h-8 text-xs bg-white/[0.02] border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[8px] font-mono uppercase tracking-widest text-white/20">Target</Label>
                      <Input
                        type="number"
                        {...form.register(`priorities.${index}.weeklyTargetUnits`, { valueAsNumber: true })}
                        className="h-8 text-xs bg-white/[0.02] border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[8px] font-mono uppercase tracking-widest text-white/20">Unit</Label>
                      <Input
                        {...form.register(`priorities.${index}.unitDefinition`)}
                        placeholder="e.g. units"
                        className="h-8 text-xs bg-white/[0.02] border-white/10"
                      />
                    </div>
                  </div>
                </GlassPanel>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 bg-action-emerald hover:bg-action-emerald/90 text-white font-mono uppercase tracking-widest rounded-xl emerald-glow"
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  {isEditMode ? 'Update Sprint' : 'Launch Sprint'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

