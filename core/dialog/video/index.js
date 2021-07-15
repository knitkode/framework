import { $ } from "@knitkode/core-dom";
import dialogAsync from "../async";
import "./index.scss";

/**
 * Open video dialog (standard HTML5 video player)
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
export default function openDialogVideo({
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
  let attrs = ` class="video"`;
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

  let video;

  dialogAsync(
    {
      id: src,
      tpl,
      rootClass: "dialogVideo " + rootClass,
    },
    {
      rendered: (instance) => {
        instance.load();
        video = $(".video", instance.$root);
      },
      opened: () => {
        // @ts-ignore
        if (hasPaused && autoplay) video.play();
      },
      closing: () => {
        // @ts-ignore
        video.pause();
        hasPaused = true;
      },
    }
  ).open();
}
