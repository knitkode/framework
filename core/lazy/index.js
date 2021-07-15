/**
 * Lazy loading
 *
 * @file
 *
 * - @see https://github.com/verlok/lazyload Options documentation
 * - Consider also using @see https://github.com/aFarkas/lazysizes
 *
 * Polyfill of intersection observer?
 * @see https://github.com/verlok/lazyload#to-polyfill-or-not-to-polyfill-intersectionobserver
 */
// import LazyLoad from "vanilla-lazyload";
import {
  $$,
  forEach,
  toArray,
  addClass,
  removeClass,
  on,
  off,
  getDataAttr,
  setDataAttr,
} from "@knitkode/core-dom";
import "./index.scss";

export const lazyClass = "lazy";

export const lazyClassSuccess = "lazy-success";

export const lazyClassError = "lazy-error";

export const lazyClassLoading = "is-loading";

const runningOnBrowser = typeof window !== "undefined";

const isBot =
  (runningOnBrowser && !("onscroll" in window)) ||
  (typeof navigator !== "undefined" &&
    /(gle|ing|ro)bot|crawl|spider/i.test(navigator.userAgent));

const supportsIntersectionObserver =
  runningOnBrowser && "IntersectionObserver" in window;

const defaultSettings = {
  selector: "." + lazyClass,
  container: isBot || runningOnBrowser ? document : null,
  threshold: 300,
  thresholds: null,
  classLoading: lazyClassLoading,
  classLoaded: lazyClassSuccess,
  classError: lazyClassError,
  loadDelay: 0,
  autoUnobserve: true,
  onenter: null,
  onexit: null,
  onreveal: null,
  onloaded: null,
  onerror: null,
  onfinish: null,
  useNative: false,
};

const processedDataName = "was-processed";
const timeoutDataName = "ll-timeout";
const trueString = "true";

const resetWasProcessedData = (element) =>
  setDataAttr(element, processedDataName, null);

export const setWasProcessedData = (element) =>
  setDataAttr(element, processedDataName, trueString);

export const getWasProcessedData = (element) =>
  getDataAttr(element, processedDataName) === trueString;

const setTimeoutData = (element, value) =>
  setDataAttr(element, timeoutDataName, value);

const getTimeoutData = (element) => getDataAttr(element, timeoutDataName);

const purgeProcessedElements = (elements) => {
  return elements.filter((element) => !getWasProcessedData(element));
};

const purgeOneElement = (elements, elementToPurge) => {
  return elements.filter((element) => element !== elementToPurge);
};

const safeCallback = (callback, arg1, arg2, arg3) => {
  if (!callback) {
    return;
  }

  if (arg3 !== undefined) {
    callback(arg1, arg2, arg3);
    return;
  }
  if (arg2 !== undefined) {
    callback(arg1, arg2);
    return;
  }
  callback(arg1);
};

const updateLoadingCount = (instance, plusMinus) => {
  instance._loadingCount += plusMinus;
  if (instance._els.length === 0 && instance._loadingCount === 0) {
    safeCallback(instance._s.onfinish, instance);
  }
};

const getSourceTags = (parentTag) => {
  let sourceTags = [];
  for (let i = 0, childTag; (childTag = parentTag.children[i]); i += 1) {
    if (childTag.tagName === "SOURCE") {
      sourceTags.push(childTag);
    }
  }
  return sourceTags;
};

const setAttributeIfValue = (element, attrName, value) => {
  if (!value) {
    return;
  }
  element.setAttribute(attrName, value);
  return true;
};

const setImageAttributes = (element) => {
  setAttributeIfValue(element, "sizes", getDataAttr(element, "sizes"));
  // <source src> with a <picture> parent is invalid and therefore ignored.
  // Please use <source srcset> instead.
  // if (!setAttributeIfValue(element, "srcset", getDataAttr(element, "src"))) {
  //   setAttributeIfValue(element, "src", getDataAttr(element, "src"));
  // }
  setAttributeIfValue(element, "srcset", getDataAttr(element, "srcset"));
  setAttributeIfValue(element, "src", getDataAttr(element, "src"));
};

export const setSourcesImg = (element) => {
  const parent = element.parentNode;

  if (parent && parent.tagName === "PICTURE") {
    let sourceTags = getSourceTags(parent);
    sourceTags.forEach((sourceTag) => {
      setImageAttributes(sourceTag);
    });
  }

  setImageAttributes(element);
};

