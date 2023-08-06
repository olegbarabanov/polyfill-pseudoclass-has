import * as fs from "fs";
import { JSDOM } from "jsdom";
import * as path from "path";
import { addTo } from "..";

const globalHtml = fs.readFileSync(
  path.resolve(__dirname, "./test.html"),
  "utf8"
);

const {
  window: { document, Element, Document, DocumentFragment },
} = new JSDOM();

document.documentElement.innerHTML = globalHtml;

const rootElementImpl = document.createElement("body");
rootElementImpl.innerHTML = document.body.innerHTML;
const documentFragmentImpl = document.createDocumentFragment();
documentFragmentImpl.append(...document.body.cloneNode(true).childNodes);

describe("check addTo()", () => {
  beforeAll(() => {
    addTo(Element, Document, DocumentFragment);
  });

  test("check querySelectorAll()", async () => {
    const targetElements = rootElementImpl.querySelectorAll(
      "header:has(~article)"
    );

    expect(targetElements.length).toBe(1);
  });
});
