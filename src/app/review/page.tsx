import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth/server";
import { getOrCreateYearlyReview, getYearlyReviewById } from "@/data-access/yearly-reviews";
import { toYearlyReviewWithTypedFields } from "@/lib/type-helpers";
import { ReviewWizardContainer } from "@/components/review-wizard/wizard-container";

// Review year: Review the previous year (e.g., in Jan 2026, review 2025)
// For now, default to 2025 as specified in the requirements
const currentDate = new Date();
const CURRENT_YEAR = currentDate.getMonth() === 0 && currentDate.getDate() <= 5
    ? currentDate.getFullYear() - 1
    : 2025;

interface ReviewPageProps {
    searchParams: Promise<{ edit?: string; year?: string }>;
}

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
    const session = await verifySession();
    const userId = session.user.id;
    const params = await searchParams;
    const editMode = params.edit === 'true';
    const yearParam = params.year ? parseInt(params.year, 10) : CURRENT_YEAR;
    const reviewYear = isNaN(yearParam) ? CURRENT_YEAR : yearParam;

    let review;
    
    if (editMode) {
        // In edit mode, get existing review (completed or draft)
        const existingReview = await getOrCreateYearlyReview(userId, reviewYear);
        review = await getYearlyReviewById(existingReview.id, userId);
        
        if (!review) {
            redirect('/dashboard');
        }
    } else {
        // Normal mode: get or create review
        review = await getOrCreateYearlyReview(userId, reviewYear);
        
        // If review is already completed and not in edit mode, redirect to dashboard
        if (review.status === 'completed') {
            redirect('/dashboard');
        }
    }

    // Convert to typed format
    const typedReview = toYearlyReviewWithTypedFields(review);

    return (
        <ReviewWizardContainer 
            initialReview={typedReview}
            year={reviewYear}
            isEditMode={editMode}
        />
    );
}

