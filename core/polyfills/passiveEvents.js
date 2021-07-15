import { on } from "@knitkode/core-dom";

let supportsPassive = false;

try {
  const opts = Object.defineProperty({}, "passive", {
    get: function () {
      supportsPassive = true;
    },
  });
  // @ts-ignore
  on("testPE", null, opts);
} catch (e) {}

/**
 * Get passive event listener option
 *
 * @see https://www.afasterweb.com/2017/08/23/passive-event-listeners-scroll-performance/
 * @param {boolean} [fallback]
 * @returns {Object | boolean}
 */
export default function getPassiveEventOpt(fallback) {
  return supportsPassive ? { passive: true } : fallback;
}
