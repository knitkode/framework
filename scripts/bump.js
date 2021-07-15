const editJsonFile = require("edit-json-file");
const { getProjects, getFrameworkPkgs } = require("./helpers");

function updateEachDep(deps, jsonKeyPrefix, editor, store, results) {
  for (let i = 0; i < deps.length; i++) {
    const depName = deps[i];

    const jsonKey = `${jsonKeyPrefix}.${depName}`;
    const semverCurrent = editor.get(jsonKey);
    const latestVersion = store[`@${depName.replace("@", "")}`].version;
    let semverPrefx = "^";

    // alpha and beta are better be unprefixed
    if (latestVersion.includes("alpha") || latestVersion.includes("beta")) {
      semverPrefx = "";
    }

    // we add the `@` because of the aforementioned convention whereas each
    // composer package has a respective npm package, their name differs only
    // for the initial scope that with composer does not use the `@` char
    const semverLatest = `${semverPrefx}${latestVersion}`;

    editor.set(jsonKey, semverLatest);

    if (semverCurrent !== semverLatest) results.push(depName);
  }
}

async function bumpToLatest() {
  const projects = getProjects();
  const pkgs = await getFrameworkPkgs(projects.allDeps);
  const editorOptions = {
    stringify_eol: true,
  };
  const result = {};

  projects.info.forEach(({ name, paths, deps }) => {
    result[name] = {
      npm: [],
      composer: [],
    };

    if (deps.npm.length || deps.npmDev.length) {
      const editor = editJsonFile(paths.npm, editorOptions);
      updateEachDep(deps.npm, "dependencies", editor, pkgs, result[name].npm);
      updateEachDep(
        deps.npmDev,
        "devDependencies",
        editor,
        pkgs,
        result[name].npm
      );
      editor.save();
    }

    if (deps.composer.length || deps.composerDev.length) {
      const editor = editJsonFile(paths.composer, editorOptions);
      updateEachDep(
        deps.composer,
        "require",
        editor,
        pkgs,
        result[name].composer
      );
      updateEachDep(
        deps.composerDev,
        "require-dev",
        editor,
        pkgs,
        result[name].composer
      );
      editor.save();
    }
  });

  let summary = "";

  for (const projectName in result) {
    const info = result[projectName];
    const projectUpdatedPkgs = info.npm
      .concat(info.composer)
      .map((name) => `    ${name}`);
    summary += `\n• ${projectName}: updated ${info.npm.length} npm and ${info.composer.length} composer pkgs:\n`;
    if (projectUpdatedPkgs) {
      summary += `${projectUpdatedPkgs.join("\n")}\n`;
    } else {
      summary += `--`;
    }
  }

  console.log(summary);
}

bumpToLatest();
