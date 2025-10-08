export interface ILogger {
  info(message: string, meta?: Record<string, any>): void;
  warn(message: string, meta?: Record<string, any>): void;
  error(message: string, error?: Error, meta?: Record<string, any>): void;
  debug(message: string, meta?: Record<string, any>): void;
  http(message: string, meta?: Record<string, any>): void;
}
