"use client";

import { usePlanningStore } from "@/hooks/stores/use-planning-store";
import { LIFE_DIMENSIONS, DIMENSION_LABELS } from "@/lib/validators/yearly-review";
import { StepHeader } from "../ui/step-header";
import { StepContainer } from "../ui/step-container";
import { ItemListInput } from "../ui/item-list-input";

export function GoalBacklogStep() {
    const { goals, addGoal, removeGoal, updateGoal, updateGoalCategory } = usePlanningStore();

    return (
        <StepContainer>
            <StepHeader
                title="Goal Backlog"
                subtitle="List your goals for 2026."
                description="Encourage quantity; allow messy wording. We'll refine them together."
            >
                <p className="text-xs text-white/40 font-mono uppercase tracking-widest mt-4">
                    {goals.length} {goals.length === 1 ? 'goal' : 'goals'} added
                </p>
            </StepHeader>

            <ItemListInput
                items={goals}
                onAdd={addGoal}
                onRemove={removeGoal}
                onUpdate={(id, text) => updateGoal(id, { text })}
                placeholder="Add a goal (e.g., 'Become a runner', 'Learn Rust', 'Start a business')"
                emptyStateMessage="No goals yet. Add your first goal above."
                addButtonText="Add"
                renderRightAction={(item) => (
                    <select
                        value={item.category || ""}
                        onChange={(e) => updateGoalCategory(item.id, e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-mono uppercase tracking-wider focus:ring-1 focus:ring-white/20 outline-none mr-2"
                    >
                        <option value="" className="bg-[#1a1a1a]">No Category</option>
                        {LIFE_DIMENSIONS.map((dim) => (
                            <option key={dim} value={dim} className="bg-[#1a1a1a]">
                                {DIMENSION_LABELS[dim]}
                            </option>
                        ))}
                    </select>
                )}
            />

            {goals.length > 0 && (
                <p className="text-sm text-action-emerald text-center font-mono uppercase tracking-widest pt-4">
                    ✓ Great start! Add more or continue when ready.
                </p>
            )}
        </StepContainer>
    );
}

