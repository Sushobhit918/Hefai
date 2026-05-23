import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type AuthUser = {
  id: string;
  role: "ADMIN" | "STAFF" | "CUSTOMER";
  email: string;
};

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}

const secret = process.env.JWT_SECRET ?? "dev-secret";

export function signToken(user: AuthUser) {
  return jwt.sign(user, secret, { expiresIn: "8h" });
}

export function requireUser(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as AuthUser;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireUser(req, res, () => {
    if (!req.user || !["ADMIN", "STAFF"].includes(req.user.role)) {
      res.status(403).json({ message: "Owner access required" });
      return;
    }
    next();
  });
}

export function requireCustomer(req: Request, res: Response, next: NextFunction) {
  requireUser(req, res, () => {
    if (!req.user || req.user.role !== "CUSTOMER") {
      res.status(403).json({ message: "Customer access required" });
      return;
    }
    next();
  });
}
