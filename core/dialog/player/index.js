import { $ } from "@knitkode/core-dom";
import dialogAsync from "../async";
import "./index.scss";

/**
 * Open player dialog
 *
 * @param {Object} options
 * @param {string} options.src
 * @param {string} [options.poster]
 * @param {number} [options.w] Video width
 * @param {number} [options.h] Video height
 * @param {string} [options.rootClass]
 * @param {string} [options.tpl]
 * @param {boolean} [options.downloadable]
 * @param {boolean} [options.controls=true]
 * @param {boolean} [options.autoplay=true]
 */
export default function openDialogPlayer({
  src,
  poster,
  w,
  h,
  rootClass = "",
  tpl,
  downloadable,
  controls = true,
  autoplay = true,
}) {
  let attrs = ` class="player video-js vjs-16-9"`;
  if (poster) attrs += ` poster="${poster}"`;
  if (controls) attrs += " controls";
  if (autoplay) attrs += " autoplay";
  if (w) attrs += ` width="${w}"`;
  if (h) attrs += ` height="${h}"`;
  if (!downloadable)
    attrs += ' oncontextmenu="return false;" controlsList="nodownload"';

  tpl =
    tpl ||
    `<video${attrs} playsinline><source src="${src}" type="video/mp4"></video>`;

  let hasPaused = false;

  import("@knitkode/core-player").then(({ default: player }) => {
    let playerInstance;

    dialogAsync(
      {
        id: src,
        tpl,
        rootClass: "dialogPlayer " + rootClass,
      },
      {
        rendered: (instance) => {
          instance.load();
          playerInstance = player($(".player", instance.$root));
          playerInstance.on("loadeddata", instance.loaded);
        },
        opened: () => {
          // @ts-ignore
          if (hasPaused || autoplay) playerInstance.play();
        },
        closing: () => {
          // @ts-ignore
          playerInstance.pause();
          hasPaused = true;
        },
      }
    ).open();
  });
}
