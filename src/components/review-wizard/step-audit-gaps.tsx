"use client";

import { useReviewStore } from "@/hooks/stores/use-review-store";
import { DimensionTextarea } from "./dimension-textarea";
import { StepWrapper } from "./step-wrapper";
import { LIFE_DIMENSIONS } from "@/lib/validators/yearly-review";
import { WORD_LIMITS, DEFAULT_RATING } from "@/lib/constants/review";

interface StepAuditGapsProps {
    currentDimensionIndex?: number;
}

export function StepAuditGaps({ currentDimensionIndex = 0 }: StepAuditGapsProps) {
    const { wheelGaps, setWheelGap, wheelRatings } = useReviewStore();
    const currentDimension = LIFE_DIMENSIONS[currentDimensionIndex];
    const currentRating = wheelRatings[currentDimension] || DEFAULT_RATING;

    return (
        <StepWrapper
            showProgress={currentDimensionIndex < LIFE_DIMENSIONS.length - 1}
            currentIndex={currentDimensionIndex}
            totalItems={LIFE_DIMENSIONS.length}
        >
            <DimensionTextarea
                dimension={currentDimension}
                question={`Why isn't it an 8? (You rated it ${currentRating}/10)`}
                value={wheelGaps[currentDimension] || ""}
                onChange={(value) => setWheelGap(currentDimension, value)}
                placeholder="What's missing? What would move it from your current rating to 8?"
                maxWords={WORD_LIMITS.wheelAudit}
            />
        </StepWrapper>
    );
}

