// @see https://www.npmjs.com/package/eases-jsnext#usage
import { cubicInOut } from "eases-jsnext";
import getDocumentHeight from "@knitkode/core-dom/getDocumentHeight";
import { isFunction, isNumber } from "@knitkode/core-helpers/type";

// TODO: decide whether to respect the user preference
// const userPrefersReducedMotion =
//   "matchMedia" in window &&
//   window.matchMedia("(prefers-reduced-motion)").matches;

/**
 * Calculate how far to scroll
 *
 * @see https://github.com/cferdinandi/smooth-scroll (credits)
 *
 * @param {HTMLElement | Number} target
 * @param {HTMLElement} [container] If a container is passed it needs to have a *non* `static` CSS `position`
 * @param {Number} offset
 * @returns {Number}
 */
function getEndY(target, container, offset, documentHeight) {
  var location = 0;

  if (isNumber(target)) {
    location = target;
  } else {
    if (container) {
      location = target.offsetTop;
      return location;
    }
    // TODO: reuse "../../dom/getOffsetTop" ?
    else if (target.offsetParent) {
      do {
        // @ts-ignore
        location += target.offsetTop;
        // @ts-ignore
        target = target.offsetParent;
      } while (target);
    }
  }

  location = Math.max(location - offset, 0);
  // adjust scroll distance to prevent abrupt stops near the bottom of the page
  location = Math.min(location, documentHeight - window.innerHeight);
  return location;
}

/**
 * Bring the anchored element into focus
 *
 * @see https://github.com/cferdinandi/smooth-scroll (credits)
 *
 * @param {HTMLElement | Number} target
 */
function adjustFocus(target) {
  // Is scrolling to top of page, blur
  if (target === 0) {
    document.body.focus();
  }

  // don't run if scrolling to a number on the page
  if (typeof target === "number") return;

  // Otherwise, bring element into focus
  target.focus();
  if (document.activeElement !== target) {
    target.setAttribute("tabindex", "-1");
    target.focus();
    target.style.outline = "none";
  }
}

/**
 * Scroll to
 *
 * @param {number | HTMLElement} target
 * @param {Object} options
 * @param {HTMLElement} [options.container=window] The container to scroll, uses `window` by default
 * @param {function(number | HTMLElement): void} [options.onstart]
 * @param {function(number | HTMLElement): void} [options.onstop]
 * @param {number | function(): number} [options.offset=0]
 * @param {boolean} [options.focus=true]
 * @param {number} [options.speed=500]
 * @returns {void}
 */
export default function scrollTo(
  target,
  { container, onstart, onstop, offset = 0, focus = true, speed = 500 } = {}
) {
  // if (__DEV__) {
  //   if (typeof target === "undefined") {
  //     console.error(`scrollTo: missing target element`);
  //   }
  // }
  const scroller = container || window;
  const hasScrollTo = isFunction(scroller.scrollTo);
  const documentHeight = getDocumentHeight();
  const _offset = isFunction(offset) ? offset() : offset;
  const fromY = container ? container.scrollTop : window.pageYOffset;
  const toY = getEndY(target, container, _offset, documentHeight);
  const distance = toY - fromY;
  const _speed = Math.abs((distance / 1000) * speed);
  let timeLapsed = 0;
  let start;
  let percentage;
  let position;

  // if the user prefers reduced motion, jump to location
  // if (userPrefersReducedMotion) {
  //   if (hasScrollTo) {
  //     scroller.scrollTo(0, Math.floor(toY));
  //   } else {
  //     scroller.scrollTop = Math.floor(toY);
  //   }
  //   if (onstop) onstop(target);
  //   return;
  // }

  // reset position to fix weird iOS bug
  // @see https://github.com/cferdinandi/smooth-scroll/issues/45
  if (fromY === 0) {
    if (hasScrollTo) {
      scroller.scrollTo(0, 0);
    } else {
      scroller.scrollTop = 0;
    }
  }

  /**
   * @param {number} timestamp
   */
  function loop(timestamp) {
    if (!start) {
      start = timestamp;
    }
    timeLapsed += timestamp - start;
    percentage = _speed === 0 ? 0 : timeLapsed / _speed;
    percentage = percentage > 1 ? 1 : percentage;
    position = fromY + distance * cubicInOut(percentage);

    if (hasScrollTo) {
      scroller.scrollTo(0, Math.floor(position));
    } else {
      scroller.scrollTop = Math.floor(position);
    }

    if (!stop(position, toY)) {
      requestAnimationFrame(loop);
      start = timestamp;
    }
  }

  /**
   * @param {number} position
   * @param {number} toY
   */
  function stop(position, toY) {
    // get the current location
    const nowY = container ? container.scrollTop : window.pageYOffset;

    // check if the target has been reached (or we've hit the end of the document)
    if (
      position === toY ||
      nowY === toY ||
      (!container &&
        (fromY < toY && window.innerHeight + nowY) >= documentHeight)
    ) {
      // clear the animation timer
      if (onstop) onstop(target);
      // bring the element into focus, it won't do anything if that is a number
      if (focus) adjustFocus(target);
      // reset start
      start = null;

      return true;
    }
  }

  if (onstart) onstart(target);

  requestAnimationFrame(loop);
}
