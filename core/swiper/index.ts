/**
 * @file
 *
 * List of swiper components @see https://swiperjs.com/api/#custom-build
 */

export { default as initSwiper } from "./init";
export { default as navigation } from "./navigation";
// FIXME: imports are included in the bundle anyway?
export {
  Swiper,
  // Virtual,
  // Keyboard,
  // Autoplay,
  Navigation,
  // Pagination,
  // EffectFade,
  // Controller,
  // Thumbs,
  // Scrollbar,
  Lazy,
  // Mousewheel,
  // Parallax,
  // Zoom,
  // History,
  // HashNavigation,
  A11y,
} from "swiper";
// EffectCube,
// EffectFlip,
// EffectCoverflow
