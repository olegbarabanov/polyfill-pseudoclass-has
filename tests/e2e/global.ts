import path from 'path';
import {fileURLToPath} from 'url';
import type * as polyfillGlobalImport from '../../src/';
import {test as base} from '@playwright/test';
import {addTo} from '../../src/';

type PolyfilledWindow = typeof window &
  Record<typeof polyfillGlobalName, typeof polyfillGlobalImport>;

const dirname = fileURLToPath(new URL('.', import.meta.url));
const pathToPolyfill = path.resolve(dirname, '../../dist/polyfill.umd.js');
const polyfillGlobalName = 'polyfill-pseudoclass-has' as const;

const sampleWebServer = {
  protocol: process.env.SAMPLE_DEV_SERVER_PROTOCOL || 'http',
  domain: process.env.SAMPLE_DEV_SERVER_DOMAIN || 'localhost',
  port: process.env.SAMPLE_DEV_SERVER_PORT || '3000',
  path: process.env.SAMPLE_DEV_SERVER_PATH || '/tests/samples',
};

const sampleWebServerURI = new URL(
  `${sampleWebServer.protocol}://${sampleWebServer.domain}:${sampleWebServer.port}${sampleWebServer.path}`
);

// global fixture for each tests
export const test = base.extend<{forEachTest: void}>({
  forEachTest: [
    async ({page}, use) => {
      await page.goto(sampleWebServerURI.toString());
      await page.addScriptTag({path: pathToPolyfill});

      await page.evaluate(
        ({polyfillGlobalName}) => {
          Object.assign(
            window,
            (window as PolyfilledWindow)[polyfillGlobalName]
          );

          addTo(Element, Document, DocumentFragment, {
            localSelectorToken: ':_has',
          });
        },
        {polyfillGlobalName}
      );

      await use();
    },
    {auto: true}, // automatically starts for every test.
  ],
});
