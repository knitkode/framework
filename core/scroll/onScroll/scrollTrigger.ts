/*!
 * ScrollTrigger
 *
 *
 * http://github.com/terwanerik
 *
 * Copyright 2017, Erik Terwan <erik@erikterwan.com>
 * Released under the MIT license.
 *
 * Date: 2017-07-09
 */

import { mergeObjects, isArray } from "@knitkode/core-helpers";

function isInt(n) {
  return Number(n) === n && n % 1 === 0;
}

function isFloat(n) {
  return Number(n) === n && n % 1 !== 0;
}

class Trigger {
  /**
   * Creates a new Trigger from the given element and options
   *
   * @param {Element|HTMLElement} element
   * @param {DefaultOptions.trigger} [options=DefaultOptions.trigger] options
   */
  constructor(element, options) {
    this.element = element;

    options = mergeObjects(new DefaultOptions().trigger, options);

    this.offset = options.offset;
    this.toggle = options.toggle;
    this.once = options.once;
    this.visible = null;
    this.active = true;
  }

  /**
   * Checks if the Trigger is in the viewport, calls the callbacks and toggles the classes
   * @param {HTMLElement|HTMLDocument|Window} parent
   * @param {string} direction top, bottom, left, right
   * @returns {boolean} If the element is visible
   */
  checkVisibility(parent, direction) {
    if (!this.active) {
      return this.visible;
    }

    const parentWidth = parent.offsetWidth || parent.innerWidth || 0;
    const parentHeight = parent.offsetHeight || parent.innerHeight || 0;

    const parentFrame = { w: parentWidth, h: parentHeight };
    const rect = this.getBounds();

    const visible = this._checkVisibility(rect, parentFrame, direction);

    if (visible !== this.visible) {
      this.visible = visible;

      const response = this._toggleCallback();

      if (response instanceof Promise) {
        response.then(this._toggleClass.bind(this)).catch((e) => {
          console.error("Trigger promise failed");
          console.error(e);
        });
      } else {
        this._toggleClass();
      }

      if (this.visible && this.once) {
        this.active = false;
      }
    } else if (visible) {
      if (typeof this.toggle.callback.visible == "function") {
        return this.toggle.callback.visible.call(this.element, this);
      }
    }

    return visible;
  }

  /**
   * Get the bounds of this element
   * @return {ClientRect | DOMRect}
   */
  getBounds() {
    return this.element.getBoundingClientRect();
  }

  /**
   * Get the calculated offset to place on the element
   * @param {ClientRect} rect
   * @param {string} direction top, bottom, left, right
   * @returns {{x: number, y: number}}
   * @private
   */
  _getElementOffset(rect, direction) {
    let offset = { x: 0, y: 0 };

    if (typeof this.offset.element.x === "function") {
      offset.x = rect.width * this.offset.element.x(this, rect, direction);
    } else if (isFloat(this.offset.element.x)) {
      offset.x = rect.width * this.offset.element.x;
    } else if (isInt(this.offset.element.x)) {
      offset.x = this.offset.element.x;
    }

    if (typeof this.offset.element.y === "function") {
      offset.y = rect.height * this.offset.element.y(this, rect, direction);
    } else if (isFloat(this.offset.element.y)) {
      offset.y = rect.height * this.offset.element.y;
    } else if (isInt(this.offset.element.y)) {
      offset.y = this.offset.element.y;
    }

    return offset;
  }

  /**
   * Get the calculated offset to place on the viewport
   * @param {{w: number, h: number}} parent
   * @param {string} direction top, bottom, left, right
   * @returns {{x: number, y: number}}
   * @private
   */
  _getViewportOffset(parent, direction) {
    let offset = { x: 0, y: 0 };

    if (typeof this.offset.viewport.x === "function") {
      offset.x = parent.w * this.offset.viewport.x(this, parent, direction);
    } else if (isFloat(this.offset.viewport.x)) {
      offset.x = parent.w * this.offset.viewport.x;
    } else if (isInt(this.offset.viewport.x)) {
      offset.x = this.offset.viewport.x;
    }

    if (typeof this.offset.viewport.y === "function") {
      offset.y = parent.h * this.offset.viewport.y(this, parent, direction);
    } else if (isFloat(this.offset.viewport.y)) {
      offset.y = parent.h * this.offset.viewport.y;
    } else if (isInt(this.offset.viewport.y)) {
      offset.y = this.offset.viewport.y;
    }

    return offset;
  }

