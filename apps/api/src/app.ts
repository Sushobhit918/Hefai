import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { ZodError } from "zod";
import { adminRouter } from "./routes/admin.js";
import { publicRouter } from "./routes/public.js";

export function createApp() {
  const app = express();
  const allowedOrigins = process.env.WEB_ORIGIN?.split(",").map((origin) => origin.trim()).filter(Boolean) ?? [];

  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      const localAllowed = process.env.NODE_ENV !== "production" && /^https?:\/\/localhost(:\d+)?$/.test(origin);
      const vercelAllowed = process.env.ALLOW_VERCEL_ORIGINS === "true" && origin.endsWith(".vercel.app");
      const explicitAllowed = allowedOrigins.includes(origin);
      callback(null, explicitAllowed || vercelAllowed || localAllowed);
    },
    credentials: true
  }));
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  app.use("/api", publicRouter);
  app.use("/api/admin", adminRouter);

  const errorHandler: ErrorRequestHandler = (error, _req, res) => {
    if (error instanceof ZodError) {
      res.status(422).json({ message: "Validation failed", issues: error.issues });
      return;
    }

    if (error instanceof Error && error.message.startsWith("Unavailable product")) {
      res.status(400).json({ message: error.message });
      return;
    }

    console.error(error);
    res.status(500).json({ message: "Unexpected server error" });
  };

  app.use(errorHandler);

  return app;
}
