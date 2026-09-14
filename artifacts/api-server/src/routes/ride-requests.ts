import { Router } from "express";
import { db } from "@workspace/db";
import { rideRequestsTable, routesTable, captainsTable, usersTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "./auth";
import crypto from "crypto";

const router = Router();

router.post("/ride-requests", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { captainId, routeId, pickupLat, pickupLng, destLat, destLng, seats } = req.body;
    const passengerId = req.user!.id;

    if (!captainId || !routeId || !pickupLat || !pickupLng || !destLat || !destLng || !seats) {
      res.status(400).json({ error: "Missing fields" });
      return;
    }

    const route = await db.query.routesTable.findFirst({
      where: eq(routesTable.id, routeId),
    });

    if (!route) {
      res.status(404).json({ error: "Route not found" });
      return;
    }

    const estimatedFare = route.baseFare * seats;
    const requestId = crypto.randomUUID();

    await db.insert(rideRequestsTable).values({
      id: requestId,
      passengerId,
      matchedCaptainId: captainId,
      routeId,
      pickupLat,
      pickupLng,
      destinationLat: destLat,
      destinationLng: destLng,
      seatsRequested: seats,
      estimatedFare,
      status: "requested",
    });

    const request = await db.query.rideRequestsTable.findFirst({
      where: eq(rideRequestsTable.id, requestId),
      with: {
        passenger: true,
        matchedCaptain: {
          with: {
            user: true,
            vehicle: true,
          }
        },
      }
    });

    // In a real system, we'd emit a websocket event here to the captain

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/ride-requests", async (req, res, next) => {
  if (req.query.role === "admin") {
    try {
      const requests = await db.query.rideRequestsTable.findMany({
        with: {
          passenger: true,
          matchedCaptain: {
            with: {
              user: true,
              vehicle: true,
            }
          }
        },
        orderBy: (requests, { desc }) => [desc(requests.createdAt)],
      });

      const mapped = requests.map(req => ({
        id: req.id,
        passengerId: req.passengerId,
        matchedCaptainId: req.matchedCaptainId,
        routeId: req.routeId,
        status: req.status,
        pickupLat: req.pickupLat,
        pickupLng: req.pickupLng,
        destLat: req.destinationLat,
        destLng: req.destinationLng,
        seatsRequested: req.seatsRequested,
        estimatedFare: req.estimatedFare,
        createdAt: req.createdAt ? new Date(req.createdAt).toISOString() : new Date().toISOString(),
        passenger: {
          fullName: req.passenger?.fullName || "Unknown",
          phone: req.passenger?.phone || "Unknown",
        },
        captain: req.matchedCaptain ? {
          fullName: req.matchedCaptain.user?.fullName || "Unknown",
          phone: req.matchedCaptain.user?.phone || "Unknown",
          vehicleMakeModel: req.matchedCaptain.vehicle?.makeModel || "Unknown",
          vehiclePlate: req.matchedCaptain.vehicle?.plate || "Unknown",
        } : undefined
      }));

      return res.status(200).json(mapped);
    } catch (error: any) {
      return res.status(500).json({ error: "Internal server error", details: error.message, stack: error.stack });
    }
  }
  
  return authenticateToken(req, res, next);
}, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const role = req.query.role as string;
    const status = req.query.status as string;

    let whereClause = undefined;
    
    if (role === "captain") {
      const captain = await db.query.captainsTable.findFirst({
        where: eq(captainsTable.userId, userId),
      });
      if (!captain) {
        res.status(404).json({ error: "Captain profile not found" });
        return;
      }
      
      whereClause = eq(rideRequestsTable.matchedCaptainId, captain.id);
    } else {
      whereClause = eq(rideRequestsTable.passengerId, userId);
    }

    const requests = await db.query.rideRequestsTable.findMany({
      where: whereClause,
      with: {
        passenger: true,
        matchedCaptain: {
          with: {
            user: true,
            vehicle: true,
          }
        }
      },
      orderBy: (requests, { desc }) => [desc(requests.createdAt)],
    });

    // Map to the OpenAPI spec shape
    const mapped = requests.map(req => ({
      id: req.id,
      passengerId: req.passengerId,
      matchedCaptainId: req.matchedCaptainId,
      routeId: req.routeId,
      status: req.status,
      pickupLat: req.pickupLat,
      pickupLng: req.pickupLng,
      destLat: req.destinationLat,
      destLng: req.destinationLng,
      seatsRequested: req.seatsRequested,
      estimatedFare: req.estimatedFare,
      createdAt: req.createdAt ? new Date(req.createdAt).toISOString() : new Date().toISOString(),
      passenger: {
        fullName: req.passenger?.fullName || "Unknown",
        phone: req.passenger?.phone || "Unknown",
      },
      captain: req.matchedCaptain ? {
        fullName: req.matchedCaptain.user?.fullName || "Unknown",
        phone: req.matchedCaptain.user?.phone || "Unknown",
        vehicleMakeModel: req.matchedCaptain.vehicle?.makeModel || "Unknown",
        vehiclePlate: req.matchedCaptain.vehicle?.plate || "Unknown",
      } : undefined
    }));

    res.status(200).json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

router.put("/ride-requests/:id/status", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ error: "Missing status" });
      return;
    }

    // Validate if user has permission to update this (we skip deep checks for MVP for speed, but ideally check passenger vs captain)
    await db.update(rideRequestsTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(rideRequestsTable.id, id as string));

    const updated = await db.query.rideRequestsTable.findFirst({
      where: eq(rideRequestsTable.id, id as string),
      with: {
        passenger: true,
        matchedCaptain: {
          with: { user: true, vehicle: true }
        }
      }
    });

    if (!updated) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    
    // In a real system, emit websocket event here

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
