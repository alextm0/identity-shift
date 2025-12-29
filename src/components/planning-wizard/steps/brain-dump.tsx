"use client";

import { usePlanningStore } from "@/hooks/stores/use-planning-store";
import { WizardTextarea } from "../wizard-textarea";
import { StepHeader } from "../ui/step-header";
import { StepContainer } from "../ui/step-container";

export function BrainDumpStep() {
    const { brainDump, setBrainDump } = usePlanningStore();

    return (
        <StepContainer>
            <StepHeader
                title="Empty your head."
                subtitle="Dump what’s taking up mental space. No structure. No judgment."
            />

            <WizardTextarea
                id="brainDump"
                label="What’s on your mind?"
                helper="Worries, tasks, ideas, regrets—anything. 5–10 lines is enough."
                value={brainDump}
                onChange={setBrainDump}
                placeholder="Write freely… no editing."
                maxLength={5000}
                counterLabel="Minimum is enough"
            />
        </StepContainer>
    );
}
