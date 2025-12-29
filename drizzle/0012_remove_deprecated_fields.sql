-- Remove deprecated columns from planning and yearlyReview tables
-- These fields are no longer used in the application

ALTER TABLE "planning" DROP COLUMN IF EXISTS "currentSelf";--> statement-breakpoint
ALTER TABLE "planning" DROP COLUMN IF EXISTS "desiredSelf";--> statement-breakpoint
ALTER TABLE "planning" DROP COLUMN IF EXISTS "goals2026";--> statement-breakpoint
ALTER TABLE "planning" DROP COLUMN IF EXISTS "themeWord";--> statement-breakpoint
ALTER TABLE "yearlyReview" DROP COLUMN IF EXISTS "bigThreeWins";--> statement-breakpoint
ALTER TABLE "yearlyReview" DROP COLUMN IF EXISTS "damnGoodDecision";--> statement-breakpoint
ALTER TABLE "yearlyReview" DROP COLUMN IF EXISTS "generatedNarrative";