  /**
   * Check the visibility of the trigger in the viewport, with offsets applied
   * @param {ClientRect} rect
   * @param {{w: number, h: number}} parent
   * @param {string} direction top, bottom, left, right
   * @returns {boolean}
   * @private
   */
  _checkVisibility(rect, parent, direction) {
    const elementOffset = this._getElementOffset(rect, direction);
    const viewportOffset = this._getViewportOffset(parent, direction);

    let visible = true;

    if (rect.left - viewportOffset.x < -(rect.width - elementOffset.x)) {
      visible = false;
    }

    if (rect.left + viewportOffset.x > parent.w - elementOffset.x) {
      visible = false;
    }

    if (rect.top - viewportOffset.y < -(rect.height - elementOffset.y)) {
      visible = false;
    }

    if (rect.top + viewportOffset.y > parent.h - elementOffset.y) {
      visible = false;
    }

    return visible;
  }

  /**
   * Toggles the classes
   * @private
   */
  _toggleClass() {
    if (this.visible) {
      if (isArray(this.toggle.class.in)) {
        this.toggle.class.in.each((className) => {
          this.element.classList.add(className);
        });
      } else {
        this.element.classList.add(this.toggle.class.in);
      }

      if (isArray(this.toggle.class.out)) {
        this.toggle.class.out.each((className) => {
          this.element.classList.remove(className);
        });
      } else {
        this.element.classList.remove(this.toggle.class.out);
      }

      return;
    }

    if (isArray(this.toggle.class.in)) {
      this.toggle.class.in.each((className) => {
        this.element.classList.remove(className);
      });
    } else {
      this.element.classList.remove(this.toggle.class.in);
    }

    if (isArray(this.toggle.class.out)) {
      this.toggle.class.out.each((className) => {
        this.element.classList.add(className);
      });
    } else {
      this.element.classList.add(this.toggle.class.out);
    }
  }

  /**
   * Toggles the callback
   * @private
   * @return null|Promise
   */
  _toggleCallback() {
    if (this.visible) {
      if (typeof this.toggle.callback.in == "function") {
        return this.toggle.callback.in.call(this.element, this);
      }
    } else {
      if (typeof this.toggle.callback.out == "function") {
        return this.toggle.callback.out.call(this.element, this);
      }
    }
  }
}

class TriggerCollection {
  /**
   * Initializes the collection
   * @param {Trigger[]} [triggers=[]] triggers A set of triggers to init with, optional
   */
  constructor(triggers) {
    /**
     * @member {Trigger[]}
     */
    this.triggers = triggers instanceof Array ? triggers : [];
  }

  /**
   * Adds one or multiple Trigger objects
   * @param {Trigger|Trigger[]} objects
   */
  add(objects) {
    if (objects instanceof Trigger) {
      // single
      return this.triggers.push(objects);
    }

    objects.each((trigger) => {
      if (trigger instanceof Trigger) {
        this.triggers.push(trigger);
      } else {
        console.error(
          "Object added to TriggerCollection is not a Trigger. Object: ",
          trigger
        );
      }
    });
  }

  /**
   * Removes one or multiple Trigger objects
   * @param {Trigger|Trigger[]} objects
   */
  remove(objects) {
    if (objects instanceof Trigger) {
      objects = [objects];
    }

    this.triggers = this.triggers.filter((trigger) => {
      let hit = false;

      objects.each((object) => {
        if (object == trigger) {
          hit = true;
        }
      });

      return !hit;
    });
  }

  /**
   * Lookup one or multiple triggers by a query string
   * @param {string} selector
   * @returns {Trigger[]}
   */
  query(selector) {
    return this.triggers.filter((trigger) => {
      const element = trigger.element;
      const parent = element.parentNode;
      const nodes = [].slice.call(parent.querySelectorAll(selector));

      return nodes.indexOf(element) > -1;
    });
  }

