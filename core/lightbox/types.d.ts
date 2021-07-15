import { glideInstance } from "../glide/helpers";

declare namespace Lightbox {
  type instance = Dialog.instance & {
    show: ({ img: string, idx: number }) => void;
    slider: glideInstance;
  };

  type hooks = {
    closing?: (lightboxSliderLastIdx: number) => any;
    run?: (lightboxSliderCurrentIdx: number) => any;
  };
}
