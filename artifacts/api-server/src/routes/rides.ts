import { Router, type IRouter } from "express";
import { desc, eq, and } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db, ridesTable, bookingsTable } from "@workspace/db";
import { CreateRideBody, GetRideParams, ListRidesQueryParams, BookRideParams, BookRideBody } from "@workspace/api-zod";
import { addActivity } from "../lib/operations";

const router: IRouter = Router();

router.post("/rides", async (req, res): Promise<void> => {
  const parsed = CreateRideBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const input = parsed.data;
  const id = `ride-${randomUUID()}`;
  
  // Ensure driver exists (mock driver for testing)
  const { driversTable } = require('@workspace/db');
  const [existingDriver] = await db.select().from(driversTable).where(eq(driversTable.id, input.driverId));
  if (!existingDriver) {
    await db.insert(driversTable).values({
      id: input.driverId,
      fullName: "Test Driver",
      phone: "+962700000000",
      nationalIdLast4: "1234",
      route: "Jerash -> Amman",
      vehicleMakeModel: "Test Car",
      vehicleColor: "White",
      vehiclePlate: "1234",
      vehicleSeats: 4,
      status: "approved"
    });
  }

  await db.insert(ridesTable).values({
    id,
    driverId: input.driverId,
    route: input.route,
    totalSeats: input.totalSeats,
    availableSeats: input.totalSeats,
    farePerSeat: input.farePerSeat,
    type: input.type || "standard",
    rentalHours: input.rentalHours || null,
    status: "open",
    departureTime: input.departureTime ? new Date(input.departureTime) : null,
  });
  
  await addActivity("Driver", "created a new ride on route", input.route);
  
  const [ride] = await db.select().from(ridesTable).where(eq(ridesTable.id, id));
  res.status(201).json(ride);
});

router.get("/rides", async (req, res): Promise<void> => {
  const query = ListRidesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  
  let dbQuery = db.select().from(ridesTable);
  
  const conditions = [];
  if (query.data.status) {
    conditions.push(eq(ridesTable.status, query.data.status as string));
  }
  if (query.data.driverId) {
    conditions.push(eq(ridesTable.driverId, query.data.driverId));
  }
  
  if (conditions.length > 0) {
    dbQuery = dbQuery.where(and(...conditions)) as any;
  }
  
  const rides = await dbQuery.orderBy(desc(ridesTable.createdAt));
  res.json(rides);
});

router.get("/rides/:rideId", async (req, res): Promise<void> => {
  const params = GetRideParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  
  const [ride] = await db.select().from(ridesTable).where(eq(ridesTable.id, params.data.rideId));
  if (!ride) {
    res.status(404).json({ error: "Ride not found" });
    return;
  }
  
  res.json(ride);
});

router.post("/rides/:rideId/book", async (req, res): Promise<void> => {
  const params = BookRideParams.safeParse(req.params);
  const body = BookRideBody.safeParse(req.body);
  
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  
  const rideId = params.data.rideId;
  const { passengerId, seatsBooked } = body.data;

  // Retrieve the ride first to check availability
  const [ride] = await db.select().from(ridesTable).where(eq(ridesTable.id, rideId));
  if (!ride) {
    res.status(404).json({ error: "Ride not found" });
    return;
  }
  
  if (ride.status !== "open" || ride.availableSeats < seatsBooked) {
    res.status(400).json({ error: "Ride no longer available or not enough seats" });
    return;
  }
  
  // Calculate total fare
  const totalFare = ride.farePerSeat * seatsBooked;
  const newAvailableSeats = ride.availableSeats - seatsBooked;
  const newStatus = newAvailableSeats === 0 ? "full" : "open";
  
  // Create booking
  const bookingId = `book-${randomUUID()}`;
  await db.insert(bookingsTable).values({
    id: bookingId,
    rideId,
    passengerId,
    seatsBooked,
    totalFare,
    status: "confirmed",
  });
  
  // Update ride available seats
  await db.update(ridesTable).set({
    availableSeats: newAvailableSeats,
    status: newStatus,
    updatedAt: new Date(),
  }).where(eq(ridesTable.id, rideId));
  
  await addActivity("Passenger", `booked ${seatsBooked} seats on ride`, rideId);
  
  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, bookingId));
  res.status(201).json(booking);
});

export default router;
