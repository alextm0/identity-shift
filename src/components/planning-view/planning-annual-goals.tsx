
import { Target } from "lucide-react";
import type { SimplifiedGoal, AnnualGoal } from "@/lib/validators";
import { PlanningGoalItem } from "@/components/planning-view/planning-goal-item";

interface PlanningAnnualGoalsProps {
    goals: (AnnualGoal | SimplifiedGoal)[];
    planningId: string;
}

export function PlanningAnnualGoals({ goals, planningId }: PlanningAnnualGoalsProps) {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                        <Target className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white">Annual Roadmap</h3>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-xs font-mono text-emerald-500 font-bold">{goals.length}</span>
                    <span className="text-[10px] font-mono text-emerald-500/70 uppercase tracking-widest">Targets</span>
                </div>
            </div>

            <div className="space-y-4">
                {goals.map((goal, index: number) => (
                    <PlanningGoalItem
                        key={`annual-${goal.id}-${index}`}
                        goal={goal}
                        index={index}
                        planningId={planningId}
                    />
                ))}
            </div>
        </div>
    );
}
