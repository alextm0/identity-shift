import { DailyLog } from "@/lib/types";
import { OneChangeOption } from "@/lib/enums";

export function generateAlerts(logs: DailyLog[], summary: any) {
  const alerts: string[] = [];

  if (summary.avgEnergy < 3 && logs.length >= 3) {
    alerts.push("CRITICAL_ENERGY_LEVEL: Your average energy is below baseline. Priority: RECOVERY.");
  }

  if (summary.motionUnits > summary.actionUnits && summary.totalActualUnits > 0) {
    alerts.push("SIMULATION_TRAP: Motion units exceed action units. You are planning more than executing.");
  }

  const daysLogged = logs.length;
  if (daysLogged < 5) {
    alerts.push(`VISIBILITY_GAP: Only ${daysLogged} days logged this week. Integrity requires daily audits.`);
  }

  const missedTargets = Object.values(summary.prioritySummary).filter((p: any) => p.ratio < 0.5).length;
  if (missedTargets >= 2) {
    alerts.push(`SCOPE_OVERLOAD: Multiple priority targets missed by >50%. Recommended: ${OneChangeOption.CUT_SCOPE}.`);
  }

  return alerts;
}

