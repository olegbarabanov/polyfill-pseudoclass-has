import { nativeClosest, nativeMatches, nativeQuerySelector, nativeQuerySelectorAll } from "./native";
import { LocalSelector, RootNode } from "./types";
import { isElementNode, isDocumentFragmentNode, isDocumentNode } from "./utils";

export class Polyfill {

/**
 * Calculates the position of an element relative to siblings
 * 
 * @param element Element
 * @returns position number
 */

  protected getElementPosition(element: Element): number {
    let position = 1;
    const parentNode = element.parentNode;
    if (parentNode) {
      position += Array.from(parentNode.children).indexOf(element);
    }
    return position;
  }

/**
 * Calculates all parent elements
 * 
 * @param element Element
 * @returns Array of parent elements
 */

  protected getParentElements(element: Element): Element[] {
    const elements: Element[] = [];
    while (element.parentElement) {
      elements.unshift(element.parentElement);
      element = element.parentElement;
    }
    return elements;
  }


  protected hasLocalSelector(globalSelector: string, startPosition: number = 0): boolean {
    return Boolean(this.getLocalSelector(globalSelector, startPosition));
  }

  /**
   * Gets a single subselector (local selectors) in a common selector (global selector)
   * 
   * @param globalSelector selector
   * @param startPosition Starting position of the subselector search
   * @param idPrefix Prefix of a temporary attribute to be used when the element needs to be modified
   * @returns List of subselectors (local selectors)
   */

  protected getLocalSelector(
    globalSelector: string,
    startPosition: number = 0,
    idPrefix: string = "____attr-for-polyfill-pseudoclass-HAS___"
  ): null | LocalSelector {
    const token = ":has(";
    const ruleStart = globalSelector.indexOf(token, startPosition);
    if (ruleStart === -1) return null;

    const subStart = ruleStart + token.length;
    let subEnd = subStart;
    let ruleEnd = subEnd;
    let openChar = 1;

    while (globalSelector[subEnd]) {
      switch (globalSelector[subEnd]) {
        case "(":
          openChar++;
          break;
        case ")":
          openChar--;
          break;
        case "/": // ignore next symbol
          continue;
      }

      ruleEnd++;
      if (openChar === 0) break;
      subEnd++;
    }

    return {
      position: ruleStart,
      rule: globalSelector.substring(ruleStart, ruleEnd),
      selector: globalSelector.substring(subStart, subEnd),
      id: idPrefix.concat(String(ruleStart)),
    };
  }


  /**
   * Gets all subselectors (local selectors) in a common selector (global selector)
   * 
   * @param globalSelector Common selector (global selector)
   * @returns Subselectors (local selectors)
   */
  protected getLocalSelectorList(globalSelector: string): LocalSelector[] {
    const selectorList: LocalSelector[] = [];
    let localSelector: LocalSelector | null;
    let position = 0;

    while (
      (localSelector = this.getLocalSelector(globalSelector, position)) !== null
    ) {
      selectorList.push(localSelector);
      position = localSelector.position + localSelector.rule.length;
    }

    return selectorList;
  }

  /**
   * Gets a unique selector from the root element to the specified element
   * 
   * @param element Element
   * @param rootElement Root Element
   * @returns selector
   */

  protected getUniqueSelector(element: Element, rootElement: Element): string {
    const stackSubSelectors: string[] = [];

    if (!rootElement.contains(element)) {
      throw new Error("Fragment does not contain the specified element");
    }

    for (
      let item: null | Element = element;
      item && item !== rootElement;
      item = item.parentElement
    ) {
      const position = this.getElementPosition(item);
      stackSubSelectors.unshift(`>:nth-child(${position})`);
    }

    return ":scope".concat(...stackSubSelectors);
  }

  /**
   * Transforms all local subselectors inside the global selector to simple CSS rules
   * 
   * @param globalSelector Common selector (global selector)
   * @param localSelectors Local selectors
   * @returns selector
   */

  protected getTransformSelector(
    globalSelector: string,
    localSelectors: LocalSelector[]
  ): string {
    let destSelectorChunks: string[] = [];
    let position = 0;
    localSelectors.forEach((selector) => {
      const ruleChunk = globalSelector.substring(position, selector.position);
      destSelectorChunks.push(ruleChunk, `[${selector.id}]`);
      position = selector.position + selector.rule.length;
    });

    destSelectorChunks.push(globalSelector.substring(position));
    return destSelectorChunks.join("");
  }

/**
 * A method that searches for elements with support for the ":has" pseudo-class
 * 
 * @param globalSelector Common selector (global selector)
 * @param rootElement Root element
 * @returns Elements
 */

