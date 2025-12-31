import { getRequiredSession } from "@/lib/auth/server";
import { getSprints, getActiveSprintCached } from "@/data-access/sprints";

export async function getSprintsData() {
    const session = await getRequiredSession();
    const userId = session.user.id;

    const [allSprints, activeSprint] = await Promise.all([
        getSprints(userId),
        getActiveSprintCached(userId)
    ]);

    return {
        allSprints,
        activeSprint,
        userId
    };
}

