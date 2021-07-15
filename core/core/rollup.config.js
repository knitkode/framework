import scss from "rollup-plugin-scss";
// import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import sucrase from "@rollup/plugin-sucrase";
import { terser } from "rollup-plugin-terser";

export default {
  input: "index.ts",
  output: {
    // file: 'bundle.js',
    dir: "dist",
    format: "cjs",
  },
  external: ["lodash.debounce", "lodash.throttle"],
  plugins: [
    // nodeResolve(),
    scss(),
    resolve({
      extensions: [".js", ".ts"],
    }),
    sucrase({
      exclude: ["node_modules/**"],
      transforms: ["typescript"],
    }),
    // typescript({
    //   tslib: require.resolve("tslib"),
    // }),
    terser(),
  ],
};
