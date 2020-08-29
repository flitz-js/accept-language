// Copyright 2020-present Marcel Joachim Kloubert <marcel.kloubert@gmx.net>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { CanBeNil, Middleware, Request } from 'flitz';
import { TFunction } from 'i18next';

/**
 * Options for 'acceptLang()' function.
 */
export interface AcceptLangOptions {
  /**
   * The default language or a function, that detects it by current request.
   */
  defaultLanguage: DefaultLanguageValue;
  /**
   * List of at least one supported language.
   */
  supportedLanguages: string[];
  /**
   * The optional i18 t() function to use.
   */
  t?: CanBeNil<TFunction>;
}

/**
 * A value for a default language.
 */
export type DefaultLanguageValue = DefaultLanguageDetector | string;

/**
 * A function, that detects the default language by request.
 */
export type DefaultLanguageDetector = (request: Request) => string;

/**
 * Creates a middleware, which extracts information from
 * 'Accept-Language' request header and makes them available in
 * 'lang' and 'languages' properties of request context.
 * 
 * @param {AcceptLangOptions} options The options.
 *
 * @returns {Middleware} The new middleware.
 */
export function acceptLang(options: AcceptLangOptions): Middleware {
  if (typeof options !== 'object') {
    throw new TypeError('options must be object');
  }

  if (
    typeof options.defaultLanguage !== 'string' &&
    typeof options.defaultLanguage !== 'function'
  ) {
    throw new TypeError('options.defaultLanguage must be string or function');
  }

  if (!Array.isArray(options.supportedLanguages)) {
    throw new TypeError('options.supportedLanguages must be array');
  }

  if (!options.supportedLanguages.length) {
    throw new TypeError('options.supportedLanguages must contain at least one entry');
  }

  if (!options.supportedLanguages.every(sl => typeof sl === 'string')) {
    throw new TypeError('Each entry of options.supportedLanguages must be string');
  }

  let defaultLangFunc: DefaultLanguageDetector;
  if (typeof options.defaultLanguage === 'string') {
    const defaultLang = options.defaultLanguage.toLowerCase().trim();

    defaultLangFunc = () => defaultLang;
  } else {
    defaultLangFunc = options.defaultLanguage;
  }

  // normalize
  const supportedLanguages = options.supportedLanguages.map(sl => sl.toLowerCase().trim());

  const translator = options.t;

  options = undefined as any;  // we do not need 'options' anymore here

  return async (req, res, next) => {
    let lang: false | string = false;
    req.languages = [];

    try {
      if (typeof req.headers['accept-language'] === 'string') {
        // parse 'Accept-Language' header
        // example: Accept-Language: de, en-GB;q=0.85, en;q=0.9
        const langsWithWeight = req.headers['accept-language']
          .split(',')
          .map(x => {
            let lang: string;
            let weight = 1;

            const sep = x.indexOf(';');
            if (sep > -1) {
              lang = x.substr(0, sep);

              const weightExpr = x.substr(sep + 1);
              const q = weightExpr.indexOf('q=');
              if (q > -1) {
                weight = parseFloat(weightExpr.substr(q + 2).trim());
              }
            } else {
              lang = x;
            }

            return {
              lang: lang.toLowerCase().trim(),
              weight
            };
          });

        // sort by weight (DESC)
        // and set array
        req.languages = langsWithWeight.sort((a, b) => {
          return b.weight - a.weight;  // DESC
        }).map(x => x.lang);

        // find matching language
        for (const l of req.languages) {
          if (supportedLanguages.includes(l)) {
            lang = l;
            break;
          }
        }
      }
    } catch { }

    if (typeof lang === 'string') {
      req.lang = lang;
    } else {
      req.lang = defaultLangFunc(req);
    }

    if (translator) {
      req.t = (key) => translator!(key, { lng: req.lang });
    }

    next();
  };
}
