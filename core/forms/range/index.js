import "@knitkode/core-polyfills/closest";
import {
  $,
  on,
  off,
  addClass,
  removeClass,
  throttle,
  createElement,
} from "@knitkode/core-dom";
import { triggerEvent } from "../helpers";
import "./common.scss";

/*!
 * Range is adapted from  Rangeable
 * Copyright (c) 2018 Karl Saunders (mobius1(at)gmx(dot)com)
 * Dual licensed under the MIT
 (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 * Version: 0.1.6
 *
 */

/**
 * Range
 * @param {String|HTMLElement} input
 * @param {Object} config
 */
const Range = function (input, config) {
  this.plugins = ["ruler"];
  const defaultConfig = {
    type: "single",
    tips: "always",
    updateThrottle: 30,
    formatTip: (value) => value,
    classes: {
      input: "rangeInput",
      container: "rangeContainer",
      vertical: "range--vertical",
      progress: "rangeProgress",
      handle: "rangeHandle",
      track: "rangeTrack",
      multiple: "rangeMultiple",
      disabled: "is-disabled",
      tips: "rangeTips",
      tip: "rangeTip",
      visible: "rangeTips--visible",
    },
  };

  // user has passed a CSS3 selector string
  if (typeof input === "string") {
    input = $(input);
  }

  this.input = input;
  this.config = Object.assign({}, defaultConfig, config);

  this.mouseAxis = {
    x: "clientX",
    y: "clientY",
  };
  this.trackSize = {
    x: "width",
    y: "height",
  };
  this.trackPos = {
    x: "left",
    y: "top",
  };
  this.lastPos = 0;
  this.double =
    this.config.type === "double" || Array.isArray(this.config.value);
  this.touch =
    "ontouchstart" in window ||
    (window.DocumentTouch && document instanceof DocumentTouch);

  this.init();

  this.onInit();
};

/**
 * Initialise the instance
 * @return {Void}
 */
Range.prototype.init = function () {
  if (!this.input.range) {
    const props = {
      min: 0,
      max: 100,
      step: 1,
      value: this.input.value,
    };

    for (let prop in props) {
      // prop is missing, so add it
      if (!this.input[prop]) {
        this.input[prop] = props[prop];
      }

      // prop set in config
      if (this.config[prop] !== undefined) {
        this.input[prop] = this.config[prop];
      }
    }

    this.axis = !this.config.vertical ? "x" : "y";

    this.input.range = this;

    if (this.double) {
      this.input.values = this.config.value
        ? this.config.value
        : [this.input.min, this.input.max];
      this.input.defaultValues = this.input.values.slice();
    } else {
      if (!this.input.defaultValue) {
        this.input.defaultValue = this.input.value;
      }
    }

    this.render();

    if (this.input.disabled) {
      this.disable();
    }

    this.initialised = true;
  }
};

/**
 * Render the instance
 * @return {Void}
 */
Range.prototype.render = function () {
  const o = this.config;
  const c = o.classes;

  const container = createElement("div", c.container);
  const track = createElement("div", c.track);
  const progress = createElement("div", c.progress);

  let handle = createElement("div", c.handle);
  let tip = createElement("div", c.tip);

  this.input.tabIndex = -1;

  if (this.double) {
    handle = [createElement("div", c.handle), createElement("div", c.handle)];
    tip = [];

    for (let i = 0; i < 3; i++) tip[i] = createElement("div", c.tip);
    handle.forEach((node, i) => {
      node.index = i;
      progress.appendChild(node);
      node.appendChild(tip[i]);
      node.tabIndex = 1;

      // locked handles?
      if (o.controls && o.controls[i]) {
        if (o.controls[i].locked && o.controls[i].locked === true) {
          node.locked = true;
        }
      }
    });

    if (o.vertical) {
      progress.appendChild(handle[0]);
    }

    progress.appendChild(tip[2]);

    addClass(container, c.multiple);
  } else {
    progress.appendChild(handle);
    handle.appendChild(tip);

    handle.tabIndex = 1;

    // locked handle?
    if (o.controls) {
      if (o.controls.locked && o.controls.locked === true) {
        handle.locked = true;
      }
    }
  }

  container.appendChild(track);

  if (o.vertical) {
    addClass(container, c.vertical);
  }

  if (o.size) {
    container.style[this.trackSize[this.axis]] = !isNaN(o.size)
      ? `${o.size}px`
      : o.size;
  }

  if (o.tips) {
    addClass(container, c.tips);

    if (typeof o.tips === "string" && o.tips === "always") {
      addClass(container, c.visible);
    }
  }

  this.nodes = {
    container,
    track,
    progress,
    handle,
    tip,
  };

  if (this.double) {
    this.nodes.buffer = [];
    const buffers = createElement("div", "rangeBuffers");

    this.input.values.forEach((val, i) => {
      const buffer = createElement("div", "rangeBuffer");
      buffers.appendChild(buffer);
      this.nodes.buffer.push(buffer);

      track.appendChild(buffers);

      if (o.controls) {
        this.limits = [{}, {}];
        if (o.controls[i].min !== undefined) {
          this.limits[i].min = o.controls[i].min;
        }
        if (o.controls[i].max !== undefined) {
          this.limits[i].max = o.controls[i].max;
        }
      }
    });
    this.setLimits(o.controls);
  } else {
    const buffer = createElement("div", "rangeBuffer");

    track.appendChild(buffer);

    this.nodes.buffer = buffer;

    track.appendChild(buffer);

    if (o.controls) {
      this.limits = {};
      if (o.controls.min !== undefined) {
        this.limits.min = o.controls.min;
      }
      if (o.controls.max !== undefined) {
        this.limits.max = o.controls.max;
      }
    }
    this.setLimits(o.controls);
  }

  track.appendChild(progress);

  this.input.parentNode.insertBefore(container, this.input);
  container.insertBefore(this.input, track);

  addClass(this.input, c.input);

  this.bind();

  this.update();
};

