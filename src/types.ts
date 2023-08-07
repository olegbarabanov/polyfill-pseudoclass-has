import {
  nativeClosestSymbol,
  nativeMatchesSymbol,
  nativeQuerySelectorAllSymbol,
  nativeQuerySelectorSymbol,
} from "./symbols";

export type LocalSelector = {
  position: number;
  rule: string;
  selector: string;
  id: string;
};


export type ExtNode = {
    [nativeQuerySelectorSymbol]?: ParentNode["querySelector"];
    [nativeQuerySelectorAllSymbol]?: ParentNode["querySelectorAll"];
  };
  
export type ExtElement = {
    [nativeMatchesSymbol]?: Element["matches"];
    [nativeClosestSymbol]?: Element["closest"];
  };

export type ScopeNode = ((Element & ExtElement) | Document | DocumentFragment) & ExtNode;