const setSourcesIframe = (element) => {
  setAttributeIfValue(element, "src", getDataAttr(element, "src"));
};

const setSourcesVideo = (element) => {
  let sourceTags = getSourceTags(element);
  sourceTags.forEach((sourceTag) => {
    setAttributeIfValue(sourceTag, "src", getDataAttr(sourceTag, "src"));
  });
  setAttributeIfValue(element, "poster", getDataAttr(element, "poster"));
  setAttributeIfValue(element, "src", getDataAttr(element, "src"));
  element.load();
};

const setSourcesBgImage = (element) => {
  const srcDataValue = getDataAttr(element, "src");
  const bgDataValue = getDataAttr(element, "bg");

  if (srcDataValue) {
    element.style.backgroundImage = `url("${srcDataValue}")`;
  }

  if (bgDataValue) {
    element.style.backgroundImage = bgDataValue;
  }
};

const setSourcesFunctions = {
  IMG: setSourcesImg,
  IFRAME: setSourcesIframe,
  VIDEO: setSourcesVideo,
};

const setSources = (element, instance) => {
  const tagName = element.tagName;
  const setSourcesFunction = setSourcesFunctions[tagName];
  if (setSourcesFunction) {
    setSourcesFunction(element);
    updateLoadingCount(instance, 1);
    instance._els = purgeOneElement(instance._els, element);
    return;
  }
  setSourcesBgImage(element);
};

const genericLoadEventName = "load";
const mediaLoadEventName = "loadeddata";
const errorEventName = "error";

const addEventListeners = (element, loadHandler, errorHandler) => {
  on(element, genericLoadEventName, loadHandler);
  on(element, mediaLoadEventName, loadHandler);
  on(element, errorEventName, errorHandler);
};

const removeEventListeners = (element, loadHandler, errorHandler) => {
  off(element, genericLoadEventName, loadHandler);
  off(element, mediaLoadEventName, loadHandler);
  off(element, errorEventName, errorHandler);
};

const eventHandler = function (event, success, instance) {
  var settings = instance._s;
  const className = success ? settings.classLoaded : settings.classError;
  const callback = success ? settings.onloaded : settings.onerror;
  const element = event.target;

  removeClass(element, settings.classLoading);
  addClass(element, className);
  if (!success) element.alt = "";
  safeCallback(callback, element, instance);

  updateLoadingCount(instance, -1);
};

const addOneShotEventListeners = (element, instance) => {
  const loadHandler = (event) => {
    eventHandler(event, true, instance);
    removeEventListeners(element, loadHandler, errorHandler);
  };
  const errorHandler = (event) => {
    eventHandler(event, false, instance);
    removeEventListeners(element, loadHandler, errorHandler);
  };
  addEventListeners(element, loadHandler, errorHandler);
};

const managedTags = ["IMG", "IFRAME", "VIDEO"];

const onEnter = (element, entry, instance) => {
  const settings = instance._s;
  safeCallback(settings.onenter, element, entry, instance);
  if (!settings.loadDelay) {
    revealAndUnobserve(element, instance);
    return;
  }
  delayLoad(element, instance);
};

const revealAndUnobserve = (element, instance) => {
  var observer = instance._O;
  revealElement(element, instance);
  if (observer && instance._s.autoUnobserve) {
    observer.unobserve(element);
  }
};

const onExit = (element, entry, instance) => {
  const settings = instance._s;
  safeCallback(settings.onexit, element, entry, instance);
  if (!settings.loadDelay) {
    return;
  }
  cancelDelayLoad(element);
};

const cancelDelayLoad = (element) => {
  var timeoutId = getTimeoutData(element);
  if (!timeoutId) {
    return; // do nothing if timeout doesn't exist
  }
  // @ts-ignore
  clearTimeout(timeoutId);
  setTimeoutData(element, null);
};

const delayLoad = (element, instance) => {
  var loadDelay = instance._s.loadDelay;
  var timeoutId = getTimeoutData(element);
  if (timeoutId) {
    return; // do nothing if timeout already set
  }
  // @ts-ignore
  timeoutId = setTimeout(function () {
    revealAndUnobserve(element, instance);
    cancelDelayLoad(element);
  }, loadDelay);
  setTimeoutData(element, timeoutId);
};