/**
 * Reset the value(s) to default
 * @return {Void}
 */
Range.prototype.reset = function () {
  if (this.double) {
    this.input.defaultValues.forEach(this.setValue, this);
  } else {
    this.setValue(this.input.defaultValue);
  }
  this.onEnd();
};

/**
 * Set the value from the position of pointer over the track
 * @param {Object} e
 */
Range.prototype.setValueFromPosition = function (e) {
  const limits = this.getLimits();
  const step = parseFloat(this.input.step);
  const rect = this.rects;
  const axis = this.touch
    ? e.touches[0][this.mouseAxis[this.axis]]
    : e[this.mouseAxis[this.axis]];
  const point = axis - this.rects.container[this.trackPos[this.axis]];
  const size = rect.container[this.trackSize[this.axis]];

  if (e.type === "mousedown") {
    if (
      (!this.double && this.nodes.handle.contains(e.target)) ||
      (this.double &&
        (this.nodes.handle[0].contains(e.target) ||
          this.nodes.handle[1].contains(e.target)))
    ) {
      return false;
    }
  }

  // get the position of the cursor over the bar as a percentage
  let position = this.config.vertical
    ? ((size - point) / size) * 100
    : (point / size) * 100;

  // work out the value from the position
  let val = (position * (limits.max - limits.min)) / 100 + limits.min;

  // apply granularity (step)
  val = Math.ceil(val / step) * step;

  if (axis >= this.lastPos) {
    val -= step;
  }

  // prevent change event from firing if slider hasn't moved
  if (parseFloat(val) === parseFloat(this.startValue)) {
    return false;
  }

  let index = false;

  if (this.double) {
    index = this.activeHandle.index;
  }

  val = this.limit(val, index);

  this.setValue(val, index);
};

/**
 * Mousedown / touchstart callback
 * @param {Object} e
 * @return {Void}
 */
Range.prototype.start = function (e) {
  e.preventDefault();

  this.startValue = this.getValue();

  this.onStart();
  // show the tip now so we can get the dimensions later
  addClass(this.nodes.container, "dragging");

  this.recalculate();

  this.activeHandle = this.getHandle(e);

  if (!this.activeHandle) {
    return false;
  }

  addClass(this.activeHandle, "is-active");

  this.setValueFromPosition(e);

  if (this.touch) {
    on(document, "touchmove", this.events.move);
    on(document, "touchend", this.events.stop);
    on(document, "touchcancel", this.events.stop);
  } else {
    on(document, "mousemove", this.events.move);
    on(document, "mouseup", this.events.stop);
  }
};

/**
 * Mousemove / touchmove callback
 * @param {Object} e
 * @return {Void}
 */
Range.prototype.move = function (e) {
  this.setValueFromPosition(e);
  this.lastPos = this.touch
    ? e.touches[0][this.mouseAxis[this.axis]]
    : e[this.mouseAxis[this.axis]];
};

/**
 * Mouseup / touchend callback
 * @param {Object} e
 * @return {Void}
 */
