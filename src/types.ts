import { StringValue } from 'ms';

export type LogLevel =
  | 'emergency'
  | 'alert'
  | 'critical'
  | 'error'
  | 'warning'
  | 'notice'
  | 'info'
  | 'debug';

export type LogEntry<T = unknown> = {
  timestamp: string;
  level: LogLevel;
  [key: string]: Partial<T> | Primitives;
} & Partial<T>;

export type Primitives =
  | string
  | number
  | bigint
  | boolean
  | undefined
  | symbol
  | null;

export type TypeOrPrimitives<T = unknown> = T | Primitives;

export interface SearchOptions {
  /**
   * Search only the object's top level. Use this if you have nested logs but want faster performance,
   * and know what you are looking for is in the object's top level.
   */
  shallow: boolean;
  /**
   * Returns logs that have occurred withing `time` amount before now. For example, to get all logs
   * from one hour ago to now, use `{ time: '1h' }`
   * A time string defined by Vercel's `ms` package.
   *
   * @example
   * ```javascript
   * // Search logs containing value `some identifier` that have happened in the last hour
   * const logsFromLastHour = logger.searchLogs('some identifier', { time: '1h' });
   * console.log(logsFromLastHour);
   * ```
   */
  time: StringValue;
}
