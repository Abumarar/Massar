import { Response, NextFunction } from "express";
import { AuthRequest } from "../routes/auth";

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: `Forbidden: Requires one of ${roles.join(", ")}` });
      return;
    }

    next();
  };
};

export const isPassenger = requireRole(["passenger", "admin"]);
export const isCaptain = requireRole(["captain", "admin"]);
export const isAdmin = requireRole(["admin"]);
