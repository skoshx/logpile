// Integration tests

import test from 'ava';
import { unlinkSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { getLogger } from '../src';
import { filePersist, fileRetrieve } from '../src/persist';
import { tryCatchSync } from '../src/util';

const mockError = { name: 'Bad Request' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test.after.always('cleanup files', () => {
  tryCatchSync(() => unlinkSync(join(__dirname, 'test-log.log')));
  tryCatchSync(() =>
    unlinkSync(join(__dirname, 'saving-logs-to-file-test.log')),
  );
  tryCatchSync(() =>
    unlinkSync(join(__dirname, 'creating-logs-searching-them.log')),
  );
});

test('creating logs & searching them', async (t) => {
  const testFilePath = join(__dirname, 'creating-logs-searching-them.log');
  const logger = getLogger({
    persist: [filePersist({ filePath: testFilePath })],
    retrieve: fileRetrieve({ filePath: testFilePath }),
  });
  const timestamp = new Date().toISOString();
  logger.error('some error occurred', { error: mockError }, 'some id', {
    timestamp,
  });
  logger.error('some error occurred', 'some id', { timestamp });

  const logs = await logger.searchLogs('some id');

  t.deepEqual(logs, [
    {
      level: 'error',
      message: 'some error occurred',
      message2: 'some id',
      error: mockError,
      timestamp,
    },
    {
      level: 'error',
      message: 'some error occurred',
      message2: 'some id',
      timestamp,
    },
  ]);
});
