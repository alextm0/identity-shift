import { revalidatePath } from "next/cache";

/**
 * Common revalidation paths for the dashboard and sprint-related data
 */
export function revalidateDashboard() {
    // Note: revalidateTag signature changed in Next.js - requires profile parameter
    // Relying on time-based revalidation (60s) instead for now
    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/daily", "layout");
    revalidatePath("/dashboard/sprint", "layout");
    revalidatePath("/dashboard/weekly", "layout");
    revalidatePath("/dashboard/planning", "layout");
    revalidatePath("/sprints", "layout");
}

/**
 * Specific revalidation for sprint changes
 */
export function revalidateSprints() {
    // Note: revalidateTag signature changed in Next.js - requires profile parameter
    // Relying on time-based revalidation (60s) instead for now
    revalidatePath("/dashboard", "layout");
    revalidatePath("/sprints", "layout");
}
