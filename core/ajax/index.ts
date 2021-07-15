import {
  isString,
  isFormData,
  isArray,
  mergeObjects,
} from "@knitkode/core-helpers";
import "@knitkode/core-polyfills/promise";

export type AjaxConfig = {
  /** @default "GET" */
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  username?: string;
  password?: string;
  data?: any;
  headers?: Record<string, string>;
  /** @default "json" */
  responseType?: "text" | "json";
  timeout?: number;
  withCredentials?: boolean;
  cache?: string | boolean;
};

export interface AjaxResponse<T> {
  data: T;
  status: number;
  xhr: XMLHttpRequest;
  config: AjaxConfig;
}

export interface AjaxPromise<SuccessfulData, FailedData>
  extends PromiseConstructor {
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = SuccessfulData, TResult2 = never>(
    onfulfilled?:
      | ((
          value: AjaxResponse<SuccessfulData>
        ) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: AjaxResponse<FailedData>) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null
  ): Promise<TResult1 | TResult2>;

  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(
    onrejected?:
      | ((reason: AjaxResponse<FailedData>) => TResult | PromiseLike<TResult>)
      | undefined
      | null
  ): Promise<SuccessfulData | TResult>;

  cancel(): void;

  finally(callback: () => void): void;
}

let cacheMap = {} as Record<string, ReturnType<typeof Ajax>>;

/**
 * Ajax, utility wrapper
 *
 * Quite inspired by atomicjs, it differs in:
 * - full typescript support
 * - coeherent and expanded promises data between resolve and reject
 * - optional caching
 * - includes a promise polyfill that can be used throughout the whole
 * codebase
 * - optimize everything for smaller/faster code.
 *
 * @see https://github.com/cferdinandi/atomic
 *
 * We might even provide an interface like axios in a smaller package,
 * @see https://github.com/developit/redaxios
 */
export function Ajax<Successful, Failed = "">(
  url: string,
  customConfig: Partial<AjaxConfig> = {}
): AjaxPromise<Successful, Failed> {
  // force immutable default configuration
  const config = mergeObjects<AjaxConfig>(
    {
      method: "GET" as const,
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
      responseType: "text" as const,
    },
    customConfig
  );

  /**
   * Parse response into a coeherent object for both successful and failed requests
   */
  const parseResponse = <T>(xhr: XMLHttpRequest) => {
    let data: T;

    if (config.responseType !== "text") {
      data = xhr.response;
    }
    try {
      data = JSON.parse(xhr.responseText) as T;
    } catch (e) {
      data = xhr.responseText as unknown as T;
    }

    return {
      data,
      status: xhr.status,
      xhr,
      config,
    };
  };

  /**
   * Parse request body in the appropriate format
   */
  const parseRequestBody = function (obj: AjaxConfig["data"]): BodyInit {
    // ff already a string, or if a FormData object, return it as-is
    if (isString(obj) || isFormData(obj)) return obj;

    // ff the content-type is set to JSON or we have a data object
    // stringify the JSON object
    if (
      /application\/json/i.test(config.headers["Content-type"]) ||
      isArray(obj)
    )
      return JSON.stringify(obj);

    // otherwise, convert object to a serialized string
    const encoded = [];
    for (const prop in obj) {
      encoded.push(
        encodeURIComponent(prop) + "=" + encodeURIComponent(obj[prop])
      );
    }
    return encoded.join("&");
  };

  /**
   * Make an XHR request, returned as a Promise
   *
   * @return The XHR request Promise
   */
  const makeRequest = (url: string) => {
    // Create the XHR request
    const xhr = new XMLHttpRequest();

    // Setup the Promise
    const xhrPromise = new Promise(function (resolve, reject) {
      // Setup our listener to process completed requests
      xhr.onreadystatechange = function () {
        // Only run if the request is complete
        if (xhr.readyState !== 4) return;

        // Prevent timeout errors from being processed
        if (!xhr.status) return;

        // Process the response
        if (xhr.status >= 200 && xhr.status < 300) {
          // If successful
          resolve(parseResponse<Successful>(xhr));
        } else {
          // If failed
          reject(parseResponse<Failed>(xhr));
        }
      };

      // Setup our HTTP xhr
      xhr.open(config.method, url, true, config.username, config.password);
      xhr.responseType = config.responseType;

      // Add headers
      for (var header in config.headers) {
        if (config.headers.hasOwnProperty(header)) {
          xhr.setRequestHeader(header, config.headers[header]);
        }
      }

      // Set timeout
      if (config.timeout) {
        xhr.timeout = config.timeout;
        xhr.ontimeout = function (e) {
          reject({
            data: "Request timeout",
            status: 408,
            xhr,
            config,
          });
        };
      }

      // Add withCredentials
      if (config.withCredentials) {
        xhr.withCredentials = true;
      }

      // Send the xhr
      xhr.send(parseRequestBody(config.data));
    }) as unknown as AjaxPromise<Successful, Failed>;

    // Cancel the XHR xhr
    xhrPromise.cancel = function () {
      xhr.abort();
    };

    // Return the request as a Promise
    return xhrPromise;
  };

  // manage cache and make the request
  if (config.cache) {
    const cacheKey = isString(config.cache) ? config.cache : url;

    if (cacheMap[cacheKey]) {
      return cacheMap[cacheKey] as AjaxPromise<Successful, Failed>;
    }

    const request = makeRequest(url);
    cacheMap[cacheKey] = request;

    return request;
  }

  return makeRequest(url);
}

/**
 * Clear ajax cache
 */
export function ajaxClearCache(cacheKey: string) {
  if (cacheKey) {
    delete cacheMap[cacheKey];
  }
  cacheMap = {};
}

export default Ajax;
