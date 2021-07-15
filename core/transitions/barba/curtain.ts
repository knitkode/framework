import { $ } from "@knitkode/core-dom";
import { gsap } from "gsap";

/**
 * Transition curtain effect for barba.js containers
 */
export function transitionBarbaCurtain(selector: string = ".transition") {
  const $element = $(selector);

  return {
    leave(data) {
      // const bg = getComputedStyle(document.body, null).getPropertyValue("background-color");
      return gsap
        .timeline()
        .set($element, {
          display: "block",
          xPercent: -100,
          yPercent: 0,
          // background: bg
        })
        .to($element, {
          xPercent: 100,
          duration: 0.6,
        })
        .to(
          data.current.container,
          {
            opacity: 0,
            duration: 0.6,
          },
          "<"
        );
    },
    after(data) {
      return gsap
        .timeline()
        .to($element, {
          xPercent: 200,
          duration: 0.6,
        })
        .to(
          data.next.container,
          {
            opacity: 1,
            duration: 0.6,
          },
          "<"
        )
        .set($element, {
          display: "none",
        });
    },
  };
}
