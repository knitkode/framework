import {
  $,
  $$,
  $each,
  addClass,
  forEach,
  removeClass,
} from "@knitkode/core-dom";
import Lazy from "@knitkode/core-lazy";
import { post } from "../ajax";

type Fragments = Record<string, string>;

/**
 * A single fragment response is just a string of HTML
 */
type FragmentResponse = string;

/**
 * A key value pair where the key is the id of the fragment (same as
 * `FragmentMap["key"]` and the value is its rendered HTML
 */
type FragmentsResponse = Record<string, FragmentResponse>;

const CLASS_LOADING = "is-loading";

/**
 * Replace fragment async
 *
 * Abstraction to replace a portion of HTML with simple remote fetching.
 *
 * @param {string} id The root DOM element identifier, it will be either replaced
 *                    or filled with the remote fragment template
 * @param {object} [data] Custom data to be passed to the server side route handler
 */
export function replaceFragment(id: string, view: string, data?: object) {
  let $root = $(`[data-fragment-id="${id}"]`);
  if (!$root) {
    if (__DEV__) {
      console.error(
        `fragments:replace, unexisting DOM element with data-fragment-id="${id}"`
      );
    }
    return;
  }

  const $content = $(".fragmentContent", $root);
  const url = `/replace?id=${id}&view=${view}`;

  addClass($root, CLASS_LOADING);

  const promise = post<FragmentResponse>(url, { data });

  promise.then(({ data }) => {
    // replace with new content
    if ($content) $content.innerHTML = data;
    else if ($root) $root.outerHTML = data;

    // re-initialise image lazy loading
    new Lazy({ container: $root });

    // remove loading state CSS handling
    removeClass($root, CLASS_LOADING);
  });

  return promise;
}

/**
 * Replace fragments async
 *
 * Abstraction to replace multiple portions of HTML with simple remote fetching
 * at once
 *
 * @param {object} [data] Custom data to be passed to the server side route handler.
 *                        It will be passed as prop to all given fragments views.
 */
export function replaceFragments(fragments: Fragments, data?: object) {
  let url = "/replace_many?";
  const map = {};

  for (const id in fragments) {
    const $roots = $$(`[data-fragment-id="${id}"]`);
    const view = fragments[id];

    map[id] = $roots;

    // add loading state CSS handling
    forEach($roots, ($el) => addClass($el, CLASS_LOADING));
    url += `${id}=${view}&`;
  }

  url = url.slice(0, -1);

  const promise = post<FragmentsResponse>(url, {
    data,
  });

  promise.then(({ data }) => {
    for (const id in map) {
      const $roots = map[id];
      // const { target } = fragments[id];

      forEach($roots, ($root) => {
        const $content = $(".fragmentContent", $root);

        // replace with new content
        if ($content) $content.innerHTML = data[id];
        else if ($root) $root.outerHTML = data[id];

        // re-initialise image lazy loading
        new Lazy({ container: $root });

        // remove loading state CSS handling
        removeClass($root, CLASS_LOADING);
      });
    }
  });

  return promise;
}

/**
 * Set loading state programmatically on a specific fragment
 *
 * It can be used in chained async requests to eagerly set the loading state
 * of a fragment. For instance when inside a fragment happens a user interaction
 * that requires async work to be done before doing the fragment replacement.
 *
 * @export
 * @param {string} fragmentId
 */
export function setFragmentLoading(fragmentId: string) {
  $each(`[data-fragment-id="${fragmentId}"]`, ($el) =>
    addClass($el, CLASS_LOADING)
  );
}
