"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller, Control, UseFormRegister, UseFormWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { SprintFormSchema, type SprintFormData, PromiseType } from "@/lib/validators";
import { SprintWithDetails } from "@/lib/types";
import { startSprintAction, updateSprintAction } from "@/actions/sprints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Target, Edit2, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";


interface SprintFormProps {
  sprintToEdit?: SprintWithDetails | null;
  onSuccess?: () => void;
}

// --- Nested Components ---

interface PromiseInputProps {
  goalIndex: number;
  promiseIndex: number;
  remove: () => void;
  control: Control<SprintFormData>;
  register: UseFormRegister<SprintFormData>;
  watch: UseFormWatch<SprintFormData>;
}

function PromiseInput({ goalIndex, promiseIndex, remove, control, register, watch }: PromiseInputProps) {
  const type = watch(`goals.${goalIndex}.promises.${promiseIndex}.type`);

  return (
    <div className="p-3 bg-white/5 rounded-lg border border-white/10 space-y-3">
      <div className="flex justify-between items-start gap-2">
        <Input
          {...register(`goals.${goalIndex}.promises.${promiseIndex}.text`)}
          placeholder="I will..."
          className="flex-1 bg-transparent border-white/10 text-sm"
        />
        <Button type="button" variant="ghost" size="icon" onClick={remove} className="h-8 w-8 text-white/40 hover:text-bullshit-crimson">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-2">
        <Controller
          control={control}
          name={`goals.${goalIndex}.promises.${promiseIndex}.type`}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="w-[100px] h-8 text-xs bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PromiseType.DAILY}>Daily</SelectItem>
                <SelectItem value={PromiseType.WEEKLY}>Weekly</SelectItem>
              </SelectContent>
            </Select>
          )}
        />

        {type === PromiseType.WEEKLY ? (
          <div className="flex items-center gap-2">
            <Label className="text-[10px] uppercase text-white/40">Target:</Label>
            <Input
              type="number"
              {...register(`goals.${goalIndex}.promises.${promiseIndex}.weeklyTarget`, { valueAsNumber: true })}
              className="w-16 h-8 text-xs bg-white/5 border-white/10"
              min={1}
            />
            <span className="text-xs text-white/40">times/week</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <span className="text-xs text-white/40 italic px-2">Every day</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface GoalSectionProps {
  goalIndex: number;
  onRemoveGoal: () => void;
  control: Control<SprintFormData>;
  register: UseFormRegister<SprintFormData>;
  watch: UseFormWatch<SprintFormData>;
  totalGoals: number;
}

function GoalSection({ goalIndex, onRemoveGoal, control, register, watch, totalGoals }: GoalSectionProps) {
  const { fields: promiseFields, append: appendPromise, remove: removePromise } = useFieldArray({
    control,
    name: `goals.${goalIndex}.promises`
  });



  return (
    <div className="border border-white/10 rounded-2xl p-4 space-y-4 bg-white/[0.01]">
      {/* Goal header */}
      <div className="flex items-start gap-3">
        <div className="w-1 h-full min-h-[20px] bg-action-emerald/60 rounded-full mt-1 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-[10px] font-mono uppercase tracking-widest text-white/40">
              Goal {goalIndex + 1}
            </Label>
            {totalGoals > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onRemoveGoal}
                className="h-6 w-6 text-white/20 hover:text-bullshit-crimson"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
          <Input
            {...register(`goals.${goalIndex}.goalText`)}
            placeholder="e.g. Finish the project MVP"
            className="bg-white/5 border-white/10 text-sm"
          />
        </div>
      </div>

      {/* Promises */}
      <div className="pl-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-widest text-white/30">
            Protocols / Habits
          </p>
          {promiseFields.length < 4 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => appendPromise({
                text: "",
                type: PromiseType.DAILY,
                scheduleDays: [0, 1, 2, 3, 4, 5, 6],
                weeklyTarget: undefined
              })}
              className="text-[10px] uppercase tracking-widest text-action-emerald hover:text-action-emerald/80 h-6"
            >
              <Plus className="h-3 w-3 mr-1" /> Add Protocol
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {promiseFields.map((field, idx) => (
            <PromiseInput
              key={field.id}
              goalIndex={goalIndex}
              promiseIndex={idx}
              remove={() => removePromise(idx)}
              control={control}
              register={register}
              watch={watch}
            />
          ))}
          {promiseFields.length === 0 && (
            <p className="text-xs text-white/20 italic py-2 text-center border border-dashed border-white/5 rounded-lg">
              No protocols yet — add habits or actions that serve this goal.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function SprintForm({ sprintToEdit, onSuccess }: SprintFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [step, setStep] = useState(1); // 1: Setup, 2: Goals & Protocols, 3: Review

  const isEditMode = !!sprintToEdit;

  const form = useForm<SprintFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(SprintFormSchema) as any,
    defaultValues: {
      name: sprintToEdit?.name || "",
      startDate: (sprintToEdit ? format(new Date(sprintToEdit.startDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')),
      endDate: (sprintToEdit ? format(new Date(sprintToEdit.endDate), 'yyyy-MM-dd') : format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')),
      goals: sprintToEdit?.goals?.map((g) => ({
        id: g.id,
        goalId: g.goalId || undefined,
        goalText: g.goalText,
        promises: g.promises?.map((p) => ({
          id: p.id,
          text: p.text,
          type: p.type as PromiseType,
          scheduleDays: p.scheduleDays || undefined,
          weeklyTarget: p.weeklyTarget || undefined
        })) || []
      })) || []
    }
  });

  useEffect(() => {
    if (open && sprintToEdit) {
      form.reset({
        name: sprintToEdit.name || "",
        startDate: format(new Date(sprintToEdit.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(sprintToEdit.endDate), 'yyyy-MM-dd'),
        goals: sprintToEdit.goals?.map((g) => ({
          id: g.id,
          goalId: g.goalId || undefined,
          goalText: g.goalText,
          promises: g.promises?.map((p) => ({
            id: p.id,
            text: p.text,
            type: p.type as PromiseType,
            scheduleDays: p.scheduleDays || undefined,
            weeklyTarget: p.weeklyTarget || undefined
          })) || []
        })) || []
      });
      setStep(1);
    } else if (open && !sprintToEdit) {
      form.reset({
        name: "",
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        goals: []
      });
      setStep(1);
    }
  }, [open, sprintToEdit, form]);

  const { fields: goalFields, append: appendGoal, remove: removeGoal } = useFieldArray({
    control: form.control,
    name: "goals",
  });

  async function onSubmit(data: SprintFormData) {
    setIsPending(true);
    try {
      if (isEditMode) {
        const result = await updateSprintAction(sprintToEdit.id, data);
        if (result.success) {
          toast.success("Sprint updated successfully");
          setOpen(false);
          onSuccess?.();
        } else {
          toast.error(result.error || "Failed to update sprint");
        }
      } else {
        const result = await startSprintAction(data);
        if (result.success) {
          toast.success("Sprint launched!");
          setOpen(false);
          form.reset();
          setStep(1);
          router.refresh();
          onSuccess?.();
        } else {
          toast.error(result.error || "Failed to launch sprint");
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
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
            className="bg-action-emerald/10 border-action-emerald/20 text-action-emerald hover:bg-action-emerald/20 h-10 px-4 rounded-xl emerald-glow text-xs uppercase tracking-widest font-semibold"
          >
            <Plus className="h-3 w-3 mr-2" />
            Launch Sprint
          </Button>
        </DialogTrigger>
      )}
      {isEditMode && (
        <DialogTrigger asChild>
          <Button
            variant="glass"
            className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-10 px-4 rounded-xl text-xs uppercase tracking-widest font-semibold"
          >
            <Edit2 className="h-3 w-3 mr-2" />
            Edit
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-2xl bg-[#09090b] border-white/10 text-white sm:rounded-[24px] overflow-hidden p-0 gap-0">
        <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02]">
          <DialogTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
            <Target className="h-5 w-5 text-action-emerald" />
            {isEditMode ? "EDIT SPRINT" : "LAUNCH SPRINT"}
          </DialogTitle>
          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3].map(s => (
              <div key={s} className={cn("h-1 flex-1 rounded-full transition-colors", step >= s ? "bg-action-emerald" : "bg-white/10")} />
            ))}
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="max-h-[60vh] overflow-y-auto p-6">

            {/* STEP 1: SETUP */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">Sprint Setup</h3>
                  <p className="text-xs text-white/40">Give your sprint a name and set the dates.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Sprint Codename</Label>
                    <Input {...form.register("name")} placeholder="Operation North Star" className="bg-white/5 border-white/10 text-sm" />
                    {form.formState.errors.name && <p className="text-bullshit-crimson text-xs">{form.formState.errors.name.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Start</Label>
                      <Input type="date" {...form.register("startDate")} className="bg-white/5 border-white/10 text-xs" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-mono uppercase tracking-widest text-white/40">End</Label>
                      <Input type="date" {...form.register("endDate")} className="bg-white/5 border-white/10 text-xs" />
                      {form.formState.errors.endDate && <p className="text-bullshit-crimson text-xs">{form.formState.errors.endDate.message}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: GOALS & PROTOCOLS */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">Focus Goals</h3>
                    <p className="text-xs text-white/40">What are you committed to achieving? (Max 3 goals)</p>
                  </div>
                  {goalFields.length < 3 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => appendGoal({ goalText: "", promises: [] })}
                      className="text-[10px] uppercase tracking-widest text-action-emerald hover:text-action-emerald/80 shrink-0"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Goal
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {goalFields.map((field, index) => (
                    <GoalSection
                      key={field.id}
                      goalIndex={index}
                      onRemoveGoal={() => removeGoal(index)}
                      control={form.control}
                      register={form.register}
                      watch={form.watch}
                      totalGoals={goalFields.length}
                    />
                  ))}
                  {goalFields.length === 0 && (
                    <div
                      onClick={() => appendGoal({ goalText: "", promises: [] })}
                      className="border border-dashed border-white/10 rounded-2xl p-8 text-center cursor-pointer hover:border-action-emerald/30 hover:bg-action-emerald/5 transition-all group"
                    >
                      <Plus className="h-6 w-6 text-white/20 group-hover:text-action-emerald/60 mx-auto mb-2 transition-colors" />
                      <p className="text-sm text-white/30 group-hover:text-white/50 transition-colors">Click to add your first goal</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-action-emerald/10 border border-action-emerald/20 p-4 rounded-xl">
                  <h3 className="text-action-emerald font-bold uppercase tracking-widest text-xs mb-2">Sprint Manifesto</h3>
                  <p className="text-xl font-bold text-white">"{form.getValues("name")}"</p>
                  <p className="text-sm text-white/60 mt-1">
                    {new Date(form.getValues("startDate")).toLocaleDateString()} — {new Date(form.getValues("endDate")).toLocaleDateString()}
                  </p>
                </div>

                <div className="space-y-4">
                  {goalFields.length === 0 ? (
                    <p className="text-sm text-white/40 italic text-center py-4">No goals set — sprint will be launched with no specific focus.</p>
                  ) : (
                    goalFields.map((goal, idx) => (
                      <div key={goal.id} className="space-y-2">
                        <h4 className="text-sm font-medium text-white/80 border-b border-white/10 pb-2 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-action-emerald" />
                          {form.getValues(`goals.${idx}.goalText`) || `Goal ${idx + 1}`}
                        </h4>
                        {(form.getValues(`goals.${idx}.promises`) || []).length > 0 ? (
                          <ul className="space-y-1 pl-4">
                            {form.getValues(`goals.${idx}.promises`)?.map((p, pIdx) => (
                              <li key={pIdx} className="flex items-center gap-3 text-sm text-white/60">
                                <div className={cn("w-1.5 h-1.5 rounded-full", p.type === PromiseType.DAILY ? "bg-blue-400" : "bg-purple-400")} />
                                <span>{p.text}</span>
                                <span className="text-[10px] uppercase bg-white/5 px-1.5 py-0.5 rounded text-white/30 ml-auto">
                                  {p.type === PromiseType.WEEKLY ? `${p.weeklyTarget}x/wk` : 'Daily'}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-white/30 italic pl-4">No protocols defined.</p>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="bg-white/5 p-4 rounded-xl">
                  <p className="text-xs text-white/40 text-center uppercase tracking-widest">
                    Commit to this sprint and make it happen.
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-between items-center">
            {step > 1 ? (
              <Button type="button" variant="ghost" onClick={() => setStep(s => s - 1)} className="text-white/40 hover:text-white">
                <ChevronLeft className="h-4 w-4 mr-2" /> Back
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button
                type="button"
                onClick={async () => {
                  if (step === 1) {
                    const isValid = await form.trigger(["name", "startDate", "endDate"]);
                    if (!isValid) return;
                  }
                  if (step === 2) {
                    // Validate goal texts
                    const goals = form.getValues("goals");
                    const emptyGoal = goals.find(g => !g.goalText?.trim());
                    if (emptyGoal) {
                      toast.error("Please fill in all goal names.");
                      return;
                    }
                    // Validate promise texts
                    const emptyPromise = goals.some(g =>
                      g.promises?.some(p => !p.text?.trim())
                    );
                    if (emptyPromise) {
                      toast.error("All protocols must have text.");
                      return;
                    }
                  }
                  setStep(prev => prev + 1);
                }}
                className="bg-white text-black hover:bg-white/90 rounded-xl"
              >
                Next <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={(e) => { form.handleSubmit(onSubmit)(e); }}
                disabled={isPending}
                className="bg-action-emerald text-white hover:bg-action-emerald/90 rounded-xl emerald-glow px-8"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Commit to Sprint"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
