import { Router } from "express";
import { db } from "@workspace/db";
import { routesTable } from "@workspace/db";

const router = Router();

router.get("/routes", async (req, res) => {
  try {
    const routes = await db.query.routesTable.findMany();
    res.status(200).json(routes);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
