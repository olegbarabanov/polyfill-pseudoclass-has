import { Polyfill } from "./polyfill";
import {
  nativeClosestSymbol,
  nativeMatchesSymbol,
  nativeQuerySelectorAllSymbol,
  nativeQuerySelectorSymbol,
} from "./symbols";
import { ExtElement, ExtNode } from "./types";
import { isElementNode, isDocumentFragmentNode, isDocumentNode } from "./utils";

/**
 * Installing polyfill in the browser globalThis
 */
export function installToBrowser() {
  installTo(
    globalThis.Element,
    globalThis.Document,
    globalThis.DocumentFragment
  );
}

/**
 * Uninstalling polyfill in the browser globalThis
 */
export function uninstallToBrowser() {
  uninstallTo(
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
 */

export function installTo(
  Element: {
    new (...args: any[]): Element & ExtElement & ExtNode;
    prototype: Element & ExtElement & ExtNode;
  },
  Document: {
    new (...args: any[]): Document & ExtNode;
    prototype: Document & ExtNode;
  },
  DocumentFragment: {
    new (...args: any[]): DocumentFragment & ExtNode;
    prototype: DocumentFragment & ExtNode;
  }
) {
  for (const nodePrototype of [Element, Document, DocumentFragment]) {
    nodePrototype.prototype[nativeQuerySelectorSymbol] =
      nodePrototype.prototype.querySelector;
    nodePrototype.prototype[nativeQuerySelectorAllSymbol] =
      nodePrototype.prototype.querySelectorAll;

    nodePrototype.prototype.querySelector = function (
      ...params: Parameters<ParentNode["querySelector"]>
    ): ReturnType<ParentNode["querySelector"]> {
      if (
        !isElementNode(this) &&
        !isDocumentNode(this) &&
        !isDocumentFragmentNode(this)
      ) {
        throw new Error("illegable invoke");
      }

      return new Polyfill().querySelector(...params, this);
    };

    nodePrototype.prototype.querySelectorAll = function (
      ...params: Parameters<ParentNode["querySelectorAll"]>
    ): ReturnType<ParentNode["querySelectorAll"]> {
      if (
        !isElementNode(this) &&
        !isDocumentNode(this) &&
        !isDocumentFragmentNode(this)
      ) {
        throw new Error("illegable invoke");
      }

      return new Polyfill().querySelectorAll(...params, this);
    };
  }

  Element.prototype[nativeClosestSymbol] = Element.prototype.closest;
  Element.prototype[nativeMatchesSymbol] = Element.prototype.matches;

  Element.prototype.closest = function (
    ...params: Parameters<Element["closest"]>
  ): ReturnType<Element["closest"]> {
    if (!isElementNode(this)) throw new Error("illegable invoke");
    return new Polyfill().closest(...params, this);
  };

  Element.prototype.matches = function (
    ...params: Parameters<Element["matches"]>
  ): ReturnType<Element["matches"]> {
    if (!isElementNode(this)) throw new Error("illegable invoke");
    return new Polyfill().matches(...params, this);
  };
}

/**
 * Uninstalling of polyfill in global Element & Document & DocumentFragment nodes
 *
 * @param Element
 * @param Document
 * @param DocumentFragment
 */
export function uninstallTo(
  Element: {
    new (...args: any[]): Element & ExtElement & ExtNode;
    prototype: Element & ExtElement & ExtNode;
  },
  Document: {
    new (...args: any[]): Document & ExtNode;
    prototype: Document & ExtNode;
  },
  DocumentFragment: {
    new (...args: any[]): DocumentFragment & ExtNode;
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
  }
}
