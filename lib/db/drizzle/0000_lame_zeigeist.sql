CREATE TABLE "massar_captain_routes" (
	"id" text PRIMARY KEY NOT NULL,
	"captain_id" text NOT NULL,
	"route_id" text NOT NULL,
	"pickup_radius_km" real DEFAULT 3 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "massar_captains" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"national_id_last4" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"is_online" boolean DEFAULT false NOT NULL,
	"current_location_lat" real,
	"current_location_lng" real,
	"rating" real DEFAULT 5,
	"total_trips" integer DEFAULT 0,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone,
	"review_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "massar_complaints" (
	"id" text PRIMARY KEY NOT NULL,
	"reporter_id" text NOT NULL,
	"reported_id" text,
	"trip_id" text,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"admin_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "massar_legal_consents" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"document_type" text NOT NULL,
	"version" text NOT NULL,
	"accepted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text
);
--> statement-breakpoint
CREATE TABLE "massar_notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"type" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "massar_otps" (
	"id" text PRIMARY KEY NOT NULL,
	"phone" text NOT NULL,
	"code_hash" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "massar_payments" (
	"id" text PRIMARY KEY NOT NULL,
	"trip_id" text NOT NULL,
	"passenger_id" text NOT NULL,
	"amount" real NOT NULL,
	"currency" text DEFAULT 'JOD' NOT NULL,
	"method" text DEFAULT 'cash' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"transaction_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "massar_ratings" (
	"id" text PRIMARY KEY NOT NULL,
	"trip_id" text NOT NULL,
	"rater_id" text NOT NULL,
	"ratee_id" text NOT NULL,
	"score" integer NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "massar_ride_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"passenger_id" text NOT NULL,
	"route_id" text,
	"pickup_lat" real NOT NULL,
	"pickup_lng" real NOT NULL,
	"destination_lat" real NOT NULL,
	"destination_lng" real NOT NULL,
	"seats_requested" integer NOT NULL,
	"type" text DEFAULT 'standard' NOT NULL,
	"custom_search_text" text,
	"status" text DEFAULT 'searching' NOT NULL,
	"matched_captain_id" text,
	"estimated_fare" real NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "massar_routes" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"origin" text NOT NULL,
	"destination" text NOT NULL,
	"base_fare" real NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "massar_trip_passengers" (
	"id" text PRIMARY KEY NOT NULL,
	"trip_id" text NOT NULL,
	"ride_request_id" text NOT NULL,
	"passenger_id" text NOT NULL,
	"seats" integer NOT NULL,
	"fare" real NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "massar_trip_stops" (
	"id" text PRIMARY KEY NOT NULL,
	"trip_id" text NOT NULL,
	"ride_request_id" text NOT NULL,
	"passenger_id" text NOT NULL,
	"type" text NOT NULL,
	"lat" real NOT NULL,
	"lng" real NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"stop_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "massar_trips" (
	"id" text PRIMARY KEY NOT NULL,
	"captain_id" text NOT NULL,
	"route_id" text NOT NULL,
	"vehicle_id" text NOT NULL,
	"status" text DEFAULT 'created' NOT NULL,
	"available_seats" integer NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "massar_users" (
	"id" text PRIMARY KEY NOT NULL,
	"phone" text NOT NULL,
	"password_hash" text NOT NULL,
	"full_name" text NOT NULL,
	"role" text DEFAULT 'passenger' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "massar_users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "massar_vehicles" (
	"id" text PRIMARY KEY NOT NULL,
	"captain_id" text NOT NULL,
	"make_model" text NOT NULL,
	"color" text NOT NULL,
	"plate" text NOT NULL,
	"total_seats" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "massar_verification_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"captain_id" text NOT NULL,
	"document_type" text NOT NULL,
	"file_url" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"rejection_reason" text,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "massar_captain_routes" ADD CONSTRAINT "massar_captain_routes_captain_id_massar_captains_id_fk" FOREIGN KEY ("captain_id") REFERENCES "public"."massar_captains"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "massar_captain_routes" ADD CONSTRAINT "massar_captain_routes_route_id_massar_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."massar_routes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "massar_captains" ADD CONSTRAINT "massar_captains_user_id_massar_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."massar_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "massar_complaints" ADD CONSTRAINT "massar_complaints_reporter_id_massar_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."massar_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "massar_complaints" ADD CONSTRAINT "massar_complaints_reported_id_massar_users_id_fk" FOREIGN KEY ("reported_id") REFERENCES "public"."massar_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "massar_complaints" ADD CONSTRAINT "massar_complaints_trip_id_massar_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."massar_trips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "massar_legal_consents" ADD CONSTRAINT "massar_legal_consents_user_id_massar_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."massar_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "massar_notifications" ADD CONSTRAINT "massar_notifications_user_id_massar_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."massar_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "massar_payments" ADD CONSTRAINT "massar_payments_trip_id_massar_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."massar_trips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "massar_payments" ADD CONSTRAINT "massar_payments_passenger_id_massar_users_id_fk" FOREIGN KEY ("passenger_id") REFERENCES "public"."massar_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "massar_ratings" ADD CONSTRAINT "massar_ratings_trip_id_massar_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."massar_trips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "massar_ratings" ADD CONSTRAINT "massar_ratings_rater_id_massar_users_id_fk" FOREIGN KEY ("rater_id") REFERENCES "public"."massar_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "massar_ratings" ADD CONSTRAINT "massar_ratings_ratee_id_massar_captains_id_fk" FOREIGN KEY ("ratee_id") REFERENCES "public"."massar_captains"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "massar_ride_requests" ADD CONSTRAINT "massar_ride_requests_passenger_id_massar_users_id_fk" FOREIGN KEY ("passenger_id") REFERENCES "public"."massar_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "massar_ride_requests" ADD CONSTRAINT "massar_ride_requests_route_id_massar_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."massar_routes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "massar_ride_requests" ADD CONSTRAINT "massar_ride_requests_matched_captain_id_massar_captains_id_fk" FOREIGN KEY ("matched_captain_id") REFERENCES "public"."massar_captains"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "massar_trip_passengers" ADD CONSTRAINT "massar_trip_passengers_trip_id_massar_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."massar_trips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "massar_trip_passengers" ADD CONSTRAINT "massar_trip_passengers_ride_request_id_massar_ride_requests_id_fk" FOREIGN KEY ("ride_request_id") REFERENCES "public"."massar_ride_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "massar_trip_passengers" ADD CONSTRAINT "massar_trip_passengers_passenger_id_massar_users_id_fk" FOREIGN KEY ("passenger_id") REFERENCES "public"."massar_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "massar_trip_stops" ADD CONSTRAINT "massar_trip_stops_trip_id_massar_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."massar_trips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "massar_trip_stops" ADD CONSTRAINT "massar_trip_stops_ride_request_id_massar_ride_requests_id_fk" FOREIGN KEY ("ride_request_id") REFERENCES "public"."massar_ride_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "massar_trip_stops" ADD CONSTRAINT "massar_trip_stops_passenger_id_massar_users_id_fk" FOREIGN KEY ("passenger_id") REFERENCES "public"."massar_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "massar_trips" ADD CONSTRAINT "massar_trips_captain_id_massar_captains_id_fk" FOREIGN KEY ("captain_id") REFERENCES "public"."massar_captains"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "massar_trips" ADD CONSTRAINT "massar_trips_route_id_massar_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."massar_routes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "massar_trips" ADD CONSTRAINT "massar_trips_vehicle_id_massar_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."massar_vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "massar_vehicles" ADD CONSTRAINT "massar_vehicles_captain_id_massar_captains_id_fk" FOREIGN KEY ("captain_id") REFERENCES "public"."massar_captains"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "massar_verification_documents" ADD CONSTRAINT "massar_verification_documents_captain_id_massar_captains_id_fk" FOREIGN KEY ("captain_id") REFERENCES "public"."massar_captains"("id") ON DELETE no action ON UPDATE no action;