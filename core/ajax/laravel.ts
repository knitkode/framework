import { $ } from "@knitkode/core-dom";
import ajax, { AjaxConfig, AjaxResponse } from "./index";

export type AjaxLaravelResponseError = AjaxResponse<{
  msg: string;
}>;

const crsfToken = $("meta[name='csrf-token']").getAttribute("content");

/**
 * Internal laravel ajax wrapper, it just adds the csrf token automatically to the
 * headers fo the request
 *
 * @param {string} endpoint The endpoint relative path, slashes will be normalised.
 */
export default function ajaxLaravel<T>(
  endpoint: string,
  options: AjaxConfig = {}
) {
  const headers = options.headers || {};

  headers["X-CSRF-TOKEN"] = crsfToken;

  options.headers = headers;

  return ajax<T>(endpoint, options);
}

/**
 * Internal laravel ajax `GET` request shortcut
 *
 * @param {string} endpoint The endpoint relative path, slashes will be normalised.
 */
export function get<T>(endpoint, options: AjaxConfig = {}) {
  options.method = "GET";
  return ajaxLaravel<T>(endpoint, options);
}

/**
 * Internal laravel ajax `POST` request shortcut
 *
 * @param {string} endpoint The endpoint relative path, slashes will be normalised.
 */
export function post<T>(endpoint: string, options: AjaxConfig = {}) {
  options.method = "POST";
  return ajaxLaravel<T>(endpoint, options);
}

/**
 * Internal laravel ajax `DELETE` request shortcut
 *
 * @param {string} endpoint The endpoint relative path, slashes will be normalised.
 */
export function del<T>(endpoint: string, options: AjaxConfig = {}) {
  options.method = "DELETE";
  return ajaxLaravel<T>(endpoint, options);
}
