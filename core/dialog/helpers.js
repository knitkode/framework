import { createElement, setDataAttr } from "@knitkode/core-dom";
import { iconTpl } from "@knitkode/core-icon";

/**
 * HTML attribute for elements that will close the dialog on click
 */
export const attrClose = "dialog-close";

function createDialogElement(name) {
  return createElement("div", `dialog${name}`);
}

/**
 * Create default dialog template dynamically and append it to the body
 *
 * @type {Dialog.skeletonCreator}
 * @param {string} [closeIconGlyph] Close icon name (uses svgicon inlined system)
 */
export function createDialogTpl(closeIconGlyph) {
  // const fragment = document.createDocumentFragment();
  const $root = createDialogElement("");
  const $backdrop = createDialogElement("Backdrop");
  const $cage = createDialogElement("Cage");
  const $centerer = createDialogElement("Centerer");
  const $wrap = createDialogElement("Wrap");
  const $content = createDialogElement("Content");
  const $loader = createDialogElement("Loader");
  const $close = createDialogElement("Close");
  $close.innerHTML = iconTpl(closeIconGlyph || "close", "js-noclick");

  setDataAttr($close, attrClose, "");
  setDataAttr($cage, attrClose, "");
  setDataAttr($centerer, attrClose, "");

  $wrap.appendChild($content);
  $wrap.appendChild($loader);
  $wrap.appendChild($close);
  $centerer.appendChild($wrap);
  $cage.appendChild($centerer);
  $root.appendChild($backdrop);
  $root.appendChild($cage);

  document.body.appendChild($root);

  return { $root, $backdrop, $cage, $wrap, $content };
}
