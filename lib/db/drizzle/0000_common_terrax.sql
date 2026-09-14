CREATE TABLE "massar_active_drivers" (
	"driver_id" text PRIMARY KEY NOT NULL,
	"is_online" integer DEFAULT 1 NOT NULL,
	"current_location" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "massar_bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"ride_id" text NOT NULL,
	"passenger_id" text NOT NULL,
	"seats_booked" integer NOT NULL,
	"total_fare" real NOT NULL,
	"status" text DEFAULT 'confirmed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "massar_driver_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"driver_id" text NOT NULL,
	"type" text NOT NULL,
	"file_name" text NOT NULL,
	"file_uri" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" date,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone,
	"review_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "massar_drivers" (
	"id" text PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"phone" text NOT NULL,
	"national_id_last4" text NOT NULL,
	"route" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"vehicle_make_model" text NOT NULL,
	"vehicle_color" text NOT NULL,
	"vehicle_plate" text NOT NULL,
	"vehicle_seats" integer NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone,
	"review_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "massar_operations_activity" (
	"id" text PRIMARY KEY NOT NULL,
	"actor" text NOT NULL,
	"action" text NOT NULL,
	"subject" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "massar_operations_rides" (
	"id" text PRIMARY KEY NOT NULL,
	"route" text NOT NULL,
	"departure_at" timestamp with time zone NOT NULL,
	"driver_name" text NOT NULL,
	"passenger_count" integer NOT NULL,
	"status" text NOT NULL,
	"fare_jod" real NOT NULL,
	"issue" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "massar_rides" (
	"id" text PRIMARY KEY NOT NULL,
	"driver_id" text NOT NULL,
	"route" text NOT NULL,
	"total_seats" integer NOT NULL,
	"available_seats" integer NOT NULL,
	"fare_per_seat" real NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"departure_time" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "massar_active_drivers" ADD CONSTRAINT "massar_active_drivers_driver_id_massar_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."massar_drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "massar_bookings" ADD CONSTRAINT "massar_bookings_ride_id_massar_rides_id_fk" FOREIGN KEY ("ride_id") REFERENCES "public"."massar_rides"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "massar_driver_documents" ADD CONSTRAINT "massar_driver_documents_driver_id_massar_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."massar_drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "massar_rides" ADD CONSTRAINT "massar_rides_driver_id_massar_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."massar_drivers"("id") ON DELETE no action ON UPDATE no action;