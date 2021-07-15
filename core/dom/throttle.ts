/**
 * Throttle for resize / scroll
 *
 * @see https://github.com/Mobius1/Rangeable/
 */
export function throttle(fn: Function, limit: number, context: object) {
  let wait;
  return function () {
    context = context || this;
    if (!wait) {
      fn.apply(context, arguments);
      wait = true;
      return setTimeout(function () {
        wait = false;
      }, limit);
    }
  };
}
