const fs = require("fs");
const nodePath = require("path");
const pkg = require("../package.json");
const latestVersion = require("latest-version");

const workspaces = pkg.workspaces.map((glob) => glob.replace(/\/\*/, ""));

const workspacesGlob = (append) =>
  nodePath.resolve(`{${workspaces.join(",")}}/${append}`);

/**
 * Get all framework's distributed packages, both npm and composer ones together
 * as composer's one have a respective dummy npm package, e.g.
 * https://www.npmjs.com/package/@knitkode/laravel-frontend
 *
 * @typedef {object} FrameworkPkg
 * @property {string} FrameworkPkg.name
 * @property {string} FrameworkPkg.version
 *
 * @typedef {object} FrameworkPkgMap
 * @property {string} FrameworkPkg
 *
 * @param {string[]} [includeOnly=[]]
 * @returns {Promise<FrameworkPkgMap>}
 */
async function getFrameworkPkgs(includeOnly = []) {
  let pkgs = getFrameworkNpmPkgs();
  const output = /** @type {FrameworkPkgMap} */ ({});
  let result = [];

  if (includeOnly.length) {
    pkgs = pkgs.filter((name) => includeOnly.includes(name));
  }

  for (let i = 0; i < pkgs.length; i++) {
    const name = pkgs[i];
    console.log(`Retrieving latest version of ${name}...`);

    const version = await latestVersion(name);
    output[name] = {
      name,
      version,
    };

    result.push(`${name}: ${version}`);
  }

  console.log(
    `\nFramework packages latest versions:\n\n${result.join("\n")}\n`
  );

  return Promise.resolve(output);
}

function getFrameworkNpmPkgs() {
  const names = Object.keys(pkg.dependencies);
  return names;
}

function getFrameworkComposerPkgs() {
  const glob = require("glob");
  const output = new Set([]);

  const paths = glob.sync(workspacesGlob("**/*/composer.json"), {
    ignore: [
      "/**/vendor/**/*",
      "/**/node_modules/**/*",
      "/**/laravel-template/**/*",
    ],
  });

  if (paths) {
    paths.forEach((path) => {
      const composer = require(path);
      output.add(composer.name);
    });
  }
  return Array.from(output);
}

/**
 * Get projects' meta info using the framework
 *
 * @returns {{ name: string; path: string; }[]}
 */
function getProjectsMeta() {
  let output = [];
  const vscodeWorkspacePath = nodePath.resolve("./framework.code-workspace");

  try {
    const content = fs.readFileSync(vscodeWorkspacePath, {
      encoding: "utf-8",
    });
    const json = JSON.parse(content);
    output = json.folders
      // exclude the framework folder itself
      .filter(({ path }) => path !== ".")
      // map to projects absolute paths
      .map(({ name, path }) => ({ name, path: nodePath.resolve(path) }));
  } catch (e) {
    console.error(`Failed to read VScode workspace at ${vscodeWorkspacePath}`);
  }

  return output;
}

function filterNpmDeps(projectDeps, frameworkDeps) {
  return Object.keys(projectDeps || [])
    .filter((n) => n.startsWith("@knitkode/"))
    .filter((n) => frameworkDeps.includes(n));
}

function filterComposerDeps(projectDeps = [], frameworkDeps = []) {
  return Object.keys(projectDeps)
    .filter((n) => n.startsWith("knitkode/"))
    .filter((n) => frameworkDeps.includes(n));
}

function getProjectsInfo() {
  const meta = getProjectsMeta();
  const npmPkgs = getFrameworkNpmPkgs();
  const composerPkgs = getFrameworkComposerPkgs();

  console.log(
    `Found ${npmPkgs.length} npm managed packages inside the framework.`
  );
  console.log(
    `Found ${composerPkgs.length} composer managed packages inside the framework.\n`
  );

  return meta.map(({ name, path }) => {
    const packageJsonPath = nodePath.join(path, "package.json");
    const composerJsonPath = nodePath.join(path, "composer.json");
    const packageJson = require(packageJsonPath);
    const composerJson = require(composerJsonPath);
    const npm = filterNpmDeps(packageJson["dependencies"], npmPkgs);
    const npmDev = filterNpmDeps(packageJson["devDependencies"], npmPkgs);
    const composer = filterComposerDeps(composerJson["require"], composerPkgs);
    const composerDev = filterComposerDeps(
      composerJson["require-dev"],
      composerPkgs
    );

    return {
      name: name,
      paths: {
        npm: packageJsonPath,
        composer: composerJsonPath,
      },
      deps: {
        npm,
        npmDev,
        composer,
        composerDev,
      },
    };
  });
}

function getProjects() {
  const info = getProjectsInfo();
  const allDeps = new Set([]);

  for (let i = 0; i < info.length; i++) {
    const { name, deps } = info[i];

    console.log(
      `\n${name} found deps:\n${deps.npm
        .concat(deps.npmDev, deps.composer, deps.composerDev)
        .map((name) => `  ${name}`)
        .join("\n")}\n`
    );

    deps.npm.forEach((name) => allDeps.add(name));
    deps.npmDev.forEach((name) => allDeps.add(name));
    deps.composer.forEach((name) => allDeps.add(`@${name}`));
    deps.composerDev.forEach((name) => allDeps.add(`@${name}`));
  }
  // console.log(info);

  return {
    info,
    allDeps: Array.from(allDeps),
  };
}

module.exports = {
  workspaces,
  workspacesGlob,
  getFrameworkPkgs,
  getProjectsMeta,
  getProjectsInfo,
  getProjects,
};
