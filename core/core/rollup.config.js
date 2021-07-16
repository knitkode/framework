import scss from "rollup-plugin-scss";
// import typescript from "@rollup/plugin-typescript";
import ignoreImport from "rollup-plugin-ignore-import";
import resolve from "@rollup/plugin-node-resolve";
import sucrase from "@rollup/plugin-sucrase";
// import commonjs from '@rollup/plugin-commonjs';
import { terser } from "rollup-plugin-terser";

import { existsSync, readdirSync } from "fs";
import path from "path";

const getDirectories = (source) =>
  readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

const configs = [];

getDirectories(path.resolve(path.join(__dirname, "../")))
  // blacklist some packages that break rollup
  .filter((name) => !["player"].includes(name))
  .forEach((dir) => {
    const entry = path.resolve(path.join(__dirname, "../", dir, "index.ts"));

    if (!existsSync(entry)) {
      return;
    }

    configs.push({
      input: entry,
      output: {
        file: "index.js",
        // dir: "./core/core",
        format: "es",
      },
      // external: ["@knitkode/core-helpers"],
      plugins: [
        // nodeResolve(),
        // scss(),
        resolve({
          extensions: [".js", ".ts"],
        }),
        // commonjs(),
        ignoreImport({
          extensions: [".scss", ".css"],
          include: ["**/*.scss", "**/*.css"],
          body: "export default undefined;",
        }),
        sucrase({
          // exclude: ["node_modules/**"],
          exclude: ["*.scss", "*.css"],
          transforms: ["typescript"],
        }),
        // typescript({
        //   tslib: require.resolve("tslib"),
        // }),
        terser(),
      ],
    });
  });

export default configs;
