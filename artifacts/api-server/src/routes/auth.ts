import { Router, Request, Response, NextFunction } from "express";
import { validateRequest } from "../middlewares/validate";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { db } from "@workspace/db";
import { usersTable, captainsTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development";

function normalizePhone(raw: string): string {
  if (!raw) return '';
  let clean = raw.trim().replace(/[\s\-\(\)\.]/g, '');
  if (clean.startsWith('+962')) {
    clean = '0' + clean.slice(4);
  } else if (clean.startsWith('962')) {
    clean = '0' + clean.slice(3);
  } else if (clean.startsWith('7') && clean.length === 9) {
    clean = '0' + clean;
  }
  return clean;
}

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

router.post("/auth/register", validateRequest({ body: RegisterBody }), async (req, res) => {
  try {
    const { phone, password, fullName, role } = req.body;
    const normalizedPhone = normalizePhone(phone);

    const existingUser = await db.query.usersTable.findFirst({
      where: or(
        eq(usersTable.phone, normalizedPhone),
        eq(usersTable.phone, phone.trim())
      ),
    });

    if (existingUser) {
      res.status(400).json({ error: "User already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    await db.insert(usersTable).values({
      id: userId,
      phone: normalizedPhone,
      passwordHash,
      fullName: fullName.trim(),
      role,
    });

    // Auto login
    const token = jwt.sign({ id: userId, phone: normalizedPhone, role }, JWT_SECRET, { expiresIn: "30d" });

    res.status(200).json({
      token,
      user: { id: userId, phone: normalizedPhone, fullName: fullName.trim(), role },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/login", validateRequest({ body: LoginBody }), async (req, res) => {
  try {
    const { phone, password } = req.body;
    const normalizedPhone = normalizePhone(phone);

    const user = await db.query.usersTable.findFirst({
      where: or(
        eq(usersTable.phone, normalizedPhone),
        eq(usersTable.phone, phone.trim())
      ),
      with: {
        captainProfile: true,
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
        captainProfile: user.captainProfile || null,
      },
    });
  } catch (error) {
    console.error("LOGIN_ERROR:", error);
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
        captainProfile: true,
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
      captainProfile: user.captainProfile || null,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
