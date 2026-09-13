import { createInsertSchema } from "drizzle-zod";
import { date, integer, pgTable, real, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const driversTable = pgTable("massar_drivers", {
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  nationalIdLast4: text("national_id_last4").notNull(),
  route: text("route").notNull(),
  status: text("status").notNull().default("pending"),
  vehicleMakeModel: text("vehicle_make_model").notNull(),
  vehicleColor: text("vehicle_color").notNull(),
  vehiclePlate: text("vehicle_plate").notNull(),
  vehicleSeats: integer("vehicle_seats").notNull(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewNote: text("review_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const driverDocumentsTable = pgTable("massar_driver_documents", {
  id: text("id").primaryKey(),
  driverId: text("driver_id").notNull().references(() => driversTable.id),
  type: text("type").notNull(),
  fileName: text("file_name").notNull(),
  fileUri: text("file_uri"),
  status: text("status").notNull().default("pending"),
  expiresAt: date("expires_at", { mode: "string" }),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewNote: text("review_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const operationsRidesTable = pgTable("massar_operations_rides", {
  id: text("id").primaryKey(),
  route: text("route").notNull(),
  departureAt: timestamp("departure_at", { withTimezone: true }).notNull(),
  driverName: text("driver_name").notNull(),
  passengerCount: integer("passenger_count").notNull(),
  status: text("status").notNull(),
  fareJod: real("fare_jod").notNull(),
  issue: text("issue"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const operationsActivityTable = pgTable("massar_operations_activity", {
  id: text("id").primaryKey(),
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  subject: text("subject").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ridesTable = pgTable("massar_rides", {
  id: text("id").primaryKey(),
  driverId: text("driver_id").notNull().references(() => driversTable.id),
  route: text("route").notNull(),
  totalSeats: integer("total_seats").notNull(),
  availableSeats: integer("available_seats").notNull(),
  farePerSeat: real("fare_per_seat").notNull(),
  status: text("status").notNull().default("open"), // open, full, completed, cancelled
  departureTime: timestamp("departure_time", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const bookingsTable = pgTable("massar_bookings", {
  id: text("id").primaryKey(),
  rideId: text("ride_id").notNull().references(() => ridesTable.id),
  passengerId: text("passenger_id").notNull(),
  seatsBooked: integer("seats_booked").notNull(),
  totalFare: real("total_fare").notNull(),
  status: text("status").notNull().default("confirmed"), // confirmed, cancelled
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const activeDriversTable = pgTable("massar_active_drivers", {
  driverId: text("driver_id").primaryKey().references(() => driversTable.id),
  isOnline: integer("is_online").notNull().default(1), // 1 for online, 0 for offline
  currentLocation: text("current_location"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertDriverSchema = createInsertSchema(driversTable).omit({
  createdAt: true,
  updatedAt: true,
});
export const insertDriverDocumentSchema = createInsertSchema(driverDocumentsTable).omit({
  createdAt: true,
  updatedAt: true,
});
export const insertOperationsRideSchema = createInsertSchema(operationsRidesTable).omit({
  createdAt: true,
});
export const insertOperationsActivitySchema = createInsertSchema(operationsActivityTable);
export const insertRideSchema = createInsertSchema(ridesTable).omit({
  createdAt: true,
  updatedAt: true,
});
export const insertBookingSchema = createInsertSchema(bookingsTable).omit({
  createdAt: true,
  updatedAt: true,
});
export const insertActiveDriverSchema = createInsertSchema(activeDriversTable).omit({
  updatedAt: true,
});

export type InsertDriver = z.infer<typeof insertDriverSchema>;
export type Driver = typeof driversTable.$inferSelect;
export type DriverDocument = typeof driverDocumentsTable.$inferSelect;
export type OperationsRide = typeof operationsRidesTable.$inferSelect;
export type OperationsActivity = typeof operationsActivityTable.$inferSelect;
export type Ride = typeof ridesTable.$inferSelect;
export type Booking = typeof bookingsTable.$inferSelect;
export type ActiveDriver = typeof activeDriversTable.$inferSelect;