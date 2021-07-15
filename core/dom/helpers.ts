/**
 * Escape colons to allow use class names as `.module:block__element`
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector#Escaping_special_characters
 *
 * @param {string} selector
 * @returns {string}
 */
export function escape(selector: string) {
  return selector.replace(/:/g, "\\:");
}

/**
 * Sizzle/jQuery like DOM nodes shortcut for `document.querySelector`
 * To avoid an extra function call we inline the above `escape`
 *
 * @param {string} selector DOM selector
 * @param {HTMLElement | Document} [parent] It falls back to `window.document`
 * @param {boolean} [avoidEscape] Whether to avoid escaping `:` in the selector string
 * @example <caption>Basic DOM selection</caption>
 * const $container = $(".my-section:");
 * const $el = $("[data-some-attr]", $container);
 */
export function $<T extends Element = HTMLElement>(
  selector: string,
  parent?: HTMLElement | Document,
  avoidEscape?: boolean
) {
  return (parent ? parent : document).querySelector(
    avoidEscape ? selector : selector.replace(/:/g, "\\:")
  ) as unknown as T;
}

/**
 * Sizzle/jQuery like DOM nodes shortcut for `document.querySelectorAll`
 * To avoid an extra function call we inline the above `escape`
 *
 * @param {string} selector DOM selector
 * @param {HTMLElement | Document} [parent] It falls back to `window.document`
 * @param {boolean} [avoidEscape] Whether to avoid escaping `:` in the selector string
 */
export function $$<T extends Element = HTMLElement>(
  selector: string,
  parent?: HTMLElement | Document,
  avoidEscape?: boolean
) {
  return (parent ? parent : document).querySelectorAll(
    avoidEscape ? selector : selector.replace(/:/g, "\\:")
  ) as unknown as NodeListOf<T>;
}

/**
 * For each, iterate through a NodeList of HTMLElements
 *
 * @param {NodeList} nodes DOM nodes collection
 * @param {function(HTMLElement, number):any} callback
 * @param {object} [scope]
 */
export function forEach<T extends Element = HTMLElement>(
  nodes: NodeList,
  callback: ($element: T, index: number) => any,
  scope?: object
) {
  for (var i = 0; i < nodes.length; i++) {
    callback.call(scope, nodes[i], i);
  }
}

/**
 * Each shortcut, iterate through a NodeList of HTMLElements retrieved with the
 * given selector (and optionally a parent container passed as thrid arguement)
 *
 * @param {string} selector DOM selector
 * @param {function(HTMLElement, number):any} callback
 * @param {HTMLElement} [parent] It falls back to `window.document`
 * @param {object} [scope]
 */
export function $each<T extends Element = HTMLElement>(
  selector: string,
  callback: ($element: T, index: number) => any,
  parent?: HTMLElement,
  scope?: object
) {
  const nodes = $$(selector, parent);
  for (var i = 0; i < nodes.length; i++) {
    callback.call(scope, nodes[i], i);
  }
}

/**
 * Node list to array
 *
 * @param {NodeList | HTMLFormControlsCollection} nodeList
 */
export function toArray<T extends Element = HTMLElement>(
  nodeList: NodeListOf<T> | HTMLFormControlsCollection
) {
  return Array.prototype.slice.call(nodeList) as T[] | HTMLFormElement[];
}

/**
 * Add class shortcut
 */
export function addClass<T extends Element = HTMLElement>(
  el?: T,
  className?: string
) {
  if (__DEV__) {
    if (!el) {
      console.warn("Used `addClass` with an unexisting DOM element");
      return;
    }
  }
  if (el) el.classList.add(className);
}

/**
 * Remove class shortcut
 */
export function removeClass<T extends Element = HTMLElement>(
  el?: T,
  className?: string
) {
  if (__DEV__) {
    if (!el) {
      console.warn("Used `removeClass` with an unexisting DOM element");
      return;
    }
  }
  if (el) el.classList.remove(className);
}

/**
 * Set vendor CSS rule
 *
 * @param {HTMLElement} element A single HTMLElement
 * @param {string} prop CSS rule proerty
 * @param {string | number | boolean} value The CSS value to set, it will be automatically vendor prefixed
 */
export function setVendorCSS(
  element: HTMLElement,
  prop: string,
  value: string | number | boolean
) {
  const propUpper = prop.charAt(0).toUpperCase() + prop.slice(1);
  element.style["webkit" + propUpper] = value;
  element.style["moz" + propUpper] = value;
  element.style["ms" + propUpper] = value;
  element.style["o" + propUpper] = value;
  element.style[prop] = value;
}

