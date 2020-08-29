[![npm](https://img.shields.io/npm/v/@flitz/accept-language.svg)](https://www.npmjs.com/package/@flitz/accept-language) [![supported flitz version](https://img.shields.io/static/v1?label=flitz&message=0.14.0%2B&color=blue)](https://github.com/flitz-js/flitz) [![last build](https://img.shields.io/github/workflow/status/flitz-js/accept-language/Publish)](https://github.com/flitz-js/accept-language/actions?query=workflow%3APublish) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/flitz-js/accept-language/pulls)

# @flitz/accept-language

> Extracts data from [Accept-Language](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language) request header field and makes it available in a [flitz](https://github.com/flitz-js/flitz) request.

## Install

Run

```bash
npm install --save @flitz/accept-language
```

from the folder, where your `package.json` is stored.

## Usage

```javascript
const flitz = require('flitz');
const acceptLang = require('@flitz/accept-language');

const run = async () => {
  const app = flitz();

  //        👇👇👇
  app.use(acceptLang({
    defaultLanguage: 'de',
    supportedLanguages: ['de', 'en']
  }));

  app.get('/', async (req, res) => {
    res.write('Language information: ' + JSON.stringify([
      req.lang,  // selected language, based on submitted languages
      req.languages  // array of submitted languages
    ]));
    res.end();
  });

  await app.listen(3000);
};

run();
```

Or the TypeScript way:

```typescript
import flitz from 'flitz';
import { acceptLang } from '@flitz/accept-language';

const run = async () => {
  const app = flitz();

  //        👇👇👇
  app.use(acceptLang({
    defaultLanguage: 'de',
    supportedLanguages: ['de', 'en']
  }));

  app.get('/', async (req, res) => {
    res.write('Language information: ' + JSON.stringify([
      req.lang,  // selected language, based on submitted languages
      req.languages  // array of submitted languages
    ]));
    res.end();
  });

  await app.listen(3000);
};

run();
```

### Translations

```typescript
import flitz from 'flitz';
import i18next, { TFunction } from 'i18next';
import { acceptLang } from '@flitz/accept-language';

const run = async () => {
  const app = flitz();

  app.use(acceptLang({
    // set t() function (s. below)
    t: await initI18(),

    defaultLanguage: 'de',
    supportedLanguages: ['de', 'en']
  }));

  app.get('/', async (req, res) => {
    res.write('String: ' + req.t!('test'));  // use t() function in req
    res.end();
  });

  await app.listen(3000);
};

const initI18 = () => {
  return new Promise<TFunction>((resolve, reject) => {
    i18next.init({
      fallbackLng: 'de',
      supportedLngs: ['de', 'en'],
      resources: {
        de: {
          translation: {
            test: 'Ein Test'
          }
        },
        en: {
          translation: {
            test: 'A test'
          }
        }
      }
    }, (err, t) => {
      if (err) {
        reject(err);
      } else {
        resolve(t);
      }
    });
  });
};
```

## Credits

The module makes use of:

* [i18next](https://github.com/i18next/i18next)
