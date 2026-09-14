import { Router, Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { usersTable, captainsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    phone: string;
    role: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Missing token" });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      res.status(403).json({ error: "Invalid token" });
      return;
    }
    req.user = user as any;
    next();
  });
};

router.post("/auth/register", async (req, res) => {
  try {
    const { phone, password, fullName, role } = req.body;
    if (!phone || !password || !fullName || !role) {
      res.status(400).json({ error: "Missing fields" });
      return;
    }

    const existingUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.phone, phone),
    });

    if (existingUser) {
      res.status(400).json({ error: "User already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    await db.insert(usersTable).values({
      id: userId,
      phone,
      passwordHash,
      fullName,
      role,
    });

    // Auto login
    const token = jwt.sign({ id: userId, phone, role }, JWT_SECRET, { expiresIn: "30d" });

    res.status(200).json({
      token,
      user: { id: userId, phone, fullName, role },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.phone, phone),
      with: {
        captainProfile: true, // we need to configure relations in db schema later
      },
    });

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ id: user.id, phone: user.phone, role: user.role }, JWT_SECRET, { expiresIn: "30d" });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
        captainProfile: (user as any).captainProfile?.[0], // simple hack for now
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/auth/me", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, req.user.id),
      with: {
        captainProfile: true, // We must add relations to schema.ts!
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({
      id: user.id,
      phone: user.phone,
      fullName: user.fullName,
      role: user.role,
      captainProfile: (user as any).captainProfile?.[0],
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