Range.prototype.stop = function (e) {
  this.stopValue = this.getValue();

  removeClass(this.nodes.container, "dragging");

  this.onEnd();

  removeClass(this.activeHandle, "is-active");
  this.activeHandle = false;

  if (this.touch) {
    off(document, "touchmove", this.events.move);
    off(document, "touchend", this.events.stop);
    off(document, "touchcancel", this.events.stop);
  } else {
    off(document, "mousemove", this.events.move);
    off(document, "mouseup", this.events.stop);
  }

  if (this.startValue !== this.stopValue) {
    triggerEvent(this.input);
  }

  this.startValue = null;
};

/**
 * Keydown callback
 * @param {Object} e
 * @return {Void}
 */
Range.prototype.keydown = function (e) {
  const step = (index) => {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        this.stepUp(index);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        this.stepDown(index);
        break;
    }
  };

  if (this.double) {
    this.nodes.handle.forEach((node) => {
      if (node === document.activeElement) {
        step(node.index);
      }
    });
  } else {
    if (this.nodes.handle === document.activeElement) {
      step();
    }
  }
};

/**
 * Increase the value by step
 * @param {Number} index
 * @return {Void}
 */
Range.prototype.stepUp = function (index) {
  const step = parseFloat(this.input.step);

  let val = this.getValue();

  if (this.double && index !== undefined) {
    val = val[index];
  }

  let newval = this.limit(parseFloat(val) + step, index);

  this.setValue(newval, index);
};

/**
 * Decrease the value by step
 * @param {Number} index
 * @return {Void}
 */
Range.prototype.stepDown = function (index) {
  const step = parseFloat(this.input.step);

  let val = this.getValue();

  if (this.double && index !== undefined) {
    val = val[index];
  }

  let newval = this.limit(parseFloat(val) - step, index);

  this.setValue(newval, index);
};

/**
 * Check the value is within the limits
 * @param {Number} value
 * @param {Number} index
 * @return {Number}
 */
Range.prototype.limit = function (value, index) {
  const el = this.input;
  const limits = this.getLimits();

  value = parseFloat(value);

  if (this.double && index !== undefined) {
    if (!index && value > el.values[1]) {
      value = el.values[1];
    } else if (index > 0 && value < el.values[0]) {
      value = el.values[0];
    }
    if (this.limits) {
      if (!index) {
        if (value > this.limits[0].max) {
          value = this.limits[0].max;
        } else if (value < this.limits[0].min) {
          value = this.limits[0].min;
        }
      } else {
        if (value > this.limits[1].max) {
          value = this.limits[1].max;
        } else if (value < this.limits[1].min) {
          value = this.limits[1].min;
        }
      }
    }
  } else {
    if (this.limits) {
      if (value > this.limits.max) {
        value = this.limits.max;
      } else if (value < this.limits.min) {
        value = this.limits.min;
      }
    }
  }
  if (value > limits.max) {
    value = limits.max;
  } else if (value < limits.min) {
    value = limits.min;
  }
  value = parseFloat(value);
  value = value.toFixed(this.accuracy);

  return value;
};

/**
 * Recache dimensions
 * @return {Void}
 */
Range.prototype.recalculate = function () {
  let handle = [];
  if (this.double) {
    this.nodes.handle.forEach((node, i) => {
      handle[i] = node.getBoundingClientRect();
    });
  } else {
    handle = this.nodes.handle.getBoundingClientRect();
  }

  this.rects = {
    handle: handle,
    container: this.nodes.container.getBoundingClientRect(),
  };
};

/**
 * Update the instance
 * @return {Void}
 */
Range.prototype.update = function () {
  this.recalculate();

  this.accuracy = 0;

  // detect float
  if (this.input.step.includes(".")) {
    this.accuracy = (this.input.step.split(".")[1] || []).length;
  }

  const value = this.getValue();
  const limits = this.getLimits();
  const size = this.rects.container[this.trackSize[this.axis]];

  const setStyle = (el, offset, m) => {
    el.style[this.config.vertical ? "bottom" : "left"] = `${offset}px`;
    el.style[this.trackSize[this.axis]] = `${
      (m / limits.max) * size - offset
    }px`;
  };

  if (this.double) {
    // set buffers
    if (this.limits) {
      this.limits.forEach((o, i) => {
        setStyle(this.nodes.buffer[i], (o.min / limits.max) * size, o.max);
      });
    }

    this.input.values.forEach((val, i) => {
      this.setValue(this.limit(val, i), i);
    });
  } else {
    // set buffer
    if (this.limits) {
      setStyle(
        this.nodes.buffer,
        (this.limits.min / limits.max) * size,
        this.limits.max
      );
    }
    this.setValue(this.limit(value));
  }
};

