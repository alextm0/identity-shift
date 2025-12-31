CREATE TABLE "promise" (
	"id" text PRIMARY KEY NOT NULL,
	"sprintId" text NOT NULL,
	"sprintGoalId" text NOT NULL,
	"text" text NOT NULL,
	"type" text NOT NULL,
	"scheduleDays" integer[],
	"weeklyTarget" integer,
	"sortOrder" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promiseLog" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"promiseId" text NOT NULL,
	"date" date NOT NULL,
	"dailyLogId" text,
	"completed" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sprintGoal" (
	"id" text PRIMARY KEY NOT NULL,
	"sprintId" text NOT NULL,
	"goalId" text NOT NULL,
	"goalText" text NOT NULL,
	"sortOrder" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dailyLog" ALTER COLUMN "mainFocusCompleted" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "dailyLog" ALTER COLUMN "priorities" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "dailyLog" ALTER COLUMN "proofOfWork" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "dailyLog" ADD COLUMN "mainGoalId" text;--> statement-breakpoint
ALTER TABLE "dailyLog" ADD COLUMN "blockerTag" text;--> statement-breakpoint
ALTER TABLE "promise" ADD CONSTRAINT "promise_sprintId_sprint_id_fk" FOREIGN KEY ("sprintId") REFERENCES "public"."sprint"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promise" ADD CONSTRAINT "promise_sprintGoalId_sprintGoal_id_fk" FOREIGN KEY ("sprintGoalId") REFERENCES "public"."sprintGoal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promiseLog" ADD CONSTRAINT "promiseLog_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promiseLog" ADD CONSTRAINT "promiseLog_promiseId_promise_id_fk" FOREIGN KEY ("promiseId") REFERENCES "public"."promise"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promiseLog" ADD CONSTRAINT "promiseLog_dailyLogId_dailyLog_id_fk" FOREIGN KEY ("dailyLogId") REFERENCES "public"."dailyLog"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sprintGoal" ADD CONSTRAINT "sprintGoal_sprintId_sprint_id_fk" FOREIGN KEY ("sprintId") REFERENCES "public"."sprint"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sprintGoal" ADD CONSTRAINT "sprintGoal_goalId_goal_id_fk" FOREIGN KEY ("goalId") REFERENCES "public"."goal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

CREATE UNIQUE INDEX "promiseLog_promiseId_date_unique" ON "promiseLog" USING btree ("promiseId","date");--> statement-breakpoint
CREATE INDEX "promiseLog_userId_date_idx" ON "promiseLog" USING btree ("userId","date");--> statement-breakpoint
CREATE INDEX "promiseLog_promiseId_date_idx" ON "promiseLog" USING btree ("promiseId","date");