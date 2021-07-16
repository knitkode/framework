import { $, getDataAttr } from "@knitkode/core-dom";
import { isFunction, isString } from "@knitkode/core-helpers";

/**
 * The DOM element to use as the root container, usually the "starting point" of
 * a component
 */
export type Rooter = string | (() => HTMLElement) | HTMLElement;

/**
 * Call hook safely (if defined)
 */
export function callHookSafely<T extends Record<string, any>, Args>(
  hooks: T = {} as T,
  hookName: keyof T,
  ...args: Args[]
) {
  if (hooks[hookName]) hooks[hookName](...args);
}

/**
 * Abstraction get a scoped root element
 */
export function getScopedRoot(
  rooter: Rooter,
  root?: string
): HTMLElement | null {
  if (isString(rooter)) {
    return root ? $(`${rooter} ${root}`) : $(rooter);
  }
  if (isFunction(rooter)) {
    return rooter();
  }
  if (rooter) {
    return root ? $(root, rooter) : rooter;
  }
  return root ? $(root) : null;
}

/**
 * @see https://stackoverflow.com/a/37673534/1938970
 *
 * @example
 * ```js
 * const deferred = new Defer();
 * deferred.resolve();
 * deferred.then(handleSuccess, handleError);
 */
export function Defer<T>() /* : PromiseConstructor */ {
  const p = (this.promise = new Promise((resolve, reject) => {
    this.resolve = resolve;
    this.reject = reject;
  }));
  this.then = p.then.bind(p);
  this.catch = p.catch.bind(p);
  if (p.finally) {
    this.finally = p.finally.bind(p);
  }
}

/**
 * Get data JSON encoded data attribute on given HTML element
 */
export function getJSONdataAttr<T extends {}>(
  $element: HTMLElement,
  attr: string
) {
  const attrValue = getDataAttr($element, attr);
  let data = {};

  try {
    data = JSON.parse(attrValue);
  } catch (e) {
    if (__DEV__) {
      console.warn(
        `[@knitkode/core-helpers/interface] Malformed 'data-${attr}' attribute on DOM element`,
        $element
      );
    }
  }

  return data as T;
}

/**
 * Run the given callback on each targeted element
 */
//  function eachTarget(
//   target: string | HTMLElement | NodeList;,
//   callback: ($el: HTMLElement) => any
// ) {
//   if (isString(target)) {
//     $each(target, callback);
//   } else if (isNodeList(target)) {
//     forEach(target, callback);
//   } else if (target) {
//     callback(target);
//   }
// }
