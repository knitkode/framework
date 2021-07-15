import { getDataAttr } from "@knitkode/core-dom";
import { isString } from "@knitkode/core-helpers";
import onScroll from "@knitkode/core-scroll/onScroll";
import { normaliseInitialiserOptions } from "@knitkode/core-scroll/onScroll/withScrollTrigger";
import "./index.scss";

// TODO: create some defaults effects with `gsap.registerEffect` new api

/**
 * Animate on scroll
 *
 * Init an scroll listener for HTML elements matching `data-onscroll={id}` or
 * for the given DOM element
 * It can be called with an `option` object as second argument or with a
 * `function`, a shortcut to the `onin` callback.
 *
 * It serves as a thin API to connect gsap animations on elements getting into
 * viewport.
 * It uses a tiny library to listen on scroll event and in viewport detection
 * and provides a `data-onscroll` HTML api to reuse the same animations
 * declaratively in the HTML.
 *
 * @see https://github.com/terwanerik/ScrollTrigger
 *
 * @type {OnScroll.initaliser}
 */
export function animateOnScroll(target, custom) {
  const { onin } = normaliseInitialiserOptions(custom);

  // data attribute API, TODO: not sure this is good
  target = isString(target) ? `[data-onscroll="${target}"]` : target;

  /**
   * Callback called on in in animation mode
   *
   * @type {OnScroll.options["onin"]}
   */
  function callbackInAnimation(element) {
    const delay = getDataAttr(element, "delay") || 0;

    // call it in a timeout otherwise it is too fast, and the `onin`
    // of elements visible immediately on load won't be perceivable
    setTimeout(
      () => {
        element.style.visibility = "visible";
        onin(element);
      },
      delay ? parseInt(delay, 10) : 0
    );
  }

  // final ScrollTrigger options to treat based on given options and mode
  const opts = {
    onin: onin ? callbackInAnimation : null,
    toggle: {
      class: {
        in: "is-in",
        out: "is-out",
      },
    },
  };

  return onScroll(target, opts);
}
