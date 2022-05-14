import { appendFileSync, readFileSync, writeFileSync } from 'fs';
import { removeCirculars } from './circular';
import { LogEntry, LogLevel } from './types';
import {
  getLogLevelNumber,
  isErrorLog,
  isVerboseLog,
  isWarningLog,
  tryCatchSync,
} from './util';

export interface LogMedium<LogType = unknown> {
  persist: PersistLogFunction<LogType>[];
  retrieve: RetrievalFunction<LogType>;
}

/**
 * PersistLogFunction - A function used to store logs to some medium.
 */
export type PersistLogFunction<LogType = unknown> = (
  log: LogEntry<LogType>,
) => Promise<boolean>;

/**
 * RetrievalFunction - A function used to retrieve logs stored by a `PersistLogFunction`.
 * The same options that are passed to the `PersistLogFunction` are passed to this function.
 */
export type RetrievalFunction<LogType = unknown> = () => Promise<
  LogEntry<LogType>[]
>;

export interface PersistOptions {
  /**
   * The level to start logging for, if the level is lower than this,
   * the persist function will be skipped.
   */
  level?: LogLevel;
  /**
   * The depth of the allowed objects when removing possible circular
   * references from the log objects. Maximum value is 10.
   */
  depth?: number;
}

export function consolePersist<T = unknown>(
  opts: PersistOptions = {},
): PersistLogFunction<T> {
  return async (log: LogEntry<T>) => {
    const logLevelNumber = getLogLevelNumber(log.level);
    if (logLevelNumber > getLogLevelNumber(opts.level ?? 'debug')) return false;
    if (logLevelNumber < 4) {
      console.error(log);
    } else if (logLevelNumber === 4) {
      console.warn(log);
    } else {
      console.log(log);
    }
    return true;
  };
}

export function filePersist<T = unknown>(
  opts: FilePersistOptions = {},
): PersistLogFunction<T> {
  return async (log: LogEntry<T>) => {
    const logLevelNumber = getLogLevelNumber(log.level);
    if (logLevelNumber > getLogLevelNumber(opts?.level ?? 'debug'))
      return false;

    if (opts.errorFilePath && isErrorLog(log))
      appendFileSync(
        opts.errorFilePath,
        JSON.stringify(removeCirculars(log, opts.depth)) + '\n',
        'utf-8',
      );
    if (opts.verboseFilePath && isVerboseLog(log))
      appendFileSync(
        opts.verboseFilePath,
        JSON.stringify(removeCirculars(log, opts.depth)) + '\n',
        'utf-8',
      );
    if (opts.warningFilePath && isWarningLog(log))
      appendFileSync(
        opts.warningFilePath,
        JSON.stringify(removeCirculars(log, opts.depth)) + '\n',
        'utf-8',
      );
    if (opts.filePath)
      appendFileSync(
        opts.filePath,
        JSON.stringify(removeCirculars(log, opts.depth)) + '\n',
        'utf-8',
      );
    return true;
  };
}

interface FilePersistOptions extends PersistOptions {
  verboseFilePath?: string;
  errorFilePath?: string;
  warningFilePath?: string;
  /**
   * The path of the log file where all logs will be placed.
   *
   * **Note:** Do not use this if you are using `verboseFilePath`, `errorFilePath` or `warningFilePath`,
   * as that will lead to duplicate logs when searching & retrieving the logs the logs.
   */
  filePath?: string;
}

export function getLogsFromFile<T = unknown>(filePath: string): LogEntry<T>[] {
  const { data: file, error } = tryCatchSync(() =>
    readFileSync(filePath, 'utf-8'),
  );
  if (error || !file) return [];
  // @ts-ignore
  return file
    .split('\n')
    .map((line) => {
      const { data: parsed, error } = tryCatchSync(() => JSON.parse(line));
      if (error) return null;
      return parsed as LogEntry<T>;
    })
    .filter((log) => log !== null);
}

export function fileRetrieve<T = unknown>(
  opts: FilePersistOptions = {},
): RetrievalFunction<T> {
  return async () => {
    const logs: LogEntry<T>[] = [];

    if (opts.errorFilePath)
      logs.push(...getLogsFromFile<T>(opts.errorFilePath));
    if (opts.verboseFilePath)
      logs.push(...getLogsFromFile<T>(opts.verboseFilePath));
    if (opts.warningFilePath)
      logs.push(...getLogsFromFile<T>(opts.warningFilePath));
    if (opts.filePath) logs.push(...getLogsFromFile<T>(opts.filePath));

    return logs;
  };
}
