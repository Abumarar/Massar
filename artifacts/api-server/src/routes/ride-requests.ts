import { Router } from "express";
import { validateRequest } from "../middlewares/validate";
import { isPassenger, isCaptain, isAdmin } from "../middlewares/roles";
import { 
  CreatePassengerRideRequestBody, 
  ListPassengerRideRequestsQueryParams, 
  UpdatePassengerRideRequestStatusParams, 
  UpdatePassengerRideRequestStatusBody,
  ListCaptainRideRequestsQueryParams,
  UpdateCaptainRideRequestStatusParams,
  UpdateCaptainRideRequestStatusBody
} from "@workspace/api-zod";
import { db } from "@workspace/db";
import { rideRequestsTable, routesTable, captainsTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "./auth";
import crypto from "crypto";
import { getIO } from "../lib/socket";

const router = Router();

// =======================
// PASSENGER ENDPOINTS
// =======================

router.post("/passenger/ride-requests", authenticateToken, isPassenger, validateRequest({ body: CreatePassengerRideRequestBody }), async (req: AuthRequest, res) => {
  try {
    const { captainId, routeId, pickupLat, pickupLng, destLat, destLng, seats, type, customSearchText } = req.body;
    const passengerId = req.user!.id;

    let estimatedFare = 0;
    if (routeId) {
      const cleanRouteId = routeId.trim();
      const withPrefix = cleanRouteId.startsWith("route-") ? cleanRouteId : `route-${cleanRouteId}`;
      const withoutPrefix = cleanRouteId.replace(/^route-/, "");
      const route = await db.query.routesTable.findFirst({
        where: or(
          eq(routesTable.id, cleanRouteId),
          eq(routesTable.id, withPrefix),
          eq(routesTable.id, withoutPrefix)
        ),
      });
      if (route) {
        estimatedFare = route.baseFare * seats;
      }
    }

    const requestId = crypto.randomUUID();

    await db.insert(rideRequestsTable).values({
      id: requestId,
      passengerId,
      matchedCaptainId: captainId,
      routeId: routeId || null,
      pickupLat,
      pickupLng,
      destinationLat: destLat,
      destinationLng: destLng,
      seatsRequested: seats,
      estimatedFare,
      type: type || "standard",
      customSearchText,
      status: "requested",
    });

    const request = await db.query.rideRequestsTable.findFirst({
      where: eq(rideRequestsTable.id, requestId),
      with: {
        passenger: true,
        matchedCaptain: {
          with: { user: true, vehicle: true }
        },
      }
    });

    if (captainId) {
      getIO().to(captainId).emit("new_ride_request", request);
    }
    getIO().emit("ride-requested", request);

    console.log("[RIDE_REQUEST_CREATED]", { requestId, passengerId, routeId, type });
    res.status(201).json(request);
  } catch (error) {
    console.error("CREATE_RIDE_REQUEST_ERROR:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/passenger/ride-requests", authenticateToken, isPassenger, validateRequest({ query: ListPassengerRideRequestsQueryParams }), async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const status = req.query.status as string;

    const requests = await db.query.rideRequestsTable.findMany({
      where: eq(rideRequestsTable.passengerId, userId),
      with: {
        passenger: true,
        matchedCaptain: {
          with: { user: true, vehicle: true }
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

    res.status(200).json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/passenger/ride-requests/:id/status", authenticateToken, isPassenger, validateRequest({ params: UpdatePassengerRideRequestStatusParams, body: UpdatePassengerRideRequestStatusBody }), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const passengerId = req.user!.id;

    // Verify ownership
    const request = await db.query.rideRequestsTable.findFirst({
      where: eq(rideRequestsTable.id, id as string)
    });

    if (!request || request.passengerId !== passengerId) {
      res.status(404).json({ error: "Not found or not authorized" });
      return;
    }

    await db.update(rideRequestsTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(rideRequestsTable.id, id as string));

    const updated = await db.query.rideRequestsTable.findFirst({
      where: eq(rideRequestsTable.id, id as string),
      with: {
        passenger: true,
        matchedCaptain: { with: { user: true, vehicle: true } }
      }
    });

    if (updated?.matchedCaptainId) {
      getIO().to(updated.matchedCaptainId).emit("ride_status_updated", updated);
    }
    getIO().to(updated!.passengerId).emit("ride_status_updated", updated);

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});


// =======================
// CAPTAIN ENDPOINTS
// =======================

router.get("/captain/ride-requests", authenticateToken, isCaptain, validateRequest({ query: ListCaptainRideRequestsQueryParams }), async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const captain = await db.query.captainsTable.findFirst({
      where: eq(captainsTable.userId, userId),
    });

    if (!captain) {
      res.status(404).json({ error: "Captain profile not found" });
      return;
    }

    const requests = await db.query.rideRequestsTable.findMany({
      where: eq(rideRequestsTable.matchedCaptainId, captain.id),
      with: {
        passenger: true,
        matchedCaptain: {
          with: { user: true, vehicle: true }
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
      captain: {
        fullName: req.matchedCaptain!.user!.fullName,
        phone: req.matchedCaptain!.user!.phone,
        vehicleMakeModel: req.matchedCaptain!.vehicle!.makeModel,
        vehiclePlate: req.matchedCaptain!.vehicle!.plate,
      }
    }));

    res.status(200).json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/captain/ride-requests/:id/status", authenticateToken, isCaptain, validateRequest({ params: UpdateCaptainRideRequestStatusParams, body: UpdateCaptainRideRequestStatusBody }), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user!.id;

    const captain = await db.query.captainsTable.findFirst({
      where: eq(captainsTable.userId, userId),
    });

    if (!captain) {
      res.status(404).json({ error: "Captain profile not found" });
      return;
    }

    const request = await db.query.rideRequestsTable.findFirst({
      where: eq(rideRequestsTable.id, id as string)
    });

    if (!request || request.matchedCaptainId !== captain.id) {
      res.status(404).json({ error: "Not found or not authorized" });
      return;
    }

    await db.update(rideRequestsTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(rideRequestsTable.id, id as string));

    const updated = await db.query.rideRequestsTable.findFirst({
      where: eq(rideRequestsTable.id, id as string),
      with: {
        passenger: true,
        matchedCaptain: { with: { user: true, vehicle: true } }
      }
    });

    getIO().to(updated!.passengerId).emit("ride_status_updated", updated);
    getIO().to(captain.id).emit("ride_status_updated", updated);

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
