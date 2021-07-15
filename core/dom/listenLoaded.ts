import { on } from "./helpers";

/**
 * Fires a callback when the DOM content is loaded
 *
 * @see https://mathiasbynens.be/notes/settimeout-onload
 */
export function listenLoaded(handler: EventHandlerNonNull) {
  on(document, "DOMContentLoaded", handler);
  // document.addEventListener("DOMContentLoaded", setTimeout(handler, 4));
}
