import { setVendorCSS, listenResize } from "@knitkode/core-dom";

function adjust($origin: HTMLElement, $target: HTMLElement) {
  const $parent = $origin.parentNode as HTMLElement | null;

  if ($parent) {
    $target.style.marginTop = `-${
      $parent.offsetHeight - $origin.offsetHeight
    }px`;
  }
}

/**
 * The parent is the column content. So we measure the empty space between
 * the content and the bottom edge of the column. The difference in px is then
 * applied to the target column as a negative top margin, shifting up the column
 */
export default function compensateGridVerticalOffset(
  $origin: HTMLElement,
  $target: HTMLElement
) {
  setVendorCSS($target, "transition", "margin-top .2s ease-in");

  adjust($origin, $target);

  listenResize(() => adjust($origin, $target));
}
