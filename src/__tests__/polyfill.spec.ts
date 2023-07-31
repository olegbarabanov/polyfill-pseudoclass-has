import * as fs from "fs";
import { Polyfill } from "..";
import { JSDOM } from "jsdom";
import * as path from "path";

const globalHtml = fs.readFileSync(path.resolve(__dirname, "./test.html"), "utf8");

const {
  window: { document },
} = new JSDOM();
let polyfill = new Polyfill();

document.documentElement.innerHTML = globalHtml;

const rootElementImpl = document.createElement("body");
rootElementImpl.innerHTML = document.body.innerHTML;
const documentFragmentImpl = document.createDocumentFragment();
documentFragmentImpl.append(...document.body.cloneNode(true).childNodes);

describe.each([document, rootElementImpl, documentFragmentImpl])(
  "Check querySelector",
  (rootNode) => {
    test(`querySelectorfind() 1 + NODE_TYPE ${rootNode.nodeType}`, async () => {
      const targetElement =
        rootNode.querySelector("main") ?? fail("target element not found");
      if (!targetElement) fail("target element not found");

      const result = polyfill.querySelector("main:has(#link-to-top)", rootNode);
      expect(result).not.toBeNull();
      expect(result).toBe(targetElement);
    });

    test(`querySelector() 2 + NODE_TYPE ${rootNode.nodeType}`, async () => {
      const targetElement = rootNode.querySelector("main");
      if (!targetElement) fail("target element not found");

      const result = polyfill.querySelector(
        "main:has(#fake-id, #link-to-top)",
        rootNode
      );
      expect(result).not.toBeNull();
      expect(result).toBe(targetElement);
    });

    test(`querySelector() 3 + NODE_TYPE ${rootNode.nodeType}`, async () => {
      const targetElement = rootNode.querySelector("main");
      if (!targetElement) fail("target element not found");

      const result = polyfill.querySelector(
        "main:has(#link-to-top):has(#link-to-bottom)",
        rootNode
      );
      expect(result).not.toBeNull();
      expect(result).toBe(targetElement);
    });

    test(`querySelector() 4 + NODE_TYPE ${rootNode.nodeType}`, async () => {
      const targetElement = rootNode.querySelector("main");
      if (!targetElement) fail("target element not found");

      const result = polyfill.querySelector(
        "#container main:has(~footer)",
        rootNode
      );
      expect(result).not.toBeNull();
      expect(result).toBe(targetElement);
    });

    test(`querySelector() 5 + NODE_TYPE ${rootNode.nodeType}`, async () => {
      const targetElement = rootNode.querySelector("header[role=banner]");
      if (!targetElement) fail("target element not found");

      const result = polyfill.querySelector(
        "#container:has(#unavailable-id, #link-to-top):has(#link-to-bottom) header[role=banner]:has(+nav):has(~footer)",
        rootNode
      );
      expect(result).not.toBeNull();
      expect(result).toBe(targetElement);
    });

    test(`querySelector() 6 + NODE_TYPE ${rootNode.nodeType}`, async () => {
      const result = polyfill.querySelector(
        "main:has(#link-to-top) unavailable-element",
        rootNode
      );
      expect(result).toBeNull();
    });

    test(`querySelector() 7 + NODE_TYPE ${rootNode.nodeType}`, async () => {
      const targetElement = rootNode.querySelector("#container");
      if (!targetElement) fail("target element not found");

      const result = polyfill.querySelector("#container:has(~ *)", rootNode);
      expect(result).not.toBeNull();
      expect(result).toBe(targetElement);
    });
  }
);

describe.each([document, rootElementImpl, documentFragmentImpl])(
  "Check querySelectorAll",
  (rootNode) => {
    test(`querySelectorAll() 1 + NODE_TYPE ${rootNode.nodeType}`, async () => {
      const targetElements = rootNode.querySelectorAll("main header");
      if (targetElements.length === 0) fail("target elements not found");

      const result = polyfill.querySelectorAll(
        "header:has(+:not(nav))",
        rootNode
      );

      expect(result).not.toBeNull();
      expect([...result]).toEqual([...targetElements]);
    });
  }
);

describe("check matches()", () => {
  test("", async () => {
    const targetElement = rootElementImpl.querySelector("main");
    if (!targetElement) fail("target element not found");

    const result1 = polyfill.matches("main:has(#link-to-top)", targetElement);
    expect(result1).toBeTruthy();
    const result2 = polyfill.matches(
      "main:has(#unavailable-id)",
      targetElement
    );
    expect(result2).toBeFalsy();
  });

  test("top-level element", async () => {
    const result1 = polyfill.matches("body:has(#link-to-top)", rootElementImpl);
    expect(result1).toBeTruthy();
    const result2 = polyfill.matches(
      "body:has(#unavailable-id)",
      rootElementImpl
    );
    expect(result2).toBeFalsy();
  });
});

describe("check closest()", () => {
  test("", async () => {
    const targetElement = rootElementImpl.querySelector("#link-to-top");
    if (!targetElement) fail("target element not found");

    const result = polyfill.closest("body:has(#link-to-top)", targetElement);
    expect(result).toBe(rootElementImpl);
  });

  test("", async () => {
    const result = polyfill.closest("body:has(#link-to-top)", rootElementImpl);
    expect(result).toBe(rootElementImpl);
  });
});
