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

test.describe('test closest() with Element', () => {
  const selectors: Array<[srcElementSelector: string, testSelector: string]> = [
    ['a[href="#text__lists"]', 'nav:has(ul)'],
    ['a[href="#text__lists"]', '*:has(nav)'],
  ];

  selectors.forEach(selector => {
    test(`test selector with installed polyfill: ${selector}`, async ({
      page,
    }) => {
      const result = await page.evaluate(
        ([srcElementSelector, testSelector]) => {
          const srcElement = document.querySelector(srcElementSelector);
          if (!srcElement) return false;

          const expected = srcElement.closest(testSelector);
          const actual = srcElement.closest(
            testSelector.replace(':has', ':_has')
          );
          return expected && expected === actual;
        },
        [...selector]
      );
      expect(result).toBeTruthy();
    });

    test(`test selector with separate instance polyfill: ${selector}`, async ({
      page,
    }) => {
      const result = await page.evaluate(
        ([srcElementSelector, testSelector]) => {
          const srcElement = document.querySelector(srcElementSelector);
          if (!srcElement) return false;

          const expected = srcElement.closest(testSelector);
          const actual = new SelectorHandler(testSelector).closest(srcElement);

          return expected && expected === actual;
        },
        [...selector]
      );
      expect(result).toBeTruthy();
    });
  });
});
