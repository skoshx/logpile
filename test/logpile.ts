import test from 'ava';
import { clone } from 'lodash-es';
import { getRandomInt, getTestLogs, testLog } from './_util';
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { getLogger, getLogObject, LogEntry } from '../src';
import { _searchLogs } from '../src/search';
import { filePersist, fileRetrieve, getLogsFromFile } from '../src/persist';
import { readFileSync, unlinkSync } from 'fs';
import { tryCatchSync } from '../src/util';
import ms from 'ms';
import { removeCirculars } from '../src/circular';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEN_LOGS = getTestLogs(10);
const MILLION_LOGS = getTestLogs(1_000_000);
const TEN_MILLION_LOGS = getTestLogs(10_000_000);

const mockError = { name: 'Bad Request' };

test.after.always('cleanup files', () => {
  tryCatchSync(() => unlinkSync(join(__dirname, 'test-log.log')));
  tryCatchSync(() => unlinkSync(join(__dirname, 'saving-logs-to-file-test.log')));
});

test('creating logs works with multiple messages', (t) => {
  const log = getLogObject(
    'info',
    'some message',
    '06eff40c-4cf8-456a-8b3c-7904a7843a92',
  );
  t.deepEqual(log, {
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'some message',
    message2: '06eff40c-4cf8-456a-8b3c-7904a7843a92',
  });
});

test('creating logs works with any object', (t) => {
  const log = getLogObject(
    'info',
    'some message',
    { error: mockError },
    'some identifier',
  );
  t.deepEqual(log, {
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'some message',
    message2: 'some identifier',
    error: mockError,
  });
});

test('saving logs to file', (t) => {
  const testFilePath = join(__dirname, 'saving-logs-to-file-test.log');
  const logger = getLogger({
    persist: [filePersist({ filePath: testFilePath })],
    retrieve: fileRetrieve({ filePath: testFilePath })
  });
  const timestamp = new Date().toISOString();
  logger.error('some error occurred', { error: mockError }, 'some id', { timestamp });

  t.deepEqual(getLogsFromFile(testFilePath), [{
    level: 'error',
    message: 'some error occurred',
    message2: 'some id',
    error: mockError,
    timestamp
  }]);
});

test.todo('saving error logs to file');
test.todo('saving warning logs to file');

test.todo('saving logs to stdout');

test('searching logs by object', (t) => {
  const testLogs = clone(MILLION_LOGS);
  testLogs.splice(getRandomInt(0, testLogs.length), 1, testLog);

  const startTime = Date.now();
  const foundLogs = _searchLogs(testLogs, { message: testLog.message });
  t.deepEqual(foundLogs, [testLog]);
  t.deepEqual(_searchLogs(testLogs, {}), []);
  t.deepEqual(_searchLogs(testLogs, []), []);
  t.log('search took', Math.floor(Date.now() - startTime), 'ms');
});

test('searching returns multiple objects', (t) => {
  const testLogs: LogEntry[] = clone(MILLION_LOGS);
  testLogs.splice(getRandomInt(0, testLogs.length), 1, testLog, testLog);

  const foundLogs = _searchLogs(testLogs, '2c356c57-42d4-41b0-a2ec-76269119a371');
  t.deepEqual(foundLogs, [testLog, testLog]);
});

test('searching logs by string', (t) => {
  const testLogs = clone(MILLION_LOGS);
  testLogs.splice(getRandomInt(0, testLogs.length), 1, testLog);

  const startTime = Date.now();
  const foundLog = _searchLogs(testLogs, testLog.message as string);
  t.deepEqual(foundLog, [testLog]);
  t.log('search took', Math.floor(Date.now() - startTime), 'ms');
});

test('searching logs by time', (t) => {
  const testLogs = clone(MILLION_LOGS);
  testLogs.splice(getRandomInt(0, testLogs.length), 1, testLog);

  const sortedLogs = testLogs.filter((log) => new Date(log.timestamp) > new Date(Date.now() - ms('1h')));
  const foundLogs = _searchLogs(testLogs, null, { time: '1h' });

  t.deepEqual(foundLogs, sortedLogs);
});

test('circulars are removed from logs', (t) => {
  const circularObject = { a: 2 } as any;
  circularObject.b = circularObject;

  const x = removeCirculars(circularObject);
  t.deepEqual(x, {
    a: 2,
    b: '[Circular]'
  });
});

test.todo('secrets are removed from logs');
