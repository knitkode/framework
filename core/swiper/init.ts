import { lazyClass, lazyClassSuccess } from "@knitkode/core-lazy";
import { $, listenResize } from "@knitkode/core-dom";
import { Swiper, SwiperOptions, Lazy, A11y } from "swiper";
import "./index.scss";

type SwiperOptionsExtended = SwiperOptions & {
  killWhen?: {
    above?: number;
    below?: number;
    cleanStyles?: boolean;
  };
};

export default function initSwiper(
  selector: string,
  options: SwiperOptionsExtended = {},
  customComponents = []
) {
  const defaultOptions = {
    lazy: {
      loadOnTransitionStart: true,
      elementClass: lazyClass,
      loadedClass: lazyClassSuccess,
      // loadingClass:
      // preloaderClass:
    },
  };
  const element = typeof selector === "string" ? $(selector) : selector;
  let instance;

  Swiper.use([A11y, Lazy, ...customComponents]);

  const createInstance = () => {
    return new Swiper(element, {
      ...defaultOptions,
      ...options,
    });
  };

  if (options.killWhen) {
    const { above, below, cleanStyles = false } = options.killWhen;
    let hasInit = false;

    const liveOrDie = () => {
      if (
        (above && window.innerWidth >= above) ||
        (below && window.innerWidth < below)
      ) {
        if (instance) {
          hasInit = false;
          instance.destroy(true, cleanStyles);
        }
      } else {
        if (!hasInit) {
          instance = createInstance();
          hasInit = true;
        }
      }
    };

    liveOrDie();

    listenResize(liveOrDie);
  } else {
    instance = createInstance();
  }

  return instance;
}
