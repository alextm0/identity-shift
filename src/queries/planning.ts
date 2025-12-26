import { getRequiredSession } from "@/lib/auth/server";
import { getPlanningByUserId } from "@/data-access/planning";

export async function getPlanningData() {
    const session = await getRequiredSession();
    const planning = await getPlanningByUserId(session.user.id);

    return {
        planning,
        userId: session.user.id
    };
}
