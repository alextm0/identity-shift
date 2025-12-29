"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlanningFormSchema, type PlanningFormData } from "@/lib/validators";
import { savePlanningAction } from "@/actions/planning";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";
import { IdentityNarrativeSection, WheelOfLifeSection, GoalsSection } from "./sections";

import type { PlanningWithTypedFields } from "@/lib/types";

interface PlanningFormProps {
  initialData?: Partial<PlanningWithTypedFields>;
}

export function PlanningForm({ initialData }: PlanningFormProps) {
  const [isPending, setIsPending] = useState(false);

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
      brainDump: initialData?.brainDump || undefined,
      futureIdentity: initialData?.futureIdentity || undefined,
      targetWheelOfLife: initialData?.targetWheelOfLife || defaultWheelValues,
      wheelOfLife: initialData?.wheelOfLife || defaultWheelValues,
      goals: initialData?.goals || undefined,
      annualGoals: initialData?.annualGoals || undefined,
      antiVision: initialData?.antiVision || undefined,
      antiGoals: initialData?.antiGoals || undefined,
      commitmentStatement: initialData?.commitmentStatement || undefined,
      signatureName: initialData?.signatureName || undefined,
      signatureImage: initialData?.signatureImage || undefined,
      futureYouLetter: initialData?.futureYouLetter || undefined,
    } as Partial<PlanningFormData>,
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

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
      <IdentityNarrativeSection form={form} />
      <WheelOfLifeSection form={form} />
      <GoalsSection form={form} />

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
