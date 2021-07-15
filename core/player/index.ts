import videojs from "video.js/dist/alt/video.core.novtt";
import "./index.scss";
import { VideoJsPlayerOptions, VideoJsPlayer } from "video.js";
// export * from "video.js";

/**
 * `controls` and `preload` options are read from the attribute on the DOM
 * element managed by the blade component
 *
 * @default {
 *   liveui: false;
 * }
 */
type PlayerOptions = VideoJsPlayerOptions & {};

const defaultOptions = {
  liveui: false,
};

/**
 * Player, just a wrapper around `videojs`
 *
 * It is always better to import this module with async imports as such:
 * ```
 * let playerInstance;
 * import("@knitkode/core-player").then(({ Player }) => {
 *   const player = Player();
 * });
 * ```
 * or with async/await:
 * ```
 * const { Player } = await import("@knitkode/core-player");
 * const player = Player();
 * ```
 *
 * For videojs API @see https://docs.videojs.com/
 * Regarding the bundle size @see https://github.com/videojs/video.js/issues/6166
 */
export function Player(
  rooter?: string | HTMLElement | VideoJsPlayer,
  options: PlayerOptions = {},
  ready?: () => any
) {
  return videojs(rooter, { ...defaultOptions, ...options }, ready);
}
