/*
 * Gives the accurate type of a JavaScript object beyond its "everything is an
 * object nature".
 *
 * @see https://gomakethings.com/true-type-checking-with-vanilla-js/
 * @see https://www.typescriptlang.org/docs/handbook/advanced-types.html#typeof-type-guards
 */
export function trueTypeOf(obj: any) {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
}

/**
 * Is Array
 */
export function isArray<T>(input: any): input is Array<T> {
  return trueTypeOf(input) === "array";
}

/**
 * Is Object
 */
export const isObject = (input: any): input is { [key: string]: any } =>
  trueTypeOf(input) === "object";

/**
 * Is Date
 */
export const isDate = (input: any): input is Date =>
  trueTypeOf(input) === "date";

/**
 * Is RegExp
 */
export const isRegexp = (input: any): input is RegExp =>
  trueTypeOf(input) === "regexp";

/**
 * Is null
 */
export const isNull = (input: any): input is null =>
  trueTypeOf(input) === "null";

/**
 * Is Function
 */
export const isFunction = (input: any): input is Function =>
  typeof input === "function";

/**
 * Is string
 */
export const isString = (input: any): input is string =>
  typeof input === "string";

/**
 * Is number
 */
export const isNumber = (input: any): input is number =>
  typeof input === "number";

/**
 * Is boolean
 */
export const isBoolean = (input: any): input is boolean =>
  typeof input === "boolean";

/**
 * Is undefined
 */
export const isUndefined = (input: any): input is undefined =>
  typeof input === "undefined";

/**
 * Is FormData
 */
export function isFormData<T>(input: any): input is FormData {
  return trueTypeOf(input) === "formdata";
}
