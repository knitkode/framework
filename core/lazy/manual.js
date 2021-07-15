import { $, $$, forEach, addClass, getDataAttr } from "@knitkode/core-dom";
import { isString } from "@knitkode/core-helpers/type";
import {
  lazyClass,
  lazyClassSuccess,
  // lazyClassLoading,
  setWasProcessedData,
  getWasProcessedData,
  setSourcesImg,
} from "./index";

/**
 * @typedef {{} | {
 *  [key: string]: {
 *    el: HTMLImageElement,
 *    src: string,
 *  }
 * }} lazyMap
 */

/**
 * Preload images from the given rooter
 *
 * @param {string | HTMLElement} rooter Either a selector or a DOM element
 * @param {(imagesMap: lazyMap) => any} done Callback to execute once all images are loaded
 * @param {Object} [options]
 * @param {string} [options.sel] Image selector, defaults to `lazyClass`
 * @param {string} [options.attr] Image src data attribute name, defaults to `src` (in the html `data-src="..."`)
 */
export function preloadImages(rooter, done, { sel, attr = "src" } = {}) {
  const map = {};
  const $images = $$(
    sel || `.${lazyClass}`,
    isString(rooter) ? $(rooter) : rooter
  );
  const howMany = $images.length;
  let asyncLoadedCount = 0;
  let toLoad = howMany;

  forEach($images, (el) => {
    el.className += ` ${lazyClass}`;

    if (getWasProcessedData(el)) {
      const { src, width, height } = /** @type {HTMLImageElement} */ (el);
      map[src] = { el, src, width, height };
      toLoad--;
    } else {
      asyncLoadedCount++;
      const dummy = new Image();
      const src = getDataAttr(el, attr);
      dummy.src = src;

      map[src] = { el, src };

      dummy.onload = function () {
        map[src].width = /** @type {HTMLImageElement} */ (this).width;
        map[src].height = /** @type {HTMLImageElement} */ (this).height;
        toLoad--;
        if (toLoad === 0) {
          if (done) done(map);
        }
      };
    }
  });

  if (asyncLoadedCount === 0 && !toLoad) {
    if (done) done(map);
  }
}

/**
 * Load all images
 *
 * @param {string | HTMLElement} rooter Either a selector or a DOM element
 * @param {Function} done Callback to execute once all images are loaded
 * @param {Object} [options]
 * @param {string} [options.sel] Image selector, defaults to `lazyClass`
 * @param {string} [options.attr] Image src data attribute name, defaults to `src` (in the html `data-src="..."`)
 */
export function loadAllImages(rooter, done, options) {
  preloadImages(
    rooter,
    (map) => {
      for (const src in map) {
        const { el } = map[src];
        // setDataAttr(el, "src", src);
        setSourcesImg(el);
        setWasProcessedData(el);

        // removeClass(el, lazyClassLoading);
        addClass(el, lazyClassSuccess);
      }
      if (done) done();
    },
    options
  );
}
