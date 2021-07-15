/**
 * Get cookie
 */
export function getCookie<T>(name: string) {
  var v = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");
  return v ? (v[2] as unknown as T) : null;
}

/**
 * Set cookie
 */
export function setCookie(
  name: string,
  value: string | number | boolean,
  days: number
) {
  var d = new Date();
  d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
  document.cookie = name + "=" + value + ";path=/;expires=" + d.toUTCString();
}

/**
 * Delete cookie
 */
export function deleteCookie(name: string) {
  setCookie(name, "", -1);
}
