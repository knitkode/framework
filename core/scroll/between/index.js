// TODO: use ScrollTrigger?
import {
  addClass,
  removeClass,
  listenScroll,
  getOffsetTop,
  getHeight,
  listenResize,
} from "@knitkode/core-dom";

/**
 * Detect if the scroll position is within the given bounds, either numbers or
 * DOM elements
 *
 * @param {number | HTMLElement | function(): number} start
 * @param {number | HTMLElement | function(): number} end
 * @param {Object} options
 * @param {HTMLElement} [options.target=document.body] - DOM element to give classes to
 * @param {string} [options.className] - The className to add to the given element
 * @param {string} [options.suffixIn] - The className suffix when the el is in between
 * @param {string} [options.suffixOut] - The className suffix when the el is not between
 * @param {Function} [options.onchange] - On change callback
 */
export default function between(
  start,
  end,
  {
    target = document.body,
    className = "between",
    suffixIn = "--in",
    suffixOut = "--out",
    onchange,
  } = {}
) {
  let isBetween = false;
  let winHeight;
  let edgeStart;
  let edgeEnd;

  function check() {
    if (
      !isBetween &&
      window.pageYOffset + winHeight > edgeStart &&
      window.pageYOffset + winHeight < edgeEnd
    ) {
      removeClass(target, className + suffixOut);
      addClass(target, className + suffixIn);
      isBetween = true;
      if (onchange) onchange(isBetween);
    } else if (
      isBetween &&
      (window.pageYOffset + winHeight < edgeStart ||
        window.pageYOffset + winHeight > edgeEnd)
    ) {
      addClass(target, className + suffixOut);
      removeClass(target, className + suffixIn);
      isBetween = false;
      if (onchange) onchange(isBetween);
    }
  }

  function calculate() {
    if (typeof start === "number") {
      edgeStart = start;
    } else if (typeof start === "function") {
      edgeStart = start();
    }
    // or it is a Node
    else {
      edgeStart = getOffsetTop(start);
    }

    if (typeof end === "number") {
      edgeEnd = end;
    } else if (typeof end === "function") {
      edgeEnd = end();
    }
    // or it is a Node
    else {
      edgeEnd = getOffsetTop(end) + getHeight(end);
    }

    winHeight = window.innerHeight;
  }

  // efficiently update sizes on resize
  const listenerResize = listenResize(calculate);

  // bind debounced on scroll
  const listenerScroll = listenScroll(check);

  // and do it immediately
  calculate();
  check();

  return {
    destroy() {
      if (listenerResize) listenerResize();
      if (listenerScroll) listenerScroll();
      if (target) {
        removeClass(target, className + suffixOut);
        removeClass(target, className + suffixIn);
      }
    },
  };
}