  /**
   * Lookup one or multiple triggers by a certain HTMLElement or NodeList
   * @param {HTMLElement|HTMLElement[]|NodeList} element
   * @returns {Trigger|Trigger[]|null}
   */
  search(element) {
    const found = this.triggers.filter((trigger) => {
      if (element instanceof NodeList || isArray(element)) {
        let hit = false;

        element.each((el) => {
          if (trigger.element == el) {
            hit = true;
          }
        });

        return hit;
      }

      return trigger.element == element;
    });

    return found.length == 0 ? null : found.length > 1 ? found : found[0];
  }

  /**
   * Calls a function on all triggers
   * @param {(function())} callback
   */
  call(callback) {
    this.triggers.each(callback);
  }
}

class ScrollAnimationLoop {
  /**
   * ScrollAnimationLoop constructor.
   * Starts a requestAnimationFrame loop as long as the user has scrolled the scrollElement. Stops after a certain time.
   *
   * @param {DefaultOptions.scroll} [options=DefaultOptions.scroll] options The options for the loop
   * @param {ScrollCallback} callback [loop=null] The loop callback
   */
  constructor(options, callback) {
    this._parseOptions(options);

    if (typeof callback === "function") {
      this.callback = callback;
    }

    this.direction = "none";
    this.position = this.getPosition();
    this.lastAction = this._getTimestamp();

    this._startRun();

    this._boundListener = this._didScroll.bind(this);
    this.element.addEventListener("scroll", this._boundListener);
  }

  /**
   * Parses the options
   *
   * @param {DefaultOptions.scroll} [options=DefaultOptions.scroll] options The options for the loop
   * @private
   */
  _parseOptions(options) {
    let defaults = new DefaultOptions().scroll;

    if (typeof options != "function") {
      defaults.callback = () => {};

      defaults = mergeObjects(defaults, options);
    } else {
      defaults.callback = options;
    }

    this.element = defaults.element;
    this.sustain = defaults.sustain;
    this.callback = defaults.callback;
    this.startCallback = defaults.start;
    this.stopCallback = defaults.stop;
    this.directionChange = defaults.directionChange;
  }

  /**
   * Callback when the user scrolled the element
   * @private
   */
  _didScroll() {
    const newPosition = this.getPosition();

    if (this.position !== newPosition) {
      let newDirection = this.direction;

      if (newPosition.x !== this.position.x) {
        newDirection = newPosition.x > this.position.x ? "right" : "left";
      } else if (newPosition.y !== this.position.y) {
        newDirection = newPosition.y > this.position.y ? "bottom" : "top";
      } else {
        newDirection = "none";
      }

      if (newDirection !== this.direction) {
        this.direction = newDirection;

        if (typeof this.directionChange === "function") {
          this.directionChange(this.direction);
        }
      }

      this.position = newPosition;
      this.lastAction = this._getTimestamp();
    } else {
      this.direction = "none";
    }

    if (!this.running) {
      this._startRun();
    }
  }

  /**
   * Starts the loop, calls the start callback
   * @private
   */
  _startRun() {
    this.running = true;

    if (typeof this.startCallback === "function") {
      this.startCallback();
    }

    this._loop();
  }

  /**
   * Stops the loop, calls the stop callback
   * @private
   */
  _stopRun() {
    this.running = false;

    if (typeof this.stopCallback === "function") {
      this.stopCallback();
    }
  }

  /**
   * The current position of the element
   * @returns {{x: number, y: number}}
   */
  getPosition() {
    const left =
      this.element.pageXOffset ||
      this.element.scrollLeft ||
      document.documentElement.scrollLeft ||
      0;
    const top =
      this.element.pageYOffset ||
      this.element.scrollTop ||
      document.documentElement.scrollTop ||
      0;

    return { x: left, y: top };
  }

  /**
   * The current timestamp in ms
   * @returns {number}
   * @private
   */
  _getTimestamp() {
    return Number(Date.now());
  }

