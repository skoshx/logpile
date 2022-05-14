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
