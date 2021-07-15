import {
  $,
  on,
  setVendorCSS,
  getStyleValue,
  listenResize,
} from "@knitkode/core-dom";
import "./index.scss";

type ExpanderOptions = {
  mode?: "lines",
  max?: number,
  oneWay?: boolean,
  duration?: number,
};

/**
 * Expand or collapse an element either by a set of max lines or by a given
 * height. It supports multiple breakpoints values.
 * We give as an assumption that given breakpoints are already sorted mobile
 * first.
 *
 * @param {HTMLElement} [$root]. Element containing the text node to clamp.
 * @param {Object} options. Options to pass to the clamper.
 * 
 * @usage
```
import { $ } from "@core/dom";
import { breakpoints } from "@core/scss";
import { Expander } from "@core/expander";

expander($(".expandable"), {
  mode: "lines",
  max: [
    [0, 3],
    [breakpoints.sm, 5],
    [breakpoints.md, 10],
  ]
});
```
 */
export function Expander(
  $root?: HTMLElement,
  { mode = "lines", max, oneWay, duration = 400 }: ExpanderOptions
) {
  const $body = $("[expander-body]", $root);
  const $toggle = $("[expander-toggle]", $root);
  // if max is passed as an array of breakpoint->max value pairs
  const isResponsive = Array.isArray(max);

  // set it immediately in case max is a simple number it will work
  let currentMax = getMaxValue();

  // immediately read and set the "natural" height value
  let expandedHeight = Math.max($body.offsetHeight, $body.scrollHeight);

  let isCollapsed = checkCollapsedDOMState();
  let isExpandable = checkThatIsExpandable(currentMax);

  // set animation properties
  setVendorCSS($body, "transition", `height ${duration}ms ease`);

  // collapse immediatel, better without animation?
  collapse();

  // and bind resize
  if (isResponsive) {
    listenResize(handleResize);
  }

  // set toggle accessibility and bind the collapse behaviour, optionally,
  // 'cause we could even espose an API to fire events programmatically and no
  // having need of a toggle "physical" element
  if ($toggle) {
    $toggle.setAttribute("role", "tab");

    on($toggle, "click", toggle);
    on($toggle, "keyup", handleEnter);
  }

  // if the expansion is one way (disabled the possibility to collapse back)
  // set the a fixed height and a margin top transition for a smooth
  // disappearance of the toggle
  if (oneWay) {
    setVendorCSS($toggle, "transition", `height ${duration}ms ease`);
    $toggle.style.height = $toggle.offsetHeight + "px";
  }

  /**
   * Determine if the content body is collapsed, that is if has an hidden overflow
   *
   * @returns {boolean}
   */
  function checkCollapsedDOMState() {
    return $body.scrollHeight > $body.offsetHeight;
  }

  /**
   * Determine if the content needs to be expandable, that is it is heighter
   * than the given maximum height. Toggle state attribute and toggle DOM
   * element according to this.
   *
   * @returns {boolean}
   */
  function checkThatIsExpandable(maxHeight) {
    let isIt = expandedHeight > getMaxHeight(maxHeight);

    if (isIt !== isExpandable) {
      $root.setAttribute("expander-expandable", isIt ? "true" : "false");
      $toggle.style.display = isIt ? "" : "none";
    }
    return isIt;
  }

  /**
   * Get max value, either the current one based on breakpoint in responsive
   * mode or the directly given value from the init options
   *
   * @returns {number}
   */
  function getMaxValue() {
    if (isResponsive) {
      let newMax;

      for (let i = 0; i < max.length; i++) {
        // breakpoints is an array of arrays, the first number is the breakpoint
        // px value, the second is the value to use on that breakpoint
        if (window.innerWidth > max[i][0]) {
          newMax = max[i][1];
        }
      }

      return newMax;
    }
    return max;
  }

  /**
   * Handle resize
   */
  function handleResize() {
    // get the new max for the breakpoint we are in
    const newMax = getMaxValue();

    // update the new "natural" height value
    expandedHeight = $body.scrollHeight;

    // always check that we actually need all this
    isExpandable = checkThatIsExpandable(newMax);

    // set new height if it hasn't been yet or if it should be different than
    // the last set one
    if (newMax !== currentMax) {
      currentMax = newMax;
    }

    // if it already collapsed set the new responsive height
    if (isCollapsed) {
      $body.style.height = getMaxHeight(currentMax) + "px";

      // if it is already expanded just adjust the height to what is needed
    } else {
      $body.style.height = "auto";
    }

    // update the toggle minimum height to disappear smoothly
    if (oneWay) {
      $toggle.style.height = $toggle.offsetHeight + "px";
    }
  }

  /**
   * Returns the maximum height a given element should have based on the line-
   * height of the text and the given clamp value.
   */
  function getMaxHeight(maxLinesOrHeight) {
    // if mode is height just use the given height, no calculations to do,
    // in "lines" mode instead compute the height based on the number of lines
    if (mode === "lines") {
      maxLinesOrHeight = getLineHeight($body) * maxLinesOrHeight;
    }

    // be sure to don't return a height bigger than the natural height of the
    // element, `expandedHeight` is always updated in the resize handler
    return Math.min(expandedHeight, maxLinesOrHeight);
  }

  /**
   * Returns the line-height of an element as an integer.
   *
   * Taken from clamp.js:
   * @see https://github.com/josephschmitt/Clamp.js
   * @returns {number}
   */
  function getLineHeight(elem) {
    let value = getStyleValue(elem, "line-height");
    if (value === "normal") {
      // Normal line heights vary from browser to browser. The spec recommends
      // a value between 1.0 and 1.2 of the font size. Using 1.1 to split the diff.
      return parseInt(getStyleValue(elem, "font-size"), 10) * 1.2;
    }
    return parseInt(value, 10);
  }

  /**
   * Handle keyboard enter or space
   */
  function handleEnter(event) {
    if (event.keyCode === 13 || event.keyCode === 32) {
      toggle();
    }
  }

  /**
   * Toggle
   */
  function toggle() {
    if (isCollapsed) {
      expand();
    } else {
      collapse();
    }
  }

  /**
   * Collapse
   */
  function collapse() {
    $root.setAttribute("expander", "false");
    $body.setAttribute("aria-expanded", "false");
    $body.style.height = getMaxHeight(currentMax) + "px";
    isCollapsed = true;
  }

  /**
   * Expand
   */
  function expand() {
    $root.setAttribute("expander", "true");
    $body.setAttribute("aria-expanded", "true");
    $body.style.height = expandedHeight + "px";
    if (oneWay) {
      $toggle.style.height = "0px";
    }
    isCollapsed = false;
  }

  // public API
  // return {}
}