  /**
   * One single tick of the animation
   * @private
   */
  _tick() {
    this.callback(this.position, this.direction);

    const now = this._getTimestamp();

    if (now - this.lastAction > this.sustain) {
      this._stopRun();
    }

    if (this.running) {
      this._loop();
    }
  }

  /**
   * Requests an animation frame
   * @private
   */
  _loop() {
    const frame =
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      ((callback) => {
        setTimeout(callback, 1000 / 60);
      });

    frame(this._tick.bind(this));
  }

  /**
   * Kills the loop forever
   */
  kill() {
    this.running = false;
    this.element.removeEventListener("scroll", this._boundListener);
  }
}

/**
 * Default options for ScrollTrigger
 */
function DefaultOptions() {
  /**
   * The default options for a trigger
   *
   * @type {
   * {
   *  once: boolean,
   *  offset: {
   *    viewport: {
   *      x: number|(function(frame, direction)),
   *      y: number|(function(frame, direction))
   *    },
   *    element: {
   *      x: number|(function(rect, direction)),
   *      y: number|(function(rect, direction))
   *    }
   *  },
   *  toggle: {
   *    class: {
   *      in: string|string[],
   *      out: string|string[]
   *    },
   *  callback: {
   *    in: {TriggerInCallback},
   *    visible: (function()),
   *    out: (function())
   *  }
   * }
   * }}
   */
  this.trigger = {
    once: false,
    offset: {
      viewport: {
        x: 0,
        y: 0,
      },
      element: {
        x: 0,
        y: 0,
      },
    },
    toggle: {
      class: {
        in: "visible",
        out: "invisible",
      },
      callback: {
        in: null,
        visible: null,
        out: null,
      },
    },
  };

  /**
   * The `in` callback is called when the element enters the viewport
   * @callback TriggerInCallback
   * @param {{x: Number, y: Number}} position
   * @param {string} direction
   */

  /**
   * The default options for the scroll behaviour
   * @type {
   * {
   *  sustain: number,
   *  element: Window|HTMLDocument|HTMLElement,
   *  callback: {ScrollCallback},
   *  start: (function()),
   *  stop: (function()),
   *  directionChange: (function(direction: {string}))
   * }
   * }
   */
  this.scroll = {
    sustain: 300,
    element: window,
    callback: () => {},
    start: () => {},
    stop: () => {},
    directionChange: () => {},
  };

  /**
   * The scroll callback is called when the user scrolls
   * @callback ScrollCallback
   * @param {{x: Number, y: Number}} position
   * @param {string} direction
   */
}

export class ScrollTrigger {
  /**
   * Constructor for the scroll trigger
   * @param {DefaultOptions} [options=DefaultOptions] options
   */
  constructor(options) {
    this._parseOptions(options);
    this._initCollection();
    this._initLoop();
  }

  /**
   * Parses the options
   * @param {DefaultOptions} [options=DefaultOptions] options
   * @private
   */
  _parseOptions(options) {
    options = mergeObjects(new DefaultOptions(), options);

    this.defaultTrigger = options.trigger;
    this.scrollOptions = options.scroll;
  }

  /**
   * Initializes the collection, picks all [data-scroll] elements as initial elements
   * @private
   */
  _initCollection() {
    const scrollAttributes = document.querySelectorAll("[data-scroll]");
    let elements = [];

    if (scrollAttributes.length > 0) {
      elements = this.createTriggers(scrollAttributes);
    }

    this.collection = new TriggerCollection(elements);
  }

  /**
   * Initializes the scroll loop
   * @private
   */
  _initLoop() {
    this.loop = new ScrollAnimationLoop({
      sustain: this.scrollOptions.sustain,
      element: this.scrollOptions.element,
      callback: (position, direction) => {
        this._scrollCallback(position, direction);
      },
      start: () => {
        this._scrollStart();
      },
      stop: () => {
        this._scrollStop();
      },
      directionChange: (direction) => {
        this._scrollDirectionChange(direction);
      },
    });
  }

