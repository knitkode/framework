import { isObject } from "./type";

/**
 * Merge two or more objects together. It mutates the target object.
 *
 * @see https://stackoverflow.com/a/46973278/1938970
 */
export const mergeObjects = <T extends object = object>(
  target: T,
  ...sources: T[]
): T => {
  if (!sources.length) {
    return target;
  }
  const source = sources.shift();
  if (source === undefined) {
    return target;
  }

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(function (key: string) {
      if (isObject(source[key])) {
        if (!target[key]) {
          target[key] = {};
        }
        mergeObjects(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    });
  }

  return mergeObjects(target, ...sources);
};

/**
 * Swap object map key/value
 *
 * @param {object} [map=[]]
 * @returns {object}
 */
export function swapMap(map = {}) {
  const output = {};
  for (const key in map) {
    output[map[key]] = key;
  }
  return output;
}
