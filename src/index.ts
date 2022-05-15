import { LogMedium } from './persist';
import { _searchLogs } from './search';
import { LogEntry, LogLevel, TypeOrPrimitives, SearchOptions } from './types';

export function getLogObject<T = unknown>(
  level: LogLevel,
  ...args: TypeOrPrimitives<T>[]
): LogEntry<T> {
  let index = 0;
  const argsToObject = args.reduce((prev, current) => {
    if (typeof current === 'string') index++;
    return typeof current === 'string'
      ? { ...prev, [`message${index === 1 ? '' : index}`]: current }
      : // @ts-ignore
        { ...prev, ...current };
  }, {});
  // @ts-ignore
  return {
    timestamp: new Date().toISOString(),
    level,
    ...argsToObject,
  };
}

/*
Source RFC5424 (https://datatracker.ietf.org/doc/html/rfc5424#page-36)

0       Emergency: system is unusable
1       Alert: action must be taken immediately
2       Critical: critical conditions
3       Error: error conditions
4       Warning: warning conditions
5       Notice: normal but significant condition
6       Informational: informational messages
7       Debug: debug-level messages
*/

/**
 * A function used to get `logpile` logger object containing all the logging
 * & search functions.
 *
 * @example
 * ```javascript
 * // An example logger that logs error & higher severity logs into stdout and logs
 * // everything to a file. That file is also used to perform searching.
 * const logger = getLogger({
 *   persist: [consolePersist({ level: 'error' }), filePersist({ file: `/etc/logs/app-logs.log` })],
 *   retrieve: fileRetrieve({ file: `/etc/logs/app-logs.log` })
 * });
 *
 * // log errors
 * logger.error('an error occurred while completing your action', { error }, 'you can pass in anything');
 * ```
 *
 * @param medium The medium object defines how logs are stored & retrieved.
 * @returns The log & search functions
 */
export function getLogger<LogType = unknown>(medium: LogMedium<LogType>) {
  const persistFunctions = medium.persist;
  const retrieveFunction = medium.retrieve;

  function persist(level: LogLevel, ...args: TypeOrPrimitives<LogType>[]) {
    const logObject: LogEntry<LogType> = getLogObject(level, ...args);
    // run through all the `persist` functions
    for (let i = 0; i < persistFunctions.length; i++) {
      persistFunctions[i](logObject);
    }
  }

  // Logging functions
  const emergency = (...args: TypeOrPrimitives<LogType>[]) =>
    persist('emergency', ...args);
  const emerg = (...args: TypeOrPrimitives<LogType>[]) =>
    persist('emergency', ...args);
  const alert = (...args: TypeOrPrimitives<LogType>[]) =>
    persist('alert', ...args);
  const critical = (...args: TypeOrPrimitives<LogType>[]) =>
    persist('critical', ...args);
  const crit = (...args: TypeOrPrimitives<LogType>[]) =>
    persist('critical', ...args);
  const error = (...args: TypeOrPrimitives<LogType>[]) =>
    persist('error', ...args);
  const err = (...args: TypeOrPrimitives<LogType>[]) =>
    persist('error', ...args);
  const notice = (...args: TypeOrPrimitives<LogType>[]) =>
    persist('notice', ...args);
  const info = (...args: TypeOrPrimitives<LogType>[]) =>
    persist('info', ...args);
  const debug = (...args: TypeOrPrimitives<LogType>[]) =>
    persist('debug', ...args);

  // Searching functions

  async function searchLogs(
    search: Partial<LogType>,
    options?: Partial<SearchOptions>,
  ): Promise<LogEntry<LogType>[]>;
  async function searchLogs(
    search: string,
    options?: Partial<SearchOptions>,
  ): Promise<LogEntry<LogType>[]>;
  async function searchLogs(
    search: string | Partial<LogType>,
    options?: Partial<SearchOptions>,
  ): Promise<LogEntry<LogType>[]> {
    const logs = await retrieveFunction();
    return _searchLogs<LogType>(logs, search, options);
  }

  return {
    persist,
    emergency,
    emerg,
    alert,
    critical,
    crit,
    error,
    err,
    notice,
    info,
    debug,
    searchLogs,
  };
}

// Export types
export * from './types';
export * from './persist';
export * from './util';
