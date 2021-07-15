/**
 * Parse duration
 *
 * Transforms a duration CSS value exported from a sass module into the same
 * value expressed in milliseconds for JavaScript.
 *
 * Example:
 *
 * ```scss
 * // MyComponent.scss
 *
 * $transition-time: 0.3s;
 *
 * :export {
 *  time: $transition-time
 * }
 * ```
 *
 * ```js
 * // MyComponent.js
 * import styles from "./styles.scss"
 *
 * const ms = parseDuration(styles.time);
 * ```
 *
 * @param {string} input CSS transition time value, e.g. "0.3s"
 */
export function parseDuration(input = "") {
  return parseFloat(input) * 1000;
}

/**
 * Parse size
 *
 * Transforms a size CSS value exported from a sass module into the same
 * value expressed in milliseconds for JavaScript.
 *
 * Example:
 *
 * ```scss
 * // MyComponent.scss
 *
 * $Component-height: 100px;
 *
 * :export {
 *  height: $Component-height
 * }
 * ```
 *
 * ```js
 * // MyComponent.js
 * import styles from "./styles.scss"
 *
 * const height = parseSize(styles.height);
 * ```
 *
 * @param {string} input CSS size value, e.g. "100px"
 */
export function parseSize(input = "") {
  return parseFloat(input);
}