  protected find(
    globalSelector: string,
    rootElement: Element,
  ): NodeListOf<Element> {
    if (!isElementNode(rootElement)) {
      throw new Error("root element must be of type Element"); // for JS environment
    }

    globalSelector = String(globalSelector); // for JS environment

    const localSelectorList = this.getLocalSelectorList(String(globalSelector));
    const elements = nativeQuerySelectorAll(rootElement, "*");

    const modElements: Map<LocalSelector, Element[]> = new Map(
      localSelectorList.map((selector) => [selector, []])
    );

    for (const item of elements) {
      const targetElement = item.parentElement ?? item;
      const targetUniqueSelector = this.getUniqueSelector(item, targetElement);

      for (const selector of localSelectorList) {
        const stmt = targetUniqueSelector.concat(" ", selector.selector);
        if (nativeQuerySelector(targetElement, stmt)) {
          modElements.get(selector)?.push(item);
        }
      }
    }

    localSelectorList.forEach((localSelector) => {
      modElements
        .get(localSelector)
        ?.forEach((element) => element.setAttribute(localSelector.id, ""));
    });

    const modSelector = this.getTransformSelector(
      globalSelector,
      localSelectorList
    );
    const resultElements = nativeQuerySelectorAll(rootElement, modSelector);

    localSelectorList.forEach((localSelector) => {
      modElements
        .get(localSelector)
        ?.forEach((element) => element.removeAttribute(localSelector.id));
    });

    return resultElements;
  }

  /**
   * Search for elements. The method operates on a copy of the object's DOM to avoid unwanted MutationObserver calls.
   * 
   * @param selector Common selector (global selector)
   * @param rootNode Root node
   * @param defaultBlockScopeElementTagName The name of the element used to nest a group of elements, if needed
   * @returns List of elements
   */

  querySelectorAll(
    selector: string,
    rootNode: RootNode,
    defaultBlockScopeElementTagName: keyof HTMLElementTagNameMap = "div"
  ): NodeListOf<Element> {
    if (!this.hasLocalSelector(selector)) {
      return nativeQuerySelectorAll(rootNode, selector);
    }

    let rootElement: Element;

    if (isDocumentNode(rootNode)) {
      rootElement = rootNode.documentElement; // get top-level element
    } else if (isDocumentFragmentNode(rootNode)) {
      rootElement = rootNode.ownerDocument.createElement(
        defaultBlockScopeElementTagName
      );
      rootElement.append(rootNode);
    } else {
      rootElement = rootNode;
    }

    const cloneRootElement = rootElement.cloneNode(true);
    if (!isElementNode(cloneRootElement)) throw new Error("incompatible node type")

    const selectors = Array.from(this.find(selector, cloneRootElement))
      .map((item) => this.getUniqueSelector(item, cloneRootElement))
      .join(",");

    const result = nativeQuerySelectorAll(rootElement, selectors || "*:not(*)"); // generate empty NodeList if selectors is empty
    if (isDocumentFragmentNode(rootNode))
      rootNode.append(...rootElement.children);

    return result;
  }

/**
 * Search for a single element. The method operates on a copy of the object's DOM to avoid unwanted MutationObserver calls.
 * 
 * @param selector Common selector (global selector)
 * @param rootNode Root node
 * @param defaultBlockScopeElement The name of the element used to nest a group of elements, if needed
 * @returns Element or null
 */

  querySelector(
    selector: string,
    rootNode: RootNode,
    defaultBlockScopeElement: keyof HTMLElementTagNameMap = "div"
  ): Element | null {
    if (!this.hasLocalSelector(selector)) {
      return nativeQuerySelector(rootNode, selector);
    }

    const nodeList = this.querySelectorAll(
      selector,
      rootNode,
      defaultBlockScopeElement
    );
    return nodeList[0] || null;
  }

  matches(selector: string, element: Element) {
    if (!this.hasLocalSelector(selector)) {
      return nativeMatches(element, selector);
    }

    const topElement = this.getParentElements(element).shift() ?? element;
    let result = false;
    if (topElement !== element) {
      result = Array.from(this.querySelectorAll(selector, topElement)).includes(element);
    } else {
      const documentFragment = element.ownerDocument.createDocumentFragment();
      const cloneElement = element.cloneNode(true);
      if (!isElementNode(cloneElement)) throw new Error("Node not inherited from Element are not supported");
      documentFragment.append(cloneElement);
      result = Array.from(this.querySelectorAll(selector, documentFragment)).includes(cloneElement);
    }

    return result
  }

  closest(selector: string, element: Element) {
    if (!this.hasLocalSelector(selector)) {
      return nativeClosest(element, selector);
    }

    const result = this.getParentElements(element)
      .concat(element)
      .reverse()
      .find((element) => this.matches(selector, element));
    return result ?? null;
  }
}
