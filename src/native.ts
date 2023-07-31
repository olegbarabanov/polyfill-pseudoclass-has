import {
  nativeClosestSymbol,
  nativeMatchesSymbol,
  nativeQuerySelectorAllSymbol,
  nativeQuerySelectorSymbol,
} from "./symbols";
import { ExtElement, RootNode } from "./types";

/**
 * Calls the stored native querySelectorAll()
 *
 * @param rootNode Root node
 * @param selector selector
 * @returns List of elements
 */
export function nativeQuerySelectorAll(
  rootNode: RootNode,
  selector: string
): ReturnType<ParentNode["querySelectorAll"]> {
  return (rootNode[nativeQuerySelectorAllSymbol] ?? rootNode.querySelectorAll).call(rootNode, selector)
}

/**
 * Calls the stored native querySelector()
 *
 * @param rootNode
 * @param selector
 * @returns Element or null
 */
export function nativeQuerySelector(
  rootNode: RootNode,
  selector: string
): ReturnType<ParentNode["querySelector"]> {
  return (rootNode[nativeQuerySelectorSymbol] ?? rootNode.querySelector).call(rootNode, selector);
}

export function nativeMatches(
  element: Element & ExtElement,
  selector: string
): ReturnType<Element["matches"]> {
  return (element[nativeMatchesSymbol] ?? element.matches).call(element, selector)
}

export function nativeClosest(
  element: Element & ExtElement,
  selector: string
): ReturnType<Element["closest"]> {
  return (element[nativeClosestSymbol] ?? element.matches).call(element, selector);
}
