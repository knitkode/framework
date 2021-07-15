import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { $$, forEach, getDataAttr } from "@knitkode/core-dom";
import "./withGsap.scss";

gsap.registerPlugin(ScrollTrigger);

/**
 * Kill all scroll triggers instances and revert pin-related changes
 */
export function killScrollTriggers() {
  ScrollTrigger.getAll().forEach((trigger) => {
    trigger.kill();
  });
}

/**
 * Animate on scroll with `gsap`
 *
 * Init an scroll listener for HTML elements matching `data-onscroll={id}` or
 * for the given DOM element
 * It can be called with an `option` object as second argument or with a
 * `function`, a shortcut to the `onin` callback.
 *
 * It serves as a thin API to connect gsap animations on elements getting into
 * viewport.
 * It uses gsap ScrollTrigger to listen scroll event and in viewport detection
 * and provides a `data-onscroll` HTML api to reuse the same animations
 * declaratively in the HTML.
 *
 * @param {string} name The animation name
 * @param {($element: HTMLElement, direction: 1 | -1) => any} animation The custom animation callback
 * @param {HTMLElement} [$root=document] The root selector from where starting to grab animated elements
 */
export function animateOnScrollWithGsap(
  name: string,
  animation: ($element: HTMLElement, direction: 1 | -1) => any,
  $root?: HTMLElement
) {
  const $triggers = $$(`[data-onscroll="${name}"]`, $root);

  /**
   * Animate, it wraps and call the given callback with the right arguments
   *
   * @param {HTMLElement} $element
   * @param {1 | -1} direction
   */
  function animate($element, direction) {
    animation($element, direction);
  }

  /**
   * Hide element in order to perceive the animation
   *
   * @param {HTMLElement} $lement
   */
  function hide($lement) {
    gsap.set($lement, { autoAlpha: 0 });
  }

  // loop through all DOM defined triggers and create the gsap ScrollTriggers
  forEach($triggers, ($trigger, idx) => {
    hide($trigger); // assure that the element is hidden when scrolled into view
    const delay = getDataAttr($trigger, "onscroll-delay");
    const trigger = {
      id: name + idx,
      trigger: $trigger,
      onEnter: function () {
        animate($trigger, 1);
      },
      onEnterBack: function () {
        animate($trigger, -1);
      },
      // assure that the element is hidden when scrolled into view
      onLeave: function () {
        hide($trigger);
      },
    };

    if (delay) {
      // trigger.start = `top -=${delay}`;
      // @ts-expect-error
      trigger.snap = { delay: parseInt(delay, 100) / 1000 };
    }

    ScrollTrigger.create(trigger);
  });

  // ScrollTrigger.batch(gsap.utils.toArray($triggers), {
  //   onEnter: (elements, triggers) => {
  //     gsap.fromTo(elements, {x: -100, opacity: 0 }, {x: 0, opacity: 1, stagger: 0.3});
  //   },
  //   onEnterBack: (elements, triggers) => {
  //     gsap.fromTo(elements, {x: 100, opacity: 0 }, {x: 0, opacity: 1, stagger: 0.3});
  //   }
  // });

  return {
    refresh() {
      ScrollTrigger.refresh();
    },
    destroy() {
      forEach($triggers, ($trigger, idx) => {
        const trigger = ScrollTrigger.getById(name + idx);
        if (trigger) trigger.kill(true);
        gsap.set($trigger, { clearProps: true });
      });
    },
  };
}

export function onScrollInBottomWithGsap(
  from = {},
  to = {},
  duration = 1.25,
  fromY = 100,
  fromOpacity = 0,
  toY = 0,
  toOpacity = 1
) {
  return animateOnScrollWithGsap("in-bottom", ($element) => {
    gsap.fromTo(
      $element,
      {
        y: fromY,
        autoAlpha: fromOpacity,
        ...from,
      },
      {
        duration,
        y: toY,
        autoAlpha: toOpacity,
        ...to,
      }
    );
  });
}

export function onScrollInLeftWithGsap(
  from = {},
  to = {},
  duration = 1.25,
  fromX = -100,
  fromOpacity = 0,
  toX = 0,
  toOpacity = 1
) {
  return animateOnScrollWithGsap("in-left", ($element) => {
    gsap.fromTo(
      $element,
      {
        x: fromX,
        autoAlpha: fromOpacity,
        ...from,
      },
      {
        duration,
        x: toX,
        autoAlpha: toOpacity,
        ...to,
      }
    );
  });
}

export function onScrollInRightWithGsap(
  from = {},
  to = {},
  duration = 1.25,
  fromX = 100,
  fromOpacity = 0,
  toX = 0,
  toOpacity = 1
) {
  return animateOnScrollWithGsap("in-right", ($element) => {
    gsap.fromTo(
      $element,
      {
        x: fromX,
        autoAlpha: fromOpacity,
        ...from,
      },
      {
        duration,
        x: toX,
        autoAlpha: toOpacity,
        ...to,
      }
    );
  });
}

export function onScrollInTopWithGsap(
  from = {},
  to = {},
  duration = 1.25,
  fromY = -100,
  fromOpacity = 0,
  toY = 0,
  toOpacity = 1
) {
  return animateOnScrollWithGsap("in-top", ($element) => {
    gsap.fromTo(
      $element,
      {
        y: fromY,
        autoAlpha: fromOpacity,
        ...from,
      },
      {
        duration,
        y: toY,
        autoAlpha: toOpacity,
        ...to,
      }
    );
  });
}
