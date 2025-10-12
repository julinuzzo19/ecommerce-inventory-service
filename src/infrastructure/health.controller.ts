import { Request, Response } from 'express';

export class HealthController {
  /**
   * Basic health check - responde rápidamente sin verificar dependencias
   */
  public healthCheck = async (_req: Request, res: Response) => {
    return res.status(200).json({
      status: 'ok',
      service: 'inventory-service',
      timestamp: new Date().toISOString(),
    });
  };
}
