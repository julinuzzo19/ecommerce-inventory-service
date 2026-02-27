import { Request, Response, NextFunction } from 'express';
import { ILogger } from '../../shared/domain/ILogger';

export const loggingMiddleware = (logger: ILogger) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();
    const { method, url, ip } = req;
    const requestId = (req as any).id;

    logger.http('Request received', { method, url, ip, requestId });

    res.on('finish', () => {
      const duration = `${Date.now() - start}ms`;
      const { statusCode } = res;

      logger.http('Request completed', {
        method,
        url,
        statusCode,
        duration,
        ip,
        requestId,
      });
    });

    next();
  };
};
