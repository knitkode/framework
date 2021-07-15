import { detect } from "./index";

export const isIos =
  typeof window !== "undefined" &&
  window.navigator &&
  window.navigator.platform &&
  /iP(ad|hone|od)/.test(window.navigator.platform);

// @see https://stackoverflow.com/a/4819886/1938970
export function detectIos() {
  return detect(() => ["ios", isIos], "is", "is-not");
}