/**
 * Get the current value(s)
 * @return {Number|Array}
 */
Range.prototype.getValue = function () {
  return this.double ? this.input.values : this.input.value;
};

/**
 * Set the current value(s)
 * @param {Number} value
 * @param {Number} index
 */
Range.prototype.setValue = function (value, index) {
  const rects = this.rects;
  const nodes = this.nodes;

  let handle = nodes.handle;

  if (this.double) {
    if (index === undefined) {
      return false;
    }

    handle = this.activeHandle ? this.activeHandle : nodes.handle[index];
  }

  if (value === undefined) {
    value = this.input.value;
  }

  value = this.limit(value, index);

  const doChange =
    this.initialised && (value !== this.input.value || this.nativeEvent);

  const format = this.config.formatTip;
  // update the value
  if (this.double) {
    const values = this.input.values;
    values[index] = value;

    if (this.config.tips) {
      // update the node so we can get the width / height
      nodes.tip[index].textContent = format.call(this, value);

      // check if tips are intersecting...
      const a = nodes.tip[0].getBoundingClientRect();
      const b = nodes.tip[1].getBoundingClientRect();
      const intersect = !(
        a.right < b.left ||
        a.left > b.right ||
        a.bottom < b.top ||
        a.top > b.bottom
      );

      // ... and set the className where appropriate
      nodes.container.classList.toggle("range--combinedTip", intersect);

      if (intersect) {
        // Format the combined tip.
        // Only show single value if they both match, otherwise show
        // both seperated by a hyphen
        nodes.tip[2].textContent =
          values[0] === values[1]
            ? format.call(this, values[0])
            : `${format.call(this, values[0])} - ${format.call(
                this,
                values[1]
              )}`;
      }
    }
  } else {
    this.input.value = value;
    nodes.tip.textContent = format.call(this, value);
  }

  // set bar size
  this.setPosition(value, index);

  if (doChange) {
    this.onChange();

    if (!this.nativeEvent) {
      triggerEvent(this.input, "input");
    }

    this.nativeEvent = false;
  }
};

/**
 * Native callback
 * @return {Void}
 */
Range.prototype.native = function () {
  this.nativeEvent = true;

  this.setValue();
};

Range.prototype.getLimits = function () {
  return {
    min: parseFloat(this.input.min),
    max: parseFloat(this.input.max),
  };
};

/**
 * Set the buffer
 * @param {[type]} value [description]
 */
Range.prototype.setLimits = function (config) {
  if (config === undefined) return false;

  if (!this.limits) {
    this.limits = config;
  }

  const setLimit = (limit, o) => {
    if (o.min !== undefined) {
      limit.min = o.min;
    }
    if (o.max !== undefined) {
      limit.max = o.max;
    }
  };

  if (this.double) {
    config.forEach((o, i) => {
      setLimit(this.limits[i], o);
    });
  } else {
    setLimit(this.limits, config);
  }

  this.update();
};

/**
 * Set the postion / size of the progress bar.
 * @param {[type]} value [description]
 */
Range.prototype.setPosition = function (value) {
  let width;

  if (this.double) {
    let start = this.getPosition(this.input.values[0]);
    let end = this.getPosition(this.input.values[1]);

    // set the start point of the bar
    this.nodes.progress.style[
      this.config.vertical ? "bottom" : "left"
    ] = `${start}px`;

    width = end - start;
  } else {
    width = this.getPosition();
  }

  // set the end point of the bar
  this.nodes.progress.style[this.trackSize[this.axis]] = `${width}px`;
};

/**
 * Get the position along the track from a value.
 * @param {Number} value
 * @return {Number}
 */
Range.prototype.getPosition = function (value) {
  if (value === undefined) {
    value = this.input.value;
  }
  const limits = this.getLimits();

  return (
    ((value - limits.min) / (limits.max - limits.min)) *
    this.rects.container[this.trackSize[this.axis]]
  );
};

/**
 * Get the correct handle on mousedown / touchstart
 * @param {Object} e
 * @return {Boolean|HTMLElement}
 */
