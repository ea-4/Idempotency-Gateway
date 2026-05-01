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
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  let attempts = 0;

  while (attempts < 5) {
    let recordRaw = await redis.get(key);
    let record: Record | null = recordRaw ? JSON.parse(recordRaw) : null;

    if (record) {
      if (record.bodyHash !== bodyHash) {
        return res.status(422).json({
          error: "Idempotency key already exists with different body",
        });
      }

      if (record?.status === "COMPLETED" && record.response) {
        res.set("X-Cache-Hit", "true");
        return res
          .status(record.response.statusCode)
          .json(record.response.body);
      }

      if (record?.status === "PROCESSING") {
        await sleep(2000);
        attempts++;
        continue;
      }
    } 
    break;
  }

  if (!record) {
    const initialRecord: Record = {
      status: "PROCESSING",
      bodyHash,
    };

    await redis.set(key, JSON.stringify(initialRecord), "EX", 60);
  }

  const originalJson = res.json;

  res.json = function (data: any) {
    const isSuccess = res.statusCode >= 200 && res.statusCode < 500;

    const finalRecord: Record = {
      status: isSuccess ? "COMPLETED" : "FAILED",
      bodyHash,
      ...(isSuccess
        ? { response: { statusCode: res.statusCode, body: data } }
        : {}),
    };

    redis.set(key, JSON.stringify(finalRecord), "EX", 86400);

    return originalJson.call(this, data);
  };

  next();
};
