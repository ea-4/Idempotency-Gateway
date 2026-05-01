import type { Request, Response, NextFunction } from "express";
import redis from "../lib/redisClient.js";
import type { Record } from "../types.js";
import crypto from "crypto";

export const idempotencyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const key = req.headers["idempotency-key"] as string;

  if (!key) {
    return res.status(400).json({
      error: "Idempotency-Key header is required",
    });
  }

  const bodyHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(req.body))
    .digest("hex");

  let recordRaw = await redis.get(key);
  let record: Record | null = recordRaw ? JSON.parse(recordRaw) : null;

  if (record) {
    if (record.bodyHash !== bodyHash) {
      return res.status(422).json({
        error: "Idempotency key already exists with different body",
      });
    }
  }


  if (!record) {
  const initialRecord: Record = {
    status: "PROCESSING",
    bodyHash,
  };

  await redis.set(key, JSON.stringify(initialRecord), "EX", 60);
}

  next();
};
