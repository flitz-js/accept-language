import flitz, { Flitz } from 'flitz';
import i18next from 'i18next';
import { Response } from 'supertest';
import { acceptLang } from '.';

type CreateTestAppFunc = () => Promise<Flitz>;
type Parser = (res: Response, callback: (err: Error | null, body: any) => void) => void;

declare global {
  namespace NodeJS {
    interface Global {
      /**
       * That function is ONLY available in test files!
       */
      createTestApp: CreateTestAppFunc;
      /**
       * That function is ONLY available in test files!
       */
      parseBody: Parser;
    }
  }
}

global.createTestApp = async () => {
  const app = flitz();

  return new Promise<Flitz>((resolve, reject) => {
    i18next.init({
      fallbackLng: 'de',
      supportedLngs: ['de', 'en'],
      resources: {
        de: {
          translation: {
            test: 'Ein Täst'
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
        app.use(acceptLang(t, 'de', 'en'));

        resolve(app);
      }
    });
  });
};

global.parseBody = (res, callback) => {
  let data = Buffer.alloc(0);

  res.once('error', err => {
    callback(err, null);
  });

  res.on('data', (chunk: Buffer) => {
    data = Buffer.concat([data, chunk]);
  });

  res.once('end', () => {
    callback(null, data);
  });
};
