import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth/server";
import { getOrCreatePlanning } from "@/data-access/planning";
import { PlanningWizardContainer } from "@/components/planning-wizard/wizard-container";

interface PlanningPageProps {
    searchParams: Promise<{ edit?: string }>;
}

export default async function PlanningPage({ searchParams }: PlanningPageProps) {
    const [{ user }, params] = await Promise.all([
        verifySession(),
        searchParams
    ]);
    const userId = user.id;
    const editMode = params.edit === 'true';

    // Get or create planning for user
    const planning = await getOrCreatePlanning(userId);

    // If planning is completed and not in edit mode, redirect to view page
    if (planning.status === 'completed' && !editMode) {
        redirect('/dashboard/planning/view');
    }

    return (
        <PlanningWizardContainer 
            initialPlanning={planning}
            isEditMode={editMode}
        />
    );
}

