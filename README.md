# Polyfill for CSS pseudo-class `:has()` in DOM Selectors API

A polyfill that adds support for the CSS pseudo-class [`:has()`](https://developer.mozilla.org/en-US/docs/Web/CSS/:has) to the DOM Selectors API (by extending [.querySelector()](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector), [.querySelectorAll()](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll), [.matches()](https://developer.mozilla.org/en-US/docs/Web/API/Element/matches), [.closest()](https://developer.mozilla.org/en-US/docs/Web/API/Element/closest) or called directly)

Polyfill does not use global environment variables in the code and therefore it can work both in the browser environment and in the server-side environment (for example with [JSDOM](https://github.com/jsdom/jsdom))

## Installation

```bash
npm install polyfill-pseudoclass-has --save
```

## Usage

### ES6 Modules
```js
import * as polyfill from "polyfill-pseudoclass-has/esm/";
```

### UMD (for environments that do not support ES6 Modules)

Use CommonJS `require()`:
```js
const polyfill = require("polyfill-pseudoclass-has/umd/polyfill.umd.js");
```

or by including it in the code using `<script src="..." />`:
```js
<script src="/umd/polyfill.umd.js" />
<script>
const polyfill = window['polyfill-pseudoclass-has']; // can also be used via globalThis['polyfill-pseudoclass-has']
...
</script>
```

## API

  - **``SelectorHandler``**
    - **`constructor(globalSelector: string)`**  

      ```js
      // Example
      const selectorHandler = new SelectorHandler("body section:has(.foo):has(.bar) div:has(img)");
      ```

    - **`query(rootNode: Element | Document | DocumentFragment): Element | null`**

      Searches for elements in the rootNode (which can be an instance of an [Element](https://developer.mozilla.org/docs/Web/API/Element) or a [Document](https://developer.mozilla.org/docs/Web/API/Document) or a [DocumentFragment](https://developer.mozilla.org/docs/Web/API/DocumentFragment)). This is similar to [Node.querySelectorAll()](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll).

      ```js
      // Example
      const selectorHandler = new SelectorHandler("div:has(img)");
      selectorHandler.query(document);
      ```

    - **`queryAll(rootNode: Element | Document | DocumentFragment): NodeListOf<Element>`**  

      Search for a single element in the rootNode (which can be an instance of an [Element](https://developer.mozilla.org/docs/Web/API/Element) or a [Document](https://developer.mozilla.org/docs/Web/API/Document) or a [DocumentFragment](https://developer.mozilla.org/docs/Web/API/DocumentFragment)). This is similar to [Node.querySelector()](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector).

      ```js
      // Example
      const selectorHandler = new SelectorHandler("div:has(img)");
      selectorHandler.queryAll(document);
      ```
    
    - **`matches(element: Element): boolean`**  

      Checks if an element (is an instance of Element) matches a selector. This is similar to [Element.matches()](https://developer.mozilla.org/en-US/docs/Web/API/Element/matches).

      ```js
      // Example
      const selectorHandler = new SelectorHandler("div:has(img)");
      selectorHandler.matches(divElement); // divElement - is an instance of Element 
      ```

    - **`closest(element: Element): Element | null`**  

      Searches for the closest parent (and self) that matches the specified selector. This is similar to [Element.closest()](https://developer.mozilla.org/en-US/docs/Web/API/Element/closest).

      ```js
      // Example
      const selectorHandler = new SelectorHandler("div:has(img)");
      selectorHandler.closest(divElement); // divElement - is an instance of Element 
      ```

  - **```addToBrowser()```**

    Installing polyfill in the browser global environment. **Note:** Works only in a browser environment.

    ```js
    // Example
    import { addToBrowser } from "polyfill-pseudoclass-has";
    addToBrowser();
    document.querySelectorAll('div:has(img)'); // now it's polyfilled
    ```

  - **```removeFromBrowser()```**

    Uninstalling polyfill from the browser global environment. **Note:** Works only in a browser environment.

    ```js
    // Example
    import { addToBrowser } from "polyfill-pseudoclass-has";
    removeFromBrowser();
    ```

  - **```addTo(Element, Document, DocumentFragment)```**

    Installing of polyfill in global Element & Document & DocumentFragment nodes (for integration into a third-party environment, for example JSDOM).

    ```js
    // Example
    import { addTo } from "polyfill-pseudoclass-has";
    addTo(Element, Document, DocumentFragment);
    document.querySelectorAll('div:has(img)'); // now it's polyfilled
    ```

    ```js
    // Example with JSDOM:
    import { addTo } from "polyfill-pseudoclass-has";
    import { JSDOM } from "jsdom";

    const { window: { Element, Document, DocumentFragment } } = new JSDOM();
    addTo(Element, Document, DocumentFragment);
    ```

  - **```removeFrom(Element, Document, DocumentFragment)```**

    Unstalling of polyfill from global Element & Document & DocumentFragment nodes (for integration into a third-party environment, for example JSDOM).

    ```js
    // Example
    import { removeFrom } from "polyfill-pseudoclass-has";
    removeFrom(Element.prototype, Document.prototype, DocumentFragment.prototype);
    ```