import styles from "./index.scss";

let sassGridGutter = 0;
let sassBreakpoints = {};
let sassContainers = {};
let sassVariables = {};

for (const fullKey in styles) {
  const splittedBreakpoints = fullKey.split("breakpoint");
  const splittedContainers = fullKey.split("container");

  if (fullKey === "gridGutter") {
    sassGridGutter = parseFloat(styles[fullKey]);
  } else if (splittedBreakpoints.length === 2) {
    sassBreakpoints[splittedBreakpoints[1]] = parseFloat(styles[fullKey]);
  } else if (splittedContainers.length === 2) {
    sassContainers[splittedContainers[1]] = parseFloat(styles[fullKey]);
  } else {
    sassVariables[fullKey] = parseFloat(styles[fullKey]);
  }
}

export const theme = sassVariables;

/**
 * @type {import("./index").knitkode.core.scss.gridGutter}
 */
export const gridGutter = sassGridGutter;

/**
 * @type {import("./index").knitkode.core.scss.breakpoints}
 */
export const breakpoints = sassBreakpoints;

/**
 * @type {import("./index").knitkode.core.scss.containers}
 */
export const containers = sassContainers;
