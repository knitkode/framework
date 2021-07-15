import { createDialogTpl } from "../helpers";
import dialog from "../index";
import "./index.scss";

/**
 * Async Dialog
 *
 * A dialog that does not require any existing markup as it creates on the fly.
 *
 * @type {Dialog.initialiserAsync}
 */
export default function dialogAsync(options = {}, hooks = {}) {
  return dialog(createDialogTpl, options, hooks);
}
