"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller, Control, UseFormRegister, UseFormWatch, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { SprintFormSchema, type SprintFormData, PromiseType, AnnualGoal } from "@/lib/validators";
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
import { Plus, Trash2, Loader2, Target, Edit2, CheckSquare, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";


interface SprintFormProps {
  activeSprint?: SprintWithDetails | null;
  sprintToEdit?: SprintWithDetails | null;
  annualGoals?: AnnualGoal[];
  onSuccess?: () => void;
}

// --- Nested Components moved outside to prevent re-creation on every render ---

interface PromiseInputProps {
  goalIndex: number;
  promiseIndex: number;
  remove: () => void;
  control: Control<SprintFormData>;
  register: UseFormRegister<SprintFormData>;
  watch: UseFormWatch<SprintFormData>;
}

function PromiseInput({
  goalIndex,
  promiseIndex,
  remove,
  control,
  register,
  watch
}: PromiseInputProps) {
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

interface GoalPromiseSectionProps {
  goalIndex: number;
  control: Control<SprintFormData>;
  register: UseFormRegister<SprintFormData>;
  watch: UseFormWatch<SprintFormData>;
}

function GoalPromiseSection({ goalIndex, control, register, watch }: GoalPromiseSectionProps) {
  const { fields: promiseFields, append: appendPromise, remove: removePromise } = useFieldArray({
    control: control,
    name: `goals.${goalIndex}.promises`
  });

  const goalText = watch(`goals.${goalIndex}.goalText`);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-action-emerald rounded-full" />
          <h4 className="text-sm font-medium text-white truncate max-w-[300px]" title={goalText}>{goalText}</h4>
        </div>
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
          className="text-[10px] uppercase tracking-widest text-action-emerald hover:text-action-emerald/80"
        >
          <Plus className="h-3 w-3 mr-1" /> Add Promise
        </Button>
      </div>

      <div className="space-y-3 pl-3 border-l border-white/10 ml-1.5">
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
          <p className="text-xs text-white/40 italic">No promises defined yet.</p>
        )}
      </div>
    </div>
  );
}

