ALTER TABLE "planning" ALTER COLUMN "currentSelf" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "planning" ALTER COLUMN "desiredSelf" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "planning" ALTER COLUMN "goals2026" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "planning" ALTER COLUMN "wheelOfLife" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "planning" ADD COLUMN "activeGoals" json;--> statement-breakpoint
ALTER TABLE "planning" ADD COLUMN "backlogGoals" json;--> statement-breakpoint
ALTER TABLE "planning" ADD COLUMN "archivedGoals" json;--> statement-breakpoint
ALTER TABLE "planning" ADD COLUMN "currentModule" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "planning" ADD COLUMN "currentStep" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "planning" ADD COLUMN "currentGoalIndex" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "planning" ADD COLUMN "status" text DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE "planning" ADD COLUMN "previousIdentity" text;--> statement-breakpoint
ALTER TABLE "planning" ADD COLUMN "lastArchiveReviewDate" timestamp;--> statement-breakpoint
ALTER TABLE "planning" ADD COLUMN "completedAt" timestamp;