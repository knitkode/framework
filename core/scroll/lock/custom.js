/**
 * @fileoverview
 *
 * Scroll lock custom implementation
 *
 * A mixture of `body-scroll-lock` and `scroll-lock`. Basically the first plus
 * the fill gaps option from the latter.
 * `reserveScrollBarGap` is set to true by default by altering the if condition
 * in `setOverflowHidden`
 *
 * @see
 * - https://github.com/willmcpo/body-scroll-lock/blob/master/src/bodyScrollLock.js
 * - https://github.com/FL3NKEY/scroll-lock/blob/master/src/scroll-lock.js
 */
import {
  forEach,
  getScrollbarWidth,
  isTotallyScrolled,
  on,
  off,
  getDataAttr,
  setDataAttr,
} from "@knitkode/core-dom";
import getPassiveEventOpt from "@knitkode/core-polyfills/passiveEvents";
import { isIos } from "@knitkode/core-detect/isIos";

export const ATTR_SCROLLGAP = "scrollgap";
const ATTR_SCROLLGAP_SET = "scrollgap-set";

// Adopted and modified solution from Bohdan Didukh (2017)
// https://stackoverflow.com/questions/41594997/ios-10-safari-prevent-scrolling-behind-a-fixed-overlay-and-maintain-scroll-posi

let locks = [];
let documentListenerAdded = false;
let initialClientY = -1;
let previousBodyOverflowSetting;
let previousBodyPaddingRight;
/** @type {NodeList | HTMLElement[] | null} */
let fillGapTargets = null;

// returns true if `el` should be allowed to receive touchmove events.
function allowTouchMove(el) {
  return locks.some((lock) => {
    if (lock.options.allowTouchMove && lock.options.allowTouchMove(el)) {
      return true;
    }

    return false;
  });
}

function preventDefault(rawEvent) {
  const e = rawEvent || window.event;

  // For the case whereby consumers adds a touchmove event listener to document.
  // Recall that we do document.addEventListener('touchmove', preventDefault,
  // { passive: false }) in disableBodyScroll - so if we provide this
  // opportunity to allowTouchMove, then the touchmove event on document will
  // break.
  if (allowTouchMove(e.target)) {
    return true;
  }
  // Do not prevent if the event has more than one touch (usually meaning this
  // is a multi touch gesture like pinch to zoom).
  if (e.touches.length > 1) return true;

  if (e.preventDefault) e.preventDefault();

  return false;
}

