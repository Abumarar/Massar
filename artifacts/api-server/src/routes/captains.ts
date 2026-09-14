import { Router } from "express";
import { db } from "@workspace/db";
import { captainsTable, vehiclesTable, usersTable, routesTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "./auth";
import crypto from "crypto";

const router = Router();

// Calculate distance using simple Haversine since we don't have PostGIS easily guaranteed
// This is done in SQL for searching
const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  return `(6371 * acos(cos(radians(${lat1})) * cos(radians(${lat2})) * cos(radians(${lon2}) - radians(${lon1})) + sin(radians(${lat1})) * sin(radians(${lat2}))))`;
};

router.post("/captains/profile", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { nationalIdLast4, vehicleMakeModel, vehicleColor, vehiclePlate, totalSeats } = req.body;
    const userId = req.user!.id;

    let captain = await db.query.captainsTable.findFirst({
      where: eq(captainsTable.userId, userId),
    });

    if (!captain) {
      const captainId = crypto.randomUUID();
      await db.insert(captainsTable).values({
        id: captainId,
        userId,
        nationalIdLast4,
        status: "approved", // auto-approve for MVP
      });
      
      const vehicleId = crypto.randomUUID();
      await db.insert(vehiclesTable).values({
        id: vehicleId,
        captainId,
        makeModel: vehicleMakeModel,
        color: vehicleColor,
        plate: vehiclePlate,
        totalSeats,
      });

      captain = await db.query.captainsTable.findFirst({
        where: eq(captainsTable.id, captainId),
      });
    }

    res.status(200).json(captain);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/captains/status", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { isOnline, routeId, pickupRadiusKm } = req.body;
    const userId = req.user!.id;

    const captain = await db.query.captainsTable.findFirst({
      where: eq(captainsTable.userId, userId),
    });

    if (!captain) {
      res.status(404).json({ error: "Captain not found" });
      return;
    }

    await db.update(captainsTable)
      .set({ isOnline })
      .where(eq(captainsTable.id, captain.id));

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/captains/location", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { lat, lng } = req.body;
    const userId = req.user!.id;

    const captain = await db.query.captainsTable.findFirst({
      where: eq(captainsTable.userId, userId),
    });

    if (!captain) {
      res.status(404).json({ error: "Captain not found" });
      return;
    }

    await db.update(captainsTable)
      .set({ currentLocationLat: lat, currentLocationLng: lng })
      .where(eq(captainsTable.id, captain.id));

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/captains/matching", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const routeId = req.query.routeId as string;
    const pickupLat = parseFloat(req.query.pickupLat as string);
    const pickupLng = parseFloat(req.query.pickupLng as string);
    // const destLat = parseFloat(req.query.destLat as string);
    // const destLng = parseFloat(req.query.destLng as string);
    const seats = parseInt(req.query.seats as string) || 1;

    if (!routeId || isNaN(pickupLat) || isNaN(pickupLng)) {
      res.status(400).json({ error: "Missing matching parameters" });
      return;
    }

    const route = await db.query.routesTable.findFirst({
      where: eq(routesTable.id, routeId),
    });

    if (!route) {
      res.status(404).json({ error: "Route not found" });
      return;
    }

    // Fetch all online captains and do distance checking
    // In production we'd do PostGIS filtering here
    const onlineCaptains = await db.query.captainsTable.findMany({
      where: eq(captainsTable.isOnline, true),
      with: {
        user: true,
        vehicle: true,
      }
    });

    const matchingCaptains = onlineCaptains
      .filter(c => c.currentLocationLat && c.currentLocationLng && c.vehicle && c.vehicle.totalSeats >= seats)
      .map(c => {
        // Calculate distance from captain to passenger pickup
        const lat1 = c.currentLocationLat!;
        const lon1 = c.currentLocationLng!;
        const R = 6371; // Earth's radius in km
        const dLat = (pickupLat - lat1) * Math.PI / 180;
        const dLon = (pickupLng - lon1) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(pickupLat * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const distanceKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return {
          captainId: c.id,
          fullName: c.user?.fullName || "Unknown",
          rating: c.rating || 5.0,
          vehicleMakeModel: c.vehicle?.makeModel || "Unknown",
          vehiclePlate: c.vehicle?.plate || "Unknown",
          availableSeats: c.vehicle?.totalSeats || 4,
          estimatedFare: (route.baseFare * seats),
          distanceKm,
          etaMinutes: Math.round((distanceKm / 40) * 60) || 1, // Assume 40km/h
          lat: c.currentLocationLat,
          lng: c.currentLocationLng,
        };
      })
      .filter(c => c.distanceKm < 10) // Only within 10km radius
      .sort((a, b) => a.distanceKm - b.distanceKm); // Sort by closest

    res.status(200).json(matchingCaptains);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
