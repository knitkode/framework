/**
 * Follow these issues about Glide.js
 *
 * - @see https://github.com/glidejs/glide/issues/385 Glide hungs browser
 * (infinite loop) if no slides
 * - @see https://github.com/glidejs/glide/issues/346 How can i make 2 or more
 * slides move when i click the prev or next controls #346
 * - @see https://github.com/glidejs/glide/issues/210 Sizes.width uses root width
 */

export { init as glide } from "./helpers";
export {
  Anchors,
  Autoplay,
  Controls,
  Breakpoints,
  Keyboard,
  Images,
  Swipe,
} from "./glide.modular.esm";
export { default as AutoHeight } from "./components/AutoHeight";
export { default as ConstrainToImgHeight } from "./components/ConstrainToImgHeight";
export { default as CrossFade } from "./components/CrossFade";
export { default as Delay } from "./components/Delay";
export { default as Fade } from "./components/Fade";
export { default as Hover } from "./components/Hover";
export { default as Interactive } from "./components/Interactive";
export { default as LazyLoad } from "./components/LazyLoad";
export { default as NextPrev } from "./components/NextPrev";
export { default as SlaveOf } from "./components/SlaveOf";
export { default as Sync } from "./components/Sync";
