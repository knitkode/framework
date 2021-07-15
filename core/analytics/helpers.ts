import { getDataAttr } from "@knitkode/core-dom";
import { isString } from "@knitkode/core-helpers/type";

/**
 * Get impression track data on the given HTML element, the element must encode
 * the data to send in a `data-impression="{data}"` attribute,
 *
 * You can do it with twig with:
 * ```
 * {% set trackData = {
 *  name: 'a name',
 * } %}
 *
 * <div data-impression="{{ trackData | json_encode() }}">
 * ```
 *
 * @param {HTMLElement} [element]
 * @returns {undefined | string} Either undefined if the element was not there or the impression data parsed from the element
 */
export function getTrackImpressionData(element?: HTMLElement) {
  if (!element) return;
  return getDataAttr(element, "track-impression");
}

/**
 * Track impression on the given HTML element
 *
 * @requires dataLayer
 * @param {string | object} data Either a JSON stringified data object or a plain javascript Object
 * @param {string} [eventName="impressionsEE"]
 * @param {string} [currencyCode="EUR"]
 * @returns {string | object} The impression data parsed from the element
 */
export function trackImpression(
  data: string | object,
  eventName: string = "impressionsEE",
  currencyCode: string = "EUR"
) {
  data = isString(data) ? JSON.parse(data) : data;

  // @ts-ignore
  dataLayer.push({
    event: eventName,
    ecommerce: {
      currencyCode,
      impressions: [data],
    },
  });

  return data;
}
