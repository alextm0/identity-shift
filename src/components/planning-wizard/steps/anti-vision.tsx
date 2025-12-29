"use client";

import { usePlanningStore } from "@/hooks/stores/use-planning-store";
import { Textarea } from "@/components/ui/textarea";
import { StepHeader } from "../ui/step-header";
import { ItemListInput } from "../ui/item-list-input";
import { StepContainer } from "../ui/step-container";
import { OptionalSection } from "../ui/optional-section";

export function AntiVisionStep() {
    const {
        antiVision,
        antiGoals,
        setAntiVision,
        addAntiGoal,
        removeAntiGoal,
        updateAntiGoal,
    } = usePlanningStore();

    return (
        <StepContainer>
            <StepHeader
                title="Anti-goals"
                subtitle="In Dec 2026, I refuse to become…"
                description="Define what you're not doing and who you're not becoming. This provides clarity through contrast."
            >
                <div className="flex flex-col items-center gap-2 mt-4">
                    <p className="text-xs text-white/40 font-mono uppercase tracking-widest">
                        {antiGoals.length} {antiGoals.length === 1 ? 'item' : 'items'} added
                    </p>
                    {antiGoals.length < 3 && (
                        <p className="text-[10px] text-focus-violet font-mono uppercase tracking-widest">
                            Need at least 3 to continue
                        </p>
                    )}
                </div>
            </StepHeader>

            <ItemListInput
                items={antiGoals}
                onAdd={addAntiGoal}
                onRemove={removeAntiGoal}
                onUpdate={updateAntiGoal}
                placeholder="I refuse to become someone who …"
                emptyStateMessage="No anti-goals yet. Add your first one above."
                addButtonText="Add"
            />

            {antiGoals.length >= 3 && (
                <p className="text-sm text-action-emerald text-center font-mono uppercase tracking-widest pt-4">
                    ✓ Strong boundaries set. Ready to proceed.
                </p>
            )}

            <OptionalSection title="Optional: Write the failure story (2 min)">
                <Textarea
                    value={antiVision || ""}
                    onChange={(e) => setAntiVision(e.target.value)}
                    placeholder="It’s Dec 2026, and things went wrong because…"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[160px] text-sm focus:border-focus-violet/30 focus:ring-focus-violet/10 transition-all"
                    maxLength={2000}
                />
            </OptionalSection>
        </StepContainer>
    );
}

