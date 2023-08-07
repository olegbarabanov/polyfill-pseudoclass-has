import {
  nativeClosestSymbol,
  nativeMatchesSymbol,
  nativeQuerySelectorAllSymbol,
  nativeQuerySelectorSymbol,
} from "./symbols";
import { ExtElement, ScopeNode } from "./types";

/**
 * Calls the stored native querySelectorAll()
 *
 * @param scopeNode Scope node
 * @param selector selector
 * @returns List of elements
 */
export function callNativeQuerySelectorAll(
  scopeNode: ScopeNode,
  selector: string
): ReturnType<ParentNode["querySelectorAll"]> {
  return (scopeNode[nativeQuerySelectorAllSymbol] ?? scopeNode.querySelectorAll).call(scopeNode, selector)
}

/**
 * Calls the stored native querySelector()
 *
 * @param scopeNode
 * @param selector
 * @returns Element or null
 */
export function callNativeQuerySelector(
  scopeNode: ScopeNode,
  selector: string
): ReturnType<ParentNode["querySelector"]> {
  return (scopeNode[nativeQuerySelectorSymbol] ?? scopeNode.querySelector).call(scopeNode, selector);
}

export function callNativeMatches(
  element: Element & ExtElement,
  selector: string
): ReturnType<Element["matches"]> {
  return (element[nativeMatchesSymbol] ?? element.matches).call(element, selector)
}

export function callNativeClosest(
  element: Element & ExtElement,
  selector: string
): ReturnType<Element["closest"]> {
  return (element[nativeClosestSymbol] ?? element.matches).call(element, selector);
}
