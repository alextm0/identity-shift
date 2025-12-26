CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dailyLog" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"sprintId" text NOT NULL,
	"date" timestamp NOT NULL,
	"energy" integer NOT NULL,
	"sleepHours" integer,
	"mainFocusCompleted" boolean NOT NULL,
	"morningGapMin" integer,
	"distractionMin" integer,
	"priorities" json NOT NULL,
	"proofOfWork" json NOT NULL,
	"win" text,
	"drain" text,
	"note" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "monthlyReview" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"sprintId" text NOT NULL,
	"month" text NOT NULL,
	"whoWereYou" text,
	"desiredIdentity" text,
	"perceivedProgress" json NOT NULL,
	"actualProgress" json NOT NULL,
	"oneChange" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "planning" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"currentSelf" text NOT NULL,
	"desiredSelf" text NOT NULL,
	"goals2026" json NOT NULL,
	"wheelOfLife" json NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "sprint" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp NOT NULL,
	"priorities" json NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean NOT NULL,
	"image" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "weeklyReview" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"sprintId" text NOT NULL,
	"weekEndDate" timestamp NOT NULL,
	"progressRatios" json NOT NULL,
	"evidenceRatio" integer NOT NULL,
	"antiBullshitScore" integer NOT NULL,
	"alerts" json NOT NULL,
	"oneChange" text NOT NULL,
	"changeReason" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "todo" CASCADE;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dailyLog" ADD CONSTRAINT "dailyLog_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dailyLog" ADD CONSTRAINT "dailyLog_sprintId_sprint_id_fk" FOREIGN KEY ("sprintId") REFERENCES "public"."sprint"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthlyReview" ADD CONSTRAINT "monthlyReview_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthlyReview" ADD CONSTRAINT "monthlyReview_sprintId_sprint_id_fk" FOREIGN KEY ("sprintId") REFERENCES "public"."sprint"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planning" ADD CONSTRAINT "planning_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sprint" ADD CONSTRAINT "sprint_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weeklyReview" ADD CONSTRAINT "weeklyReview_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weeklyReview" ADD CONSTRAINT "weeklyReview_sprintId_sprint_id_fk" FOREIGN KEY ("sprintId") REFERENCES "public"."sprint"("id") ON DELETE no action ON UPDATE no action;