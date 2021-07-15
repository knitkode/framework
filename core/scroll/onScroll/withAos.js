import AOS from "aos";

// @see https://github.com/michalsnik/aos (options)
export default function init(options = {}) {
  return AOS.init({
    // once: true,
    animatedClassName: "is-in",
    ...options,
  });
}
