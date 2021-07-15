import { $each, addClass, getDataAttr } from "@knitkode/core-dom";
import formatDate from "date-fns/format";
import isValid from "date-fns/isValid";

// this is commented cause tree shaking does not do its job with it
// export * from "date-fns";

/**
 * Convert UTC date to local date
 */
export function convertUTCDateToLocalDate(date: Date) {
  var newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);

  var offset = date.getTimezoneOffset() / 60;
  var hours = date.getHours();

  newDate.setHours(hours - offset);

  return newDate;
}

/**
 * Auto convert to local dates
 *
 * Convers UTC dates printed from server to local dates according to user
 * timezone, it adds `${attr}--init` class once the date has updated.
 *
 * In the `data-datelocal` attribute value you can put a valid date format, see
 * the supported list of formats on the [date-fns docs](https://date-fns.org/docs/format).
 *
 * @see https://stackoverflow.com/a/10837121
 *
 * @see [`date-fns/format` options](https://date-fns.org/docs/format#arguments)
 *
 * @export
 * @param {string} [attr="datelocal"] Data attribute selector (it is always prefixed by `data-`), so by default it select all HTML elements matching the selector `[data-datelocal]`
 * @param {string} [format] A valid date format, by default it is grabbed by the DOM data-attribute `data-datelocal`
 */
export function autoConvertToLocalDates(
  attr = "datelocal",
  format?: string,
  dateFnsFormatOptions?: Parameters<dateFns["format"]>[2]
) {
  const selector = `[data-${attr}]`;

  $each(selector, ($el) => {
    const dateFormat = format || getDataAttr($el, attr);
    let value = $el.textContent.trim();

    if (value && dateFormat) {
      // if it has spaces leave it as a string otherwise it's a probably an
      // integer based date
      // @ts-expect-error
      value = /\s/g.test(value) ? value : parseInt(value, 10);

      const valueAsDate = new Date(value);
      if (isValid(valueAsDate)) {
        $el.textContent = formatDate(
          valueAsDate,
          dateFormat,
          dateFnsFormatOptions
        );
        addClass($el, attr + "--init");
      }
    }
  });
}
