CREATE TYPE "public"."print_color" AS ENUM('color', 'bw');--> statement-breakpoint
ALTER TABLE "programs" ADD COLUMN "print_color" "print_color" DEFAULT 'color' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "onboarding_completed_at" timestamp;