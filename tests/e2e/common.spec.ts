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

test.describe('test querySelector() & Document NODE', () => {
  const patterns = [
    'nav:has(a)',
    'main:has(#link-to-top):has(#link-to-bottom)',
  ];

  patterns.forEach(pattern => {
    test(`test selector with installed polyfill ${pattern}`, async () => {
      const result = await page.evaluate(
        ({pattern}) =>
          document.querySelector(pattern) ===
          document.querySelector(pattern.replace(':has', ':_has')),
        {pattern}
      );
      expect(result).toBeTruthy();
    });

    test(`test selector with separate instance polyfill ${pattern}`, async () => {
      const result = await page.evaluate(
        ({pattern}) =>
          document.querySelector(pattern) ===
          new SelectorHandler(pattern).query(document),
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
    test(`test selector with installed polyfill ${pattern}`, async () => {
      const result = await page.evaluate(
        ({pattern}) => {
          const src = [...document.querySelectorAll(pattern)];
          const eq = [
            ...document.querySelectorAll(pattern.replace(':has', ':_has')),
          ];
          return (
            src.length === eq.length &&
            src.every((item, index) => item === eq[index])
          );
        },
        {pattern}
      );

      expect(result).toBeTruthy();
    });

    test(`test selector with separate instance polyfill ${pattern}`, async () => {
      const result = await page.evaluate(
        ({pattern}) => {
          const src = [...document.querySelectorAll(pattern)];
          const eq = [...new SelectorHandler(pattern).queryAll(document)];
          // return [src.length, eq.length];
          return (
            src.length === eq.length &&
            src.every((item, index) => item === eq[index])
          );
        },
        {pattern}
      );

      expect(result).toBeTruthy();
    });
  });
});