/**
 * Is node list
 *
 * @param {any} nodes The object to check
 */
export function isNodeList<T>(nodes: any): nodes is NodeList {
  const stringRepr = Object.prototype.toString.call(nodes);

  return (
    typeof nodes === "object" &&
    /^\[object (HTMLCollection|NodeList|Object)\]$/.test(stringRepr) &&
    typeof nodes.length === "number" &&
    (nodes.length === 0 ||
      (typeof nodes[0] === "object" && nodes[0].nodeType > 0))
  );
}

/**
 * Shortcut for `addEventListener`
 *
 * @param {Window | Document | HTMLElement | Element} el
 * @param {string} type
 * @param {EventListener} handler
 * @param {AddEventListenerOptions | boolean} [options=false]
 */
export function on(
  el: Window | Document | HTMLElement | Element,
  type: string,
  handler: EventListener,
  options: AddEventListenerOptions | boolean = false
) {
  if (__DEV__) {
    if (!el) {
      console.warn("Used `on` with an unexisting DOM element");
      return;
    }
  }
  if (el) el.addEventListener(type, handler, options);
}

/**
 * Shortcut for `removeEventListener`
 *
 * @param {Window | Document | HTMLElement | Element} el
 * @param {string} type
 * @param {EventListener} handler
 * @param {EventListenerOptions | boolean} [options=false]
 */
export function off(
  el: Window | Document | HTMLElement | Element,
  type: string,
  handler: EventListener,
  options: EventListenerOptions | boolean = false
) {
  if (__DEV__) {
    if (!el) {
      console.warn("Used `off` with an unexisting DOM element");
      return;
    }
  }
  if (el) el.removeEventListener(type, handler, options);
}

/**
 * One shot listener, it `addEventListener` and removes it first time is called
 * with `removeEventListener`
 *
 * @param {Window | Document | HTMLElement} el
 * @param {string} type
 * @param {EventListener} handler
 * @param {EventListenerOptions | boolean} [options=false]
 */
export function once(
  el: Window | Document | HTMLElement,
  type: string,
  handler: EventListener,
  options: EventListenerOptions | boolean = false
) {
  const handlerWrapper = (event) => {
    handler(event);
    off(el, type, handlerWrapper);
  };

  on(el, type, handlerWrapper, options);
}

/**
 * Shortcut for `document.createElement`, allowing to to create an HTML element
 * with a given className directly (a very common use case)
 *
 * @param {string} type
 * @param {string} [className]
 * @return {HTMLElement}
 */
export function createElement(type: string, className?: string) {
  const el = document.createElement(type);
  if (className) {
    el.classList.add(className);
  }
  return el;
}

/**
 * Is element hidden?
 *
 * @param {HTMLElement} [el]
 * @return {boolean}
 */
export function isHidden(el?: HTMLElement) {
  return !el || el.offsetParent === null;
}

/**
 * Finds siblings nodes of the passed node.
 *
 * @see @glidejs/glide/src/utils/dom (source)
 * @param {Element} node
 * @return {Array}
 */
export function siblings(node: Element) {
  if (node && node.parentNode) {
    let n = node.parentNode.firstChild;
    let matched = [] as Element[];

    for (; n; n = n.nextSibling) {
      if (n.nodeType === 1 && n !== node) {
        matched.push(n as Element);
      }
    }

    return matched;
  }

  return [];
}

/**
 * Checks if passed node exist and is a valid element.
 *
 * @see @glidejs/glide/src/utils/dom (source)
 * @param {Element} [node]
 * @return {boolean}
 */
export function exists(node?: Element) {
  if (node && node instanceof window.HTMLElement) {
    return true;
  }

  return false;
}

/**
 * Get data attribute
 *
 * TODO: maybe move to `dataset` API but consider the comment about Safari here
 * https://stackoverflow.com/a/9201264/1938970
 *
 * @param {HTMLElement} element
 * @param {string} attribute The name of the `data-{attr}`
 */
export function getDataAttr(element: HTMLElement, attribute: string) {
  // return element.dataset[attribute];
  return element.getAttribute("data-" + attribute);
}

/**
 * Set data
 *
 * TODO: maybe move to `dataset` API but consider the comment about Safari here
 * https://stackoverflow.com/a/9201264/1938970
 *
 * @param {Element} element
 * @param {string} attribute The name of the `data-{attr}`
 * @param {string | number | null} [value] The value to set, `null` or
 *                                         `undefined` will remove the attribute
 */
