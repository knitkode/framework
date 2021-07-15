// TODO: use ScrollTrigger?
import {
  addClass,
  removeClass,
  listenScroll,
  getOffsetTop,
} from "@knitkode/core-dom";

/**
 * @typedef {Object} thresholdInstance
 * @property {Function} destroy
 */

/**
 * @typedef {Object} thresholdOptions
 * @property {HTMLElement} [target=document.body] - The element to apply classes
 * @property {string} [className="threshold"] - The className to add to the given element
 * @property {string} [suffixAbove="--above"] - The className suffix when the el is above
 * @property {string} [suffixBelow="--below"] - The className suffix when the el is below
 * @property {Function} [onchange] - On change callback
 */

/**
 * Below threshold scroll utility
 *
 * Detects the current scroll position and apply the above/below classes to the
 * given target element according to the given threshold (either a number or a
 * DOM element)
 *
 * @param {number | HTMLElement} threshold Can be a number or a DOM element
 * @param {thresholdOptions} options
 * @returns {thresholdInstance}
 */
export default function threshold(
  threshold = 300,
  {
    target = document.body,
    className = "threshold",
    suffixAbove = "--above",
    suffixBelow = "--below",
    onchange,
  }
) {
  let isBelow = false;
  threshold =
    typeof threshold === "number" ? threshold : getOffsetTop(threshold);

  function check() {
    if (!isBelow && window.pageYOffset > threshold) {
      removeClass(target, className + suffixAbove);
      addClass(target, className + suffixBelow);
      isBelow = true;
      if (onchange) onchange(isBelow);
    } else if (isBelow && window.pageYOffset <= threshold) {
      addClass(target, className + suffixAbove);
      removeClass(target, className + suffixBelow);
      isBelow = false;
      if (onchange) onchange(isBelow);
    }
  }

  // bind debounced on scroll
  const scrollHandler = listenScroll(check);

  // and check immediately
  check();

  function destroy() {
    scrollHandler();
  }

  return {
    destroy,
  };
}