export function SprintForm({ sprintToEdit, annualGoals = [], onSuccess }: SprintFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [step, setStep] = useState(1); // 1: Setup & Goals, 2: Promises, 3: Review

  const isEditMode = !!sprintToEdit;

  const form = useForm<SprintFormData>({
    resolver: zodResolver(SprintFormSchema),
    defaultValues: {
      name: sprintToEdit?.name || "",
      startDate: (sprintToEdit ? format(new Date(sprintToEdit.startDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')),
      endDate: (sprintToEdit ? format(new Date(sprintToEdit.endDate), 'yyyy-MM-dd') : format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')), // Default 2 weeks
      goals: sprintToEdit?.goals?.map((g) => ({
        id: g.id,
        goalId: g.goalId,
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
  // Sync form when sprintToEdit changes or dialog opens
  useEffect(() => {
    if (open && sprintToEdit) {
      form.reset({
        name: sprintToEdit.name || "",
        startDate: format(new Date(sprintToEdit.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(sprintToEdit.endDate), 'yyyy-MM-dd'),
        goals: sprintToEdit.goals?.map((g) => ({
          id: g.id,
          goalId: g.goalId,
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

  const toggleGoalSelection = (goal: AnnualGoal) => {
    const existsIndex = goalFields.findIndex(g => g.goalId === goal.id);
    if (existsIndex >= 0) {
      removeGoal(existsIndex);
    } else {
      if (goalFields.length >= 3) {
        toast.error("Focus on max 3 goals per sprint");
        return;
      }
      appendGoal({
        goalId: goal.id,
        goalText: goal.text,
        promises: []
      });
    }
  };

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
          toast.success("Sprint started successfully");
          setOpen(false);
          form.reset();
          setStep(1);
          router.refresh();
          onSuccess?.();
        } else {
          toast.error(result.error || "Failed to start sprint");
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  }

  const onInvalid = (errors: FieldErrors<SprintFormData>) => {
    // Help the user identify which goal is missing promises
    if (errors.goals) {
      toast.error("Please add at least one promise to every goal.");
    } else {
      toast.error("Please check all fields and try again.");
    }
  };

  // Nested components moved outside


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
            SPRINT INITIALIZATION
          </DialogTitle>
          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3].map(s => (
              <div key={s} className={cn("h-1 flex-1 rounded-full transition-colors", step >= s ? "bg-action-emerald" : "bg-white/10")} />
            ))}
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="max-h-[60vh] overflow-y-auto p-6">
            {/* STEP 1: SETUP & GOALS */}
            {step === 1 && (
              <div className="space-y-8">
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
                    </div>
                  </div>
                </div>

                {(isEditMode || annualGoals.length > 0) && (
                  <div className="space-y-4">
                    <Label className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                      {isEditMode ? "Goals in this Sprint" : "Select Focus Goals (Max 3)"}
                    </Label>
                    <div className="grid gap-3">
                      {annualGoals.map(goal => {
                        const isSelected = goalFields.some(g => g.goalId === goal.id);
                        return (
                          <div
                            key={goal.id}
                            onClick={() => toggleGoalSelection(goal)}
                            className={cn(
                              "p-4 rounded-xl border cursor-pointer transition-all hover:bg-white/5 flex items-start gap-4",
                              isSelected ? "bg-action-emerald/5 border-action-emerald/30" : "bg-transparent border-white/10"
                            )}
                          >
                            {/* Custom Checkbox to avoid Dialog focus trap issues */}
                            <div className={cn(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ring-offset-background",
                              isSelected ? "bg-action-emerald border-action-emerald text-primary-foreground" : "border-primary"
                            )}>
                              {isSelected && <CheckSquare className="h-3 w-3 text-black fill-current" />}
                            </div>
                            <div className="space-y-1 text-left">
                              <p className={cn("text-sm font-medium leading-none", isSelected ? "text-white" : "text-white/60")}>{goal.text}</p>
                              <div className="flex gap-2 mt-1">
                                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/40">{goal.category}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {annualGoals.length === 0 && !isEditMode && (
                        <p className="text-sm text-white/40 italic p-4 text-center border border-dashed border-white/10 rounded-xl">
                          No annual goals found. Please verify your annual plan.
                        </p>
                      )}
                    </div>
                    {form.formState.errors.goals && <p className="text-bullshit-crimson text-xs">{form.formState.errors.goals.message}</p>}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: PROMISES */}
            {step === 2 && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">Define Your Protocols</h3>
                  <p className="text-sm text-white/60">For each goal, define binary promises (protocols) you will keep.</p>
                </div>

                <div className="space-y-8">
                  {goalFields.map((field, index) => (
                    <GoalPromiseSection
                      key={field.id}
                      goalIndex={index}
                      control={form.control}
                      register={form.register}
                      watch={form.watch}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-action-emerald/10 border border-action-emerald/20 p-4 rounded-xl">
                  <h3 className="text-action-emerald font-bold uppercase tracking-widest text-xs mb-2">Manifesto</h3>
                  <p className="text-xl font-bold text-white">"{form.getValues("name")}"</p>
                  <p className="text-sm text-white/60 mt-1">
                    {new Date(form.getValues("startDate")).toLocaleDateString()} — {new Date(form.getValues("endDate")).toLocaleDateString()}
                  </p>
                </div>

                <div className="space-y-6">
                  {goalFields.map((goal, idx) => (
                    <div key={goal.id} className="space-y-3">
                      <h4 className="text-sm font-medium text-white/80 border-b border-white/10 pb-2">{goal.goalText}</h4>
                      <ul className="space-y-2">
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
                    </div>
                  ))}
                </div>

                <div className="bg-white/5 p-4 rounded-xl">
                  <p className="text-xs text-white/40 text-center uppercase tracking-widest">
                    Review your sprint commitment.
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
                onClick={async (e) => {
                  e.preventDefault(); // Prevent accidental form submission
                  const isValid = await form.trigger(["name", "startDate", "endDate"]);

                  if (!isValid) {
                    return;
                  }

                  if (step === 1) {
                    // Check goals manually since field array validation can be tricky with trigger
                    if (goalFields.length === 0) {
                      toast.error("Select at least one goal.");
                      return;
                    }
                  }

                  if (step === 2) {
                    const currentGoals = form.getValues("goals");
                    const goalsWithPromises = currentGoals.every(g => g.promises && g.promises.length > 0);
                    if (!goalsWithPromises) {
                      toast.error("Every goal must have at least one promise.");
                      return;
                    }

                    // Validate that all promises have non-empty text
                    const allPromisesHaveText = currentGoals.every(g =>
                      g.promises && g.promises.every((p) => p.text && p.text.trim().length > 0)
                    );
                    if (!allPromisesHaveText) {
                      toast.error("All promises must have text.");
                      return;
                    }
                  }

                  setStep((prev) => prev + 1);
                }}
                className="bg-white text-black hover:bg-white/90 rounded-xl"
              >
                Next <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={(e) => {
                  form.handleSubmit(onSubmit, onInvalid)(e);
                }}
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
