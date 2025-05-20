import * as fs from 'fs';
import {JSDOM} from 'jsdom';
import * as path from 'path';
import {addTo, removeFrom} from '..';

const globalHtml = fs.readFileSync(
  path.resolve(__dirname, './test.html'),
  'utf8'
);

const {
  window: {document, Element, Document, DocumentFragment},
} = new JSDOM();

document.documentElement.innerHTML = globalHtml;

const rootElementImpl = document.createElement('body');
rootElementImpl.innerHTML = document.body.innerHTML;
const documentFragmentImpl = document.createDocumentFragment();
documentFragmentImpl.append(...document.body.cloneNode(true).childNodes);

describe('check addTo()', () => {
  beforeAll(() => {
    addTo(Element, Document, DocumentFragment);
  });

  afterAll(() => {
    removeFrom(Element, Document, DocumentFragment);
  });

  test('check querySelectorAll()', async () => {
    const targetElements = rootElementImpl.querySelectorAll(
      'header:has(~article)'
    );

    expect(targetElements.length).toBe(1);
  });

  test('check querySelector()', async () => {
    const targetElement = rootElementImpl.querySelector('header:has(~article)');

    expect(targetElement).toBeInstanceOf(Element);
  });

  test('check matches()', async () => {
    const targetElement = rootElementImpl.querySelector('nav');
    if (!targetElement) fail('target element not found');

    expect(targetElement.matches('div:has(ul) nav')).toBeTruthy();
  });

  test('check closest()', async () => {
    const targetElement = rootElementImpl.querySelector('div#container > nav');
    const subTargetElement = targetElement?.querySelector('nav > ul');
    if (!subTargetElement) fail('required elements not found');
    const result = subTargetElement.closest('div > nav:has(ul li):has(~main)');
    expect(result).toBe(targetElement);
  });
});

describe('check addTo() with redefined CSS token (example `:has` => `:_has`)', () => {
  beforeAll(() => {
    addTo(Element, Document, DocumentFragment, {localSelectorToken: ':_has'});
  });

  afterAll(() => {
    removeFrom(Element, Document, DocumentFragment);
  });

  test('check querySelectorAll()', async () => {
    const targetElements = rootElementImpl.querySelectorAll(
      'header:_has(~article)'
    );

    expect(targetElements.length).toBe(1);
  });

  test('check querySelector()', async () => {
    const targetElement = rootElementImpl.querySelector(
      'header:_has(~article)'
    );

    expect(targetElement).toBeInstanceOf(Element);
  });

  test('check matches()', async () => {
    const targetElement = rootElementImpl.querySelector('nav');
    if (!targetElement) fail('target element not found');

    expect(targetElement.matches('div:_has(ul) nav')).toBeTruthy();
  });

  test('check closest()', async () => {
    const targetElement = rootElementImpl.querySelector('div#container > nav');
    const subTargetElement = targetElement?.querySelector('nav > ul');
    if (!subTargetElement) fail('required elements not found');
    const result = subTargetElement.closest(
      'div > nav:_has(ul li):_has(~main)'
    );
    expect(result).toBe(targetElement);
  });
});
