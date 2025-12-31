import { DailyLog } from "@/lib/types";
import { OneChangeOption } from "@/lib/enums";
import { PromiseSummary } from "./weekly-summary";

export interface Insight {
  id: string;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    type: 'primary' | 'secondary';
  };
  priority: number; // Higher = more important
}

export interface AtRiskPromise {
  promiseId: string;
  label: string;
  goalText: string;
  actual: number;
  target: number;
  status: 'at-risk' | 'missed';
}

export function generateInsights(
  logs: DailyLog[],
  prioritySummary: Record<string, PromiseSummary>
): { primaryInsight: Insight | null; atRiskPromises: AtRiskPromise[] } {
  const insights: Insight[] = [];
  const daysLogged = logs.length;

  // 1. Visibility gap (highest priority - this becomes the primary insight)
  if (daysLogged < 5) {
    insights.push({
      id: 'visibility-gap',
      title: 'Visibility Gap',
      description: `Only ${daysLogged} days logged this week. Integrity requires daily audits.`,
      action: {
        label: 'Log today',
        href: '/dashboard/daily',
        type: 'primary'
      },
      priority: 10
    });
  }

  // 2. Scope overload (only show if we can recommend concrete action)
  const missedTargets = Object.values(prioritySummary).filter((p: PromiseSummary) => p.ratio < 0.5).length;
  if (missedTargets >= 2) {
    insights.push({
      id: 'scope-overload',
      title: 'Scope Overload',
      description: `Multiple targets missed by >50%. Consider: ${OneChangeOption.CUT_SCOPE}.`,
      action: {
        label: 'Adjust sprint',
        href: '/dashboard/sprint',
        type: 'primary'
      },
      priority: 8
    });
  }

  // 3. Extract at-risk promises
  const atRiskPromises: AtRiskPromise[] = Object.values(prioritySummary)
    .filter((p: PromiseSummary): p is PromiseSummary & { status: 'at-risk' | 'missed' } =>
      p.status === 'at-risk' || p.status === 'missed'
    )
    .map((p) => ({
      promiseId: p.promiseId,
      label: p.label,
      goalText: p.goalText,
      actual: p.actual,
      target: p.target,
      status: p.status
    }))
    .sort((a, b) => (a.actual / a.target) - (b.actual / b.target)); // Sort by most behind

  // Sort insights by priority
  insights.sort((a, b) => b.priority - a.priority);

  return {
    primaryInsight: insights[0] || null,
    atRiskPromises
  };
}
