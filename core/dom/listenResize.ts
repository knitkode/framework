import { debounce, DebounceSettings } from "@knitkode/core-helpers";
import { on, off } from "./helpers";

/**
 * Listen window resize event using lodash's debounce
 *
 * @returns {() => void} An automatic unbinding function to run to deregister the listener upon call
 */
export function listenResize(
  handler: EventHandlerNonNull,
  debounceWait?: number,
  debounceOptions?: DebounceSettings
) {
  const resizeHandler = debounce(handler, debounceWait, debounceOptions);

  on(window, "resize", resizeHandler);

  /**
   * Unbind the previously attached scroll handler
   */
  function unbinder() {
    resizeHandler.cancel();
    off(window, "resize", resizeHandler);
  }

  return unbinder;
}
