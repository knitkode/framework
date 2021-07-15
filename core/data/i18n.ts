/**
 * Localise string
 *
 * Like in PHP it replaces interpolated variables with an object data, e.g.:
 * ```
 * __("Choose :name!", { name: "nobody" }) === "Choose nobody!";
 * ```
 */
export function __<T extends Record<string, string>>(
  key: keyof T,
  data: object,
  dictionary?: T
) {
  const globalDictionary = window["__i18n"] as T;
  let value = dictionary ? dictionary[key] : (globalDictionary[key] as string);

  if (value && data) {
    const matches = value.match(/(\:.*?)[\s|.|?|!|:|,|;]/g);
    for (let i = 0; i < matches.length; i++) {
      const dynamicStringPortion = matches[i];
      const dataKey = dynamicStringPortion.replace(":", "");
      if (data[dataKey]) {
        value = value.replace(
          new RegExp(dynamicStringPortion, "g"),
          data[dataKey]
        );
      }
    }
  }

  return value;
}
