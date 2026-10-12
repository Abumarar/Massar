import { Router } from "express";
import { db } from "@workspace/db";
import { captainsTable, vehiclesTable, usersTable, routesTable } from "@workspace/db";
import { eq, and, or, sql } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "./auth";
import crypto from "crypto";
import bcrypt from "bcryptjs";

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
        nationalIdLast4: nationalIdLast4 || "0000",
        status: "approved", // auto-approve for MVP
        isOnline: true,
        currentLocationLat: 32.05,
        currentLocationLng: 35.85,
      });
      
      const vehicleId = crypto.randomUUID();
      await db.insert(vehiclesTable).values({
        id: vehicleId,
        captainId,
        makeModel: vehicleMakeModel || "مركبة مسار",
        color: vehicleColor || "أبيض",
        plate: vehiclePlate || "12-34567",
        totalSeats: Number(totalSeats) || 4,
      });

      captain = await db.query.captainsTable.findFirst({
        where: eq(captainsTable.id, captainId),
      });
    } else {
      await db.update(captainsTable).set({
        nationalIdLast4: nationalIdLast4 || captain.nationalIdLast4,
        status: "approved",
        isOnline: true,
        currentLocationLat: captain.currentLocationLat ?? 32.05,
        currentLocationLng: captain.currentLocationLng ?? 35.85,
      }).where(eq(captainsTable.id, captain.id));

      const vehicle = await db.query.vehiclesTable.findFirst({
        where: eq(vehiclesTable.captainId, captain.id),
      });

      if (vehicle) {
        await db.update(vehiclesTable).set({
          makeModel: vehicleMakeModel || vehicle.makeModel,
          color: vehicleColor || vehicle.color,
          plate: vehiclePlate || vehicle.plate,
          totalSeats: Number(totalSeats) || vehicle.totalSeats,
        }).where(eq(vehiclesTable.id, vehicle.id));
      } else {
        await db.insert(vehiclesTable).values({
          id: crypto.randomUUID(),
          captainId: captain.id,
          makeModel: vehicleMakeModel || "مركبة مسار",
          color: vehicleColor || "أبيض",
          plate: vehiclePlate || "12-34567",
          totalSeats: Number(totalSeats) || 4,
        });
      }

      captain = await db.query.captainsTable.findFirst({
        where: eq(captainsTable.id, captain.id),
      });
    }

    // Ensure user role is updated to captain
    await db.update(usersTable).set({ role: "captain" }).where(eq(usersTable.id, userId));

    res.status(200).json(captain);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/captains/status", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { isOnline, routeId, pickupRadiusKm } = req.body;
    const userId = req.user!.id;

    let captain = await db.query.captainsTable.findFirst({
      where: eq(captainsTable.userId, userId),
    });

    if (!captain) {
      if (req.user?.role === "captain" || req.user?.role === "admin") {
        const newCaptainId = crypto.randomUUID();
        await db.insert(captainsTable).values({
          id: newCaptainId,
          userId,
          nationalIdLast4: "0000",
          status: "approved",
          isOnline: isOnline ?? true,
          currentLocationLat: 32.05,
          currentLocationLng: 35.85,
        });
        captain = await db.query.captainsTable.findFirst({
          where: eq(captainsTable.id, newCaptainId),
        });
      }
      if (!captain) {
        res.status(404).json({ error: "Captain not found" });
        return;
      }
    }

    await db.update(captainsTable)
      .set({
        isOnline: isOnline ?? true,
        currentLocationLat: captain.currentLocationLat ?? 32.05,
        currentLocationLng: captain.currentLocationLng ?? 35.85,
      })
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

    if (!route) {
      res.status(404).json({ error: "Route not found" });
      return;
    }

    // Ensure at least one captain is available if DB has none
    await seedDefaultCaptainIfMissing();

    // Fetch all online captains and do distance checking
    const onlineCaptains = await db.query.captainsTable.findMany({
      where: eq(captainsTable.isOnline, true),
      with: {
        user: true,
        vehicle: true,
      }
    });

    const matchingCaptains = onlineCaptains
      .filter(c => c.vehicle && c.vehicle.totalSeats >= seats)
      .map(c => {
        // Calculate distance from captain to passenger pickup
        const lat1 = c.currentLocationLat ?? 32.05;
        const lon1 = c.currentLocationLng ?? 35.85;
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
          fullName: c.user?.fullName || "كابتن مسار (Captain)",
          rating: c.rating || 4.9,
          vehicleMakeModel: c.vehicle?.makeModel || "تويوتا بريوس (Toyota Prius)",
          vehiclePlate: c.vehicle?.plate || "12-34567",
          availableSeats: c.vehicle?.totalSeats || 4,
          estimatedFare: (route.baseFare * seats),
          distanceKm: Math.round(distanceKm * 10) / 10,
          etaMinutes: Math.max(2, Math.round((distanceKm / 40) * 60)), // Assume 40km/h
          lat: lat1,
          lng: lon1,
        };
      })
      .filter(c => c.distanceKm <= 55) // Allow intercity corridor up to 55km (e.g. Amman <-> Jerash is ~45km)
      .sort((a, b) => a.distanceKm - b.distanceKm); // Sort by closest

    res.status(200).json(matchingCaptains);
  } catch (error) {
    console.error("CAPTAINS_MATCHING_ERROR:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export async function seedDefaultCaptainIfMissing() {
  try {
    const existingCaptain = await db.query.captainsTable.findFirst();
    if (!existingCaptain) {
      console.log("[DB] Seeding default captain (0788888888 / Captain123!)...");
      const passwordHash = await bcrypt.hash("Captain123!", 10);
      const userId = "captain-system-user-id";
      await db.insert(usersTable).values({
        id: userId,
        phone: "0788888888",
        passwordHash,
        fullName: "كابتن طارق العدوان (Captain Tariq)",
        role: "captain",
      }).onConflictDoNothing();

      const captainId = "captain-system-profile-id";
      await db.insert(captainsTable).values({
        id: captainId,
        userId,
        nationalIdLast4: "1988",
        status: "approved",
        isOnline: true,
        currentLocationLat: 32.05,
        currentLocationLng: 35.85,
        rating: 4.9,
        totalTrips: 142,
      }).onConflictDoNothing();

      await db.insert(vehiclesTable).values({
        id: "vehicle-system-id",
        captainId,
        makeModel: "تويوتا بريوس (Toyota Prius 2022)",
        color: "أبيض لؤلؤي",
        plate: "12-34567",
        totalSeats: 4,
      }).onConflictDoNothing();

      console.log("[DB] Default captain seeded successfully.");
    }
  } catch (err) {
    console.error("[DB] Failed to seed default captain:", err);
  }
}

export default router;
