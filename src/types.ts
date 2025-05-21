import {
  selectorHandlerOptionsSymbol,
  nativeClosestSymbol,
  nativeMatchesSymbol,
  nativeQuerySelectorAllSymbol,
  nativeQuerySelectorSymbol,
} from './symbols';

export type LocalSelector = {
  position: number;
  rule: string;
  selector: string;
  id: string;
};

export type ExtNode = {
  [nativeQuerySelectorSymbol]?: ParentNode['querySelector'];
  [nativeQuerySelectorAllSymbol]?: ParentNode['querySelectorAll'];
  [selectorHandlerOptionsSymbol]?: SelectorHandlerOptions;
};

export type ExtElement = {
  [nativeMatchesSymbol]?: Element['matches'];
  [nativeClosestSymbol]?: Element['closest'];
};

export type ScopeNode = ((Element & ExtElement) | Document | DocumentFragment) &
  ExtNode;

export type SelectorHandlerOptions = {
  /**
   * The name of the element used to nest a group of elements, if needed
   */
  blockScopeElementTagName?: string;
  /**
   * Prefix of a temporary attribute to be used when the element needs to be modified
   */
  checkedIdPrefix?: string;
  /**
   * The name of the pseudo-selector. Changing this value may be appropriate in some cases, such as for testing.
   */
  localSelectorToken?: string;
  /**
   * The name of the attribute that marks the root element during search, which is necessary in some cases
   */
  rootElementUniqueAttr?: string;
};
