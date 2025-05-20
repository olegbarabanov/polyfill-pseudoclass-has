import {SelectorHandler} from './selector-handler';
import {
  selectorHandlerOptionsSymbol,
  nativeClosestSymbol,
  nativeMatchesSymbol,
  nativeQuerySelectorAllSymbol,
  nativeQuerySelectorSymbol,
} from './symbols';
import {ExtElement, ExtNode, SelectorHandlerOptions} from './types';
import {isElementNode, isDocumentFragmentNode, isDocumentNode} from './utils';

/**
 * Installing polyfill in the browser globalThis
 */
export function addToBrowser() {
  addTo(globalThis.Element, globalThis.Document, globalThis.DocumentFragment);
}

/**
 * Uninstalling polyfill in the browser globalThis
 */
export function removeFromBrowser() {
  removeFrom(
    globalThis.Element,
    globalThis.Document,
    globalThis.DocumentFragment
  );
}

/**
 * Installing of polyfill in global Element & Document & DocumentFragment nodes
 *
 * @param Element Element - base class
 * @param Document Document - base class
 * @param DocumentFragment DocumentFragment - base class
 * @param selectorHandlerOptions - Additional options that will be passed to the handler (SelectorHandler) when called
 */

export function addTo(
  Element: {
    new (...args: unknown[]): Element & ExtElement & ExtNode;
    prototype: Element & ExtElement & ExtNode;
  },
  Document: {
    new (...args: unknown[]): Document & ExtNode;
    prototype: Document & ExtNode;
  },
  DocumentFragment: {
    new (...args: unknown[]): DocumentFragment & ExtNode;
    prototype: DocumentFragment & ExtNode;
  },
  selectorHandlerOptions: SelectorHandlerOptions = {}
) {
  for (const nodePrototype of [Element, Document, DocumentFragment]) {
    nodePrototype.prototype[nativeQuerySelectorSymbol] =
      nodePrototype.prototype.querySelector;
    nodePrototype.prototype[nativeQuerySelectorAllSymbol] =
      nodePrototype.prototype.querySelectorAll;

    nodePrototype.prototype[selectorHandlerOptionsSymbol] =
      selectorHandlerOptions;

    nodePrototype.prototype.querySelector = function (
      ...params: Parameters<ParentNode['querySelector']>
    ): ReturnType<ParentNode['querySelector']> {
      if (
        !isElementNode(this) &&
        !isDocumentNode(this) &&
        !isDocumentFragmentNode(this)
      ) {
        throw new Error('illegable invoke');
      }

      const [selector] = params;

      return new SelectorHandler(
        selector,
        this[selectorHandlerOptionsSymbol]
      ).query(this);
    };

    nodePrototype.prototype.querySelectorAll = function (
      ...params: Parameters<ParentNode['querySelectorAll']>
    ): ReturnType<ParentNode['querySelectorAll']> {
      if (
        !isElementNode(this) &&
        !isDocumentNode(this) &&
        !isDocumentFragmentNode(this)
      ) {
        throw new Error('illegable invoke');
      }

      const [selector] = params;

      return new SelectorHandler(
        selector,
        this[selectorHandlerOptionsSymbol]
      ).queryAll(this);
    };
  }

  Element.prototype[nativeClosestSymbol] = Element.prototype.closest;
  Element.prototype[nativeMatchesSymbol] = Element.prototype.matches;

  Element.prototype.closest = function (
    ...params: Parameters<Element['closest']>
  ): ReturnType<Element['closest']> {
    if (!isElementNode(this)) throw new Error('illegable invoke');

    const [selector] = params;

    return new SelectorHandler(
      selector,
      this[selectorHandlerOptionsSymbol]
    ).closest(this);
  };

  Element.prototype.matches = function (
    ...params: Parameters<Element['matches']>
  ): ReturnType<Element['matches']> {
    if (!isElementNode(this)) throw new Error('illegable invoke');

    const [selector] = params;

    return new SelectorHandler(
      selector,
      this[selectorHandlerOptionsSymbol]
    ).matches(this);
  };
}

/**
 * Uninstalling of polyfill from global Element & Document & DocumentFragment nodes
 *
 * @param Element
 * @param Document
 * @param DocumentFragment
 */

export function removeFrom(
  Element: {
    new (...args: unknown[]): Element & ExtElement & ExtNode;
    prototype: Element & ExtElement & ExtNode;
  },
  Document: {
    new (...args: unknown[]): Document & ExtNode;
    prototype: Document & ExtNode;
  },
  DocumentFragment: {
    new (...args: unknown[]): DocumentFragment & ExtNode;
    prototype: DocumentFragment & ExtNode;
  }
) {
  if (Element.prototype[nativeClosestSymbol]) {
    Element.prototype.closest = Element.prototype[nativeClosestSymbol];
  }

  if (Element.prototype[nativeMatchesSymbol]) {
    Element.prototype.matches = Element.prototype[nativeMatchesSymbol];
  }

  for (const nodePrototype of [Element, Document, DocumentFragment]) {
    if (nodePrototype.prototype[nativeQuerySelectorSymbol]) {
      nodePrototype.prototype.querySelector =
        nodePrototype.prototype[nativeQuerySelectorSymbol];
      delete nodePrototype.prototype[nativeQuerySelectorSymbol];
    }

    if (nodePrototype.prototype[nativeQuerySelectorAllSymbol]) {
      nodePrototype.prototype.querySelectorAll =
        nodePrototype.prototype[nativeQuerySelectorAllSymbol];
      delete nodePrototype.prototype[nativeQuerySelectorAllSymbol];
    }

    delete nodePrototype.prototype[selectorHandlerOptionsSymbol];
  }
}
