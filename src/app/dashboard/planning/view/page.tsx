import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth/server";
import { getPlanningByUserId } from "@/data-access/planning";
import { toPlanningWithTypedFields } from "@/lib/type-helpers";
import { PlanningView } from "@/components/planning-wizard/planning-view";

export default async function PlanningViewPage() {
    const session = await verifySession();
    const userId = session.user.id;

    // Get planning for user
    const planning = await getPlanningByUserId(userId);

    if (!planning) {
        redirect("/dashboard/planning");
    }

    const typedPlanning = toPlanningWithTypedFields(planning);

    return (
        <PlanningView planning={typedPlanning} />
    );
}

