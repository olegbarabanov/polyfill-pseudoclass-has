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

export type RootNode = ((Element & ExtElement) | Document | DocumentFragment) & ExtNode;

// export interface NativeMethods {
//   querySelector: ParentNode["querySelector"];
//   querySelectorAll: ParentNode["querySelectorAll"];
//   matches?: Element["matches"];
//   closest?: Element["closest"];
// }
