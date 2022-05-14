import { find } from 'lodash-es';

const objectFindFunction = (value, search, options) => {
  if (options?.shallow) return value === search;
  if (typeof value === 'object') return objectFindFunction(value, options);
  return value === search;
};
export function searchByString(logs, search, options) {
  const foundLog = find(logs, (log) => {
    return find(log, (value) => {
      return objectFindFunction(value, search, options);
    });
  });
  console.log('FOUND LOG ');
  console.log(foundLog);
  return null;
}

const search = [
  {
    timestamp: new Date().toISOString(),
    level: 'error',
    hello: 'team',
    message: 'some uuid',
  },
];

searchByString(search, 'some uuid');
