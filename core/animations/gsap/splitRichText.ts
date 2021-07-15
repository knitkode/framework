// @ts-nocheck
import { $$ } from "@knitkode/core-dom";

/**
 * Split RTE block of text wit inner HTML
 *
 * @param {string | HTMLElement} selector
 * @params {import("gsap").SplitText} SplitText
 */
export function splitRichText(selector: string | HTMLElement, SplitText) {
  const element = typeof selector === "string" ? $$(selector) : selector;
  const brLines = element.innerHTML ? element.innerHTML.split("<br>") : [];

  if (brLines.length > 1) {
    // wrap text divided by <br> in <div>...</div>
    let brLinesAsDiv = "";
    for (var i = 0, l = brLines.length; i < l; i++) {
      brLinesAsDiv += "<div>" + brLines[i] + "</div>";
    }
    element.innerHTML = brLinesAsDiv;

    splitRichText(element, SplitText);
  } else if (element.children && element.children.length) {
    for (var i = 0, l = element.children.length; i < l; i++) {
      splitRichText(element.children[i], SplitText);
    }
  } else if (element.length) {
    for (var i = 0, l = element.length; i < l; i++) {
      splitRichText(element[i], SplitText);
    }
  } else {
    new SplitText(element, { type: "lines" });
  }
}
