import { getRequiredSession } from "@/lib/auth/server";
import { getSprints, getActiveSprintsCached } from "@/data-access/sprints";

export async function getSprintsData() {
    const session = await getRequiredSession();
    const userId = session.user.id;

    const [allSprints, activeSprints] = await Promise.all([
        getSprints(userId),
        getActiveSprintsCached(userId)
    ]);

    return {
        allSprints,
        activeSprints,
        userId
    };
}

