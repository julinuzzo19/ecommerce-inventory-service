import { Request, Response, NextFunction } from "express";
import { generateUuidV4 } from "../../utils/uuidGenerator";

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const incoming = (req.headers["x-request-id"] as string | undefined) || undefined;

  // Reusar si viene del gateway/proxy, si no generar uno nuevo
  const requestId = (incoming && incoming.trim()) || generateUuidV4();

  (req as any).id = requestId;
  // Siempre exponer el request id en la respuesta
  res.setHeader("X-Request-ID", requestId);

  next();
};
