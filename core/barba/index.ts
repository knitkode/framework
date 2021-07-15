import { $, setDataAttr } from "@knitkode/core-dom";
import _barba from "@barba/core";
import scrollTo from "@knitkode/core-scroll/scrollTo";
// import barbaRouter from "@barba/router";
export { barbaRoute } from "./route";

export const barba = _barba;

/**
 * Barba before enter global hook
 *
 * Run at each state change, always re-initialise the lazy loading and update
 * the header state (which is outside of the `barba-container`)
 *
 * About scrolling and navigation:
 * @see https://github.com/barbajs/barba/issues/159
 */
barba.hooks.beforeEnter((data) => {
  // `data.trigger` is one of HTMLElment | "barba" | "back" | "forward",
  // scroll only to top when transitioning to a new route by actually clicking
  // a link, otherwise just keep the scroll position
  if (typeof data.trigger !== "string") {
    scrollTo(0);
  }

  // assign a data attribute with the next route namespace on the `<html>`
  // element
  setDataAttr($("html"), "route", data.next.namespace);
});
