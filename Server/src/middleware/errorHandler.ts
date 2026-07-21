import { Request, Response, NextFunction } from "express";

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  console.error(`[Error] ${req.method} ${req.path}:`, err.message);
  res.status(500).json({ message: err.message || "Internal server error" });
}
