const fs = require("fs");
const glob = require("glob");

glob("{components,core,use,workflow}/**/*.json", {}, function (er, files) {
  let valid = [];
  let invalid = [];

  console.log(`${files.length} to check.`);

  files.forEach((filepath, index) => {
    fs.readFile(filepath, { encoding: "utf-8" }, (err, data) => {
      if (err) {
        console.error(`Failed reading ${filepath}`, err);
      } else {
        try {
          JSON.parse(data);
          valid.push(filepath);
        } catch (e) {
          console.error(`Failed parsing ${filepath}`);
          invalid.push(filepath);
        }
      }

      if (index === files.length - 1) {
        console.log(
          `${valid.length} valid, ${invalid.length} invalid out of ${files.length} JSON files.`
        );
      }
    });
  });
});
