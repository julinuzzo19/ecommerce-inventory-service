import { Request, Response, NextFunction } from 'express';
import { GATEWAY_SECRET } from '../../config/envs';

/**
 * Detecta si la request viene del API Gateway comparando
 * el header 'x-gateway-secret' con la variable de entorno GATEWAY_SECRET.
 * Establece (req as any).isFromGateway = true|false para uso posterior.
 */
export const gatewayDetectionMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const gatewaySecretEnv = GATEWAY_SECRET;

  // Node/Express normaliza los headers a lowercase
  const gatewayHeader =
    (req.headers['x-gateway-secret'] as string | undefined) || undefined;

  if (gatewayHeader !== gatewaySecretEnv) {
    res.status(403).json({ message: 'Forbidden: Invalid gateway secret' });
    return;
  }

  next();
};
