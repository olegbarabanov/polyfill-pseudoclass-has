import {test, expect} from '@playwright/test';
import path from 'path';
import {fileURLToPath} from 'url';

const dirname = fileURLToPath(new URL('.', import.meta.url));

test.beforeEach(async ({page}) => {
  await page.goto('http://polyfill-pseudoclass-has:3000/tests/samples');
  await page.addScriptTag({
    path: path.resolve(dirname, '../../dist/polyfill.umd.js'),
  });
});

const patterns = ['nav:has(a)', 'main:has(#link-to-top):has(#link-to-bottom)'];

patterns.forEach(pattern => {
  test(`test selector ${pattern}`, async ({page}) => {
    const result = await page.evaluate((pattern) => {
      const selectorHandler = new window[
        'polyfill-pseudoclass-has'
      ].SelectorHandler(pattern);
      return (
        selectorHandler.query(document) === document.querySelector(pattern)
      );
    }, pattern);
    await expect(result).toBeTruthy();
  });
});
