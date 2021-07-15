import { detect } from "./index";

// @see https://stackoverflow.com/a/4819886/1938970
export function hasTouch() {
  const prefixes = " -webkit- -moz- -o- -ms- ".split(" ");
  const mq = function (query) {
    return window.matchMedia(query).matches;
  };

  if (
    "ontouchstart" in window ||
    // @ts-ignore
    (window.DocumentTouch && document instanceof DocumentTouch)
  ) {
    return true;
  }

  // include the 'heartz' as a way to have a non matching MQ to help terminate the join
  // https://git.io/vznFH
  const query = ["(", prefixes.join("touch-enabled),("), "heartz", ")"].join(
    ""
  );

  return mq(query);
}

// @see https://stackoverflow.com/a/4819886/1938970
export function detectTouch() {
  return detect(() => ["touch", hasTouch()]);
}
