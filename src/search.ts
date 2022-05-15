import { filter, isEqual, pick } from 'lodash-es';
import { LogEntry, SearchOptions } from './types';
import ms, { StringValue } from 'ms';

const isObject = (obj: any) =>
  obj && typeof obj === 'object' && !Array.isArray(obj);

function searchMatchesTree<T = unknown>(tree: T, search: object): boolean {
  if (Object.keys(search ?? {}).length === 0) return false;
  const pickedValues = pick(tree, Object.keys(search ?? {}));
  return isEqual(pickedValues, search);
}

export function searchTree<T = unknown>(
  tree: T,
  search: string | object,
  options?: Partial<SearchOptions>,
): T | null {
  if (isEqual(tree, search)) return tree;
  if (typeof search === 'object' && searchMatchesTree(tree, search as object))
    return tree;

  const keys = Object.keys(tree);
  let result = null;
  for (let i = 0; i < keys.length && !result; i++) {
    // @ts-ignore
    const value = tree[keys[i]];
    if (isEqual(value, search)) result = tree;
    if (typeof search === 'object' && searchMatchesTree(tree, search as object))
      result = tree;
    if (result === null && isObject(value) && !options?.shallow)
      result = searchTree(value, search);
    if (result === null && Array.isArray(value) && !options?.shallow) {
      for (let i = 0; i < value.length; i++) {
        result = searchTree(value[i], search);
        if (result) break;
      }
    }
  }
  return result;
}

export function _searchLogs<T = unknown>(
  logs: LogEntry<T>[],
  search: string | Partial<T> | null,
  options?: Partial<SearchOptions>,
): LogEntry<T>[] {
  let foundLogs: LogEntry<T>[] = [];

  if (search) {
    // @ts-ignore - filter for search
    foundLogs = filter<LogEntry<T>[]>(logs, (log: LogEntry<T>) =>
      searchTree<LogEntry<T>>(log, search, options),
    );
  }

  if (options?.time) {
    // @ts-ignore - filter for time
    foundLogs = filter<LogEntry<T>[]>(
      logs,
      (log: LogEntry<T>) =>
        new Date(log.timestamp) >
        new Date(Date.now() - ms(options.time as StringValue)),
    );
  }

  return foundLogs ?? [];
}
