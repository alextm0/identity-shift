ALTER TABLE "planning" DROP CONSTRAINT "planning_userId_unique";--> statement-breakpoint
CREATE INDEX "monthlyReview_userId_createdAt_idx" ON "monthlyReview" USING btree ("userId","createdAt");--> statement-breakpoint
CREATE INDEX "sprint_userId_active_idx" ON "sprint" USING btree ("userId","active");--> statement-breakpoint
CREATE INDEX "sprint_userId_startDate_idx" ON "sprint" USING btree ("userId","startDate");--> statement-breakpoint
CREATE INDEX "weeklyReview_userId_weekEndDate_idx" ON "weeklyReview" USING btree ("userId","weekEndDate");--> statement-breakpoint
ALTER TABLE "sprint" DROP COLUMN "priorities";