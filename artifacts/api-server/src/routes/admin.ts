import { Router } from "express";
import { db } from "@workspace/db";
import { captainsTable, usersTable, vehiclesTable, rideRequestsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "./auth";
import { isAdmin } from "../middlewares/roles";

const router = Router();

// GET /admin/captains — list all captains with user + vehicle info
router.get(
  "/admin/captains",
  authenticateToken,
  isAdmin,
  async (_req: AuthRequest, res) => {
    try {
      const captains = await db.query.captainsTable.findMany({
        with: {
          user: true,
          vehicle: true,
        },
        orderBy: (captainsTable, { desc }) => [desc(captainsTable.submittedAt)],
      });

      res.status(200).json(captains);
    } catch (error) {
      console.error("GET /admin/captains error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// PUT /admin/captains/:id/status — approve, reject, suspend, set in_review
router.put(
  "/admin/captains/:id/status",
  authenticateToken,
  isAdmin,
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status, reviewNote } = req.body;

      const ALLOWED = ["pending", "in_review", "approved", "rejected", "suspended"];
      if (!status || !ALLOWED.includes(status)) {
        res.status(400).json({
          error: `Invalid status. Must be one of: ${ALLOWED.join(", ")}`,
        });
        return;
      }

      const captain = await db.query.captainsTable.findFirst({
        where: eq(captainsTable.id, id),
      });

      if (!captain) {
        res.status(404).json({ error: "Captain not found" });
        return;
      }

      await db
        .update(captainsTable)
        .set({
          status,
          reviewNote: reviewNote ?? captain.reviewNote,
          reviewedAt: new Date(),
        })
        .where(eq(captainsTable.id, id));

      const updated = await db.query.captainsTable.findFirst({
        where: eq(captainsTable.id, id),
        with: { user: true, vehicle: true },
      });

      res.status(200).json(updated);
    } catch (error) {
      console.error("PUT /admin/captains/:id/status error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// GET /admin/ride-requests — list ALL ride requests across all passengers
router.get(
  "/admin/ride-requests",
  authenticateToken,
  isAdmin,
  async (_req: AuthRequest, res) => {
    try {
      const requests = await db.query.rideRequestsTable.findMany({
        with: {
          passenger: true,
          matchedCaptain: {
            with: { user: true, vehicle: true },
          },
        },
        orderBy: (t, { desc }) => [desc(t.createdAt)],
      });

      const mapped = requests.map((r) => ({
        id: r.id,
        passengerId: r.passengerId,
        matchedCaptainId: r.matchedCaptainId,
        routeId: r.routeId,
        status: r.status,
        type: (r as any).type ?? "standard",
        customSearchText: (r as any).customSearchText ?? null,
        pickupLat: r.pickupLat,
        pickupLng: r.pickupLng,
        destLat: r.destinationLat,
        destLng: r.destinationLng,
        seatsRequested: r.seatsRequested,
        estimatedFare: r.estimatedFare,
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
        passenger: {
          fullName: r.passenger?.fullName ?? "Unknown",
          phone: r.passenger?.phone ?? "Unknown",
        },
        captain: r.matchedCaptain
          ? {
              fullName: r.matchedCaptain.user?.fullName ?? "Unknown",
              phone: r.matchedCaptain.user?.phone ?? "Unknown",
              vehicleMakeModel: r.matchedCaptain.vehicle?.makeModel ?? "Unknown",
              vehiclePlate: r.matchedCaptain.vehicle?.plate ?? "Unknown",
            }
          : undefined,
      }));

      res.status(200).json(mapped);
    } catch (error) {
      console.error("GET /admin/ride-requests error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;

