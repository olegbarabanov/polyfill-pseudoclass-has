/**
 * @file A basic set of E2E-tests running in a real browser environment.
 * ---
 * Since modern browser environments already have native support
 * for the `:has` pseudo-class, for the correct testing of the polyfill,
 * the `:has` selector is intentionally redefined to `:_has`.
 *
 * The result of the polyfill's work is then compared with the native result
 * in the browser.
 */

import {test, expect, Page} from '@playwright/test';
import path from 'path';
import {fileURLToPath} from 'url';
import type * as polyfillGlobalImport from '../../src/';
import {SelectorHandler, addTo} from '../../src/';

const dirname = fileURLToPath(new URL('.', import.meta.url));
const polyfillGlobalName = 'polyfill-pseudoclass-has' as const;

type PolyfilledWindow = typeof window &
  Record<typeof polyfillGlobalName, typeof polyfillGlobalImport>;

test.describe.configure({mode: 'serial'});
let page: Page;

test.beforeAll(async ({browser}) => {
  page = await browser.newPage();
  await page.goto('http://polyfill-pseudoclass-has:3000/tests/samples');
  await page.addScriptTag({
    path: path.resolve(dirname, '../../dist/polyfill.umd.js'),
  });

  await page.evaluate(
    ({polyfillGlobalName}) => {
      Object.assign(window, (window as PolyfilledWindow)[polyfillGlobalName]);
    },
    {polyfillGlobalName}
  );

  await page.evaluate(() => {
    addTo(Element, Document, DocumentFragment, {localSelectorToken: ':_has'});
  });
});

test.afterAll(async () => await page.close());

test.describe('test querySelector() with Document NODE', () => {
  const patterns = [
    'nav:has(a)',
    'main:has(#link-to-top):has(#link-to-bottom)',
  ];

  patterns.forEach(pattern => {
    test(`test selector with installed polyfill: ${pattern}`, async () => {
      const result = await page.evaluate(
        ({pattern}) => {
          const expected = document.querySelector(pattern);
          const actual = document.querySelector(
            pattern.replace(':has', ':_has')
          );
          return expected === actual;
        },
        {pattern}
      );
      expect(result).toBeTruthy();
    });

    test(`test selector with separate instance polyfill: ${pattern}`, async () => {
      const result = await page.evaluate(
        ({pattern}) => {
          const expected = document.querySelector(pattern);
          const actual = new SelectorHandler(pattern).query(document);
          return expected === actual;
        },
        {pattern}
      );
      expect(result).toBeTruthy();
    });
  });
});

test.describe('test querySelectorAll() & Document NODE', () => {
  const patterns = [
    'body:has(a)',
    'main:has(#link-to-top):has(#link-to-bottom)',
  ];

  patterns.forEach(pattern => {
    test(`test selector with installed polyfill: ${pattern}`, async () => {
      const result = await page.evaluate(
        ({pattern}) => {
          const expected = [...document.querySelectorAll(pattern)];
          const actual = [
            ...document.querySelectorAll(pattern.replace(':has', ':_has')),
          ];
          return (
            expected.length === actual.length &&
            expected.every((item, index) => item === actual[index])
          );
        },
        {pattern}
      );

      expect(result).toBeTruthy();
    });

    test(`test selector with separate instance polyfill: ${pattern}`, async () => {
      const result = await page.evaluate(
        ({pattern}) => {
          const expected = [...document.querySelectorAll(pattern)];
          const actual = [...new SelectorHandler(pattern).queryAll(document)];
          return (
            expected.length === actual.length &&
            expected.every((item, index) => item === actual[index])
          );
        },
        {pattern}
      );

      expect(result).toBeTruthy();
    });
  });
});

test.describe('test querySelector() & Element', () => {
  const patterns = [
    'head:has(title) ~ body a',
    'main:has(#link-to-top):has(#link-to-bottom)',
  ];

  patterns.forEach(pattern => {
    test(`test selector with installed polyfill: ${pattern}`, async () => {
      const result = await page.evaluate(
        ({pattern}) => {
          const expected = document.body.querySelector(pattern);
          const actual = document.body.querySelector(
            pattern.replace(':has', ':_has')
          );
          return expected === actual;
        },
        {pattern}
      );
      expect(result).toBeTruthy();
    });

    test(`test selector with separate instance polyfill: ${pattern}`, async () => {
      const result = await page.evaluate(
        ({pattern}) => {
          const expected = document.querySelector(pattern);
          const actual = new SelectorHandler(pattern).query(document.body);
          return expected === actual;
        },
        {pattern}
      );
      expect(result).toBeTruthy();
    });
  });
});

test.describe('test querySelectorAll() & Element', () => {
  const patterns = [
    'head:has(title) ~ body a',
    'main:has(#link-to-top):has(#link-to-bottom)',
  ];

  patterns.forEach(pattern => {
    test(`test selector with installed polyfill: ${pattern}`, async () => {
      const result = await page.evaluate(
        ({pattern}) => {
          const expected = [...document.body.querySelectorAll(pattern)];
          const actual = [
            ...document.body.querySelectorAll(pattern.replace(':has', ':_has')),
          ];
          return (
            expected.length === actual.length &&
            expected.every((item, index) => item === actual[index])
          );
        },
        {pattern}
      );

      expect(result).toBeTruthy();
    });

    test(`test selector with separate instance polyfill: ${pattern}`, async () => {
      const result = await page.evaluate(
        ({pattern}) => {
          const expected = [...document.body.querySelectorAll(pattern)];
          const actual = [
            ...new SelectorHandler(pattern).queryAll(document.body),
          ];
          return (
            expected.length === actual.length &&
            expected.every((item, index) => item === actual[index])
          );
        },
        {pattern}
      );

      expect(result).toBeTruthy();
    });
  });
});

test.describe('test querySelector() & DocumentFragment', () => {
  const patterns = [
    'nav:has(a)',
    'main:has(#link-to-top):has(#link-to-bottom)',
  ];

  patterns.forEach(pattern => {
    test(`test selector with installed polyfill: ${pattern}`, async () => {
      const result = await page.evaluate(
        ({pattern}) => {
          const documentFragment = document.createDocumentFragment();
          documentFragment.append(document.body.cloneNode(true));
          const expected = documentFragment.querySelector(pattern);
          const actual = documentFragment.querySelector(
            pattern.replace(':has', ':_has')
          );
          return expected === actual;
        },
        {pattern}
      );
      expect(result).toBeTruthy();
    });

    test(`test selector with separate instance polyfill: ${pattern}`, async () => {
      const result = await page.evaluate(
        ({pattern}) => {
          const documentFragment = document.createDocumentFragment();
          documentFragment.append(document.body.cloneNode(true));
          const expected = documentFragment.querySelector(pattern);
          const actual = new SelectorHandler(pattern).query(documentFragment);
          return expected === actual;
        },
        {pattern}
      );
      expect(result).toBeTruthy();
    });
  });
});
