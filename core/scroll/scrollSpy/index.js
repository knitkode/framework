import "@knitkode/core-polyfills/closest";
import {
  $,
  $$,
  forEach,
  addClass,
  removeClass,
  emitEvent,
  getOffsetTop,
  getHeight,
  getDocumentHeight,
  listenScroll,
  listenResize,
} from "@knitkode/core-dom";

const defaults = {
  header: "", // selector for a fixed/absolute header that adds to the offset
  navClass: "is-active",
  contentClass: "is-active",
  offset: 0,
  reflow: false,
  events: true,
  onSetup: null,
};

/**
 * Sort content from first to last in the DOM
 * @param {Array} data The content areas
 */
function sortContents(data) {
  if (data) {
    data
      .sort(function (item1, item2) {
        var offset1 = getOffsetTop(item1.content);
        var offset2 = getOffsetTop(item2.content);
        if (offset1 < offset2) return -1;
        return 1;
      })
      .map((item, idx) => {
        item.idx = idx;
        return item;
      });
  }
}

/**
 * Get the offset to use for calculating position
 * @param {Object} settings The settings for this instantiation
 * @return {number} The number of pixels to offset the calculations
 */
let headerEl;

function getOffset(settings) {
  let headerOffset = 0;
  if (settings.header) {
    headerEl = headerEl || $(settings.header);
    headerOffset = headerEl ? getHeight(headerEl) : 0;
  }

  // if the offset is a function run it
  if (typeof settings.offset === "function") {
    return parseFloat(settings.offset()) + headerOffset;
  }

  // Otherwise, return it as-is
  return parseFloat(settings.offset) + headerOffset;
}

/**
 * Determine if an element is in view
 * @param {Element} elem The element
 * @param {Object} settings The settings for this instantiation
 * @param {boolean} [bottom] If true, check if element is above bottom of viewport instead
 * @return {boolean} Returns true if element is in the viewport
 */
function isInView(elem, settings, bottom) {
  var bounds = elem.getBoundingClientRect();
  var offset = getOffset(settings);
  if (bottom) {
    return (
      bounds.bottom <
      (window.innerHeight || document.documentElement.clientHeight)
    );
  }
  return bounds.top <= offset;
}

/**
 * Check if at the bottom of the viewport
 * @return {boolean} If true, page is at the bottom of the viewport
 */
function isAtBottom() {
  if (window.innerHeight + window.pageYOffset >= getDocumentHeight())
    return true;
  return false;
}

/**
 * Check if the last item should be used (even if not at the top of the page)
 * @param  {Object} item     The last item
 * @param  {Object} settings The settings for this instantiation
 * @return {boolean}         If true, use the last item
 */
function useLastItem(item, settings) {
  if (isAtBottom() && isInView(item.content, settings, true)) return true;
  return false;
}

/**
 * Get the active content
 * @param {Array}  data The content areas
 * @param {Object} settings The settings for this instantiation
 * @return {Object} The content area and matching navigation link
 */
function getActive(data, settings) {
  var last = data[data.length - 1];
  if (useLastItem(last, settings)) return last;
  for (var i = data.length - 1; i >= 0; i--) {
    if (isInView(data[i].content, settings)) return data[i];
  }
}

/**
 * Deactivate a nav and content area
 * @param {Object} items The nav item and content to deactivate
 * @param {Object} settings The settings for this instantiation
 */
function deactivate(items, settings) {
  // Make sure there are items to deactivate
  if (!items) return;

  // Get the parent list item
  var li = items.nav.closest("li");
  if (!li) return;

  // Remove the active class from the nav and content
  removeClass(li, settings.navClass);
  removeClass(items.content, settings.contentClass);

  // Emit a custom event
  emitEvent("scrollspy:deactivate", {
    li,
    link: items.nav,
    content: items.content,
    settings: settings,
  });
}

/**
 * Activate a nav and content area
 * @param {Object} items The nav item and content to activate
 * @param {Object} settings The settings for this instantiation
 */
function activate(items, settings) {
  // Make sure there are items to activate
  if (!items) return;

  // Get the parent list item
  var li = items.nav.closest("li");
  if (!li) return;

  // Add the active class to the nav and content
  addClass(li, settings.navClass);
  addClass(items.content, settings.contentClass);

  // Emit a custom event
  emitEvent("scrollspy:active", {
    li,
    link: items.nav,
    content: items.content,
    settings: settings,
  });
}

/**
 * Scrollspy
 *
 * Manages in-page hash based navigation adding 'active' classes on links inside
 * the given navigation element.
 *
 * @param {String} selector The selector to use for navigation items
 * @param {Object} options User options and settings
 */
export default function scrollSpy(selector, options = {}) {
  let data, current, timeout, settings;
  let continueFrame;
  let scrollListener;
  let resizeListener;

  /**
   * Set variables from DOM elements
   */
  function setup() {
    // Get all nav items
    const navItems = $$(selector);

    // Create data array
    data = [];

    // Loop through each item, get it's matching content, and push to the array
    forEach(navItems, function (navItem) {
      // Get the content for the nav item
      var content = document.getElementById(
        // @ts-ignore
        decodeURIComponent(navItem.hash.substr(1))
      );
      if (!content) return;

      // Push to the data array
      data.push({
        nav: navItem,
        content: content,
      });
    });

    // Sort data by the order they appear in the DOM
    sortContents(data);

    if (settings.onSetup) {
      settings.onSetup(data);
    }
  }

  /**
   * Detect which content is currently active
   */
  function detect() {
    // Get the active content
    const active = getActive(data, settings);

    // if there's no active content, deactivate and bail
    if (!active) {
      if (current) {
        deactivate(current, settings);
        current = null;
      }
      return;
    }

    // If the active content is the one currently active, do nothing
    if (current && active.content === current.content) return;

    // Deactivate the current content and activate the new content
    deactivate(current, settings);
    activate(active, settings);

    // Update the currently active content
    current = active;
  }

  /**
   * Detect the active content on scroll
   * Debounced for performance
   */
  function scrollHandler() {
    // If there's a timer, cancel it
    if (timeout) {
      cancelAnimationFrame(timeout);
    }

    if (continueFrame) {
      // Setup debounce callback
      timeout = requestAnimationFrame(detect);
    }
  }

  /**
   * Update content sorting on resize
   * Debounced for performance
   */
  function resizeHandler() {
    // If there's a timer, cancel it
    if (timeout) {
      cancelAnimationFrame(timeout);
    }

    if (continueFrame) {
      // Setup debounce callback
      timeout = requestAnimationFrame(function () {
        sortContents(data);
        detect();
      });
    }
  }

  /**
   * Destroy the current instantiation
   */
  function destroy() {
    // Undo DOM changes
    if (current) {
      deactivate(current, settings);
    }

    // Remove event listeners
    if (scrollListener) scrollListener();
    if (resizeListener) resizeListener();
    if (timeout) {
      cancelAnimationFrame(timeout);
    }

    // Reset variables
    data = null;
    current = null;
    timeout = null;
    continueFrame = false;
    settings = null;
  }

  /**
   * Initialize the current instantiation
   */
  function init() {
    // Merge user options into defaults
    settings = { ...defaults, ...options };

    continueFrame = true;

    // Setup variables based on the current DOM
    setup();

    // Find the currently active content
    detect();

    // Setup event listeners
    scrollListener = listenScroll(scrollHandler);
    if (settings.reflow) {
      resizeListener = listenResize(resizeHandler);
    }
  }

  // Initialize and return the public APIs
  init();

  return {
    setup,
    detect,
    destroy,
  };
}
