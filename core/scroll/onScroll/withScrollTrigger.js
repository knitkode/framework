import { isFunction } from "@knitkode/core-helpers/type";
import { ScrollTrigger } from "./scrollTrigger";

/**
 * Singleton ScrollTrigger instance
 *
 * @type {OnScroll.trigger | undefined}
 */
let trigger;

/**
 * Normalise options (custom ones merged with ScrollTrigger ones)
 *
 * @param {OnScroll.initaliserOptions} custom
 * @returns {OnScroll.options}
 */
export function normaliseInitialiserOptions(custom) {
  let options;

  // if given a function as second parameter shortcut to onin callback, and
  // leave defaults settings for the rest
  if (isFunction(custom)) {
    options = { onin: custom };
  } else {
    options = custom || {};
  }

  // with defaults
  let {
    onin,
    onout,
    onchange,
    once = true,
    offset = {},
    toggle = {},
  } = options;

  // onchange will fire both at in and out callbacks
  if (onchange) {
    onin = onchange;
    onout = onchange;
  }

  if (!toggle.callback) toggle.callback = {};

  return { onin, onout, onchange, once, offset, toggle };
}

/**
 * Init an onScroll action/trigger reusing the same listener singleton
 *
 * It can be called with options as second argument or with a function to
 * defaults to `in` callback behaviour
 *
 * @see https://github.com/terwanerik/ScrollTrigger
 *
 * @type {OnScroll.initaliser}
 */
export default function onScroll(target, custom) {
  if (!trigger) {
    trigger = new ScrollTrigger();
  }

  const { once, offset, toggle, onin, onout } =
    normaliseInitialiserOptions(custom);

  /**
   * Callback called on `in` (just pass the element as argument as the trigger
   * instance is not very much used in real word scenarios)
   *
   * @param {OnScroll.trigger} trigger
   */
  function callbackIn(trigger) {
    onin(trigger.element);
  }

  /**
   * Callback called on `out` (just pass the element as argument as the trigger
   * instance is not very much used in real word scenarios)
   *
   * @param {OnScroll.trigger} trigger
   */
  function callbackOut(trigger) {
    onout(trigger.element);
  }

  // final ScrollTrigger options to treat based on given options
  const opts = {
    once,
    offset,
    toggle,
  };

  if (onin) {
    opts.toggle.callback.in = callbackIn;
  }
  if (onout) {
    opts.toggle.callback.out = callbackOut;
  }

  trigger.add(target, opts);

  return {
    trigger,
    target,
  };
}
