import { $, on, off, setVendorCSS } from "@knitkode/core-dom";
import "./index.scss";

type ZaccHook = ($root: HTMLElement) => any;

type ZaccOptions = {
  mounted?: ZaccHook;
  opening?: ZaccHook;
  opened?: ZaccHook;
  closing?: ZaccHook;
  closed?: ZaccHook;
  /** Called both on opened and on closed  */
  changed?: ZaccHook;
  /** @default 400  */
  duration?: number;
};

/**
 * Zacc, accordion inspired by Google Closure's Zippy
 */
export default function zacc(
  $root: HTMLElement,
  {
    mounted,
    opening,
    opened,
    closing,
    closed,
    changed,
    duration = 400,
  }: ZaccOptions = {}
) {
  const $head = $("[data-zacc-head]", $root);
  const $wrap = $("[data-zacc-wrap]", $root);
  const $body = $("[data-zacc-body]", $root);
  const $input = $("[data-zacc-input]", $root) as HTMLInputElement;

  let height;
  let animation;
  let isExpanded = false;

  $root.setAttribute("data-zacc-init", "true");

  // accessibility
  $head.setAttribute("tabindex", "0");
  $head.setAttribute("role", "tab");

  // calculate accordion content height
  height = $wrap.offsetHeight;

  // allow $roots to be expanded by default based on the HTML markup. First by
  // reading the checkbox input controller or if there is no checkbox by reading
  // `aria-expanded="true"`. If none of the signal a default expanded state
  // we immediately hide the area without animation
  if (
    ($input && $input.checked) ||
    (!$input && $head.getAttribute("aria-expanded") === "true")
  ) {
    isExpanded = true;
  } else {
    collapse(true);
  }

  setVendorCSS($body, "transitionDuration", `${duration}ms`);

  if (mounted) mounted($root);

  if ($input) {
    on($input, "change", handleInputChange);
  } else {
    on($head, "click", toggle);
    on($head, "keyup", handleEnter);
  }

  /**
   * Destroy
   */
  function destroy() {
    $root.setAttribute("data-zacc-init", "false");

    if ($input) {
      off($head, "click", handleInputChange);
    } else {
      on($head, "click", toggle);
      off($head, "keyup", handleEnter);
    }
  }

  /**
   * Hnalde input change
   *
   * @this {HTMLInputElement}
   */
  function handleInputChange() {
    this.checked ? expand() : collapse();
    isExpanded = this.checked;
  }

  /**
   * Handle keyboard enter or space
   */
  function handleEnter(event) {
    if (event.keyCode === 13 || event.keyCode === 32) {
      toggle();
    }
  }

  /**
   * Toggle
   */
  function toggle() {
    if (isExpanded) {
      collapse();
    } else {
      expand();
    }
  }

  /**
   * Collapse
   */
  function collapse(dontAnimate?: boolean) {
    const negativeHeight = -height;

    $head.setAttribute("aria-expanded", "false");

    // immediately hide the overflow for the animation
    $wrap.style.overflow = "hidden";

    if (closing) closing($root);

    if (dontAnimate) {
      $wrap.style.display = "none";
      $body.style.marginTop = negativeHeight + "px";
      if (closed) closed($root);
      if (changed) changed($root);
    } else {
      $body.style.marginTop = negativeHeight + "px";

      // wait the end of the animation before to hide the content wrapper
      clearTimeout(animation);

      animation = setTimeout(() => {
        $wrap.style.display = "none";
        if (closed) closed($root);
        if (changed) changed($root);
      }, duration);
    }

    isExpanded = false;
  }

  /**
   * Expand
   */
  function expand() {
    $head.setAttribute("aria-expanded", "true");
    $wrap.style.display = "block";

    if (opening) opening($root);

    // we need this in a timeout to make the css animation works
    setTimeout(() => {
      $body.style.marginTop = "0";
    }, 3);

    // wait the end of the animation, then don't cut the overflow anymore
    clearTimeout(animation);

    animation = setTimeout(() => {
      $wrap.style.overflow = "";
      if (opened) opened($root);
      if (changed) changed($root);
    }, duration);

    isExpanded = true;
  }

  /**
   * Recalulate accordion height programmatically, useful for instance with
   * nested accordions that modify the height of the parent accordion
   */
  function recalculate() {
    height = $wrap.offsetHeight;
  }

  return {
    destroy,
    toggle,
    expand,
    collapse,
    recalculate,
  };
}
