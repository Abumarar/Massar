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
      with: {
        captainProfile: true,
      },
    });

    if (existingUser) {
      // User already exists with this phone. Allow dual registration / activation!
      const passwordHash = await bcrypt.hash(password, 10);

      if (role === "captain") {
        let captainProfile = existingUser.captainProfile;
        if (!captainProfile) {
          const captainId = crypto.randomUUID();
          await db.insert(captainsTable).values({
            id: captainId,
            userId: existingUser.id,
            nationalIdLast4: "0000",
            status: "approved",
            isOnline: true,
          });
          captainProfile = {
            id: captainId,
            userId: existingUser.id,
            nationalIdLast4: "0000",
            status: "approved",
            isOnline: true,
            currentLocationLat: null,
            currentLocationLng: null,
            rating: 5.0,
            totalTrips: 0,
            submittedAt: new Date(),
            reviewedAt: null,
            reviewNote: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }

        await db
          .update(usersTable)
          .set({
            role: "captain",
            fullName: fullName?.trim() || existingUser.fullName,
            passwordHash,
          })
          .where(eq(usersTable.id, existingUser.id));

        const token = jwt.sign(
          { id: existingUser.id, phone: normalizedPhone, role: "captain" },
          JWT_SECRET,
          { expiresIn: "30d" }
        );

        res.status(200).json({
          token,
          user: {
            id: existingUser.id,
            phone: normalizedPhone,
            fullName: fullName?.trim() || existingUser.fullName,
            role: "captain",
            captainProfile,
          },
        });
        return;
      } else {
        // Registering as passenger with existing phone
        await db
          .update(usersTable)
          .set({
            fullName: fullName?.trim() || existingUser.fullName,
            passwordHash,
          })
          .where(eq(usersTable.id, existingUser.id));

        const token = jwt.sign(
          { id: existingUser.id, phone: normalizedPhone, role: "passenger" },
          JWT_SECRET,
          { expiresIn: "30d" }
        );

        res.status(200).json({
          token,
          user: {
            id: existingUser.id,
            phone: normalizedPhone,
            fullName: fullName?.trim() || existingUser.fullName,
            role: "passenger",
            captainProfile: existingUser.captainProfile || null,
          },
        });
        return;
      }
    }

    // New user registration
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    await db.insert(usersTable).values({
      id: userId,
      phone: normalizedPhone,
      passwordHash,
      fullName: fullName.trim(),
      role,
    });

    let captainProfile = null;
    if (role === "captain") {
      const captainId = crypto.randomUUID();
      await db.insert(captainsTable).values({
        id: captainId,
        userId,
        nationalIdLast4: "0000",
        status: "approved",
        isOnline: true,
      });
      captainProfile = {
        id: captainId,
        userId,
        nationalIdLast4: "0000",
        status: "approved",
        isOnline: true,
        currentLocationLat: null,
        currentLocationLng: null,
        rating: 5.0,
        totalTrips: 0,
        submittedAt: new Date(),
        reviewedAt: null,
        reviewNote: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    const token = jwt.sign({ id: userId, phone: normalizedPhone, role }, JWT_SECRET, { expiresIn: "30d" });

    res.status(200).json({
      token,
      user: {
        id: userId,
        phone: normalizedPhone,
        fullName: fullName.trim(),
        role,
        captainProfile,
      },
    });
  } catch (error) {
    console.error("REGISTER_ERROR:", error);
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

export async function seedDefaultAdminIfMissing() {
  try {
    const existingAdmin = await db.query.usersTable.findFirst({
      where: or(
        eq(usersTable.role, "admin"),
        eq(usersTable.phone, "0799999999"),
        eq(usersTable.phone, "admin")
      ),
    });

    if (!existingAdmin) {
      console.log("[DB] Seeding default admin user (0799999999 / Admin1234!)...");
      const passwordHash = await bcrypt.hash("Admin1234!", 10);
      await db.insert(usersTable).values({
        id: "admin-system-user-id",
        phone: "0799999999",
        passwordHash,
        fullName: "مسؤول مسار (Admin)",
        role: "admin",
      });
      console.log("[DB] Default admin user seeded successfully.");
    }
  } catch (err) {
    console.error("[DB] Failed to seed default admin:", err);
  }
}

export default router;
