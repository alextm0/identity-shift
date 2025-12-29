ALTER TABLE "dailyLog" ALTER COLUMN "sprintId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "monthlyReview" ALTER COLUMN "sprintId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "weeklyReview" ALTER COLUMN "sprintId" DROP NOT NULL;