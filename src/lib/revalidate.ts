import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Common revalidation paths for the dashboard and sprint-related data
 */
export function revalidateDashboard() {
    // Tags-based revalidation (Standard Next.js API)
    revalidateTag("active-sprint", "max");
    revalidateTag("planning", "max");
    revalidateTag("dashboard", "max");

    // Path-based revalidation for layout-wide changes
    revalidatePath("/dashboard", "layout");
}

/**
 * Specific revalidation for sprint changes
 */
export function revalidateSprints() {
    revalidateTag("active-sprint", "max");
    revalidatePath("/sprints", "layout");
}
