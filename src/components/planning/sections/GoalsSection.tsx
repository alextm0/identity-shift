"use client";

import { useState } from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import { PlanningFormData } from "@/lib/validators";
import { TargetRow } from "../TargetRow";

interface GoalsSectionProps {
  form: UseFormReturn<PlanningFormData>;
}

export function GoalsSection({ form }: GoalsSectionProps) {

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "goals",
  });

  const categoryToDimension: Record<string, string> = {
    "health": "Health", "income": "Wealth", "relationships": "Relationships",
    "technical": "Career", "training": "Energy", "mental": "Mindset",
    "learning": "Environment", "creativity": "Spirituality",
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-2">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-focus-violet animate-pulse" />
            Goals
          </h2>
          <p className="text-[9px] font-mono text-white/20 uppercase tracking-[0.3em]">Defined Outcomes for Identity Shift</p>
        </div>
        <Button
          type="button"
          variant="glass"
          size="sm"
          onClick={() => append({ 
            id: crypto.randomUUID(),
            text: "",
            category: undefined,
            createdAt: new Date(),
          })}
          className="text-[9px] font-mono uppercase tracking-widest h-8 px-3 hover:bg-focus-violet/10 hover:text-focus-violet transition-all group"
        >
          <Plus className="h-3 w-3 mr-2 group-hover:rotate-90 transition-transform" />
          Add Goal
        </Button>
      </div>

      {fields.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-12 text-center rounded-3xl border border-dashed border-white/5 bg-white/[0.01]"
        >
          <p className="text-white/30 font-mono text-[10px] uppercase tracking-[0.3em]">No goals yet. Add your first goal to get started.</p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {fields.map((field, index) => {
              const category = form.watch(`goals.${index}.category`);
              return (
                <TargetRow
                  key={field.id}
                  index={index}
                  form={form}
                  remove={remove}
                  relatedDimension={category ? categoryToDimension[category] || null : null}
                  onHover={setHoveredGoalArea}
                />
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

