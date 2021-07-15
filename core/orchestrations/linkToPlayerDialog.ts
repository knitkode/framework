import { listen, getDataAttr } from "@knitkode/core-dom";
import openDialogPlayer from "@knitkode/core-dialog/player";

/**
 * Link to player dialog
 *
 * Matches all elements with the given selector and bind them to open a player
 * dialog, the targeted elements must have a `data-src="{videoUrl}"` attribute
 * and optionally a `data-poster="{posterUrl}"` attribute
 */
export default function linkToPlayerDialog(
  selector: string,
  onclick: (src: string, poster?: string) => any
) {
  listen("click", selector, function (event, el) {
    event.preventDefault();
    const src = getDataAttr(el, "src");
    const poster = getDataAttr(el, "poster");

    if (onclick) onclick(src, poster);

    openDialogPlayer({
      w: 1920,
      h: 1080,
      src,
      poster,
    });
  });
}
