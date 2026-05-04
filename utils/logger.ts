/**
 * Multi-level logger utility for Playwright tests.
 * Supports DEBUG, INFO, WARN, ERROR levels with timestamps.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const LOG_LEVEL_LABELS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: "DEBUG",
  [LogLevel.INFO]: " INFO",
  [LogLevel.WARN]: " WARN",
  [LogLevel.ERROR]: "ERROR",
};

const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: "\x1b[36m", // Cyan
  [LogLevel.INFO]: "\x1b[32m",  // Green
  [LogLevel.WARN]: "\x1b[33m",  // Yellow
  [LogLevel.ERROR]: "\x1b[31m", // Red
};

const RESET_COLOR = "\x1b[0m";

class Logger {
  private currentLevel: LogLevel;
  private context: string;

  constructor(context: string = "Test", level: LogLevel = LogLevel.DEBUG) {
    this.context = context;
    // Allow overriding log level via env variable (e.g. LOG_LEVEL=WARN)
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    if (envLevel && LogLevel[envLevel as keyof typeof LogLevel] !== undefined) {
      this.currentLevel = LogLevel[envLevel as keyof typeof LogLevel];
    } else {
      this.currentLevel = level;
    }
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    const color = LOG_LEVEL_COLORS[level];
    const label = LOG_LEVEL_LABELS[level];
    return `${color}[${timestamp}] [${label}] [${this.context}] ${message}${RESET_COLOR}`;
  }

  private log(level: LogLevel, message: string, ...args: unknown[]): void {
    if (level < this.currentLevel) return;

    const formatted = this.formatMessage(level, message);
    const extra = args.length > 0 ? " " + JSON.stringify(args, null, 2) : "";

    switch (level) {
      case LogLevel.ERROR:
        console.error(formatted + extra);
        break;
      case LogLevel.WARN:
        console.warn(formatted + extra);
        break;
      default:
        console.log(formatted + extra);
    }
  }

  debug(message: string, ...args: unknown[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    this.log(LogLevel.ERROR, message, ...args);
  }

  /** Create a child logger with a more specific context */
  child(subContext: string): Logger {
    return new Logger(`${this.context}::${subContext}`, this.currentLevel);
  }
}

/** Factory – creates a named logger for a given context (e.g. page class name) */
export function createLogger(context: string): Logger {
  return new Logger(context);
}

/** Default root logger */
export const logger = new Logger("Root");