  /**
   * Callback for checking triggers
   * @param {{x: number, y: number}} position
   * @param {string} direction
   * @private
   */
  _scrollCallback(position, direction) {
    this.collection.call((trigger) => {
      trigger.checkVisibility(this.scrollOptions.element, direction);
    });

    this.scrollOptions.callback(position, direction);
  }

  /**
   * When the scrolling started
   * @private
   */
  _scrollStart() {
    this.scrollOptions.start();
  }

  /**
   * When the scrolling stopped
   * @private
   */
  _scrollStop() {
    this.scrollOptions.stop();
  }

  /**
   * When the direction changes
   * @param {string} direction
   * @private
   */
  _scrollDirectionChange(direction) {
    this.scrollOptions.directionChange(direction);
  }

  /**
   * Creates a Trigger object from a given element and optional option set
   * @param {HTMLElement} element
   * @param {DefaultOptions.trigger} [options=DefaultOptions.trigger] options
   * @returns Trigger
   */
  createTrigger(element, options) {
    return new Trigger(element, mergeObjects(this.defaultTrigger, options));
  }

  /**
   * Creates an array of triggers
   * @param {HTMLElement[]|NodeList} elements
   * @param {Object} [options=null] options
   * @returns {Trigger[]} Array of triggers
   */
  createTriggers(elements, options) {
    let triggers = [];

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (element) triggers.push(this.createTrigger(element, options));
    }

    return triggers;
  }

  /**
   * Adds triggers
   * @param {string|HTMLElement|NodeList|Trigger|Trigger[]} objects A list of objects or a query
   * @param {Object} [options=null] options
   * @returns {ScrollTrigger}
   */
  add(objects, options) {
    if (objects instanceof HTMLElement) {
      this.collection.add(this.createTrigger(objects, options));

      return this;
    }

    if (objects instanceof Trigger) {
      this.collection.add(objects);

      return this;
    }

    if (objects instanceof NodeList) {
      this.collection.add(this.createTriggers(objects, options));

      return this;
    }

    if (isArray(objects) && objects.length && objects[0] instanceof Trigger) {
      this.collection.add(objects);

      return this;
    }

    if (
      isArray(objects) &&
      objects.length &&
      objects[0] instanceof HTMLElement
    ) {
      this.collection.add(this.createTriggers(objects, options));

      return this;
    }

    // assume it's a query string
    this.collection.add(
      this.createTriggers(document.querySelectorAll(objects), options)
    );

    return this;
  }

  /**
   * Removes triggers
   * @param {string|HTMLElement|NodeList|Trigger|Trigger[]} objects A list of objects or a query
   * @returns {ScrollTrigger}
   */
  remove(objects) {
    if (objects instanceof Trigger) {
      this.collection.remove(objects);

      return this;
    }

    if (isArray(objects) && objects.length && objects[0] instanceof Trigger) {
      this.collection.remove(objects);

      return this;
    }

    if (objects instanceof HTMLElement) {
      this.collection.remove(this.search(objects));

      return this;
    }

    if (
      isArray(objects) &&
      objects.length &&
      objects[0] instanceof HTMLElement
    ) {
      this.collection.remove(this.search(objects));

      return this;
    }

    if (objects instanceof NodeList) {
      this.collection.remove(this.search(objects));

      return this;
    }

    if (isArray(objects) && objects.length && objects[0] instanceof Trigger) {
      this.collection.remove(objects);

      return this;
    }

    // assume it's a query string
    this.collection.remove(this.query(objects.toString()));

    return this;
  }

  /**
   * Lookup one or multiple triggers by a query string
   * @param {string} selector
   * @returns {Trigger[]}
   */
  query(selector) {
    return this.collection.query(selector);
  }

  /**
   * Lookup one or multiple triggers by a certain HTMLElement or NodeList
   * @param {HTMLElement|HTMLElement[]|NodeList} element
   * @returns {Trigger|Trigger[]|null}
   */
  search(element) {
    return this.collection.search(element);
  }

  /**
   * Reattaches the scroll listener
   */
  listen() {
    if (this.loop) {
      return;
    }

    this._initLoop();
  }

  /**
   * Kills the scroll listener
   */
  kill() {
    this.loop.kill();
    this.loop = null;
  }
}
