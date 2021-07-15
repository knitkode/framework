import { $, $$, forEach, on, setDataAttr } from "@knitkode/core-dom";

forEach($$(".file"), ($root) => {
  const $input = /** @type {HTMLInputElement} */ ($(".formControl", $root));
  const $fileName = $(".fileName", $root);

  on($input, "change", () => {
    if ($input.files.length) {
      const file = $input.files[0];
      $fileName.textContent = file.name;

      // it creates two input attributes data values from the same file
      // selection, one is the file content encoded as data url, the other is
      // the filename, its key will be the same with a `_name` suffix.
      // FIXME: is this fillform specific? Probably it should not be here
      const reader = new FileReader();
      reader.onload = () => {
        setDataAttr($input, "filecontent", reader.result);
        setDataAttr($input, "filename", file.name);
      };
      reader.readAsDataURL(file);
    }
  });
});
