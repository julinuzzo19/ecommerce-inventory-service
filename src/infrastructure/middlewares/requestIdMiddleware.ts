import { Request, Response, NextFunction } from "express";
import { generateUuidV4 } from "../../utils/uuidGenerator";

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Genera un ID único para la solicitud
  const requestId = generateUuidV4();

  // Asigna a req para uso interno
  (req as any).id = requestId;

  // Opcional: agrega a headers de respuesta para trazabilidad
  res.setHeader("X-Request-ID", requestId);

  next();
};
