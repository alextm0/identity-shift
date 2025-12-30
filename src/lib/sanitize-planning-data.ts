import { sanitizeText } from "./sanitize";
import type { PlanningFormData, SimplifiedGoal, AnnualGoal, AntiGoal, PlanningGoal } from "@/lib/validators";

/**
 * Sanitizes planning form data to prevent XSS and ensure data integrity.
 * This consolidates the sanitization logic used across planning actions.
 */
export function sanitizePlanningData(validated: Partial<PlanningFormData>): Partial<PlanningFormData> {
    const updateData: Partial<PlanningFormData> & { updatedAt: Date } = {
        ...validated,
        updatedAt: new Date(),
    };

    // Sanitize Step 1 fields
    if (validated.brainDump) {
        updateData.brainDump = sanitizeText(validated.brainDump, 5000);
    }
    if (validated.futureIdentity) {
        updateData.futureIdentity = sanitizeText(validated.futureIdentity, 1000);
    }

    // Sanitize Step 2 fields
    if (validated.wheelVisionStatements) {
        const sanitized: Record<string, string> = {};
        Object.entries(validated.wheelVisionStatements).forEach(([key, value]) => {
            sanitized[key] = sanitizeText(value as string, 500);
        });
        updateData.wheelVisionStatements = sanitized;
    }

    // Sanitize Step 3 fields
    if (validated.futureYouLetter) {
        updateData.futureYouLetter = sanitizeText(validated.futureYouLetter, 2000);
    }

    // Sanitize goals if present
    if (validated.goals) {
        updateData.goals = validated.goals.map((goal) => ({
            ...goal,
            text: goal.text ? sanitizeText(goal.text, 500) : goal.text,
        }));
    }

    if (validated.annualGoals) {
        updateData.annualGoals = validated.annualGoals.map((goal) => ({
            ...goal,
            text: goal.text ? sanitizeText(goal.text, 500) : goal.text,
            definitionOfDone: goal.definitionOfDone ? sanitizeText(goal.definitionOfDone, 1000) : goal.definitionOfDone,
            progressSignal: goal.progressSignal ? sanitizeText(goal.progressSignal, 500) : goal.progressSignal,
            whyMatters: goal.whyMatters ? sanitizeText(goal.whyMatters, 1000) : goal.whyMatters,
        })) as any;
    }

    // Sanitize Step 7 fields
    if (validated.antiVision) {
        updateData.antiVision = sanitizeText(validated.antiVision, 2000);
    }
    if (validated.antiGoals) {
        updateData.antiGoals = validated.antiGoals.map((antiGoal) => ({
            ...antiGoal,
            text: antiGoal.text ? sanitizeText(antiGoal.text, 500) : antiGoal.text,
        }));
    }

    // Sanitize Step 8 fields
    if (validated.commitmentStatement) {
        updateData.commitmentStatement = sanitizeText(validated.commitmentStatement, 1000);
    }
    if (validated.signatureName) {
        updateData.signatureName = sanitizeText(validated.signatureName, 200);
    }
    if (validated.signatureImage) {
        // Basic length check for base64
        updateData.signatureImage = validated.signatureImage.substring(0, 500000); // 500KB limit roughly
    }

    // Sanitize previousIdentity if present
    if (validated.previousIdentity) {
        updateData.previousIdentity = sanitizeText(validated.previousIdentity, 2000);
    }

    // Legacy support: sanitize activeGoals if present (for backward compatibility)
    if (validated.activeGoals) {
        updateData.activeGoals = (validated.activeGoals as any[]).map((goal) => ({
            ...goal,
            text: goal.text ? sanitizeText(goal.text, 500) : goal.text,
        }));
    }

    return updateData;
}

