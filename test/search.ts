import test from 'ava';
import { searchTree } from '../src/search';

const searchFixture = {
  a: 2,
  hello: 'team',
  nested: {
    data: {
      method: 'post',
      headers: {
        Authorization: `Bearer token`,
        'X-Request-Time': '123',
      },
    },
  },
};

test('search tree works with object', (t) => {
  t.deepEqual(searchTree(searchFixture, { method: 'post' }), {
    ...searchFixture.nested.data,
  });
});

test('search tree works with string', (t) => {
  t.deepEqual(searchTree(searchFixture, `Bearer token`), {
    ...searchFixture.nested.data.headers,
  });
});

test('search tree works with shallow search', (t) => {
  // string search
  t.deepEqual(
    searchTree(searchFixture, 'team', { shallow: true }),
    searchFixture,
  );
  t.deepEqual(searchTree(searchFixture, 'post', { shallow: true }), null);
  // object search
  t.deepEqual(
    searchTree(searchFixture, { hello: 'team' }, { shallow: true }),
    searchFixture,
  );
  t.deepEqual(
    searchTree(searchFixture, { method: 'post' }, { shallow: true }),
    null,
  );
});
