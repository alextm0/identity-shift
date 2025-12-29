CREATE TABLE "sprintPriority" (
	"id" text PRIMARY KEY NOT NULL,
	"sprintId" text NOT NULL,
	"priorityKey" text NOT NULL,
	"label" text NOT NULL,
	"type" text NOT NULL,
	"weeklyTargetUnits" integer DEFAULT 0 NOT NULL,
	"unitDefinition" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "planning" ADD COLUMN "annualGoals" json;--> statement-breakpoint
ALTER TABLE "planning" ADD COLUMN "signatureImage" text;--> statement-breakpoint
ALTER TABLE "sprintPriority" ADD CONSTRAINT "sprintPriority_sprintId_sprint_id_fk" FOREIGN KEY ("sprintId") REFERENCES "public"."sprint"("id") ON DELETE cascade ON UPDATE no action;