export function setDataAttr(
  element: HTMLElement,
  attribute: string,
  value: string | number | null
) {
  if (value === null || typeof value === "undefined") {
    // delete element.dataset[attribute];
    // return;
    element.removeAttribute("data-" + attribute);
    return;
  }
  // element.dataset[attribute] = value.toString();
  element.setAttribute("data-" + attribute, value.toString());
}

/**
 * Emit event (use only if the targeted browser supports `CustomEvent`s)
 *
 * @param {string} [type="customEvent"]
 * @param {object} [detail={}]
 * @returns
 */
export function emitEvent<Detail extends {}>(
  type: string = "customEvent",
  detail: Detail = {} as Detail
) {
  if (typeof window.CustomEvent !== "function") return;

  document.dispatchEvent(
    new CustomEvent(type, {
      bubbles: true,
      detail,
    })
  );
}

/**
 * Determine the document's height
 *
 * @see https://github.com/cferdinandi/smooth-scroll (credits)
 * @returns {number}
 */
export function getDocumentHeight() {
  const { body, documentElement } = document;

  return Math.max(
    body.scrollHeight,
    documentElement.scrollHeight,
    body.offsetHeight,
    documentElement.offsetHeight,
    body.clientHeight,
    documentElement.clientHeight
  );
}

/**
 * Get element height
 *
 * @param {HTMLElement} element
 * @returns {number}
 */
export function getHeight(element) {
  return parseInt(window.getComputedStyle(element).height, 10);
}

/**
 * Get an element's distance from the top and left of the Document.
 *
 * @param  {HTMLElement} elem The HTML node element
 * @return {{ top: number, left: number }} Distance from the top and left in pixels
 */
export function getOffset(elem) {
  let left = 0;
  let top = 0;

  while (elem && !isNaN(elem.offsetLeft) && !isNaN(elem.offsetTop)) {
    left += elem.offsetLeft - elem.scrollLeft;
    top += elem.offsetTop - elem.scrollTop;
    // @ts-ignore
    elem = elem.offsetParent;
  }
  return { top, left };
}

/**
 * Get an element's distance from the top of the Document.
 *
 * @see https://vanillajstoolkit.com/helpers/getoffsettop/
 *
 * @param  {HTMLElement} elem The HTML node element
 * @return {number}    Distance from the top in pixels
 */
export function getOffsetTop(elem) {
  let location = 0;
  if (elem.offsetParent) {
    while (elem) {
      location += elem.offsetTop;
      // @ts-ignore
      elem = elem.offsetParent;
    }
  }
  return location >= 0 ? location : 0;
}

/**
 * Get scrollbar's current width
 *
 * @param {HTMLElement} [element]
 * @returns {number}
 */
export function getScrollbarWidth(element) {
  return window.innerWidth - (element || document.documentElement).clientWidth;
}

/**
 * Return the current style value for an element CSS property
 *
 * @param {HTMLElement} el The element to compute
 * @param {string} prop The style property
 * @returns {string}
 */
export function getStyleValue(el: HTMLElement, prop: string) {
  return getComputedStyle(el, null).getPropertyValue(prop);
}

/**
 * Determine if an element is in the viewport
 *
 * (c) 2017 Chris Ferdinandi, MIT License, https://gomakethings.com
 *
 * @return {boolean} Returns `true` if element is in the viewport
 */
export function isInViewport(elem: Element | HTMLElement) {
  const distance = elem.getBoundingClientRect();
  return (
    distance.top >= 0 &&
    distance.left >= 0 &&
    distance.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    distance.right <=
      (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Is element totally scrolled
 *
 * @see https://github.com/willmcpo/body-scroll-lock/blob/master/src/bodyScrollLock.js#L116
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#Problems_and_solutions
 */
export function isTotallyScrolled(el?: HTMLElement) {
  return el ? el.scrollHeight - el.scrollTop <= el.clientHeight : false;
}

/**
 * On click outside
 */
export function onClickOutside(
  element: HTMLElement,
  callback: Function,
  autoUnbind: boolean = false
) {
  const bind = (event) => {
    // if (event.target.closest(element) === null) {
    if (!element.contains(event.target)) {
      callback();
      if (autoUnbind) unbind();
    }
  };

  const unbind = () => {
    off(document, "click", bind);
  };

  on(document, "click", bind);

  return unbind;
}