function setOverflowHidden(options) {
  // Setting overflow on body/documentElement synchronously in Desktop Safari
  // slows down the responsiveness for some reason. Setting within a setTimeout
  // fixes this.
  setTimeout(() => {
    const scrollBarGap = getScrollbarWidth();

    // fill gaps if any targets are there (the condition is in there)
    fillGaps(scrollBarGap);

    // If previousBodyPaddingRight is already set, don't set it again.
    if (previousBodyPaddingRight === undefined) {
      const dontReserveScrollBarGap =
        options && options.reserveScrollBarGap === false;

      if (!dontReserveScrollBarGap && scrollBarGap > 0) {
        previousBodyPaddingRight = document.body.style.paddingRight;
        document.body.style.paddingRight = `${scrollBarGap}px`;
      }
    }

    // If previousBodyOverflowSetting is already set, don't set it again.
    if (previousBodyOverflowSetting === undefined) {
      previousBodyOverflowSetting = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
  });
}

function restoreOverflowSetting() {
  // Setting overflow on body/documentElement synchronously in Desktop Safari
  // slows down the responsiveness for some reason. Setting within a setTimeout
  // fixes this.
  setTimeout(() => {
    // unfill gaps immediately
    unfillGaps();

    if (previousBodyPaddingRight !== undefined) {
      document.body.style.paddingRight = previousBodyPaddingRight;

      // Restore previousBodyPaddingRight to undefined so setOverflowHidden
      // knows it can be set again.
      previousBodyPaddingRight = undefined;
    }

    if (previousBodyOverflowSetting !== undefined) {
      document.body.style.overflow = ""; // previousBodyOverflowSetting;

      // Restore previousBodyOverflowSetting to undefined
      // so setOverflowHidden knows it can be set again.
      previousBodyOverflowSetting = undefined;
    }
  });
}

function handleScroll(event, targetElement) {
  const clientY = event.targetTouches[0].clientY - initialClientY;

  if (allowTouchMove(event.target)) {
    return false;
  }

  if (targetElement && targetElement.scrollTop === 0 && clientY > 0) {
    // element is at the top of its scroll.
    return preventDefault(event);
  }

  if (isTotallyScrolled(targetElement) && clientY < 0) {
    // element is at the top of its scroll.
    return preventDefault(event);
  }

  event.stopPropagation();
  return true;
}

/**
 * Unfill gaps if there are no locks active and gap targets have been set
 */
function unfillGaps() {
  if (fillGapTargets) {
    forEach(fillGapTargets, (target) => {
      const originalPaddingRight = getDataAttr(target, ATTR_SCROLLGAP);
      if (originalPaddingRight) {
        target.style.paddingRight = originalPaddingRight;
      }

      // remove the flag
      setDataAttr(target, ATTR_SCROLLGAP_SET);
    });
  }
}

/**
 * Fill gaps if gap targets have been set
 *
 * @param {number} scrollBarGap
 */
function fillGaps(scrollBarGap) {
  if (fillGapTargets) {
    // const scrollBarGap = getScrollbarWidth();
    forEach(fillGapTargets, (target) => {
      if (!getDataAttr(target, ATTR_SCROLLGAP_SET)) {
        target.style.paddingRight = `${scrollBarGap}px`;
        // flag it positively
        setDataAttr(target, ATTR_SCROLLGAP_SET, "y");
      }
    });
  }
}

/**
 * Set gap targets, this can be done once, re-calling the function will overwrite
 * the current targets
 *
 * @param {NodeList | HTMLElement[]} elements
 */
export function fillGapsOf(elements) {
  fillGapTargets = elements;

  forEach(fillGapTargets, (target) => {
    const originalPaddingRight = getComputedStyle(target).paddingRight;
    setDataAttr(target, ATTR_SCROLLGAP, originalPaddingRight);
  });
}

/**
 * Disable body scroll, the given element will retain its scroll behaviour
 *
 * @param {HTMLElement} targetElement Needed for iOS devices
 * @param {Object} [options]
 */
export function disableBodyScroll(targetElement, options) {
  if (isIos) {
    // targetElement must be provided, and disableBodyScroll must not have been
    // called on this targetElement before.
    if (!targetElement) {
      // targElement must be provided when calling disableBodyScroll on IOS
      return;
    }

    if (
      targetElement &&
      !locks.some((lock) => lock.targetElement === targetElement)
    ) {
      const lock = {
        targetElement,
        options: options || {},
      };

      locks = [...locks, lock];

      targetElement.ontouchstart = (event) => {
        if (event.targetTouches.length === 1) {
          // detect single touch.
          initialClientY = event.targetTouches[0].clientY;
        }
      };
      targetElement.ontouchmove = (event) => {
        if (event.targetTouches.length === 1) {
          // detect single touch.
          handleScroll(event, targetElement);
        }
      };

      if (!documentListenerAdded) {
        on(document, "touchmove", preventDefault, getPassiveEventOpt());
        documentListenerAdded = true;
      }
    }
  } else {
    setOverflowHidden(options);
    const lock = {
      targetElement,
      options: options || {},
    };

    locks = [...locks, lock];
  }
}

/**
 * Clear all body scroll locks
 *
 */
export function clearAllBodyScrollLocks() {
  if (isIos) {
    // Clear all locks ontouchstart/ontouchmove handlers, and the references.
    locks.forEach((lock) => {
      lock.targetElement.ontouchstart = null;
      lock.targetElement.ontouchmove = null;
    });

    if (documentListenerAdded) {
      off(document, "touchmove", preventDefault, getPassiveEventOpt());
      documentListenerAdded = false;
    }

    locks = [];

    // Reset initial clientY.
    initialClientY = -1;
  } else {
    restoreOverflowSetting();
    locks = [];
  }
}

/**
 * Enable body scroll lock, the given element will restore its scroll behaviour
 *
 * @param {HTMLElement} targetElement Needed for iOS devices
 */
export function enableBodyScroll(targetElement) {
  if (isIos) {
    if (!targetElement) {
      // targElement must be provided when calling enableBodyScroll on IOS
      return;
    }

    targetElement.ontouchstart = null;
    targetElement.ontouchmove = null;

    locks = locks.filter((lock) => lock.targetElement !== targetElement);

    if (documentListenerAdded && locks.length === 0) {
      off(document, "touchmove", preventDefault, getPassiveEventOpt());

      documentListenerAdded = false;
    }
  } else {
    locks = locks.filter((lock) => lock.targetElement !== targetElement);
    if (!locks.length) {
      restoreOverflowSetting();
    }
  }
}
