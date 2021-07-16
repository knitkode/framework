import {
  $,
  on,
  off,
  addClass,
  removeClass,
  setVendorCSS,
  emitEvent,
} from "@knitkode/core-dom";
import { isFunction, isString } from "@knitkode/core-helpers";
import { Defer } from "@knitkode/core-internals";
import scrollLock, { fillGapsOf } from "@knitkode/core-scroll/lock";
import { attrClose } from "./helpers";
import "./index.scss";

const instances = {};

/**
 * Dialog, a simple, reusable and extendable dialog function. It only manages
 * standard dialog beahaviour and accesibility.
 *
 * for inspiration @see https://github.com/ghosh/Micromodal
 * TODO: trap focus perhaps with @see https://www.npmjs.com/package/tabbable
 *
 * @type {Dialog.initialiser}
 */
export default function Dialog(rooter, options = {}, hooks = {}) {
  const { id } = options;

  if (id && instances[id]) {
    return instances[id];
  }

  const CLASS_LOADING = "is-loading";
  const EVENT_NAMESPACE = "dialog.";
  const { tpl, rootClass, transition = 300, gaps } = options;
  const { mounted, rendered, opening, opened, closing, closed } = hooks;
  let lastActiveElement;
  let $root;
  let $backdrop;
  let $cage;
  let $wrap;
  let $content;
  let willOpen = new Defer();

  if (isFunction(rooter)) {
    const skeleton = rooter();
    $root = skeleton.$root;
    $backdrop = skeleton.$backdrop;
    $cage = skeleton.$cage;
    $wrap = skeleton.$wrap;
    $content = skeleton.$content;
  } else {
    $root = isString(rooter) ? $(rooter) : rooter;
    if (!$root) {
      return;
    }
    $backdrop = $(".dialogBackdrop", $root);
    $cage = $(".dialogCage", $root);
    $wrap = $(".dialogWrap", $root);
    $content = $(".dialogContent", $root);
  }

  const instance = {
    id,
    $root,
    $cage,
    $wrap,
    $content,
    willOpen,
    render,
    open,
    close,
    destroy,
    load,
    loaded,
  };

  if (tpl) {
    render(tpl);
  }
  mountAndBind();

  // maybe save Dialog instance
  if (id) {
    instances[id] = instance;
  }

  /**
   * Mounted, bind event listeners
   */
  function mountAndBind() {
    if (rootClass) {
      $root.className += " " + rootClass;
    }

    on($root, "touchstart", handleClick);
    on($root, "click", handleClick);
    on(document, "keydown", handleKeydown);

    setVendorCSS($backdrop, "transitionDuration", `${transition}ms`);
    setVendorCSS($wrap, "transitionDuration", `${transition}ms`);

    addClass($root, "has-init");

    if (mounted) mounted(instance);
  }

  /**
   * Populate dialog content with HTML, it calls the `rendered` hook
   *
   * @param {string} content
   * @param {boolean} [silent] Useful when emptying the dialog content and don't want the `rendered` callback to be called
   */
  function render(content, silent) {
    $content.innerHTML = content;

    if (rendered && !silent) rendered(instance);
  }

  /**
   * Handle click
   *
   * @private
   * @memberof Dialog
   * @param {Event & { target: HTMLElement}} event
   */
  function handleClick(event) {
    if (event.target.hasAttribute(`data-${attrClose}`)) {
      close(event);
      event.preventDefault();
    }
  }

  /**
   * Handle keydown
   *
   * @private
   * @memberof Dialog
   * @param {KeyboardEvent} event
   */
  function handleKeydown(event) {
    if (event.keyCode === 27) close(event);
    // if (event.keyCode === 9) maintainFocus(event)
  }

  /**
   * Destroy
   *
   * @public
   */
  function destroy() {
    off($root, "touchstart", handleClick);
    off($root, "click", handleClick);
    off(document, "keydown", handleKeydown);
    $root.parentNode.removeChild($root);
  }

  /**
   * Close
   *
   * @public
   * @param {Event} [event]
   * @param {any} [customData]
   */
  function close(event, customData) {
    if (closing) closing(instance, customData);
    emit("closing", customData);

    if (lastActiveElement) {
      // @ts-ignore
      lastActiveElement.focus();
    }
    removeClass($root, "is-in");

    instance.opened = false;

    setTimeout(() => {
      $root.style.display = "none";

      willOpen = new Defer();
      instance.willOpen = willOpen;

      // destroy only if an id has not been set on instantiation, otherwise we
      // will keep the dialog and maybe reuse it the next time
      if (!instances[id]) {
        destroy();
      }

      scrollLock.enable($cage);

      if (closed) closed(instance, customData);
      emit("closed", customData);
    }, transition);
  }

  /**
   * Open
   *
   * @public
   * @param {any} [customData]
   */
  function open(customData) {
    lastActiveElement = document.activeElement;

    $root.style.display = "block";

    setTimeout(() => {
      addClass($root, "is-in");
    }, 3);

    if (opening) opening(instance, customData);
    emit("opening", customData);

    if (gaps) fillGapsOf(gaps);
    scrollLock.disable($cage);

    setTimeout(() => {
      if (opened) opened(instance, customData);
      instance.opened = true;
      emit("opened", customData);

      willOpen.resolve();
    }, transition + 3);

    return instance;
  }

  /**
   * Event emitter function
   *
   * @param {string} name
   * @param {any} [data]
   */
  function emit(name, data) {
    emitEvent(`${EVENT_NAMESPACE}${name}`, {
      instance,
      data,
    });
  }

  /**
   * Start loading async content
   *
   * @public
   */
  function load() {
    addClass($root, CLASS_LOADING);
  }

  /**
   * End loading async content
   *
   * @public
   */
  function loaded() {
    removeClass($root, CLASS_LOADING);
  }

  return instance;
}
