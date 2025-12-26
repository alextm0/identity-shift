"use client";

import { useReviewStore } from "@/hooks/stores/use-review-store";
import { DimensionTextarea } from "./dimension-textarea";
import { StepWrapper } from "./step-wrapper";
import { LIFE_DIMENSIONS } from "@/lib/validators/yearly-review";
import { WORD_LIMITS } from "@/lib/constants/review";

interface StepAuditWinsProps {
    currentDimensionIndex?: number;
}

export function StepAuditWins({ currentDimensionIndex = 0 }: StepAuditWinsProps) {
    const { wheelWins, setWheelWin } = useReviewStore();
    const currentDimension = LIFE_DIMENSIONS[currentDimensionIndex];

    return (
        <StepWrapper
            showProgress={currentDimensionIndex < LIFE_DIMENSIONS.length - 1}
            currentIndex={currentDimensionIndex}
            totalItems={LIFE_DIMENSIONS.length}
        >
            <DimensionTextarea
                dimension={currentDimension}
                question="Why didn't you write a 3?"
                value={wheelWins[currentDimension] || ""}
                onChange={(value) => setWheelWin(currentDimension, value)}
                placeholder="What's working here? Even if it's small, list it."
                maxWords={WORD_LIMITS.wheelAudit}
            />
        </StepWrapper>
    );
}

