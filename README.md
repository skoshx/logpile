<p align="center">
<img src="docs/hidden-secrets-logo.png" />
</p>

> 🪵 A simple & tiny logging library with supercharged search features

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/skoshx/logpile/blob/main/LICENSE.md)
[![CI](https://github.com/skoshx/hidden-secrets/actions/workflows/ci.yml/badge.svg)](https://github.com/skoshx/logpile/actions/workflows/ci.yml)
[![prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![jest](https://jestjs.io/img/jest-badge.svg)](https://github.com/facebook/jest)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/skoshx/logpile/blob/main/README.md)
[![Docs](https://paka.dev/badges/v0/cute.svg)](https://paka.dev/npm/logpile)

Logs are an integral part of building good software, especially APIs. It's important for logs to be easy to write in code, and easy to connect to some larger entity. This is where `logpile` comes in. This library is perfect for needing a versatile logger that works for anything, and that can flexibly search logs.

A perfect example is an API, where errors are logged with a reference to the users account. You can use `logpile` to search for all the error logs associated with that user, and display them to the API user.

## Install

```bash
$ yarn add logpile
```

or with npm

```bash
$ npm install --save logpile
```

## Features

- Tiny, Simple & Extendable
- Extendable output medium (stdout, file, database or custom)
- Supercharged search features (text, object, fuzzy)
- Hides sensitive values from the logs
- Fully TypeScript

## Usage

```typescript
import { createLogger } from 'logpile';

const logger = createLogger({
  persist: [consolePersist({ level: 'error' }), filePersist({})],
  retrieve: fileRetrieve({})
});

// you can pass anything to the function
logger.warn('hello world', { some: 'object' }, 'another message');
/*=> {
  timestamp: "2022-05-13T01:19:18.402Z",
  level: "warning",
  message: "hello world",
  message2: "another message",
  some: "object"
}*/

// you can search all logs with useful features
// search logs containing value 'hello world', in the last hour

/**
 * You can search all logs with useful features.
 * Search logs containing value 'hello world', from the last hour
 */
const logs = logger.searchLogs('hello world', { time: '1h' });
```

## License

`logpile` is released under the [MIT License](https://opensource.org/licenses/MIT).

## TODO

- Improved search functionality
  - Search options for time (vercel's `ms` type eg. { time: '1wk' })
  - Search where timestamp between 2 values
  - Search items can be ranges (eg. { count > 2 && count < 4 })
- Deno release
