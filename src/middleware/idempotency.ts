import type { Request, Response, NextFunction } from "express";

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

  next();
};
