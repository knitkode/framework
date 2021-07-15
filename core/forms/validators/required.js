/**
 * Validator: is required check
 *
 * @param {HTMLFormElement} element
 * @returns {Boolean}
 */
export default function isRequired(element) {
  // use the native API if available
  if (element.validity) {
    return !element.validity.valueMissing;
  }

  // TODO: custom stuff for checkboxes, radios, and selects
  return element.value && element.value !== "";
}