Range.prototype.getHandle = function (e) {
  if (!this.double) {
    return this.nodes.handle.locked ? false : this.nodes.handle;
  }

  const r = this.rects;
  const distA = Math.abs(
    e[this.mouseAxis[this.axis]] - r.handle[0][this.trackPos[this.axis]]
  );
  const distB = Math.abs(
    e[this.mouseAxis[this.axis]] - r.handle[1][this.trackPos[this.axis]]
  );
  let handle = e.target.closest(`.${this.config.classes.handle}`);

  if (!handle) {
    if (distA > distB) {
      handle = this.nodes.handle[1];
    } else {
      handle = this.nodes.handle[0];
    }
  }

  return handle.locked ? false : handle;
};

/**
 * Enable the instance
 * @return {Void}
 */
Range.prototype.enable = function () {
  on(
    this.nodes.container,
    this.touch ? "touchstart" : "mousedown",
    this.events.start
  );

  if (this.double) {
    this.nodes.handle.forEach((el) => (el.tabIndex = 1));
  } else {
    this.nodes.handle.tabIndex = 1;
  }

  removeClass(this.nodes.container, this.config.classes.disabled);

  this.input.disabled = false;
};

/**
 * Disable the instance
 * @return {Void}
 */
Range.prototype.disable = function () {
  off(
    this.nodes.container,
    this.touch ? "touchstart" : "mousedown",
    this.events.start
  );

  if (this.double) {
    this.nodes.handle.forEach((el) => el.removeAttribute("tabindex"));
  } else {
    this.nodes.handle.removeAttribute("tabindex");
  }

  this.nodes.addClass(container, this.config.classes.disabled);

  this.input.disabled = true;
};

/**
 * Add event listeners
 * @return {Void}
 */
Range.prototype.bind = function () {
  this.events = {};
  const events = [
    "start",
    "move",
    "stop",
    "update",
    "reset",
    "native",
    "keydown",
  ];

  // bind so we can remove later
  events.forEach((event) => {
    this.events[event] = this[event].bind(this);
  });

  this.events.scroll = throttle(this.events.update, this.config.updateThrottle);
  this.events.resize = throttle(this.events.update, this.config.updateThrottle);

  // throttle the scroll callback for performance
  on(document, "scroll", this.events.scroll);

  // throttle the resize callback for performance
  on(window, "resize", this.events.resize);

  // key control
  on(document, "keydown", this.events.keydown);

  // touchstart/mousedown
  on(
    this.nodes.container,
    this.touch ? "touchstart" : "mousedown",
    this.events.start
  );

  // listen for native input to allow keyboard control on focus
  on(this.input, "input", this.events.native);

  // detect form reset
  if (this.input.form) {
    on(this.input.form, "reset", this.events.reset);
  }
};

/**
 * Remove event listeners
 * @return {Void}
 */
Range.prototype.unbind = function () {
  // throttle the scroll callback for performance
  off(document, "scroll", this.events.scroll);

  // throttle the resize callback for performance
  off(window, "resize", this.events.resize);

  off(document, "keydown", this.events.keydown);

  off(
    this.nodes.container,
    this.touch ? "touchstart" : "mousedown",
    this.events.start
  );

  // listen for native input to allow keyboard control on focus
  off(this.input, "input", this.events.native);

  // detect form reset
  if (this.input.form) {
    off(this.input.form, "reset", this.events.reset);
  }

  this.events = null;
};

/**
 * Destroy the instance
 * @return {Void}
 */
Range.prototype.destroy = function () {
  if (this.input.range) {
    // remove all event events
    this.unbind();

    // remove the className from the input
    removeClass(this.input, this.config.classes.input);

    // kill all nodes
    this.nodes.container.parentNode.replaceChild(
      this.input,
      this.nodes.container
    );

    // remove the reference from the input
    delete this.input.range;

    this.initialised = false;
  }
};

/**
 * onInit callback
 * @return {Void}
 */
Range.prototype.onInit = function () {
  if (this.config.onInit) {
    this.config.onInit.call(this, this.getValue());
  }
};

/**
 * onStart callback
 * @return {Void}
 */
Range.prototype.onStart = function () {
  if (this.config.onStart) {
    this.config.onStart.call(this, this.getValue());
  }
};

/**
 * onChange callback
 * @return {Void}
 */
Range.prototype.onChange = function () {
  if (this.config.onChange) {
    this.config.onChange.call(this, this.getValue());
  }
};

/**
 * onEnd callback
 * @return {Void}
 */
Range.prototype.onEnd = function () {
  if (this.config.onEnd) {
    this.config.onEnd.call(this, this.getValue());
  }
};

export default Range;
