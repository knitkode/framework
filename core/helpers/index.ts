export { default as debounce } from "lodash.debounce";
export { default as throttle } from "lodash.throttle";
export * from "./data";
export * from "./interface";
export * from "./location";
export * from "./type";

export type ValueOf<T> = T[keyof T];

/**
 * Uuid, tiny custom helper instead of node's uuid/v4
 *
 * @see https://stackoverflow.com/a/2117523/1938970
 */
export function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get random int (min and max included)
 */
export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Get random key from given object
 *
 * @see https://stackoverflow.com/a/15106541/1938970
 */
export function randomKey<T extends Record<string | number, any>>(
  obj: T
): keyof T {
  const keys = Object.keys(obj);
  return keys[(keys.length * Math.random()) << 0];
}

/**
 * Maps an array of objects into a map keyed with the given key
 */
export function mapListBy<T extends Record<string | number | symbol, any>>(
  array: T[] = [] as T[],
  key: keyof T = "" as keyof T
) {
  return array.reduce((obj, item) => {
    obj[item[key]] = item;
    return obj;
  }, {} as Record<ValueOf<T>, T>);
}

/**
 * Remove duplicated array objects, equality is determined by a strict (`===`)
 * comparison of each object's given key
 *
 * @param {object[]} [array=[]]
 * @param {string} [key=""]
 * @returns {object[]}
 */
export function removeDuplicatesByKey<
  T extends Record<string | number | symbol, any>
>(array: T[] = [] as T[], key: keyof T = "" as keyof T) {
  const keysMap = {} as Record<ValueOf<T>, boolean>;
  const output = [];

  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    if (!keysMap[item[key]]) {
      output.push(item);
      keysMap[item[key]] = true;
    }
  }

  return output;
}

/**
 * Download file programmatically, it fakes a click action, should only work
 * from same origin domain
 */
export function downloadFile(url: string, name: string) {
  const a = document.createElement("a");
  a.download = name;
  a.href = url;
  a.click();
}
