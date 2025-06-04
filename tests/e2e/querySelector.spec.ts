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

import {expect} from '@playwright/test';
import {SelectorHandler} from '../../src/';
import {test} from './global';

test.describe('test querySelector() with Document NODE', () => {
  const patterns = [
    'nav:has(a)',
    'main:has(#link-to-top):has(#link-to-bottom)',
  ];

  patterns.forEach(pattern => {
    test(`test selector with installed polyfill: ${pattern}`, async ({
      page,
    }) => {
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

    test(`test selector with separate instance polyfill: ${pattern}`, async ({
      page,
    }) => {
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

test.describe('test querySelector() & Element', () => {
  const patterns = [
    'head:has(title) ~ body a',
    'main:has(#link-to-top):has(#link-to-bottom)',
  ];

  patterns.forEach(pattern => {
    test(`test selector with installed polyfill: ${pattern}`, async ({
      page,
    }) => {
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

    test(`test selector with separate instance polyfill: ${pattern}`, async ({
      page,
    }) => {
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

test.describe('test querySelector() & DocumentFragment', () => {
  const patterns = [
    'nav:has(a)',
    'main:has(#link-to-top):has(#link-to-bottom)',
  ];

  patterns.forEach(pattern => {
    test(`test selector with installed polyfill: ${pattern}`, async ({
      page,
    }) => {
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

    test(`test selector with separate instance polyfill: ${pattern}`, async ({
      page,
    }) => {
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
