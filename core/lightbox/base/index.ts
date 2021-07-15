import {
  $,
  addClass,
  removeClass,
  getDataAttr,
  getScrollbarWidth,
} from "@knitkode/core-dom";
import dialog from "@knitkode/core-dialog";
import {
  glide,
  Anchors,
  AutoHeight,
  Controls,
  Keyboard,
  LazyLoad,
  Swipe,
} from "@knitkode/core-glide";
import scrollTo from "@knitkode/core-scroll/scrollTo";
import "./index.scss";

type LightboxInstance = Dialog.instance & {
  show: ({ img: string, idx: number }) => void;
  slider: glideInstance;
};

type LightboxHooks = {
  closing?: (lightboxSliderLastIdx: number) => any;
  run?: (lightboxSliderCurrentIdx: number) => any;
};

/**
 * Lightbox base initialiser
 *
 * @export
 * @param {string} id
 * @param {import("../types").Lightbox.hooks} [hooks={}]
 * @param {import("../../glide/helpers").glideOptions} [sliderOpts={}]
 * @returns {import("../types").Lightbox.instance}
 */
export default function lightboxBase(
  id,
  hooks: LightboxHooks = {},
  sliderOpts = {}
) {
  let $arrows;
  let $placeholder;
  let slider;
  let $root;

  const instance = dialog(
    `#${id}`,
    { id },
    {
      mounted: (dialog) => {
        $root = dialog.$root;
        $arrows = $(".lightboxArrows", $root);
        $placeholder = $(".lightboxPlaceholder", $root);
      },
      opening: scrollToTop,
      opened: () => {
        checkScrollLock();
        // give a timeout to let the animation properly finish so that glide
        // can get the right dom sizes when mounting
        setTimeout(() => {
          // TODO: FIXED_VIDEPORT_VARIANT: start
          // remove AutoHeight component
          // TODO: FIXED_VIDEPORT_VARIANT: end
          slider.mount({
            Anchors,
            Controls,
            Keyboard,
            LazyLoad,
            AutoHeight,
            Swipe,
          });
        }, 100);
      },
      closing: (dialog) => {
        removeClass(dialog.$root, "is-ready");
        if (hooks.closing && instance.slider) {
          hooks.closing(instance.slider.index);
        }
      },
      closed: (dialog) => {
        // slider.destroy();
        checkScrollLock();
      },
    }
  );

  // decorate dialog instance with custom public methods
  instance.show = show;

  /**
   * Scroll to top
   */
  function scrollToTop() {
    scrollTo(0, { container: instance.$cage });
  }

  /**
   * Check scroll lock
   *
   * @deprecated ? I just put `overflow-y: scroll` on the `dialogCage`
   */
  function checkScrollLock() {
    if ($arrows) {
      $arrows.style.paddingRight = getScrollbarWidth(instance.$cage) + "px";
    }
  }

  /**
   * Init slider
   *
   * @param {number} idx
   * @returns {import("../../glide/helpers").glideInstance}
   */
  function initSlider(idx) {
    return glide($(".glide", $root), {
      sizeByTrack: true,
      ...sliderOpts,
      startAt: idx,
    })
      .on("mount.after", () => {
        // TODO: FIXED_VIDEPORT_VARIANT: start
        // const { $content } = instance;
        // const currentHeight = `${$content.offsetHeight}px`;
        // const $track = $(".glide__track", $content);
        // const $slides = $(".glide__slides", $content);
        // $track.style.height = currentHeight;
        // $slides.style.height = currentHeight;
        // TODO: FIXED_VIDEPORT_VARIANT: end
        addClass(instance.$root, "is-ready");
        instance.loaded();
      })
      .on("run", () => {
        scrollToTop();
        if (hooks.run) {
          hooks.run(instance.slider.index);
        }
      })
      .on("autoHeight.after", checkScrollLock);
  }

  /**
   * Show lightbox from trigger
   *
   * @param {HTMLElement} $trigger
   */
  function show($trigger) {
    const img = getDataAttr($trigger, "img");
    const idx = parseInt(getDataAttr($trigger, "glide-idx"), 10);
    let width = getDataAttr($trigger, "w");
    let height = getDataAttr($trigger, "h");

    // give to the transform scale animation a sense of origin by grabbing
    // the center coordinates of the clicked trigger
    const triggerRect = $trigger.getBoundingClientRect();
    const destX = triggerRect.left + $trigger.offsetWidth / 2;
    const destY = triggerRect.top + $trigger.offsetHeight / 2;
    instance.$wrap.style.transformOrigin = `${destX}px ${destY}px`;
    // console.log(`destX ${destX} destY ${destY}`);
    // console.log(instance.$wrap.offsetHeight, instance.$wrap.offsetWidth)
    // instance.$wrap.style.transform = `scale(${0.3}`;

    instance.load();

    // if we have width and height we don't need to wait the image to be loaded
    // in order to properly size the dialog
    if (width && height) {
      width = parseInt(width, 10);
      height = parseInt(height, 10);
      $placeholder.width = width;
      $placeholder.height = height;
      $placeholder.src = img;
      // $(".glide__slides", $root).style.height = height + "px";
      onPlaceholderReady(idx);
    } else {
      $placeholder.onload = () => onPlaceholderReady(idx);
      $placeholder.src = img;
    }
  }

  /**
   * When placeholder is properly sized init the slider and open the dialog
   *
   * @param {number} idx
   */
  function onPlaceholderReady(idx) {
    // slider has already init
    if (slider) {
      slider.destroy();
      // or:
      // slider.go(`=${idx}`);
      // slider.update({ startAt: idx });
      // instance.open();
      // return;
    }

    slider = initSlider(idx);
    instance.slider = slider;

    instance.open();
  }

  return instance;
}
