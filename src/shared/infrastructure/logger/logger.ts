import winston from "winston";
import path from "path";
import { ILogger } from "../../domain/ILogger.js";

export enum LogLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  HTTP = "http",
  DEBUG = "debug",
}

// Una sola clase que maneja todo
export class WinstonLogger implements ILogger {
  private static sharedLogger: winston.Logger;
  private context: string;

  constructor(context: string = "Application") {
    this.context = context;

    // Crear logger compartido solo una vez
    if (!WinstonLogger.sharedLogger) {
      WinstonLogger.sharedLogger = this.createLogger();
    }
  }

  private createLogger(): winston.Logger {
    const isProduction = process.env.NODE_ENV === "production";
    const logDir = "logs";

    // Formato para desarrollo - más legible
    const devFormat = winston.format.printf(({ timestamp, level, message, stack, context, ...meta }) => {
      // Colores para mejor visualización
      const levelColors = {
        error: "🔴",
        warn: "🟡",
        info: "🔵",
        http: "🟢",
        debug: "⚪",
      };

      const icon = levelColors[level as keyof typeof levelColors] || "⚪";
      const time = new Date().toLocaleTimeString("es-ES", { hour12: false });
      let log = `${icon} ${time} [${level.toUpperCase()}]`;

      if (context) {
        //   log += ` [${context}]`;
      }

      log += `: ${message}`;

      // Formatear metadata de forma más legible (sin JSON en desarrollo)
      const { context: _, ...cleanMeta } = meta;
      if (Object.keys(cleanMeta).length > 0) {
        // Para logs HTTP, formato estilo Morgan
        if (level === "http") {
          const { method, url, statusCode, duration, ip, requestId } = cleanMeta;
          const msgStr = String(message);

          if (msgStr.includes("Request received")) {
            // Formato para request entrante
            log = `🟢 ${time} ${method} ${url}`;
          } else if (msgStr.includes("Request completed")) {
            // Formato para request completado (estilo Morgan)
            const status = Number(statusCode);
            const statusColor = status >= 400 ? "🔴" : status >= 300 ? "🟡" : "🟢";
            log = `${time} ${statusCode} ${method} ${url} ${duration}`;
          } else {
            // Fallback para otros logs HTTP
            const metaString = Object.entries(cleanMeta)
              .map(([key, value]) => `${key}=${value}`)
              .join(", ");
            log += ` | ${metaString}`;
          }
        } else {
          // Para otros logs, mantener formato multi-línea
          log += "\n";
          Object.entries(cleanMeta).forEach(([key, value]) => {
            log += `    ${key}: ${value}\n`;
          });
          log = log.trimEnd(); // Remover última nueva línea
        }
      }

      if (stack) {
        log += `\n   💥 ${String(stack).replace(/\n/g, "\n   ")}`;
      }

      return log;
    });

    // Formato para producción - compacto
    const prodFormat = winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.errors({ stack: true }),
      winston.format.printf(({ timestamp, level, message, stack, context, ...meta }) => {
        let log = `${timestamp} [${level.toUpperCase()}]`;

        if (context) {
          log += ` [${context}]`;
        }

        log += `: ${message}`;

        const { context: _, ...cleanMeta } = meta;
        if (Object.keys(cleanMeta).length > 0) {
          log += ` ${JSON.stringify(cleanMeta)}`;
        }

        if (stack) {
          log += `\n${stack}`;
        }

        return log;
      }),
    );

    const consoleFormat = isProduction ? prodFormat : devFormat;

    const transports: winston.transport[] = [];

    // Solo agregar consola en desarrollo
    if (!isProduction) {
      transports.push(
        new winston.transports.Console({
          level: "debug",
          format: consoleFormat,
        }),
      );
    }

    if (isProduction) {
      transports.push(
        new winston.transports.File({
          filename: path.join(logDir, "error.log"),
          level: "error",
          format: winston.format.combine(winston.format.json(), winston.format.timestamp()),
          maxsize: 5242880,
          maxFiles: 5,
        }),
        new winston.transports.File({
          filename: path.join(logDir, "combined.log"),
          level: "http", // ✅ Incluir logs HTTP en archivo
          format: winston.format.combine(winston.format.json(), winston.format.timestamp()),
          maxsize: 5242880,
          maxFiles: 5,
        }),
      );
    }

    return winston.createLogger({
      level: isProduction ? "http" : "debug", // ✅ Cambiar nivel global para incluir HTTP
      format: consoleFormat,
      transports,
      exitOnError: false,
    });
  }

  info(message: string, meta: Record<string, any> = {}): void {
    WinstonLogger.sharedLogger.info(message, {
      context: this.context,
      ...meta,
    });
  }

  warn(message: string, meta: Record<string, any> = {}): void {
    WinstonLogger.sharedLogger.warn(message, {
      context: this.context,
      ...meta,
    });
  }

  error(message: string, error?: Error, meta: Record<string, any> = {}): void {
    WinstonLogger.sharedLogger.error(message, {
      context: this.context,
      error: error?.message,
      stack: error?.stack,
      ...meta,
    });
  }

  debug(message: string, meta: Record<string, any> = {}): void {
    WinstonLogger.sharedLogger.debug(message, {
      context: this.context,
      ...meta,
    });
  }

  http(message: string, meta: Record<string, any> = {}): void {
    WinstonLogger.sharedLogger.http(message, {
      context: this.context,
      ...meta,
    });
  }
}

export const createLogger = (context: string): ILogger => {
  return new WinstonLogger(context);
};
