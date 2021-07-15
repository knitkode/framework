# KnitKode Framework

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/1dfb471aa62649a29ffd71d1f386e7fe)](https://www.codacy.com/gl/knitkode/framework/dashboard?utm_source=gitlab.com&utm_medium=referral&utm_content=knitkode/framework&utm_campaign=Badge_Grade)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/) [![pipelines](https://github.com/knitkode/framework/badges/master/pipeline.svg)](https://github.com/knitkode/framework/-/pipelines)

Monorepo for the whole KnitKode framework, offical documentation at [knitkode.github.io/framework](https://knitkode.github.io/framework)

## Contribute

Clone this repo locally and install dependencies running

```bash
npm i
```

Link all packages with:

```bash
npm run link
```

Now in your test project bootstrapped with `@knitkode/create-laravel-app` you can run `npm run link` to use the globally symlinked packages from your machine.

### Publish packages

First commit and push your local work. Then, never manually bump package versions, just run form the terminal:

```bash
npm run publish
```

It uses `lerna` under the hood, the follow its interactive tool to semver each modified package.

### Inner dependencies

Packages in monorepos can depend on each other internally, use [lerna](https://github.com/lerna/lerna) for this.
If unsure on how to define the right version use the [`semver calculator online tool`](https://semver.npmjs.com/).

### Manage dependent projects

This repository contain a `.code-workspace` file for [VS code](https://code.visualstudio.com/docs/editor/workspaces) and a `.mu_repo` file for [mu-repo](https://fabioz.github.io/mu-repo/) to conveninetly upgrade projects dependent on this framework.

### Dev notes

- About managing polyglot monorepo (with both npm packages and composer packages) see this [test monorepo](https://github.com/newism/lerna) and its [consumer](https://github.com/newism/lerna-sub)
