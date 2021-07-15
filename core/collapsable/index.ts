import { $, setVendorCSS } from "@knitkode/core-dom";

type CollapsableOptions = {
  /** @default 300 */
  duration?: number;
  expanded?: ($element: HTMLElement) => any;
  collapsed?: ($element: HTMLElement) => any;
};

/**
 * Collapsable
 *
 * Simple utility to make an element collapsable. It requires the element
 * not to have vertical margins, as we simply read the "inner" height of the
 * given element.
 */
export function Collapsable(
  selector: string | HTMLElement,
  $root?: HTMLElement,
  options?: CollapsableOptions
) {
  const { duration = 300, expanded, collapsed } = options || {};
  const $el =
    typeof selector === "string"
      ? $(selector, $root)
      : (selector as HTMLElement);

  if (!$el) {
    return;
  }

  let lastHeight = $el.scrollHeight;
  let isExpanded = lastHeight > 0;

  $el.style.overflow = "hidden";

  setVendorCSS($el, "transition", `height ${duration}ms ease`);

  setAriaExpanded(isExpanded);

  /**
   * Set ARIA attribute on the element to flag the expanded status
   */
  function setAriaExpanded(expanded) {
    $el.setAttribute("aria-expanded", expanded);
  }

  /**
   * Toggle element
   */
  function toggle() {
    // const collapsed = $el.getAttribute("aria-expanded");
    // if (collapsed === "true") {
    if (isExpanded) {
      collapse();
    } else {
      expand();
    }
  }

  /**
   * Expand element
   *
   * @param {boolean} [immediate] Run without animation
   */
  function expand(immediate?: boolean) {
    if (immediate) {
      _doExpand();
    } else {
      $el.style.height = `${$el.scrollHeight}px`;

      setTimeout(_doExpand, duration + 1);
    }
  }

  /**
   * Actually expand
   *
   */
  function _doExpand() {
    $el.style.height = "auto";
    lastHeight = $el.scrollHeight;

    setAriaExpanded(true);
    isExpanded = true;

    if (expanded) expanded($el);
  }

  /**
   * Collapse element
   *
   * @param {boolean} [immediate] Run without animation
   */
  function collapse(immediate?: boolean) {
    if (immediate) {
      _doCollapse();
    } else {
      $el.style.height = `${lastHeight}px`;

      setTimeout(_doCollapse, 3);
    }
  }

  /**
   * Actually collapse
   *
   */
  function _doCollapse() {
    $el.style.height = "0";
    setAriaExpanded(false);
    isExpanded = false;

    setTimeout(() => {
      if (collapsed) collapsed($el);
    }, duration + 3);
  }

  return {
    toggle,
    expand,
    collapse,
  };
}
