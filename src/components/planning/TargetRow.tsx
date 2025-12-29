"use client";

import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UseFormReturn } from "react-hook-form";
import type { PlanningFormData } from "@/lib/validators";

interface TargetRowProps {
  index: number;
  form: UseFormReturn<PlanningFormData>;
  remove: (index: number) => void;
  relatedDimension: string | null;
  onHover: (dimension: string | null) => void;
}

export const TargetRow = memo(function TargetRow({ index, form, remove, relatedDimension, onHover }: TargetRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Note: The new goals structure doesn't have a deadline field
  // If deadline is needed, it should be added to the SimplifiedGoal schema

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
          {/* Category Badge - Styled Input */}
          <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
            <div className="absolute inset-0 bg-focus-violet/10 rounded-lg pointer-events-none" />
            <Input
              {...form.register(`goals.${index}.category`)}
              placeholder="CATEGORY"
              className="w-24 h-8 bg-transparent border-focus-violet/20 text-[10px] tracking-widest font-mono font-bold text-focus-violet placeholder:text-focus-violet/30 text-center rounded-lg focus:bg-focus-violet/20 focus:border-focus-violet transition-all uppercase"
            />
          </div>

          {/* Main Goal Text Input */}
          <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
            <Input
              {...form.register(`goals.${index}.text`)}
              placeholder="Define your goal..."
              className="h-10 px-3 bg-transparent border-none text-base md:text-lg font-medium text-white placeholder:text-white/20 focus:ring-0 shadow-none transition-colors"
            />
          </div>
        </div>

        {/* Action Section */}
        <div className="flex items-center gap-3 pl-2">

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
                  {...form.register(`goals.${index}.text`)}
                  placeholder="Describe your goal in detail. What will achieving this unlock for you?"
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
});

