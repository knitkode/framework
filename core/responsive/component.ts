import { listenResize } from "@knitkode/core-dom";

type ResponsiveBreakpointKey = "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

type ResponsiveBreakpoints = Record<ResponsiveBreakpointKey, number>;

type ResponsiveReadyComponent = {
  init: Function;
  destroy: Function;
  /** Dynamically added by `responsiveComponent` */
  inMode?: () => ResponsiveComponentMode;
};

type ResponsiveComponentMode = "" | "mobile" | "desktop";

type ResponsiveComponentOptions = {
  breakpoints: ResponsiveBreakpoints;
  mobile: ResponsiveReadyComponent;
  desktop: ResponsiveReadyComponent;
};

/**
 * Responsive component
 *
 * @param {string} [breakpoint="lg"]
 * @param {Object} options
 * @param {Object} options.breakpoints
 * @param {ResponsiveReadyComponent} options.mobile
 * @param {ResponsiveReadyComponent} options.desktop
 * @returns
 */
export default function responsiveComponent(
  breakpoint: keyof ResponsiveBreakpoints = "lg",
  { breakpoints, mobile, desktop }: ResponsiveComponentOptions
) {
  const DESKTOP = "desktop";
  const MOBILE = "mobile";
  const threshold = breakpoints[breakpoint];
  let current = mobile;
  let mode: ResponsiveComponentMode = "";

  listenResize(check);

  /**
   * In move?
   *
   * Attach a method to the given components that returns the information on
   * which mode is currently active
   */
  function inMode() {
    return mode;
  }

  // dynamically add components methods
  mobile.inMode = inMode;
  desktop.inMode = inMode;

  /**
   * Check enabling the right mode based on screen width (desktop/mobile).
   * First we destroy the current one, then assign the new current component,
   * then initialise it. NB: all components used here need to have a `destroy`
   * and `init` method.
   */
  function check() {
    if (window.innerWidth >= threshold) {
      if (mode === MOBILE) {
        mobile.destroy();
      }
      if (mode !== DESKTOP) {
        desktop.init();
        mode = DESKTOP;
        current = desktop;
      }
    } else {
      if (mode === DESKTOP) {
        desktop.destroy();
      }
      if (mode !== MOBILE) {
        mobile.init();
        mode = MOBILE;
        current = mobile;
      }
    }
  }

  // check immediately
  check();

  return current;
}
