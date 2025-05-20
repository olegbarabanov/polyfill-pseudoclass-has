import * as fs from 'fs';
import {JSDOM} from 'jsdom';
import * as path from 'path';
import {SelectorHandler} from '..';

const globalHtml = fs.readFileSync(
  path.resolve(__dirname, './test.html'),
  'utf8'
);

const {
  window: {document},
} = new JSDOM();

document.documentElement.innerHTML = globalHtml;

const rootElementImpl = document.createElement('body');
rootElementImpl.innerHTML = document.body.innerHTML;
const documentFragmentImpl = document.createDocumentFragment();
documentFragmentImpl.append(...document.body.cloneNode(true).childNodes);

describe.each([document, rootElementImpl, documentFragmentImpl])(
  'Check query()',
  rootNode => {
    test(`querySelectorfind() 1 + NODE_TYPE ${rootNode.nodeType}`, async () => {
      const targetElement =
        rootNode.querySelector('main') ?? fail('target element not found');
      if (!targetElement) fail('target element not found');

      const selector = 'main:has(#link-to-top)';
      const result = new SelectorHandler(selector).query(rootNode);
      expect(result).not.toBeNull();
      expect(result).toBe(targetElement);
    });

    test(`query() 2 + NODE_TYPE ${rootNode.nodeType}`, async () => {
      const targetElement = rootNode.querySelector('main');
      if (!targetElement) fail('target element not found');

      const selector = 'main:has(#fake-id, #link-to-top)';
      const result = new SelectorHandler(selector).query(rootNode);
      expect(result).not.toBeNull();
      expect(result).toBe(targetElement);
    });

    test(`query() 3 + NODE_TYPE ${rootNode.nodeType}`, async () => {
      const targetElement = rootNode.querySelector('main');
      if (!targetElement) fail('target element not found');

      const selector = 'main:has(#link-to-top):has(#link-to-bottom)';
      const result = new SelectorHandler(selector).query(rootNode);
      expect(result).not.toBeNull();
      expect(result).toBe(targetElement);
    });

    test(`query() 4 + NODE_TYPE ${rootNode.nodeType}`, async () => {
      const targetElement = rootNode.querySelector('main');
      if (!targetElement) fail('target element not found');

      const selector = '#container main:has(~footer)';
      const result = new SelectorHandler(selector).query(rootNode);
      expect(result).not.toBeNull();
      expect(result).toBe(targetElement);
    });

    test(`query() 5 + NODE_TYPE ${rootNode.nodeType}`, async () => {
      const targetElement = rootNode.querySelector('header[role=banner]');
      if (!targetElement) fail('target element not found');

      const selector =
        '#container:has(#unavailable-id, #link-to-top):has(#link-to-bottom) header[role=banner]:has(+nav):has(~footer)';
      const result = new SelectorHandler(selector).query(rootNode);
      expect(result).not.toBeNull();
      expect(result).toBe(targetElement);
    });

    test(`query() 6 + NODE_TYPE ${rootNode.nodeType}`, async () => {
      const selector = 'main:has(#link-to-top) unavailable-element';
      const result = new SelectorHandler(selector).query(rootNode);
      expect(result).toBeNull();
    });

    test(`query() 7 + NODE_TYPE ${rootNode.nodeType}`, async () => {
      const targetElement = rootNode.querySelector('#container');
      if (!targetElement) fail('target element not found');

      const selector = '#container:has(~ *)';
      const result = new SelectorHandler(selector).query(rootNode);
      expect(result).not.toBeNull();
      expect(result).toBe(targetElement);
    });

    test(`query() 8 + NODE_TYPE ${rootNode.nodeType}`, async () => {
      const targetElement = rootNode.querySelector('#container');
      if (!targetElement) fail('target element not found');

      const selector = '#container:has(~ *)';
      const result = new SelectorHandler(selector).query(rootNode);
      expect(result).not.toBeNull();
      expect(result).toBe(targetElement);
    });

    test(`query() 9 + NODE_TYPE ${rootNode.nodeType}`, async () => {
      const scopeNode = rootNode.querySelector('article');
      if (!scopeNode) fail('element not found');
      const targetElement = scopeNode.querySelector('header');
      if (!targetElement) fail('target element not found');

      const selector = 'div:has(#text) header';
      const result = new SelectorHandler(selector).query(scopeNode);
      expect(result).toBe(targetElement);
    });
  }
);

describe.each([document, rootElementImpl, documentFragmentImpl])(
  'Check queryAll',
  rootNode => {
    test(`queryAll() 1 + NODE_TYPE ${rootNode.nodeType}`, async () => {
      const targetElements = rootNode.querySelectorAll('main header');
      if (targetElements.length === 0) fail('target elements not found');

      const selector = 'header:has(+:not(nav))';
      const result = new SelectorHandler(selector).queryAll(rootNode);

      expect(result).not.toBeNull();
      expect([...result]).toEqual([...targetElements]);
    });
  }
);

describe('check matches()', () => {
  test('', async () => {
    const targetElement = rootElementImpl.querySelector('main');
    if (!targetElement) fail('target element not found');

    const selector1 = 'main:has(#link-to-top)';
    const result1 = new SelectorHandler(selector1).matches(targetElement);
    expect(result1).toBeTruthy();

    const selector2 = 'main:has(#unavailable-id)';
    const result2 = new SelectorHandler(selector2).matches(targetElement);
    expect(result2).toBeFalsy();
  });

  test('top-level element', async () => {
    const selector1 = 'body:has(#link-to-top)';
    const result1 = new SelectorHandler(selector1).matches(rootElementImpl);
    expect(result1).toBeTruthy();

    const selector2 = 'body:has(#unavailable-id)';
    const result2 = new SelectorHandler(selector2).matches(rootElementImpl);
    expect(result2).toBeFalsy();
  });
});

describe('check closest()', () => {
  test('', async () => {
    const targetElement = rootElementImpl.querySelector('#link-to-top');
    if (!targetElement) fail('target element not found');

    const selector = 'body:has(#link-to-top)';
    const result = new SelectorHandler(selector).closest(targetElement);
    expect(result).toBe(rootElementImpl);
  });

  test('', async () => {
    const selector = 'body:has(#link-to-top)';
    const result = new SelectorHandler(selector).closest(rootElementImpl);
    expect(result).toBe(rootElementImpl);
  });
});

describe('check extended options', () => {
  test('check redefined CSS token (example `:has` => `:_has`)', async () => {
    const targetElement = rootElementImpl.querySelector('main');
    if (!targetElement) fail('target element not found');

    const selector1 = 'main:_has(#link-to-top)';
    const result1 = new SelectorHandler(selector1, {
      localSelectorToken: ':_has',
    }).matches(targetElement);
    expect(result1).toBeTruthy();

    const selector2 = 'main:_has(#unavailable-id)';
    const result2 = new SelectorHandler(selector2, {
      localSelectorToken: ':_has',
    }).matches(targetElement);
    expect(result2).toBeFalsy();
  });
});
