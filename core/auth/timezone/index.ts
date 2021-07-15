import { $each } from "@knitkode/core-dom";

/**
 * Get timezone offset (in minutes)
 *
 * @see https://usefulangle.com/post/31/detect-user-browser-timezone-name-in-php
 * @return {number}
 */
export function getTimezoneOffset() {
  let minutesOffset = new Date().getTimezoneOffset();
  minutesOffset = minutesOffset == 0 ? 0 : -minutesOffset;

  // timezone difference in minutes such as 330 or -360 or 0
  return minutesOffset;
}

export function setTimezone(selector = "[data-auth-timezone-offset]") {
  const timezoneOffset = getTimezoneOffset();

  $each(selector, ($input: HTMLInputElement) => {
    $input.value = timezoneOffset + "";
  });
}

// auto init?
// setTimezone();
