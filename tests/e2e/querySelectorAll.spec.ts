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

test.describe('test querySelectorAll() & Document NODE', () => {
  const patterns = [
    'body:has(a)',
    'main:has(#link-to-top):has(#link-to-bottom)',
  ];

  patterns.forEach(pattern => {
    test(`test selector with installed polyfill: ${pattern}`, async ({
      page,
    }) => {
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

    test(`test selector with separate instance polyfill: ${pattern}`, async ({
      page,
    }) => {
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

test.describe('test querySelectorAll() & Element', () => {
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

    test(`test selector with separate instance polyfill: ${pattern}`, async ({
      page,
    }) => {
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

test.describe('test querySelectorAll() & DocumentFragment', () => {
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
          const expected = [...documentFragment.querySelectorAll(pattern)];
          const actual = [
            ...documentFragment.querySelectorAll(
              pattern.replace(':has', ':_has')
            ),
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

    test(`test selector with separate instance polyfill: ${pattern}`, async ({
      page,
    }) => {
      const result = await page.evaluate(
        ({pattern}) => {
          const documentFragment = document.createDocumentFragment();
          documentFragment.append(document.body.cloneNode(true));
          const expected = [...documentFragment.querySelectorAll(pattern)];
          const actual = [
            ...new SelectorHandler(pattern).queryAll(documentFragment),
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
