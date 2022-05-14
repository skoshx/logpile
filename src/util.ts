import { LogEntry } from "../dist";
import { removeCirculars } from "./circular";
import { PersistOptions } from "./persist";
import { LogLevel } from "./types";

// Source RFC5424 (https://datatracker.ietf.org/doc/html/rfc5424#page-36)
export const logLevels = new Map([
  ['emergency', 0],
  ['alert', 1],
  ['critical', 2],
  ['error', 3],
  ['warning', 4],
  ['notice', 5],
  ['informational', 6],
  ['debug', 7]
]);

export function getLogLevelNumber(level: LogLevel) {
  return logLevels.get(level) ?? 7;
}

export const isErrorLog = (log: LogEntry) => ['emergency', 'alert', 'critical', 'error'].includes(log.level);
export const isWarningLog = (log: LogEntry) => log.level === 'warning';
export const isVerboseLog = (log: LogEntry) => ['notice', 'informational', 'debug'].includes(log.level);

/* export function logToString<T = unknown>(log: LogEntry<T>, opts: PersistOptions): LogEntry<T> {
  return removeCirculars<LogEntry<T>>(log, opts.depth);
} */


export interface TryCatchResponse<DataType, ErrorType> {
  data: DataType | null;
  error: ErrorType | null;
}

export function tryCatchSync<DataType = unknown, ErrorType = unknown>(fn: () => DataType): TryCatchResponse<DataType, ErrorType> {
  try {
    return { data: fn(), error: null };
  } catch (error) {
    return { data: null, error: error as ErrorType };
  }
}
