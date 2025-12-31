import type { Metadata } from 'next';
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth/server";
import { getOrCreateYearlyReview } from "@/data-access/yearly-reviews";
import { toYearlyReviewWithTypedFields } from "@/lib/type-helpers";
import { ReviewWizardContainer } from "@/components/review-wizard/wizard-container";
import { EditableWheelSection } from "@/components/review-wizard/editable-wheel-section";
import { EditableWinsSection } from "@/components/review-wizard/editable-wins-section";

export const metadata: Metadata = {
  title: 'Yearly Review',
  description: 'Review your year and plan for the next',
  robots: {
    index: false,
    follow: false,
  },
};

// Review year: Review the previous year (e.g., in Jan 2026, review 2025)
// For now, default to 2025 as specified in the requirements
const currentDate = new Date();
const CURRENT_YEAR = currentDate.getMonth() === 0 && currentDate.getDate() <= 5
    ? currentDate.getFullYear() - 1
    : currentDate.getFullYear();

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

    const review = await getOrCreateYearlyReview(userId, reviewYear);

    if (!review) {
        redirect('/dashboard');
    }

    // If review is already completed and not in edit mode, redirect to dashboard
    if (review.status === 'completed' && !editMode) {
        redirect('/dashboard');
    }

    // Convert to typed format and ensure only serializable data is passed to Client Components
    const serializableReview = toYearlyReviewWithTypedFields(review);

    if (editMode) {
        // If in editMode, render individual editable sections
        return (
            <div className="min-h-screen flex flex-col p-6 md:p-12">
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-full max-w-4xl space-y-8">
                        <EditableWheelSection reviewId={serializableReview.id} initialRatings={serializableReview.wheelRatings} />
                        <EditableWinsSection reviewId={serializableReview.id} initialWins={serializableReview.wins} />
                        {/* Potentially other editable sections here */}
                    </div>
                </div>
            </div>
        );
    }

    // Otherwise, render the step-by-step wizard
    return (
        <ReviewWizardContainer
            initialReview={serializableReview}
            year={reviewYear}
            isEditMode={editMode}
        />
    );
}

