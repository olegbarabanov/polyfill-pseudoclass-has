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

test.describe('test matches() with Element', () => {
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
          const el = document.querySelector(pattern);
          return el ? el.matches(pattern.replace(':has', ':_has')) : false;
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
          const el = document.querySelector(pattern);
          return el ? new SelectorHandler(pattern).matches(el) : false;
        },
        {pattern}
      );
      expect(result).toBeTruthy();
    });
  });
});