const revealElement = (element, instance, force) => {
  var settings = instance._s;
  if (!force && getWasProcessedData(element)) {
    return; // element has already been processed and force wasn't true
  }
  if (managedTags.indexOf(element.tagName) > -1) {
    addOneShotEventListeners(element, instance);
    addClass(element, settings.classLoading);
  }
  setSources(element, instance);
  setWasProcessedData(element);
  safeCallback(settings.onreveal, element, instance);
  safeCallback(settings.callback_set, element, instance);
};

const isIntersecting = (entry) =>
  entry.isIntersecting || entry.intersectionRatio > 0;

const getObserverSettings = (settings) => ({
  root: settings.container === document ? null : settings.container,
  rootMargin: settings.thresholds || settings.threshold + "px",
});

const setObserver = (instance) => {
  if (!supportsIntersectionObserver) {
    return null;
  }
  return new IntersectionObserver((entries) => {
    entries.forEach((entry) =>
      isIntersecting(entry)
        ? onEnter(entry.target, entry, instance)
        : onExit(entry.target, entry, instance)
    );
  }, getObserverSettings(instance._s));
};

const nativeLazyTags = ["IMG", "IFRAME"];

const shouldUseNative = (settings) =>
  settings.useNative && "loading" in HTMLImageElement.prototype;

const loadAllNative = (instance) => {
  instance._els.forEach((element) => {
    if (nativeLazyTags.indexOf(element.tagName) === -1) {
      return;
    }
    element.setAttribute("loading", "lazy");
    revealElement(element, instance);
  });
};

const getElements = (elements, settings) =>
  purgeProcessedElements(
    toArray(elements || $$(settings.selector, settings.container))
  );

const retryLazyLoad = (instance) => {
  var settings = instance._s;
  var errorElements = $$("." + settings.classError, settings.container);
  forEach(errorElements, (element) => {
    removeClass(element, settings.classError);
    resetWasProcessedData(element);
  });
  instance.update();
};

const setOnlineCheck = (instance) => {
  if (!runningOnBrowser) {
    return;
  }

  on(window, "online", (event) => {
    retryLazyLoad(instance);
  });
};

/**
 * Lazyload
 *
 * Very similar to https://github.com/verlok/lazyload
 *
 * @constructor
 *
 * @param {Object} [custom={}]
 * @param {string} [custom.selector=".lazy"]
 * @param {Element} [custom.container]
 * @param {number} [custom.threshold=300]
 * @param {any} [custom.thresholds=null]
 * @param {string} [custom.classLoading="is-loading"]
 * @param {string} [custom.classLoaded="lazy-success"]
 * @param {string} [custom.classError="lazy-error"]
 * @param {number} [custom.loadDelay=0]
 * @param {boolean} [custom.autoUnobserve=true]
 * @param {Function} [custom.onenter=null]
 * @param {Function} [custom.onexit=null]
 * @param {Function} [custom.onreveal=null]
 * @param {Function} [custom.onloaded=null]
 * @param {Function} [custom.onerror=null]
 * @param {Function} [custom.onfinish=null]
 * @param {boolean} [custom.useNative=false]
 * @param {NodeList} [elements]
 */
function LazyLoad(custom = {}, elements) {
  this._s = {
    ...defaultSettings,
    ...custom,
  };
  this._els = [];
  this._loadingCount = 0;
  this._O = setObserver(this);
  this.update(elements);
  setOnlineCheck(this);
}

LazyLoad.prototype = {
  update: function (elements) {
    var settings = this._s;
    this._els = getElements(elements, settings);
    if (isBot || !this._O) {
      this.loadAll();
      return;
    }
    if (shouldUseNative(settings)) {
      loadAllNative(this);
      this._els = getElements(elements, settings);
    }
    this._els.forEach((element) => {
      this._O.observe(element);
    });
  },

  destroy: function () {
    if (this._O) {
      this._els.forEach((element) => {
        this._O.unobserve(element);
      });
      this._O = null;
    }
    this._els = null;
    this._s = null;
  },

  load: function (element, force) {
    revealElement(element, this, force);
  },

  loadAll: function () {
    this._els.forEach((element) => {
      revealAndUnobserve(element, this);
    });
  },
};

// autoinit
// new LazyLoad();

export default LazyLoad;
