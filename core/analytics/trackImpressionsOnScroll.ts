import { getTrackImpressionData, trackImpression } from "./helpers";
import onScroll from "@knitkode/core-scroll/onScroll";

/**
 * Track impressions on scroll
 *
 * The array and check of duplicates is to prevent doubled impressions on async
 * rendered content (in a "results-filtering" scenario)
 *
 * @param {string} [eventName="impressionsEE"]
 * @param {string} [currencyCode="EUR"]
 * @returns {ReturnType<OnScroll.initaliser>}
 */
export function trackImpressionsOnScroll(
  eventName?: string,
  currencyCode?: string
) {
  const trackedData = {};

  return onScroll("[data-track-impression]", {
    onin: (element) => {
      const dataString = getTrackImpressionData(element);
      if (dataString && !trackedData[dataString]) {
        trackImpression(dataString, eventName, currencyCode);
        trackedData[dataString] = true;
      }
    },
    // trigger the event only when 90% of the element is visible
    offset: {
      element: {
        y: 0.9,
      },
    },
  });
}
