import { getRequiredSession } from "@/lib/auth/server";
import { getPlanningByUserIdAndYear } from "@/data-access/planning";
import { getCurrentReviewAndPlanningYears } from "@/lib/date-utils";

export async function getPlanningData() {
    const session = await getRequiredSession();
    const userId = session.user.id;
    const { planningYear } = getCurrentReviewAndPlanningYears();
    const planning = await getPlanningByUserIdAndYear(userId, planningYear);

    return {
        planning,
        userId: session.user.id
    };
}
