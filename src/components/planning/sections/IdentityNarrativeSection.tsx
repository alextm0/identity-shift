"use client";

import { GlassPanel } from "@/components/dashboard/glass-panel";
import { StyledTextarea } from "@/components/ui/form-elements";
import { UseFormReturn } from "react-hook-form";
import { PlanningFormData } from "@/lib/validators";

interface IdentityNarrativeSectionProps {
  form: UseFormReturn<PlanningFormData>;
}

export function IdentityNarrativeSection({ form }: IdentityNarrativeSectionProps) {
  return (
    <GlassPanel className="p-8 relative overflow-hidden backdrop-blur-xl">
      <div className="space-y-3">
        <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-focus-violet/80 mb-4">
          Future Identity
        </h3>
        <StyledTextarea
          {...form.register("futureIdentity")}
          placeholder="In Dec 2026, I'm the kind of person who... Describe your future identity in present tense, as if it's already true..."
          variant="violet"
          className="min-h-[200px] text-white resize-none text-base leading-[1.6] p-4 rounded-lg transition-all duration-300"
          autoResize
        />
        {form.formState.errors.futureIdentity && (
          <p className="text-bullshit-crimson text-[10px] font-mono uppercase">
            {form.formState.errors.futureIdentity.message}
          </p>
        )}
      </div>
    </GlassPanel>
  );
}

