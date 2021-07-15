import "@knitkode/core-polyfills/closest";
import { $, on, off, emitEvent, getHeight } from "@knitkode/core-dom";
import { uuid } from "@knitkode/core-helpers";
import scrollTo from "../scrollTo";

const defaults = {
  selector: "[data-smooth]",
  header: "",
  speed: 600,
  offset: 0,
  updateURL: true,
  popstate: true,
  events: false,
};

function setHistory(options, instanceId) {
  if (!history.replaceState || !options.updateURL || history.state) return;

  const hash = window.location.hash || "";

  // Set a default history
  history.replaceState(
    {
      smoothScroll: instanceId,
      anchor: hash ? hash : window.pageYOffset,
    },
    document.title,
    hash ? hash : window.location.href
  );
}

/**
 * Update the URL
 * @param  {HTMLElement | Number} anchor
 * @param  {Object} options
 */
function updateURL(anchor, options, instanceId) {
  if (typeof anchor === "number") return;

  // verify that pushState is supported and the updateURL option is enabled
  if (!history.pushState || !options.updateURL) return;

  // update URL
  history.pushState(
    { smoothScroll: instanceId, anchor: anchor.id },
    document.title,
    anchor === document.documentElement ? "#top" : "#" + anchor.id
  );
}

export default function SmoothScroll(options = {}) {
  let settings;
  let anchor;
  let toggle;
  let headerEl;
  let animation;
  let instanceId = uuid();

  /**
   * Cancel a scroll-in-progress
   *
   * @param {boolean} noEvent
   * @param {HTMLElement | number} anchor
   * @param {HTMLElement} toggle
   * @returns
   */
  function cancel(noEvent, anchor, toggle) {
    cancelAnimationFrame(animation);
    animation = null;
    if (noEvent) return;
    if (settings.events) emitEvent("scrollCancel", { anchor, toggle });
  }

  /**
   * Start/stop the scrolling animation
   * @param {HTMLElement | number} anchor The element or position to scroll to
   * @param {HTMLElement} toggle The element that toggled the scroll event
   * @param {Object} options
   */
  function scroll(anchor, toggle, options = {}) {
    const _settings = { ...settings, ...options };
    const headerOffset = headerEl ? getHeight(headerEl) : 0;

    cancel(false, anchor, toggle);

    updateURL(anchor, _settings, instanceId);

    scrollTo(anchor, {
      offset: _settings.offset + headerOffset,
      focus: _settings.focus,
      speed: _settings.speed,
      onstart: () => {
        if (_settings.events) emitEvent("scrollStart", { anchor, toggle });
      },
      onstop: () => {
        cancel(true, anchor, toggle);
        if (_settings.events) emitEvent("scrollStop", { anchor, toggle });
      },
    });
  }

  /**
   * If smooth scroll element clicked, animate scroll
   *
   * @param {MouseEvent} event
   */
  function handleClick(event) {
    // don't run if event was canceled but still bubbled up
    // by @mgreter - https://github.com/cferdinandi/smooth-scroll/pull/462/
    if (event.defaultPrevented) return;

    // don't run if right-click or command/control + click or shift + click
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey)
      return;

    // @ts-ignore check if a smooth scroll link was clicked
    toggle = event.target.closest(settings.selector);

    if (!toggle) return;

    // get the anchored element
    let anchor;
    if (toggle.hash === "#") {
      anchor = document.documentElement;
    } else {
      anchor = $(toggle.hash);
    }

    if (!anchor) return;

    event.preventDefault();

    setHistory(settings, instanceId);

    scroll(anchor, toggle);
  }

  /**
   * Animate scroll on popstate events
   */
  function handlePopstate() {
    const { state } = history;
    // stop if history.state doesn't exist (ex. if clicking on a broken anchor link).
    // fixes `Cannot read property 'smoothScroll' of null` error getting thrown.
    if (!state) return;

    // console.log("state.smoothScroll", state.smoothScroll);

    // only run if state is a popstate record for this instantiation
    if (!state.smoothScroll || state.smoothScroll !== instanceId) {
      return;
    }

    // get the anchor
    let anchor = state.anchor;
    if (typeof anchor === "string" && anchor) {
      anchor = $(state.anchor);
      if (!anchor) return;
    }

    // animate scroll to anchor link
    scroll(anchor, null, { updateURL: false });
  }

  /**
   * Destroy the current initialization.
   */
  function destroy() {
    // if plugin isn't already initialized, stop
    if (!settings) return;

    // remove event listeners
    off(document, "click", handleClick);
    off(window, "popstate", handlePopstate);

    // cancel any scrolls-in-progress
    cancel(false, anchor, toggle);

    // reset variables
    settings = null;
    anchor = null;
    toggle = null;
    animation = null;
  }

  /**
   * Initialize Smooth Scroll
   */
  function init() {
    // destroy any existing initializations
    destroy();

    // selectors and variables
    settings = { ...defaults, ...options };

    if (settings.header) {
      headerEl = $(settings.header);
    }

    // when a toggle is clicked, run the click handler
    on(document, "click", handleClick, false);

    // if updateURL and popState are enabled, listen for pop events
    if (settings.updateURL && settings.popstate) {
      on(window, "popstate", handlePopstate, false);
    }
  }

  init();

  // public api
  return {
    scroll,
    cancel,
    destroy,
  };
}
