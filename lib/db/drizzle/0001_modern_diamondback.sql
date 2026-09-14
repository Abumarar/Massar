ALTER TABLE "massar_rides" ADD COLUMN "type" text DEFAULT 'standard' NOT NULL;--> statement-breakpoint
ALTER TABLE "massar_rides" ADD COLUMN "rental_hours" integer;