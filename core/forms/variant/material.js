import { $$, forEach, on, off } from "@knitkode/core-dom";
import { setEmptyStatus } from "../helpers";

export default function FormsVariantMaterial(rootSelector) {
  const $controls = $$(`${rootSelector} .formControl`);

  forEach($controls, ($input) => {
    on($input, "blur", setEmptyStatus);

    // on load for prefilled values
    // use a timeout for prefilled values in session restored by the browser on
    // page back navigation
    setTimeout(() => setEmptyStatus.call($input), 10);
  });

  return {
    destroy() {
      forEach($controls, ($input) => {
        off($input, "blur", setEmptyStatus);
      });
    },
  };
}
