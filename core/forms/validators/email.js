// import _isEmail from "validator/lib/isEmail";

/**
 * Validator: is email check
 *
 * @param {HTMLInputElement} element
 * @returns {Boolean}
 */
export default function isEmail(element) {
  // return _isEmail(element.value);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(element.value);
  // return element.value.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
}
