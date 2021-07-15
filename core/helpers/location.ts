import { globalConf } from "@knitkode/core-data";
import { isNull } from "./type";

/**
 * Get website base url
 */
export function getBaseUrl(trailingSlash: boolean = true) {
  let url = globalConf.baseUrl || "";
  if (!url) {
    if (__DEV__) {
      console.warn("Failed to retrieve baseUrl from `globalConf`");
    }
    return "";
  }

  // ensure trailing slash
  if (trailingSlash) {
    url = url + "/";
  }

  // replace too many end slashes
  return url.replace(/\/+$/, "/");
}

/**
 * Normalise URL path, it replaces consecutive slashes
 */
export function normaliseUrlPath(path: string) {
  return path.replace(/\/+/g, "/");
}

/**
 * Get endpoint
 */
export function getEndpoint(path: string = "", trailingSlash: boolean = true) {
  let url = getBaseUrl() + "/" + path;

  // ensure trailing slash
  if (trailingSlash) {
    url = url + "/";
  }

  // replace too many consecutive slashes (except `http{s}://`)
  return url.replace(/([^:]\/)\/+/g, "$1");
}

/**
 * Get parsed query parameters as object dictionary (from URL or given query string)
 *
 * @param {string} [queryString] A full query string that starts with a `?`, e.g.
 *                              `?myparam=x`. It defaults to reading the current
 *                               URL query string with `location.search`. Through
 *                               this argument you can use this same function to
 *                               parse, for instance, the query params of the
 *                               `href` of a `<a href="...">` HTML tag.
 *
 */
export function getQueryParams<T extends Record<string, string>>(
  queryString?: string
) {
  let params = {};
  let search = queryString || location.search;
  search = search.substring(1);

  try {
    // @see https://stackoverflow.com/a/8649003/1938970
    let paramsAsObj = `{"${search.replace(/&/g, '","').replace(/=/g, '":"')}"}`;
    params = JSON.parse(paramsAsObj, (key, value) => {
      return key === "" ? value : decodeURIComponent(value);
    });
  } catch (e) {}

  return params as T;
}

/**
 * Get pathname parts
 *
 * First clean the pathname from the first slash if any then split the pathname
 * in parts,
 * Given a pathname like: `"/en/{prefix}/{collection}/{slug}"` we obtain
 * `[locale, prefix, collection, slug]`
 */
export function getPathnameParts() {
  const currentLocation = location;
  const pathnameCleaned = currentLocation.pathname.replace(/^\//, "");
  return pathnameCleaned.split("/");
}

/**
 * Get clean query string for URL
 */
export function buildQueryString(params = {}) {
  let output = "";

  for (const key in params) {
    const value = params[key];
    if (typeof value !== null && typeof value !== "undefined") {
      output += `${key}=${encodeURIComponent(value)}&`;
    }
  }

  // removes the last &
  return output ? `?${output.replace(/&+$/, "")}` : "";
}

/**
 * Change URL path, ensures initial and ending slashes and normalise eventual
 * consecutive slashes.
 *
 * @param {boolean} [replace] Replace URL instead of pushing it in the history stack. By default it pushes it.
 * @returns {string} The new cleaned pathname
 */
export function changeUrlPath(
  pathname: string,
  state?: object,
  replace?: boolean
) {
  const path = normaliseUrlPath(`/${pathname}/`);

  history[replace ? "replaceState" : "pushState"](state, null, path);

  return path;
}

/**
 * Change current URL query parameters
 *
 * @param {boolean} [replace] Replace URL instead of pushing it in the history stack. By default it pushes it.
 */
export function changeUrlParams(
  params: string | Record<string, string> = {},
  replace?: boolean
) {
  const queryString =
    typeof params === "string" ? params : buildQueryString(params);

  history[replace ? "replaceState" : "pushState"](
    null,
    null,
    location.pathname + queryString
  );

  return queryString;
}

/**
 * Merge query parameters objects, it *mutates* the first given object argument
 */
export function mergeParams<T extends Record<string, string>>(
  oldParams = {},
  newParams = {}
) {
  for (const key in newParams) {
    const value = newParams[key];

    if (oldParams[key] && isNull(value)) {
      delete oldParams[key];
    } else {
      oldParams[key] = value;
    }
  }

  return oldParams as T;
}

/**
 * Merge current URL query parameters with the given ones
 *
 * @param {boolean} [replace] Replace URL instead of pushing it in the history stack. By default it pushes it.
 */
export function mergeUrlParams(params: object = {}, replace?: boolean) {
  return changeUrlParams(mergeParams(getQueryParams(), params), replace);
}

/**
 * Remove URL query parameter
 *
 * @param {boolean} [replace] Replace URL instead of pushing it in the history stack. By default it pushes it.
 */
export function removeUrlParam(paramKey?: string, replace?: boolean) {
  let params = {};
  const currentParams = getQueryParams();
  for (const key in currentParams) {
    if (key !== paramKey) {
      params[key] = currentParams[key];
    }
  }

  return changeUrlParams(params, replace);
}

/**
 * Redirect to url with params {optionally}, removes eventual trailing question
 * marks from the given URL.
 */
export function redirectTo(url: string, params?: object) {
  const queryString = buildQueryString(params);
  location.href = url.replace(/\?+$/g, "") + queryString;
}

/**
 * Is external url
 */
export function isExternalUrl(url: string) {
  const reg = /https?:\/\/((?:[\w\d-]+\.)+[\w\d]{2,})/i;
  const urlMatches = reg.exec(url);

  // if no matches are found it means we either have an invalid URL, a relative
  // URL or a hash link, and those are not considered externals
  if (!urlMatches) {
    return false;
  }

  return reg.exec(location.href)[1] !== urlMatches[1];
}

/**
 * Update link `<a href="">` query parameters, it returns the newly created `href`
 * URL value
 */
export function updateLinkParams(
  $anchor: HTMLAnchorElement,
  newParams: Record<string, string> = {}
) {
  const { href } = $anchor;
  const parts = href.split("?");
  const pre = parts[0];
  const queryString = parts[1];
  const allParams = queryString
    ? mergeParams(getQueryParams(`?${queryString}`), newParams)
    : newParams;
  const newLink = pre + buildQueryString(allParams);

  $anchor.href = newLink;

  return newLink;
}
