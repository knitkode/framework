import { gsap } from "gsap";
import { on, off, listenResize } from "@knitkode/core-dom";

type GsapTiltOptions = {
  /**
   * Indicates whether the Power component is present.
   */
  hasPower: boolean;
  /**
   * The mousemove sensible area
   */
  area: HTMLElement;
  /**
   * The target element to tilt
   */
  target: HTMLElement;
  /**
   * @default 8
   */
  max?: number;
  /**
   * @default false
   */
  full?: boolean;
  /**
   * @default true
   */
  reverse?: boolean;
};

/**
 * Tilt with `gsap`
 */
export function TiltWithGsap({
  area,
  target,
  max = 8,
  full = false,
  reverse = true,
}: GsapTiltOptions) {
  const _reverse = reverse ? -1 : 1;
  let clientWidth;
  let clientHeight;
  let width;
  let height;
  let left;
  let top;

  const updateTargetPos = () => {
    if (full) {
      clientWidth =
        window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth;
      clientHeight =
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight;
    } else {
      const rect = area.getBoundingClientRect();
      width = area.offsetWidth;
      height = area.offsetHeight;
      left = rect.left;
      top = rect.top;
    }
  };

  const handleMouseMove = (event) => {
    let x, y;
    const { clientX, clientY } = event;
    if (full) {
      x = clientX / clientWidth;
      y = clientY / clientHeight;
    } else {
      x = (clientX - left) / width;
      y = (clientY - top) / height;
    }

    const tiltX = parseFloat((_reverse * (max - x * max * 2)).toFixed(2));
    const tiltY = parseFloat((_reverse * (y * max * 2 - max)).toFixed(2));

    // const tiltX =  e.pageX / $body.width()  * 100 - 50;
    // const tiltY =  e.pageY / $body.height() * 100 - 50;

    gsap.to(target, {
      rotationY: 0.2 * tiltX, // 0.05 * tiltX,
      rotationX: 0.4 * tiltY, // 0.20 * tiltY,
      rotationZ: "-0.1",
      transformPerspective: 500,
      transformOrigin: "center center",
    });
  };

  gsap.set(target, { transformStyle: "preserve-3d" });
  on(area, "mousemove", handleMouseMove);
  // on(area, "mouseenter", handleMouseEnter);
  // on(area, "mouseleave", handleMouseLeave);

  updateTargetPos();
  listenResize(updateTargetPos);

  return {
    destroy() {
      off(area, "mousemove", handleMouseMove);
    },
  };
}
