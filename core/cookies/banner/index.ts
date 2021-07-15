import {
  $,
  addClass,
  removeClass,
  listen,
  unlisten,
  on,
  off,
} from "@knitkode/core-dom";
import { isExternalUrl } from "@knitkode/core-helpers";
import { getCookie, setCookie } from "../index";
import "./index.scss";

type CookiesBannerValue = "yes" | "no" | undefined;
type CookiesBannerAcceptedReason = "scroll" | "navigation" | "ok";

/**
 * Cookies banner (custom)
 *
 * The default behaviour is that every click (except on links to external
 * domains) and any scroll action will accept cookies.
 *
 * @param {string} [name="cookies_accepted"] The cookie name to be read/set
 * @param {Function} [onAccept] Function called when the cookies are accepted
 * @param {Function} [onAccepted] Function called if the cookies are already accepted on load
 */
export function CookiesBanner(
  name: string = "cookies_accepted",
  onAccept?: (reason: CookiesBannerAcceptedReason) => any,
  onAccepted?: Function
) {
  const status = getCookie<CookiesBannerValue>(name);
  const $banner = $("#cookiesBanner");
  const initialScroll = window.pageYOffset;

  /**
   * Hide banner
   */
  function hide() {
    if ($banner) {
      removeClass($banner, "is-in");
      setTimeout(() => {
        // TODO: maybe use native `.remove()`, @see:
        // https://developer.mozilla.org/en-US/docs/Web/API/ChildNode/remove
        $banner.parentNode.removeChild($banner);
      }, 500);
    }
  }

  if (status === "yes") {
    if (onAccepted) onAccepted();
    hide();
  } else {
    let accepted;

    setCookie(name, "no", 365);

    /**
     * Click handler, don't accept cookies only on clicks on external links,
     * all other clicks will accept cookies
     */
    function handleClick(event: Event, element: HTMLAnchorElement) {
      const { href } = element;
      if (href) {
        if (!isExternalUrl(href)) {
          event.preventDefault();
          accept("navigation");
          location.href = href;
        }
      }
    }

    /**
     * Accpet handler, aware click on the "OK" button
     */
    function handleAccept(event: Event, element: HTMLAnchorElement) {
      accept("ok");
    }

    /**
     * Scroll handler, immediately accept on scroll interaction
     */
    function scrollHandler() {
      const scrollPosition = window.pageYOffset;
      if (!accepted) {
        if (
          scrollPosition > initialScroll + 30 ||
          scrollPosition < initialScroll - 30
        ) {
          accepted = true;
          setTimeout(() => accept("scroll"), 1000);
        }
      }
    }

    setTimeout(() => {
      show();
      listen("click", ".cookiesAccept", handleAccept);
      listen("click", "a", handleClick);
      on(window, "scroll", scrollHandler);
    }, 100);

    /**
     * Accept cookies, unbinds listeners, set positive cookie and hide banner
     */
    function accept(reason: CookiesBannerAcceptedReason) {
      accepted = true;
      off(window, "scroll", scrollHandler);
      unlisten("click", ".cookiesAccept", handleAccept);
      unlisten("click", "a", handleClick);
      setCookie(name, "yes", 365);
      if (onAccept) onAccept(reason);
      hide();
    }

    /**
     * Show banner
     */
    function show() {
      if ($banner) {
        addClass($banner, "is-in");
      }
    }
  }
}
