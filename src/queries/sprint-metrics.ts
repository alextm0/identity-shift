import { getRequiredSession } from "@/lib/auth/server";
import { getActiveSprintCached, getSprints } from "@/data-access/sprints";
import { db } from "@/lib/db";
import { dailyLog, promiseLog } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { normalizeDate } from "@/lib/data-access/base";
import { SprintWithDetails } from "@/lib/types";

export async function getSprintMetricsData(sprintId?: string) {
    const session = await getRequiredSession();
    const userId = session.user.id;

    // 1. Get the target sprint
    let sprint: SprintWithDetails | undefined;
    if (sprintId) {
        const allSprints = await getSprints(userId);
        sprint = allSprints.find(s => s.id === sprintId) as SprintWithDetails;
    } else {
        sprint = await getActiveSprintCached(userId) as SprintWithDetails;
    }

    if (!sprint) {
        return {
            sprint: null,
            dailyLogs: [],
            promiseLogs: [],
            allSprints: await getSprints(userId),
            userId
        };
    }

    // 2. Fetch all logs within the sprint timeframe
    const startDate = normalizeDate(new Date(sprint.startDate));
    const endDate = normalizeDate(new Date(sprint.endDate));

    const [dailyLogs, pLogs, allSprints] = await Promise.all([
        db.select()
            .from(dailyLog)
            .where(and(
                eq(dailyLog.userId, userId),
                eq(dailyLog.sprintId, sprint.id)
            )),
        db.select()
            .from(promiseLog)
            .where(and(
                eq(promiseLog.userId, userId),
                gte(promiseLog.date, startDate),
                lte(promiseLog.date, endDate)
            )),
        getSprints(userId)
    ]);

    // Filter promise logs to only include those belonging to this sprint's promises
    // (This handles cases where dates might overlap between sprints, though rare)
    const sprintPromiseIds = new Set(
        sprint.goals?.flatMap(g => g.promises?.map(p => p.id) || []) || []
    );

    const filteredPromiseLogs = pLogs.filter(log => sprintPromiseIds.has(log.promiseId));

    return {
        sprint,
        dailyLogs,
        promiseLogs: filteredPromiseLogs,
        allSprints,
        userId
    };
}
