import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db, ridesTable, activeDriversTable } from "@workspace/db";
import { CreateRideBody, GetRideParams, ListRidesQueryParams, AcceptRideParams, AcceptRideBody } from "@workspace/api-zod";
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
  const createdAt = new Date();
  
  await db.insert(ridesTable).values({
    id,
    passengerId: input.passengerId,
    route: input.route,
    seats: input.seats,
    fare: input.fare,
    status: "pending",
    createdAt,
  });
  
  await addActivity("Passenger", "requested a ride on route", input.route);
  
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
  
  if (query.data.status) {
    dbQuery = dbQuery.where(eq(ridesTable.status, query.data.status)) as any;
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

router.patch("/rides/:rideId/accept", async (req, res): Promise<void> => {
  const params = AcceptRideParams.safeParse(req.params);
  const body = AcceptRideBody.safeParse(req.body);
  
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  
  // Update the ride status
  const [updated] = await db.update(ridesTable).set({
    status: "accepted",
    driverId: body.data.driverId,
    updatedAt: new Date(),
  })
  .where(eq(ridesTable.id, params.data.rideId))
  .returning();
  
  if (!updated) {
    res.status(404).json({ error: "Ride not found" });
    return;
  }
  
  await addActivity("Driver", `accepted ride`, updated.id);
  
  res.json(updated);
});

export default router;
