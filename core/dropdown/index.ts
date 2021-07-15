import { $, on, off, addClass, removeClass } from "@knitkode/core-dom";
import { hasTouch } from "@knitkode/core-detect";
import scrollLock, { fillGapsOf } from "@knitkode/core-scroll/lock";
import "./index.scss";

type DropdownOptions = {
  namespace?: string;
  /** Callback on closed */
  closed?: () => any;
  /** Callback on opened */
  opened?: () => any;
  /** To override the default toggle element */
  $toggle?: HTMLElement;
  fillGaps?: NodeList;
  /** Adds activation behaviour on hover */
  hoverable?: boolean;
};

/**
 * Dropdown
 */
export default function Dropdown(
  $root: HTMLElement,
  {
    namespace,
    closed,
    opened,
    $toggle,
    fillGaps,
    hoverable,
  }: DropdownOptions = {}
) {
  // constants
  const CLASS_IN = "is-in";
  const CLASS_IN_HTML = `${namespace}:is-in-html`;

  // DOM
  const $html = $("html");
  const $checkbox = $(".dropdownInput", $root) as HTMLInputElement;
  const $flyout = $(".dropdownFlyout", $root);
  $toggle = $toggle || $(".dropdownToggle", $root);

  // state
  let hasInit = false;
  let isOpen = $checkbox.checked;
  let isHovering = false;
  let isControlledByClick = false;

  init();

  /**
   * Init menu
   */
  function init() {
    if (hasInit) return;

    hasInit = true;

    // immediately set the elements that will receive gaps on scroll locking
    if (fillGaps) fillGapsOf(fillGaps);

    // bind listeners
    on($toggle, "click", handleClickToggle);

    // disable checkbox toggling functionality, just relies on JavaScript now
    /** @type {HTMLInputElement} */ $checkbox.disabled = true;

    // bind mouse events on non touch devices only
    if (!hasTouch() && hoverable) {
      on($root, "mouseenter", handleMouseEnter);
      on($root, "mouseleave", handleMouseLeave);
    }
  }

  /**
   * Destroy
   */
  function destroy() {
    off($toggle, "change", handleClickToggle);
    if (hoverable) {
      off($root, "mouseenter", handleMouseEnter);
      off($root, "mouseleave", handleMouseLeave);
    }

    // re-enable page scroll
    scrollLock.enable($flyout);

    hasInit = false;
  }

  /**
   * Handle toggle button click. Toggling functionality works even without this,
   * as it relies on hover/input:checked. So the header opens even without
   * JavaScript. With this we only tweaks behaviour and "progressively enhance" it.
   */
  function handleClickToggle() {
    isControlledByClick = true;
    // console.log("handleClickToggle", isControlledByClick, isOpen)
    if (isHovering) {
      if (!isOpen) {
        open();
      }
    } else {
      toggle();
    }
  }

  /**
   * Handle mouse enter on toggle button
   */
  function handleMouseEnter() {
    // console.log("entering interactive root", isControlledByClick, isOpen)
    if (isControlledByClick) return;
    isHovering = true;
    if (!isOpen) open();
  }

  /**
   * Handle mouse enter on toggle button
   */
  function handleMouseLeave() {
    // console.log("leaving interactive root", isControlledByClick, isOpen)
    if (isControlledByClick) return;
    isHovering = false;
    if (isOpen) {
      setTimeout(maybeClose, 200);
    }
  }
  /**
   * Handle click outside of the menu (only when it is open)
   */
  function handleClickOutside(event: Event) {
    // console.log("handleClickOutside", isControlledByClick);
    if (!isControlledByClick) return;
    // @ts-ignore
    if (!$root.contains(event.target)) {
      close();
      event.preventDefault();
      event.stopPropagation();
    }
  }

  /**
   * Maybe close
   *
   * Close after a delay, at the end of which we re-check that the mouse is
   * actually not over there anymore
   */
  function maybeClose() {
    if (!isHovering && !isControlledByClick) {
      close();
    }
  }

  /**
   * Toggle
   */
  function toggle() {
    isOpen ? close() : open();
  }

  /**
   * Open
   *
   * In situations where the dropdown is opened by an external toggle (outside
   * the $root container) we need to bind the click outside a bit later.
   * Without a timeout the clickouside would be called too soon, at the same
   * time as the open click. Basically the same click would first open
   * and then immediately close the dropdown.
   */
  function open(forceClickControl?: boolean) {
    if (forceClickControl) isControlledByClick = true;

    if (isOpen) return;

    if (!hasInit) init();

    isOpen = true;

    addClass($root, CLASS_IN);
    addClass($html, CLASS_IN_HTML);

    scrollLock.disable($root);

    if (opened) opened();

    setTimeout(() => on(document, "click", handleClickOutside), 3);
  }

  /**
   * Close
   */
  function close() {
    if (!isOpen) return;

    isOpen = false;
    isControlledByClick = false;
    $checkbox.checked = false;

    removeClass($root, CLASS_IN);
    removeClass($html, CLASS_IN_HTML);

    scrollLock.enable($root);

    off(document, "click", handleClickOutside);

    if (closed) closed();
  }

  return {
    destroy,
    open,
    toggle,
  };
}
