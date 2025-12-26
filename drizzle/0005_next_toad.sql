CREATE TABLE "yearlyReview" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"year" integer NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"currentStep" integer DEFAULT 1 NOT NULL,
	"wheelRatings" json,
	"wheelWins" json,
	"wheelGaps" json,
	"bigThreeWins" json,
	"damnGoodDecision" text,
	"generatedNarrative" text,
	"completedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "yearlyReview" ADD CONSTRAINT "yearlyReview_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "yearlyReview_userId_year_idx" ON "yearlyReview" USING btree ("userId","year");