import type { Metadata } from 'next';
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth/server";
import { getCompletedYearlyReview } from "@/data-access/yearly-reviews";
import { toYearlyReviewWithTypedFields } from "@/lib/type-helpers";
import { YearlyReviewView } from "@/components/review-wizard/yearly-review-view";

interface ReviewYearPageProps {
    params: Promise<{ year: string }>;
}

export async function generateMetadata(
  { params }: ReviewYearPageProps
): Promise<Metadata> {
  const { year } = await params;
  return {
    title: `${year} Year Review`,
    description: `Review your progress and achievements for ${year}`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function ReviewYearPage({ params }: ReviewYearPageProps) {
    const session = await verifySession();
    const userId = session.user.id;
    const { year } = await params;
    const yearNum = parseInt(year, 10);

    if (isNaN(yearNum)) {
        redirect("/dashboard");
    }

    // Get completed review for this year
    const review = await getCompletedYearlyReview(userId, yearNum);
    
    if (!review) {
        redirect("/dashboard");
    }

    const typedReview = toYearlyReviewWithTypedFields(review);

    return (
        <YearlyReviewView review={typedReview} year={yearNum} />
    );
}

