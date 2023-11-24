import {
  nativeClosestSymbol,
  nativeMatchesSymbol,
  nativeQuerySelectorAllSymbol,
  nativeQuerySelectorSymbol,
} from './symbols';
import {ExtElement, ScopeNode} from './types';

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
): ReturnType<ParentNode['querySelectorAll']> {
  return (
    scopeNode[nativeQuerySelectorAllSymbol] ?? scopeNode.querySelectorAll
  ).call(scopeNode, selector);
}

/**
 * Calls the stored native .querySelector()
 *
 * @param scopeNode
 * @param selector
 * @returns Element or null
 */
export function callNativeQuerySelector(
  scopeNode: ScopeNode,
  selector: string
): ReturnType<ParentNode['querySelector']> {
  return (scopeNode[nativeQuerySelectorSymbol] ?? scopeNode.querySelector).call(
    scopeNode,
    selector
  );
}

/**
 * Calls the stored native Element.matches()
 *
 * @param element
 * @param selector
 * @returns According to Element.matches(), returns true if matched and false otherwise
 */
export function callNativeMatches(
  element: Element & ExtElement,
  selector: string
): ReturnType<Element['matches']> {
  return (element[nativeMatchesSymbol] ?? element.matches).call(
    element,
    selector
  );
}

/**
 * Calls the stored native Element.closest()
 *
 * @param element
 * @param selector
 * @returns According to Element.closest(), returns the first element found or null
 */
export function callNativeClosest(
  element: Element & ExtElement,
  selector: string
): ReturnType<Element['closest']> {
  return (element[nativeClosestSymbol] ?? element.matches).call(
    element,
    selector
  );
}
