import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db, driverDocumentsTable, driversTable, operationsActivityTable, operationsRidesTable } from "@workspace/db";
import {
  CreateDriverApplicationWithDocumentsBody,
  GetDriverParams,
  ListDriversQueryParams,
  ReviewDriverDocumentBody,
  ReviewDriverDocumentParams,
  UpdateDriverStatusBody,
  UpdateDriverStatusParams,
} from "@workspace/api-zod";
import {
  addActivity,
  complianceRequirements,
  ensureOperationsSeeded,
  getDriverDetail,
  getSummary,
  listDriversWithDocuments,
  toDriver,
  toOperationsActivity,
  toOperationsRide,
} from "../lib/operations";

const router: IRouter = Router();

router.get("/operations/summary", async (_req, res): Promise<void> => {
  await ensureOperationsSeeded();
  res.json(await getSummary());
});

router.get("/operations/activity", async (_req, res): Promise<void> => {
  await ensureOperationsSeeded();
  const rows = await db.select().from(operationsActivityTable).orderBy(desc(operationsActivityTable.createdAt)).limit(10);
  res.json(rows.map(toOperationsActivity));
});

router.get("/rides/operations", async (_req, res): Promise<void> => {
  await ensureOperationsSeeded();
  const rows = await db.select().from(operationsRidesTable).orderBy(desc(operationsRidesTable.departureAt)).limit(20);
  res.json(rows.map(toOperationsRide));
});

router.get("/compliance-requirements", async (_req, res): Promise<void> => {
  res.json(complianceRequirements);
});

router.get("/drivers", async (req, res): Promise<void> => {
  await ensureOperationsSeeded();
  const query = ListDriversQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { drivers, documents } = await listDriversWithDocuments();
  const filtered = query.data.status ? drivers.filter((driver) => driver.status === query.data.status) : drivers;
  res.json(filtered.map((driver) => toDriver(driver, documents)));
});

router.post("/drivers", async (req, res): Promise<void> => {
  const parsed = CreateDriverApplicationWithDocumentsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const input = parsed.data;
  const id = `driver-${randomUUID()}`;
  const submittedAt = new Date();
  await db.insert(driversTable).values({
    id,
    fullName: input.fullName,
    phone: input.phone,
    nationalIdLast4: input.nationalIdLast4,
    route: input.route,
    status: "pending",
    vehicleMakeModel: input.vehicle.makeModel,
    vehicleColor: input.vehicle.color,
    vehiclePlate: input.vehicle.plate,
    vehicleSeats: input.vehicle.seats,
    submittedAt,
  });
  await db.insert(driverDocumentsTable).values(input.documents.map((document) => ({
    id: `${id}-${randomUUID()}`,
    driverId: id,
    type: document.type,
    fileName: document.fileName,
    fileUri: document.fileUri ?? null,
    status: "pending",
    expiresAt: document.expiresAt ?? null,
    submittedAt,
  })));
  await addActivity("Driver app", "submitted a new application from", input.fullName);
  const detail = await getDriverDetail(id);
  res.status(201).json(detail);
});

router.get("/drivers/:driverId", async (req, res): Promise<void> => {
  await ensureOperationsSeeded();
  const params = GetDriverParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const detail = await getDriverDetail(params.data.driverId);
  if (!detail) {
    res.status(404).json({ error: "Driver not found" });
    return;
  }
  res.json(detail);
});

router.patch("/drivers/:driverId", async (req, res): Promise<void> => {
  await ensureOperationsSeeded();
  const params = UpdateDriverStatusParams.safeParse(req.params);
  const body = UpdateDriverStatusBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [updated] = await db.update(driversTable).set({
    status: body.data.status,
    reviewNote: body.data.reviewNote ?? null,
    reviewedAt: ["approved", "rejected", "suspended"].includes(body.data.status) ? new Date() : null,
    updatedAt: new Date(),
  }).where(eq(driversTable.id, params.data.driverId)).returning();
  if (!updated) {
    res.status(404).json({ error: "Driver not found" });
    return;
  }
  await addActivity("Operations", `marked ${body.data.status}`, updated.fullName);
  const { documents } = await listDriversWithDocuments();
  res.json(toDriver(updated, documents));
});

router.patch("/drivers/:driverId/documents/:documentId", async (req, res): Promise<void> => {
  await ensureOperationsSeeded();
  const params = ReviewDriverDocumentParams.safeParse(req.params);
  const body = ReviewDriverDocumentBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [updated] = await db.update(driverDocumentsTable).set({
    status: body.data.status,
    reviewNote: body.data.reviewNote ?? null,
    reviewedAt: body.data.status === "pending" ? null : new Date(),
    updatedAt: new Date(),
  }).where(eq(driverDocumentsTable.id, params.data.documentId)).returning();
  if (!updated || updated.driverId !== params.data.driverId) {
    res.status(404).json({ error: "Document not found" });
    return;
  }
  await addActivity("Compliance", `marked document ${body.data.status}`, updated.fileName);
  res.json({
    id: updated.id,
    driverId: updated.driverId,
    type: updated.type,
    fileName: updated.fileName,
    fileUri: updated.fileUri,
    status: updated.status,
    expiresAt: updated.expiresAt,
    submittedAt: updated.submittedAt,
    reviewedAt: updated.reviewedAt,
    reviewNote: updated.reviewNote,
  });
});

router.post("/driver-applications", async (req, res): Promise<void> => {
  const parsed = CreateDriverApplicationWithDocumentsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const input = parsed.data;
  const id = `driver-${randomUUID()}`;
  const submittedAt = new Date();
  await db.insert(driversTable).values({
    id,
    fullName: input.fullName,
    phone: input.phone,
    nationalIdLast4: input.nationalIdLast4,
    route: input.route,
    status: "pending",
    vehicleMakeModel: input.vehicle.makeModel,
    vehicleColor: input.vehicle.color,
    vehiclePlate: input.vehicle.plate,
    vehicleSeats: input.vehicle.seats,
    submittedAt,
  });
  await db.insert(driverDocumentsTable).values(input.documents.map((document) => ({
    id: `${id}-${randomUUID()}`,
    driverId: id,
    type: document.type,
    fileName: document.fileName,
    fileUri: document.fileUri ?? null,
    status: "pending",
    expiresAt: document.expiresAt ?? null,
    submittedAt,
  })));
  await addActivity("Driver app", "submitted a new application from", input.fullName);
  const detail = await getDriverDetail(id);
  res.status(201).json(detail);
});

export default router;