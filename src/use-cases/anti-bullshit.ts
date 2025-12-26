/**
 * ABS Calculation Logic
 * 
 * Objectives:
 * - Drops if "Motion" (Admin/Planning/Organization) > "Action" (Hard Evidence/Work units).
 * - High score (80-100) indicates high execution integrity.
 * - Low score (<40) indicates performative productivity.
 */
export function calculateABS(motionUnits: number, actionUnits: number): number {
  if (motionUnits === 0 && actionUnits === 0) return 100;
  
  // Motion is planning, organizing, talking about work.
  // Action is deep work, progress units, shipped code.
  
  const total = motionUnits + actionUnits;
  const actionRatio = actionUnits / total;
  
  // Ideal ratio is 20% motion, 80% action
  // If action ratio is 0.8 or higher, score stays near 100
  // If action ratio drops below 0.5 (motion > action), score drops significantly
  
  let score = 0;
  
  if (actionRatio >= 0.8) {
    score = 90 + (actionRatio - 0.8) * 50; // 90-100
  } else if (actionRatio >= 0.5) {
    score = 60 + (actionRatio - 0.5) * 100; // 60-90
  } else {
    score = actionRatio * 120; // 0-60
  }
  
  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Validates a daily log for Proof-of-Work
 */
export function validateProofOfWork(progressUnits: number, proof: string | null): boolean {
  if (progressUnits > 0 && (!proof || proof.trim().length < 10)) {
    return false;
  }
  return true;
}
