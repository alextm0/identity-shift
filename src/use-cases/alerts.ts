import { DailyLog } from "@/lib/types";
import { OneChangeOption } from "@/lib/enums";
import { WeeklySummary, PromiseSummary } from "@/use-cases/weekly-summary";

export function generateAlerts(logs: DailyLog[], summary: WeeklySummary) {
  const alerts: string[] = [];

  // Visibility gap (most important - put first)
  const daysLogged = logs.length;
  if (daysLogged < 5) {
    alerts.push(`VISIBILITY_GAP: Only ${daysLogged} days logged this week. Integrity requires daily audits.`);
  }

  // Critical Energy Level
  if (daysLogged >= 3 && summary.avgEnergy < 3) {
    alerts.push(`CRITICAL_ENERGY_LEVEL: Average energy is ${summary.avgEnergy.toFixed(1)}. Recovery is the bottleneck.`);
  }

  // Simulation Trap
  if (daysLogged >= 3 && summary.motionUnits > summary.actionUnits) {
    alerts.push(`SIMULATION_TRAP: Motion (${summary.motionUnits}) exceeds Action (${summary.actionUnits}). Stop planning, start doing.`);
  }

  // Scope overload
  const missedTargets = Object.values(summary.prioritySummary).filter((p: PromiseSummary) => p.ratio < 0.5).length;
  if (missedTargets >= 2) {
    alerts.push(`SCOPE_OVERLOAD: Multiple priority targets missed by >50%. Recommended: ${OneChangeOption.CUT_SCOPE}.`);
  }

  // Promises at risk
  if (summary.promisesAtRisk > 0) {
    alerts.push(`PROMISE_AT_RISK: ${summary.promisesAtRisk} focus areas are falling behind schedule.`);
  }

  // Keep max 3 alerts as per design
  return alerts.slice(0, 3);
}


