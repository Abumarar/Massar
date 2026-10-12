import { Router } from "express";
import { db } from "@workspace/db";
import { captainsTable, usersTable, vehiclesTable, rideRequestsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "./auth";
import { isAdmin } from "../middlewares/roles";
import { getIO } from "../lib/socket";

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
      const id = String(req.params.id);
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

      const routes = await db.query.routesTable.findMany();
      const routesMap = new Map(routes.map((r) => [r.id, r.name]));

      const mapped = requests.map((r) => ({
        id: r.id,
        passengerId: r.passengerId,
        matchedCaptainId: r.matchedCaptainId,
        routeId: r.routeId,
        routeName: r.routeId ? (routesMap.get(r.routeId) || r.routeId) : (r.customSearchText || "رحلة خاصة"),
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

      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.status(200).json(mapped);
    } catch (error) {
      console.error("GET /admin/ride-requests error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
// PUT /admin/ride-requests/:id/status — admin updates ride status
router.put(
  "/admin/ride-requests/:id/status",
  authenticateToken,
  isAdmin,
  async (req: AuthRequest, res) => {
    try {
      const id = String(req.params.id);
      const { status } = req.body;
      const request = await db.query.rideRequestsTable.findFirst({
        where: eq(rideRequestsTable.id, id),
      });
      if (!request) {
        res.status(404).json({ error: "Request not found" });
        return;
      }
      await db
        .update(rideRequestsTable)
        .set({ status })
        .where(eq(rideRequestsTable.id, id));

      const updated = await db.query.rideRequestsTable.findFirst({
        where: eq(rideRequestsTable.id, id),
        with: {
          passenger: true,
          matchedCaptain: { with: { user: true, vehicle: true } },
        },
      });

      if (updated?.passengerId) {
        try {
          getIO().to(updated.passengerId).emit("ride_status_updated", updated);
        } catch {}
      }
      if (updated?.matchedCaptainId) {
        try {
          getIO().to(updated.matchedCaptainId).emit("ride_status_updated", updated);
        } catch {}
      }

      res.status(200).json(updated);
    } catch (err) {
      console.error("PUT /admin/ride-requests/:id/status error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// PUT /admin/ride-requests/:id/assign — assign captain to ride request
router.put(
  "/admin/ride-requests/:id/assign",
  authenticateToken,
  isAdmin,
  async (req: AuthRequest, res) => {
    try {
      const id = String(req.params.id);
      const { captainId } = req.body;
      const captain = await db.query.captainsTable.findFirst({
        where: eq(captainsTable.id, captainId),
        with: { user: true, vehicle: true },
      });
      if (!captain) {
        res.status(404).json({ error: "Captain not found" });
        return;
      }

      await db
        .update(rideRequestsTable)
        .set({
          matchedCaptainId: captainId,
          status: "accepted",
        })
        .where(eq(rideRequestsTable.id, id));

      const updated = await db.query.rideRequestsTable.findFirst({
        where: eq(rideRequestsTable.id, id),
        with: {
          passenger: true,
          matchedCaptain: { with: { user: true, vehicle: true } },
        },
      });

      if (updated?.passengerId) {
        try {
          getIO().to(updated.passengerId).emit("ride-accepted", {
            requestId: id,
            captain: {
              id: captain.id,
              fullName: captain.user?.fullName ?? "الكابتن",
              phone: captain.user?.phone ?? "",
              vehicle: captain.vehicle?.makeModel ?? "",
              plate: captain.vehicle?.plate ?? "",
            },
          });
        } catch {}
      }

      res.status(200).json(updated);
    } catch (err) {
      console.error("PUT /admin/ride-requests/:id/assign error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;

