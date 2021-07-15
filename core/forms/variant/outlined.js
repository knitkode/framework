import { $, $$, forEach, addClass, on, off } from "@knitkode/core-dom";
import { getLabelInput, setEmptyStatus } from "../helpers";

export default function FormsVariantOutlined(rootSelector) {
  /** @type {HTMLInputElement[]} */
  const $inputs = [];

  forEach($$(rootSelector), (root) => {
    const label = /** @type {HTMLLabelElement} */ ($(".formLabel", root));

    // TODO: decide wether to leave this in or not, it's a misuse of the library
    // more than anything
    // support formRoot variant outline that do not have a label but just a
    // placeholder in the HTML, then manage that through CSS and the class added
    if (!label) {
      addClass(root, "nolabel");
      return;
    }

    const labelText = label.textContent;
    label.innerHTML =
      `` +
      `<span class="_start"></span>` +
      `<span class="_middle">${labelText}</span>` +
      `<span class="_end"></span>`;

    const $input = getLabelInput(label);

    on($input, "blur", setEmptyStatus);
    $inputs.push($input);

    // on load for prefilled values
    // use a timeout for prefilled values in session restored by the browser on
    // page back navigation
    setTimeout(() => setEmptyStatus.call($input), 10);
  });

  return {
    destroy() {
      $inputs.forEach((input) => {
        off(input, "blur", setEmptyStatus);
      });
    },
  };
}
