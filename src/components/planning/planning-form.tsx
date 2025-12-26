"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlanningFormSchema, type PlanningFormData } from "@/lib/validators";
import { savePlanningAction } from "@/actions/planning";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { WheelOfLife } from "./wheel-of-life";
import { toast } from "sonner";
import { Plus, Trash2, Save, Loader2, ArrowRight, Target, Activity, Sparkles, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface PlanningFormProps {
  initialData?: any;
}

interface TargetRowProps {
  index: number;
  form: any;
  remove: (index: number) => void;
  relatedDimension: string | null;
  onHover: (dimension: string | null) => void;
}

function TargetRow({
  index,
  form,
  remove,
  relatedDimension,
  onHover
}: TargetRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const deadlineValue = form.watch(`goals2026.${index}.deadline`);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative bg-zinc-900/40 hover:bg-zinc-900/60 border border-white/5 hover:border-white/10 rounded-xl transition-all duration-300 overflow-hidden"
      onMouseEnter={() => onHover(relatedDimension)}
      onMouseLeave={() => onHover(null)}
    >
      {/* HEADER ROW */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Drag Handle / Accent */}
        <div className={cn(
          "w-1 h-12 rounded-full transition-all duration-300",
          isOpen ? "bg-focus-violet shadow-[0_0_15px_rgba(139,92,246,0.5)]" : "bg-white/10 group-hover:bg-white/20"
        )} />

        <div className="flex-1 flex flex-col md:flex-row md:items-center gap-3 min-w-0">
          {/* Area Badge - Styled Input */}
          <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
            <div className="absolute inset-0 bg-focus-violet/10 rounded-lg pointer-events-none" />
            <Input
              {...form.register(`goals2026.${index}.area`)}
              placeholder="AREA"
              className="w-24 h-8 bg-transparent border-focus-violet/20 text-[10px] tracking-widest font-mono font-bold text-focus-violet placeholder:text-focus-violet/30 text-center rounded-lg focus:bg-focus-violet/20 focus:border-focus-violet transition-all uppercase"
            />
          </div>

          {/* Main Outcome Input */}
          <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
            <Input
              {...form.register(`goals2026.${index}.outcome`)}
              placeholder="Define your target outcome..."
              className="h-10 px-3 bg-transparent border-none text-base md:text-lg font-medium text-white placeholder:text-white/20 focus:ring-0 shadow-none transition-colors"
            />
          </div>
        </div>

        {/* Action Section */}
        <div className="flex items-center gap-3 pl-2">
          {/* Custom Date Picker Trigger */}
          <div className="relative group/date" onClick={(e) => e.stopPropagation()}>
            <div className={cn(
              "flex items-center gap-2 h-8 px-3 rounded-md border transition-all duration-300",
              deadlineValue
                ? "bg-focus-violet/10 border-focus-violet/30 text-focus-violet"
                : "bg-white/5 border-white/10 text-zinc-500 hover:bg-white/10 hover:text-zinc-300"
            )}>
              <span className="text-[10px] font-mono font-medium tracking-wider uppercase">
                {deadlineValue ? format(new Date(deadlineValue), "MMM d, yyyy") : "Deadline"}
              </span>
            </div>
            {/* Using native input to bypass any component-specific pointer event issues */}
            <input
              type="date"
              {...form.register(`goals2026.${index}.deadline`)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onClick={(e) => {
                // Manually trigger picker if browser allows, as opacity:0 sometimes blocks clicks on some devices
                try {
                  (e.target as HTMLInputElement).showPicker?.();
                } catch { }
              }}
            />
          </div>

          <div className="h-4 w-[1px] bg-white/10 mx-1" />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              remove(index);
            }}
            className="h-8 w-8 text-zinc-500 hover:text-bullshit-crimson hover:bg-bullshit-crimson/10 rounded-full transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          <div className={cn(
            "p-1.5 rounded-full bg-white/5 text-zinc-500 transition-all duration-300",
            isOpen && "bg-focus-violet text-white rotate-180"
          )}>
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* EXPANDED CONTENT */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "circOut" }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 pl-[3.25rem] md:pl-[4.5rem] pr-6 pb-6">
              <div className="flex flex-col gap-3 p-4 rounded-xl bg-black/40 border border-white/5 relative group/edit">
                <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Why this matters</span>
                </div>

                <Textarea
                  {...form.register(`goals2026.${index}.why`)}
                  placeholder="Describe the deeper purpose behind this goal. What will achieving this unlock for you?"
                  className="min-h-[80px] mt-6 px-3 bg-transparent border-none text-base text-zinc-200 placeholder:text-zinc-600 focus:ring-0 resize-none leading-relaxed overflow-hidden font-sans"
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = target.scrollHeight + "px";
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function PlanningForm({ initialData }: PlanningFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [hoveredGoalArea, setHoveredGoalArea] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("assessment");

  const defaultWheelValues = {
    Health: 5,
    Wealth: 5,
    Relationships: 5,
    Career: 5,
    Energy: 5,
    Mindset: 5,
    Environment: 5,
    Spirituality: 5,
  };

  const form = useForm<PlanningFormData>({
    resolver: zodResolver(PlanningFormSchema),
    defaultValues: {
      currentSelf: initialData?.currentSelf || "",
      desiredSelf: initialData?.desiredSelf || "",
      goals2026: initialData?.goals2026 || [
        { area: "Health", outcome: "", why: "", deadline: "" },
      ],
      wheelOfLife: initialData?.wheelOfLife || defaultWheelValues,
      wheelOfLifeTarget: initialData?.wheelOfLifeTarget || defaultWheelValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "goals2026",
  });

  async function onSubmit(data: PlanningFormData) {
    setIsPending(true);
    try {
      await savePlanningAction(data);
      toast.success("Planning data saved successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save planning");
      console.error(error);
    } finally {
      setIsPending(false);
    }
  }

  const wheelOfLifeValues = form.watch("wheelOfLife");
  const wheelOfLifeTargetValues = form.watch("wheelOfLifeTarget") || defaultWheelValues;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
      {/* Identity Narrative Section - Split Pane */}
      <GlassPanel className="p-8 relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Current Identity */}
          <div className="flex-1 space-y-3">
            <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-white/40 mb-4">
              Who am I today?
            </h3>
            <Textarea
              {...form.register("currentSelf")}
              placeholder="Be brutally honest about your habits, weaknesses, and current reality..."
              className="min-h-[200px] bg-white/[0.02] border-white/10 focus:border-white/20 text-white/70 resize-none text-base leading-[1.6] p-4 rounded-lg transition-all duration-300"
            />
            {form.formState.errors.currentSelf && (
              <p className="text-bullshit-crimson text-[10px] font-mono uppercase">
                {form.formState.errors.currentSelf.message}
              </p>
            )}
          </div>

          {/* Arrow Connector */}
          <div className="hidden md:flex items-center justify-center px-4 pt-8">
            <div className="relative">
              <ArrowRight className="h-8 w-8 text-focus-violet/60" />
              <div className="absolute inset-0 bg-focus-violet/20 blur-xl" />
            </div>
          </div>

          {/* Desired Identity */}
          <div className="flex-1 space-y-3">
            <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-focus-violet/80 mb-4">
              Who am I becoming?
            </h3>
            <Textarea
              {...form.register("desiredSelf")}
              placeholder="Describe the person who has already achieved your goals. Write in present tense, as if it's already true..."
              className="min-h-[200px] bg-focus-violet/[0.02] border-focus-violet/10 focus:border-focus-violet/30 text-white resize-none text-base leading-[1.6] p-4 rounded-lg transition-all duration-300"
            />
            {form.formState.errors.desiredSelf && (
              <p className="text-bullshit-crimson text-[10px] font-mono uppercase">
                {form.formState.errors.desiredSelf.message}
              </p>
            )}
          </div>
        </div>
      </GlassPanel>

      {/* Wheel of Life Section with Tabs */}
      <GlassPanel className="p-8 space-y-6 backdrop-blur-xl">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white uppercase mb-2">Wheel of Life</h2>
          <p className="text-sm text-white/40 leading-relaxed">
            Assess your current satisfaction and set targets for next year. The chart shows both overlayed.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="assessment" className="flex items-center gap-2">
              <Activity className="h-3.5 w-3.5" />
              Assessment
            </TabsTrigger>
            <TabsTrigger value="target" className="flex items-center gap-2">
              <Target className="h-3.5 w-3.5" />
              Target
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assessment" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Sliders */}
              <div className="lg:col-span-1 space-y-4">
                {Object.keys(wheelOfLifeValues).map((key) => {
                  const value = form.watch(`wheelOfLife.${key}`) as number;
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest">
                        <span className={cn(
                          "text-white/60 transition-colors",
                          hoveredGoalArea === key && "text-focus-violet"
                        )}>{key}</span>
                        <span className="text-white/40">{value}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        {...form.register(`wheelOfLife.${key}`, { valueAsNumber: true })}
                        className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-white/40 transition-all duration-300"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Chart */}
              <div className="lg:col-span-2 flex items-center justify-center min-h-[300px] lg:min-h-[400px]">
                <WheelOfLife
                  values={wheelOfLifeValues}
                  targetValues={wheelOfLifeTargetValues}
                  highlightedArea={hoveredGoalArea}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="target" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Sliders */}
              <div className="lg:col-span-1 space-y-4">
                {Object.keys(wheelOfLifeTargetValues).map((key) => {
                  const value = form.watch(`wheelOfLifeTarget.${key}`) as number;
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest">
                        <span className={cn(
                          "text-white/60 transition-colors",
                          hoveredGoalArea === key && "text-focus-violet"
                        )}>{key}</span>
                        <span className="text-focus-violet">{value}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        {...form.register(`wheelOfLifeTarget.${key}`, { valueAsNumber: true })}
                        className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-focus-violet transition-all duration-300"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Chart */}
              <div className="lg:col-span-2 flex items-center justify-center min-h-[300px] lg:min-h-[400px]">
                <WheelOfLife
                  values={wheelOfLifeValues}
                  targetValues={wheelOfLifeTargetValues}
                  highlightedArea={hoveredGoalArea}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </GlassPanel>

      {/* Goals Section - Premium Data Modules */}
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-2">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-focus-violet animate-pulse" />
              2026 Targets
            </h2>
            <p className="text-[9px] font-mono text-white/20 uppercase tracking-[0.3em]">Defined Outcomes for Identity Shift</p>
          </div>
          <Button
            type="button"
            variant="glass"
            size="sm"
            onClick={() => append({ area: "", outcome: "", why: "", deadline: "" })}
            className="text-[9px] font-mono uppercase tracking-widest h-8 px-3 hover:bg-focus-violet/10 hover:text-focus-violet transition-all group"
          >
            <Plus className="h-3 w-3 mr-2 group-hover:rotate-90 transition-transform" />
            Add Target
          </Button>
        </div>

        {fields.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-12 text-center rounded-3xl border border-dashed border-white/5 bg-white/[0.01]"
          >
            <p className="text-white/30 font-mono text-[10px] uppercase tracking-[0.3em]">No targets yet. Add your first target to get started.</p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {fields.map((field, index) => {
                const area = form.watch(`goals2026.${index}.area`);
                const areaToDimension: Record<string, string> = {
                  "Health": "Health", "Wealth": "Wealth", "Relationships": "Relationships",
                  "Career": "Career", "Energy": "Energy", "Mindset": "Mindset",
                  "Environment": "Environment", "Spirituality": "Spirituality",
                };
                return (
                  <TargetRow
                    key={field.id}
                    index={index}
                    form={form}
                    remove={remove}
                    relatedDimension={areaToDimension[area] || null}
                    onHover={setHoveredGoalArea}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-8">
        <Button
          type="submit"
          disabled={isPending}
          className="h-14 px-12 bg-focus-violet hover:bg-focus-violet/90 text-white font-mono uppercase tracking-[0.2em] rounded-2xl violet-glow"
        >
          {isPending ? (
            <>
              <Loader2 className="h-5 w-5 mr-3 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-3" />
              SOLIDIFY_PLAN
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
