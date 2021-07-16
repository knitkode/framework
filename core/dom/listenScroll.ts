import { debounce, DebounceSettings } from "@knitkode/core-helpers";
import { on, off } from "./helpers";

/**
 * Listen window scroll event using lodash's debounce
 *
 * @returns {() => void} An automatic unbinding function to run to deregister the listener upon call
 */
export function listenScroll(
  handler: EventHandlerNonNull,
  debounceWait?: number,
  debounceOptions?: DebounceSettings
) {
  const scrollHandler = debounce(handler, debounceWait, debounceOptions);

  on(window, "scroll", scrollHandler, {
    capture: true,
    passive: true,
  });

  /**
   * Unbind the previously attached scroll handler
   */
  function unbinder() {
    scrollHandler.cancel();
    off(window, "scroll", scrollHandler);
  }

  return unbinder;
}
