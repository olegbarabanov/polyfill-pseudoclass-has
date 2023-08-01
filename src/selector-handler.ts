import { callNativeQuerySelectorAll, callNativeQuerySelector, callNativeMatches, callNativeClosest } from "./native";
import { LocalSelector, RootNode } from "./types";
import { isElementNode, isDocumentFragmentNode, isDocumentNode } from "./utils";

export class SelectorHandler {

/**
 * The name of the element used to nest a group of elements, if needed
 */
  readonly blockScopeElementTagName: string = "polyfill-block-scope-element";

  /**
   * Prefix of a temporary attribute to be used when the element needs to be modified
   */
  readonly checkedIdPrefix: string = "____attr-for-polyfill-pseudoclass-HAS___";
  readonly localSelectors: readonly LocalSelector[];
  readonly transformSelector: string;
  readonly hasLocalSelector: boolean;
  readonly globalSelector: string;

  constructor(globalSelector: string) {
    this.globalSelector = String(globalSelector); // for JS environment
    this.localSelectors = Object.freeze(this.getLocalSelectors(globalSelector));
    this.hasLocalSelector = this.localSelectors.length > 0;
    this.transformSelector = this.getTransformSelector();
  }

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
      id: this.checkedIdPrefix.concat(String(ruleStart)),
    };
  }


  /**
   * Gets all subselectors (local selectors) in a common selector (global selector)
   * 
   * @param globalSelector Common selector (global selector)
   * @returns Subselectors (local selectors)
   */

  protected getLocalSelectors(globalSelector: string): LocalSelector[] {
    const localSelectors: LocalSelector[] = [];
    let localSelector: LocalSelector | null;
    let position = 0;

    while (
      (localSelector = this.getLocalSelector(globalSelector, position)) !== null
    ) {
      localSelectors.push(localSelector);
      position = localSelector.position + localSelector.rule.length;
    }

    return localSelectors;
  }

  /**
   * Gets a unique selector from the root element to the specified element
   * 
   * @param element Target element
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
   * @returns selector
   */

  protected getTransformSelector(): string {
    let destSelectorChunks: string[] = [];
    let position = 0;
    this.localSelectors.forEach((selector) => {
      const ruleChunk = this.globalSelector.substring(position, selector.position);
      destSelectorChunks.push(ruleChunk, `[${selector.id}]`);
      position = selector.position + selector.rule.length;
    });

    destSelectorChunks.push(this.globalSelector.substring(position));
    return destSelectorChunks.join("");
  }

/**
 * A method that searches for elements with support for the ":has" pseudo-class
 * 
 * @param rootElement Root element
 * @returns NodeList of found elements
 */

  protected find(rootElement: Element): NodeListOf<Element> {
    if (!isElementNode(rootElement)) {
      throw new Error("root element must be of type Element"); // for JS environment
    }

    const elements = callNativeQuerySelectorAll(rootElement, "*");

    const modElements: Map<LocalSelector, Element[]> = new Map(
      this.localSelectors.map((selector) => [selector, []])
    );

    for (const item of elements) {
      const targetElement = item.parentElement ?? item;
      const targetUniqueSelector = this.getUniqueSelector(item, targetElement);

      for (const selector of this.localSelectors) {
        const stmt = targetUniqueSelector.concat(" ", selector.selector);
        if (callNativeQuerySelector(targetElement, stmt)) {
          modElements.get(selector)?.push(item);
        }
      }
    }

    this.localSelectors.forEach((localSelector) => {
      modElements
        .get(localSelector)
        ?.forEach((element) => element.setAttribute(localSelector.id, ""));
    });

    const resultElements = callNativeQuerySelectorAll(rootElement, this.transformSelector);

    this.localSelectors.forEach((localSelector) => {
      modElements
        .get(localSelector)
        ?.forEach((element) => element.removeAttribute(localSelector.id));
    });

    return resultElements;
  }

  /**
   * This is similar to Node.querySelectorAll()
   * Search for elements. The method operates on a copy of the object's DOM to avoid unwanted MutationObserver calls.
   * 
   * @param rootNode Root node
   * @returns NodeList of found elements
   */

  queryAll(rootNode: RootNode): NodeListOf<Element> {
    if (!this.hasLocalSelector) return callNativeQuerySelectorAll(rootNode, this.globalSelector);

    let rootElement: Element;

    if (isDocumentNode(rootNode)) {
      rootElement = rootNode.documentElement; // get top-level element
    } else if (isDocumentFragmentNode(rootNode)) {
      rootElement = rootNode.ownerDocument.createElement(
        this.blockScopeElementTagName
      );
      rootElement.append(rootNode);
    } else {
      rootElement = rootNode;
    }

    const cloneRootElement = rootElement.cloneNode(true);
    if (!isElementNode(cloneRootElement)) throw new Error("incompatible node type")

    const selectors = Array.from(this.find(cloneRootElement))
      .map((item) => this.getUniqueSelector(item, cloneRootElement))
      .join(",");

    const result = callNativeQuerySelectorAll(rootElement, selectors || "*:not(*)"); // generate empty NodeList if selectors is empty
    if (isDocumentFragmentNode(rootNode)) {
      rootNode.append(...rootElement.children);
    }

    return result;
  }

/**
 * This is similar to Node.querySelector()
 * Search for a single element. The method operates on a copy of the object's DOM to avoid unwanted MutationObserver calls.
 * 
 * @param rootNode Root node
 * @returns founded Element or null
 */

  query(rootNode: RootNode): Element | null {
    if (!this.hasLocalSelector) return callNativeQuerySelector(rootNode, this.globalSelector);

    const nodeList = this.queryAll(rootNode);
    return nodeList[0] || null;
  }

  /**
   * This is similar to Element.matches()
   * Checks if an element matches a selector.
   * 
   * @param element 
   * @returns TRUE if the element matches the selector
   */
  matches(element: Element): boolean {
    if (!isElementNode(element)) return false; // for JS environment
    if (!this.hasLocalSelector) return callNativeMatches(element, this.globalSelector);

    const topElement = this.getParentElements(element).shift() ?? element;
    let result = false;
    if (topElement !== element) {
      result = Array.from(this.queryAll(topElement)).includes(element);
    } else {
      const documentFragment = element.ownerDocument.createDocumentFragment();
      const cloneElement = element.cloneNode(true);
      if (!isElementNode(cloneElement)) throw new Error("Node not inherited from Element are not supported");
      documentFragment.append(cloneElement);
      result = Array.from(this.queryAll(documentFragment)).includes(cloneElement);
    }

    return result
  }


  /**
   * This is similar to Element.closest()
   * Searches for the closest parent (and self) that matches the specified selector
   * 
   * @param element 
   * @returns Found element or null
   */
  closest(element: Element): Element | null {
    if (!isElementNode(element)) return null; // for JS environment
    if (!this.hasLocalSelector) return callNativeClosest(element, this.globalSelector);

    const result = this.getParentElements(element)
      .concat(element)
      .reverse()
      .find((element) => this.matches(element));
    return result ?? null;
  }
}
