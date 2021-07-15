/**
 * Check whether *Google Tag Manager* is active on page
 *
 * It simply checks on the existence of `google_tag_manager` global variable.
 * In a future we might refine this check if needed in a single place.
 */
export function hasGtm() {
  return !!window["google_tag_manager"];
}
