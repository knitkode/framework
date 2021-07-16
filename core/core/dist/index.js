"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
var t = require("@knitkode/core-helpers");
function e(t) {
  return t.replace(/:/g, "\\:");
}
function n(t, e, n) {
  return (e || document).querySelectorAll(n ? t : t.replace(/:/g, "\\:"));
}
function o(t, e, n, o = !1) {
  !__DEV__ || t
    ? t && t.addEventListener(e, n, o)
    : console.warn("Used `on` with an unexisting DOM element");
}
function r(t, e, n, o = !1) {
  !__DEV__ || t
    ? t && t.removeEventListener(e, n, o)
    : console.warn("Used `off` with an unexisting DOM element");
}
const i = {};
function c(n, o) {
  if (["*", "window", window].indexOf(o) > -1) return window;
  if (
    [
      "document",
      "document.documentElement",
      document,
      document.documentElement,
    ].indexOf(o) > -1
  )
    return document;
  let r = o;
  return t.isString(r)
    ? n.closest(e(r))
    : !!r.contains && (r === n ? n : !!r.contains(n) && r);
}
function s(t) {
  i[t.type] &&
    i[t.type].forEach(function (e) {
      const n = c(t.target, e.selector);
      n && e.callback(t, n);
    });
}
function l(t, e, n) {
  e &&
    n &&
    t.split(",").forEach((t) => {
      (t = t.trim()),
        i[t] || ((i[t] = []), o(window, t, s, !0)),
        i[t].push({ selector: e, callback: n });
    });
}
function u(t, e, n) {
  t.split(",").forEach(function (t) {
    if (((t = t.trim()), !i[t])) return;
    if (i[t].length < 2 || !e) return delete i[t], void r(window, t, s, !0);
    const o = (function (t, e, n) {
      for (var o = 0; o < t.length; o++)
        if (t[o].selector === e && t[o].callback.toString() === n.toString())
          return o;
      return -1;
    })(i[t], e, n);
    o < 0 || i[t].splice(o, 1);
  });
}
(exports.$ = function (t, e, n) {
  return (e || document).querySelector(n ? t : t.replace(/:/g, "\\:"));
}),
  (exports.$$ = n),
  (exports.$each = function (t, e, o, r) {
    const i = n(t, o);
    for (var c = 0; c < i.length; c++) e.call(r, i[c], c);
  }),
  (exports.addClass = function (t, e) {
    !__DEV__ || t
      ? t && t.classList.add(e)
      : console.warn("Used `addClass` with an unexisting DOM element");
  }),
  (exports.createElement = function (t, e) {
    const n = document.createElement(t);
    return e && n.classList.add(e), n;
  }),
  (exports.emitEvent = function (t = "customEvent", e = {}) {
    "function" == typeof window.CustomEvent &&
      document.dispatchEvent(new CustomEvent(t, { bubbles: !0, detail: e }));
  }),
  (exports.escape = e),
  (exports.exists = function (t) {
    return !!(t && t instanceof window.HTMLElement);
  }),
  (exports.forEach = function (t, e, n) {
    for (var o = 0; o < t.length; o++) e.call(n, t[o], o);
  }),
  (exports.getDataAttr = function (t, e) {
    return t.getAttribute("data-" + e);
  }),
  (exports.getDocumentHeight = function () {
    const { body: t, documentElement: e } = document;
    return Math.max(
      t.scrollHeight,
      e.scrollHeight,
      t.offsetHeight,
      e.offsetHeight,
      t.clientHeight,
      e.clientHeight
    );
  }),
  (exports.getHeight = function (t) {
    return parseInt(window.getComputedStyle(t).height, 10);
  }),
  (exports.getOffset = function (t) {
    let e = 0,
      n = 0;
    for (; t && !isNaN(t.offsetLeft) && !isNaN(t.offsetTop); )
      (e += t.offsetLeft - t.scrollLeft),
        (n += t.offsetTop - t.scrollTop),
        (t = t.offsetParent);
    return { top: n, left: e };
  }),
  (exports.getOffsetTop = function (t) {
    let e = 0;
    if (t.offsetParent) for (; t; ) (e += t.offsetTop), (t = t.offsetParent);
    return e >= 0 ? e : 0;
  }),
  (exports.getScrollbarWidth = function (t) {
    return window.innerWidth - (t || document.documentElement).clientWidth;
  }),
  (exports.getStyleValue = function (t, e) {
    return getComputedStyle(t, null).getPropertyValue(e);
  }),
  (exports.isHidden = function (t) {
    return !t || null === t.offsetParent;
  }),
  (exports.isInViewport = function (t) {
    const e = t.getBoundingClientRect();
    return (
      e.top >= 0 &&
      e.left >= 0 &&
      e.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      e.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }),
  (exports.isNodeList = function (t) {
    const e = Object.prototype.toString.call(t);
    return (
      "object" == typeof t &&
      /^\[object (HTMLCollection|NodeList|Object)\]$/.test(e) &&
      "number" == typeof t.length &&
      (0 === t.length || ("object" == typeof t[0] && t[0].nodeType > 0))
    );
  }),
  (exports.isTotallyScrolled = function (t) {
    return !!t && t.scrollHeight - t.scrollTop <= t.clientHeight;
  }),
  (exports.listen = l),
  (exports.listenLoaded = function (t) {
    o(document, "DOMContentLoaded", t);
  }),
  (exports.listenOnce = function (t, e, n) {
    l(t, e, function o(r) {
      const i = c(r.target, e);
      i && (n(r, i), u(t, e, o));
    });
  }),
  (exports.listenResize = function (e, n, i) {
    const c = t.debounce(e, n, i);
    return (
      o(window, "resize", c),
      function () {
        c.cancel(), r(window, "resize", c);
      }
    );
  }),
  (exports.listenScroll = function (e, n, i) {
    const c = t.debounce(e, n, i);
    return (
      o(window, "scroll", c, { capture: !0, passive: !0 }),
      function () {
        c.cancel(), r(window, "scroll", c);
      }
    );
  }),
  (exports.off = r),
  (exports.on = o),
  (exports.onClickOutside = function (t, e, n = !1) {
    const i = (o) => {
        t.contains(o.target) || (e(), n && c());
      },
      c = () => {
        r(document, "click", i);
      };
    return o(document, "click", i), c;
  }),
  (exports.once = function (t, e, n, i = !1) {
    const c = (o) => {
      n(o), r(t, e, c);
    };
    o(t, e, c, i);
  }),
  (exports.removeClass = function (t, e) {
    !__DEV__ || t
      ? t && t.classList.remove(e)
      : console.warn("Used `removeClass` with an unexisting DOM element");
  }),
  (exports.setDataAttr = function (t, e, n) {
    null != n
      ? t.setAttribute("data-" + e, n.toString())
      : t.removeAttribute("data-" + e);
  }),
  (exports.setVendorCSS = function (t, e, n) {
    const o = e.charAt(0).toUpperCase() + e.slice(1);
    (t.style["webkit" + o] = n),
      (t.style["moz" + o] = n),
      (t.style["ms" + o] = n),
      (t.style["o" + o] = n),
      (t.style[e] = n);
  }),
  (exports.siblings = function (t) {
    if (t && t.parentNode) {
      let e = t.parentNode.firstChild,
        n = [];
      for (; e; e = e.nextSibling) 1 === e.nodeType && e !== t && n.push(e);
      return n;
    }
    return [];
  }),
  (exports.toArray = function (t) {
    return Array.prototype.slice.call(t);
  }),
  (exports.unlisten = u);
