ALTER TABLE "planning" ADD COLUMN "year" integer DEFAULT 2025 NOT NULL;--> statement-breakpoint
CREATE INDEX "auditLog_userId_createdAt_idx" ON "auditLog" USING btree ("userId","createdAt");--> statement-breakpoint
CREATE INDEX "auditLog_entityType_entityId_idx" ON "auditLog" USING btree ("entityType","entityId");--> statement-breakpoint
CREATE INDEX "dailyLog_sprintId_date_idx" ON "dailyLog" USING btree ("sprintId","date");--> statement-breakpoint
CREATE INDEX "monthlyReview_sprintId_idx" ON "monthlyReview" USING btree ("sprintId");--> statement-breakpoint
CREATE UNIQUE INDEX "planning_userId_year_idx" ON "planning" USING btree ("userId","year");--> statement-breakpoint
CREATE INDEX "weeklyReview_sprintId_idx" ON "weeklyReview" USING btree ("sprintId");