import { Router } from "express";
import { db } from "@workspace/db";
import { routesTable } from "@workspace/db";

const router = Router();

export const DEFAULT_JORDAN_ROUTES = [
  {
    id: "route-amman-jerash",
    name: "عمان ⇄ جرش (Amman - Jerash)",
    origin: "عمان",
    destination: "جرش",
    baseFare: 2.5,
    isActive: true,
  },
  {
    id: "route-jerash-amman",
    name: "جرش ⇄ عمان (Jerash - Amman)",
    origin: "جرش",
    destination: "عمان",
    baseFare: 2.5,
    isActive: true,
  },
  {
    id: "route-amman-irbid",
    name: "عمان ⇄ إربد (Amman - Irbid)",
    origin: "عمان",
    destination: "إربد",
    baseFare: 3.5,
    isActive: true,
  },
  {
    id: "route-irbid-amman",
    name: "إربد ⇄ عمان (Irbid - Amman)",
    origin: "إربد",
    destination: "عمان",
    baseFare: 3.5,
    isActive: true,
  },
  {
    id: "route-amman-zarqa",
    name: "عمان ⇄ الزرقاء (Amman - Zarqa)",
    origin: "عمان",
    destination: "الزرقاء",
    baseFare: 1.5,
    isActive: true,
  },
  {
    id: "route-zarqa-amman",
    name: "الزرقاء ⇄ عمان (Zarqa - Amman)",
    origin: "الزرقاء",
    destination: "عمان",
    baseFare: 1.5,
    isActive: true,
  },
  {
    id: "route-amman-salt",
    name: "عمان ⇄ السلط (Amman - Salt)",
    origin: "عمان",
    destination: "السلط",
    baseFare: 2.0,
    isActive: true,
  },
  {
    id: "route-salt-amman",
    name: "السلط ⇄ عمان (Salt - Amman)",
    origin: "السلط",
    destination: "عمان",
    baseFare: 2.0,
    isActive: true,
  },
  {
    id: "route-amman-madaba",
    name: "عمان ⇄ مأدبا (Amman - Madaba)",
    origin: "عمان",
    destination: "مأدبا",
    baseFare: 2.0,
    isActive: true,
  },
  {
    id: "route-madaba-amman",
    name: "مأدبا ⇄ عمان (Madaba - Amman)",
    origin: "مأدبا",
    destination: "عمان",
    baseFare: 2.0,
    isActive: true,
  },
  {
    id: "route-amman-aqaba",
    name: "عمان ⇄ العقبة (Amman - Aqaba)",
    origin: "عمان",
    destination: "العقبة",
    baseFare: 10.0,
    isActive: true,
  },
  {
    id: "route-aqaba-amman",
    name: "العقبة ⇄ عمان (Aqaba - Amman)",
    origin: "العقبة",
    destination: "عمان",
    baseFare: 10.0,
    isActive: true,
  },
];

export async function seedDefaultRoutesIfEmpty() {
  try {
    const existing = await db.query.routesTable.findMany();
    if (existing.length === 0) {
      console.log("[DB] Seeding default Jordanian intercity routes...");
      for (const route of DEFAULT_JORDAN_ROUTES) {
        await db.insert(routesTable).values(route).onConflictDoNothing();
      }
      console.log("[DB] Seeded default routes successfully.");
    }
  } catch (err) {
    console.error("[DB] Failed to seed default routes:", err);
  }
}

router.get("/routes", async (req, res) => {
  try {
    let routes = await db.query.routesTable.findMany();
    if (routes.length === 0) {
      await seedDefaultRoutesIfEmpty();
      routes = await db.query.routesTable.findMany();
    }
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.status(200).json(routes);
  } catch (error) {
    console.error("GET /routes error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
