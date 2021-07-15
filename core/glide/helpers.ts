///<reference path="node_modules/@types/glidejs__glide/index.d.ts" />

import { escape, listenResize } from "@knitkode/core-dom";
import Glide from "./glide.modular.esm";
// import { Glide } from "@glidejs/glide";
import "./index.scss";

// declare namespace Glide {
//   interface Options {
//     ciao: true;
//   }
// }

// const a: Glide.Options. = "a";

type GlideOptions = Glide.Options & {
  /**
   * Kill/destroy the slider above or below a certain `window.innerWidth`. When using this option components must be passed as third argument
   * @default
   */
  killWhen?: { above?: number; below?: number };
  /**
   * Calculates the slider width based on the `data-glide-el="track"` element, useful when paried up with `ContrainToImgHeight` custom component
   * @default false
   */
  sizeByTrack?: boolean;
  /**
   * Turns a glide instance into a non-interactive slave of another, synced with it
   */
  slaveOf?: GlideInstance;
  /**
   * Allows to sync multiple glide instances
   */
  sync?: GlideInstance;
  /**
   * This just sets the animation timing of the autoHeight in `ms`. N.B.: it's necessary to also import and add the component `AutoHeight`
   */
  autoHeight?: number | boolean;
  delay?: { enter?: number; exit?: number };
  /**
   * When true slides clones will be created
   * @default true
   */
  loop?: Boolean;
};

type GlideComponents = {
  /** Custom component */
  AutoHeight: Function;
  /** Custom component */
  CrossFade: Function;
  /** Custom component */
  Delay: Function;
  /** Custom component */
  Fade: Function;
  /** Custom component */
  LazyLoad: Function;
  /** Custom component */
  NextPrev: Function;
  /** Custom component */
  SlaveOf: Function;
  Anchors: any;
  Breakpoints: any;
  Controls: any;
  Hover: any;
  Images: any;
  Keyboard: any;
  Swipe: any;
  Html: {
    root: HTMLElement;
    track: HTMLElement;
    slides: HTMLElement[];
    wrapper: HTMLElement;
  };
  Clone: { items: HTMLElement };
};

type GlideInstance = {
  index: Number;
  settings: GlideOptions;
  disabled: Boolean;
  mount: (components?: GlideComponents) => GlideInstance;
  update: (options: GlideOptions) => GlideOptions;
  destroy: Function;
  // on: (event: String, handler)
};

/**
 * Init glidejs slider (custom fork)
 *
 * @param {string | HTMLElement} selector
 * @param {glideOptions} options
 * @param {glideComponents} [components={}]
 * @returns {glideInstance}
 */
export function init(selector, options, components = {}) {
  // allow to pass a DOM element or a selector. Escape it to allow the use of
  // colons in HTML classNames
  // @ts-ignore
  let glide = /** @type {glideInstance} */ new Glide(
    typeof selector === "string" ? escape(selector) : selector,
    options
  );

  // FIXME: @styleloader
  if (__DEV__) {
    const _mount = glide.mount;
    // const _mount = glide.mount.bind(glide);
    // @ts-ignore
    glide.mount = function (components) {
      setTimeout(() => {
        _mount.call(glide, components);
      }, 50);
    };
  }

  // @see https://github.com/glidejs/glide/issues/208
  if (options.killWhen) {
    const { above, below } = options.killWhen;
    let hasInit = false;

    const toggle = () => {
      if (
        (above && window.innerWidth >= above) ||
        (below && window.innerWidth < below)
      ) {
        if (hasInit) {
          hasInit = false;
          try {
            glide.destroy();
          } catch (e) {
            // FIXME: sometimes the glide.Events class gives error, if resizing
            // too fast maybe, not sure if this is a problem...
          }
          // glide.disable();
        }
      } else {
        if (!hasInit) {
          glide.mount(components);

          // if (!glide) {
          //   glide = /** @type {glideInstance} */ (new Glide(
          //     typeof selector === "string" ? escape(selector) : selector,
          //     options
          //   )).mount(components);;
          // } else {
          //   glide.mount(components);
          // }
          hasInit = true;
        }
      }
    };

    const listenerResize = listenResize(toggle);

    glide.on("destroy", listenerResize);

    toggle();
  }

  // return the glide instance, with its default API,
  // @see https://glidejs.com/docs/api/
  return glide;
}
