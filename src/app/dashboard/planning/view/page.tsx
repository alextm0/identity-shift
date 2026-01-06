import { verifySession } from "@/lib/auth/server";
import { getOrCreatePlanning } from "@/data-access/planning";
import { toPlanningWithTypedFields } from "@/lib/type-helpers";
import { PlanningView } from "@/components/planning-wizard/planning-view";

export default async function PlanningViewPage() {
    const session = await verifySession();
    const userId = session.user.id;

    // Get planning for user (consistent with main planning page)
    const planning = await getOrCreatePlanning(userId);

    // No need to check !planning as getOrCreatePlanning always returns something that is persisted or new

    const typedPlanning = toPlanningWithTypedFields(planning);

    return (
        <PlanningView planning={typedPlanning} />
    );
}

