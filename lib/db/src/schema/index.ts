import { createInsertSchema } from "drizzle-zod";
import { date, integer, pgTable, real, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

// 1. USERS
export const usersTable = pgTable("massar_users", {
  id: text("id").primaryKey(),
  phone: text("phone").notNull().unique(),
  passwordHash: text("password_hash").notNull(), // for MVP auth
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("passenger"), // passenger, captain, admin
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// 2. CAPTAINS (Drivers)
export const captainsTable = pgTable("massar_captains", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => usersTable.id),
  nationalIdLast4: text("national_id_last4").notNull(),
  status: text("status").notNull().default("pending"), // pending, in_review, approved, rejected, suspended
  isOnline: boolean("is_online").notNull().default(false),
  currentLocationLat: real("current_location_lat"),
  currentLocationLng: real("current_location_lng"),
  rating: real("rating").default(5.0),
  totalTrips: integer("total_trips").default(0),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewNote: text("review_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// 3. VEHICLES
export const vehiclesTable = pgTable("massar_vehicles", {
  id: text("id").primaryKey(),
  captainId: text("captain_id").notNull().references(() => captainsTable.id),
  makeModel: text("make_model").notNull(),
  color: text("color").notNull(),
  plate: text("plate").notNull(),
  totalSeats: integer("total_seats").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// 4. ROUTES (Supported routes like Jerash <-> Amman)
export const routesTable = pgTable("massar_routes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(), // e.g. "Jerash - Amman"
  origin: text("origin").notNull(), // "Jerash"
  destination: text("destination").notNull(), // "Amman"
  baseFare: real("base_fare").notNull(), // e.g. 12.0
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// 5. CAPTAIN ROUTES (Which routes a captain operates on)
export const captainRoutesTable = pgTable("massar_captain_routes", {
  id: text("id").primaryKey(),
  captainId: text("captain_id").notNull().references(() => captainsTable.id),
  routeId: text("route_id").notNull().references(() => routesTable.id),
  pickupRadiusKm: real("pickup_radius_km").notNull().default(3.0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// 6. RIDE REQUESTS (From passengers)
export const rideRequestsTable = pgTable("massar_ride_requests", {
  id: text("id").primaryKey(),
  passengerId: text("passenger_id").notNull().references(() => usersTable.id),
  routeId: text("route_id").notNull().references(() => routesTable.id),
  pickupLat: real("pickup_lat").notNull(),
  pickupLng: real("pickup_lng").notNull(),
  destinationLat: real("destination_lat").notNull(),
  destinationLng: real("destination_lng").notNull(),
  seatsRequested: integer("seats_requested").notNull(),
  status: text("status").notNull().default("searching"), // searching, matched, requested, accepted, captain_arriving, picked_up, in_progress, completed, cancelled
  matchedCaptainId: text("matched_captain_id").references(() => captainsTable.id),
  estimatedFare: real("estimated_fare").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// 7. TRIPS (The actual journey by the captain)
export const tripsTable = pgTable("massar_trips", {
  id: text("id").primaryKey(),
  captainId: text("captain_id").notNull().references(() => captainsTable.id),
  routeId: text("route_id").notNull().references(() => routesTable.id),
  vehicleId: text("vehicle_id").notNull().references(() => vehiclesTable.id),
  status: text("status").notNull().default("created"), // created, boarding, en_route, completed, cancelled
  availableSeats: integer("available_seats").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// 8. TRIP PASSENGERS (Links ride requests to a trip)
export const tripPassengersTable = pgTable("massar_trip_passengers", {
  id: text("id").primaryKey(),
  tripId: text("trip_id").notNull().references(() => tripsTable.id),
  rideRequestId: text("ride_request_id").notNull().references(() => rideRequestsTable.id),
  passengerId: text("passenger_id").notNull().references(() => usersTable.id),
  seats: integer("seats").notNull(),
  fare: real("fare").notNull(),
  status: text("status").notNull().default("active"), // active, cancelled
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// 9. RATINGS
export const ratingsTable = pgTable("massar_ratings", {
  id: text("id").primaryKey(),
  tripId: text("trip_id").notNull().references(() => tripsTable.id),
  raterId: text("rater_id").notNull().references(() => usersTable.id), // usually passenger
  rateeId: text("ratee_id").notNull().references(() => captainsTable.id), // usually captain
  score: integer("score").notNull(), // 1 to 5
  comment: text("comment"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// 10. NOTIFICATIONS
export const notificationsTable = pgTable("massar_notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => usersTable.id),
  title: text("title").notNull(),
  body: text("body").notNull(),
  type: text("type").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Export types and insert schemas
export const insertUserSchema = createInsertSchema(usersTable);
export const insertCaptainSchema = createInsertSchema(captainsTable);
export const insertVehicleSchema = createInsertSchema(vehiclesTable);
export const insertRouteSchema = createInsertSchema(routesTable);
export const insertCaptainRouteSchema = createInsertSchema(captainRoutesTable);
export const insertRideRequestSchema = createInsertSchema(rideRequestsTable);
export const insertTripSchema = createInsertSchema(tripsTable);
export const insertTripPassengerSchema = createInsertSchema(tripPassengersTable);
export const insertRatingSchema = createInsertSchema(ratingsTable);
export const insertNotificationSchema = createInsertSchema(notificationsTable);

import { relations } from "drizzle-orm";

export const usersRelations = relations(usersTable, ({ one, many }) => ({
  captainProfile: one(captainsTable, {
    fields: [usersTable.id],
    references: [captainsTable.userId],
  }),
  rideRequests: many(rideRequestsTable),
}));

export const captainsRelations = relations(captainsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [captainsTable.userId],
    references: [usersTable.id],
  }),
  vehicle: one(vehiclesTable, {
    fields: [captainsTable.id],
    references: [vehiclesTable.captainId],
  }),
  trips: many(tripsTable),
}));

export const rideRequestsRelations = relations(rideRequestsTable, ({ one }) => ({
  passenger: one(usersTable, {
    fields: [rideRequestsTable.passengerId],
    references: [usersTable.id],
  }),
  matchedCaptain: one(captainsTable, {
    fields: [rideRequestsTable.matchedCaptainId],
    references: [captainsTable.id],
  }),
}));

export const vehiclesRelations = relations(vehiclesTable, ({ one }) => ({
  captain: one(captainsTable, {
    fields: [vehiclesTable.captainId],
    references: [captainsTable.id],
  })
}));

export type User = typeof usersTable.$inferSelect;
export type Captain = typeof captainsTable.$inferSelect;
export type Vehicle = typeof vehiclesTable.$inferSelect;
export type Route = typeof routesTable.$inferSelect;
export type CaptainRoute = typeof captainRoutesTable.$inferSelect;
export type RideRequest = typeof rideRequestsTable.$inferSelect;
export type Trip = typeof tripsTable.$inferSelect;
export type TripPassenger = typeof tripPassengersTable.$inferSelect;
export type Rating = typeof ratingsTable.$inferSelect;
export type Notification = typeof notificationsTable.$inferSelect;
