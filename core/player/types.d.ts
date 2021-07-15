import { VideoJsPlayerOptions, VideoJsPlayer } from "video.js";

declare namespace Player {
  /** VideoJS options */
  type vendorOptions = VideoJsPlayerOptions;

  /** There are no custom options for now  */
  type customOptions = {};

  /** Merge of custom and vendor options */
  type options = customOptions & vendorOptions;

  /** Player initialiser function */
  type initialiser = (
    rooter?: string | HTMLElement | VideoJsPlayer,
    options?: options,
    ready?: () => void
  ) => VideoJsPlayer;
}
