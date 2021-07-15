import { on, off, escape } from "./helpers";
import { isString } from "@knitkode/core-helpers";

/**
 * Listen: events delegation system
 *
 * From:
 * https://github.com/cferdinandi/events
 * https://github.com/cferdinandi/events/blob/master/src/js/events/events.js
 *
 * @fileoverview
 */

type ListenEvent = {
  selector: string;
  callback: (event: Event, desiredTarget: Window | Document | Element) => any;
};

/**
 * Active events
 */
const activeEvents: Record<string, ListenEvent[]> = {};

/**
 * Get the index of the registered listener
 */
function getIndex(
  arr: ListenEvent[],
  selector: string,
  callback: ListenEvent["callback"]
) {
  for (var i = 0; i < arr.length; i++) {
    if (
      arr[i].selector === selector &&
      arr[i].callback.toString() === callback.toString()
    )
      return i;
  }
  return -1;
}

/**
 * Check if the listener callback should run or not
 *
 * @param {Element} target The event.target
 * @param {string | Window | Document | Element} selector The selector/element to check the target against
 * @return {Window | Document | Element | false} If not false, run listener and pass the targeted element to use in the callback
 */
function getRunTarget(
  target: Element,
  selector: string | Window | Document | Element
) {
  if (
    ["*", "window", window as Window].indexOf(selector as string | Window) > -1
  ) {
    // if (selector === "*" || selector === "window" || selector === window) {
    return window;
  }
  if (
    [
      "document",
      "document.documentElement",
      document,
      document.documentElement,
    ].indexOf(selector as string | Document) > -1
  ) {
    return document;
  }
  let _selector = selector as string | Element;

  if (isString(_selector)) {
    return target.closest(escape(_selector));
  }

  if (_selector.contains) {
    if (_selector === target) {
      return target;
    }
    if (_selector.contains(target)) {
      return _selector;
    }
    return false;
  }

  return false;
}

/**
 * Handle listeners after event fires
 *
 * @param {Event} event The event
 */
function eventHandler(event) {
  if (!activeEvents[event.type]) {
    return;
  }

  activeEvents[event.type].forEach(function (listener) {
    const target = getRunTarget(event.target as Element, listener.selector);
    if (!target) {
      return;
    }
    listener.callback(event, target);
  });
}

/**
 * Listen an event
 *
 * @param {string} types The event type or types (comma separated)
 * @param {string} selector The selector to run the event on
 * @param {ListenEvent["callback"]} callback The function to run when the event fires
 */
export function listen(
  types: string,
  selector: string,
  callback: ListenEvent["callback"]
) {
  // Make sure there's a selector and callback
  if (!selector || !callback) return;

  // Loop through each event type
  types.split(",").forEach((type) => {
    // Remove whitespace
    type = type.trim();

    // If no event of this type yet, setup
    if (!activeEvents[type]) {
      activeEvents[type] = [];
      on(window, type, eventHandler, true);
    }

    // Push to active events
    activeEvents[type].push({
      selector: selector,
      callback: callback,
    });
  });
}

/**
 * Stop listening for an event
 *
 * @param {string} types The event type or types (comma separated)
 * @param {string} selector The selector to remove the event from
 * @param {Function} callback The function to remove
 */
export function unlisten(
  types: string,
  selector: string,
  callback: ListenEvent["callback"]
) {
  // Loop through each event type
  types.split(",").forEach(function (type) {
    // Remove whitespace
    type = type.trim();

    // if event type doesn't exist, bail
    if (!activeEvents[type]) return;

    // If it's the last event of it's type, remove entirely
    if (activeEvents[type].length < 2 || !selector) {
      delete activeEvents[type];
      off(window, type, eventHandler, true);
      return;
    }

    // Otherwise, remove event
    const index = getIndex(activeEvents[type], selector, callback);
    if (index < 0) return;
    activeEvents[type].splice(index, 1);
  });
}

/**
 * Listen an event, and automatically unlisten it after it's first run
 *
 * @param {string} types The event type or types (comma separated)
 * @param {string} selector The selector to run the event on
 * @param {Function} callback The function to run when the event fires
 */
export function listenOnce(
  types: string,
  selector: string,
  callback: ListenEvent["callback"]
) {
  listen(types, selector, function temp(event) {
    const target = getRunTarget(event.target as Element, selector);
    if (target) {
      callback(event, target);
      unlisten(types, selector, temp);
    }
  });
}

/**
 * Get an immutable copy of all active event listeners
 *
 * @return {Object} Active event listeners
 */
export function getListeners() {
  const obj: typeof activeEvents = {};
  for (var type in activeEvents) {
    if (activeEvents.hasOwnProperty(type)) {
      obj[type] = activeEvents[type];
    }
  }
  return obj;
}
