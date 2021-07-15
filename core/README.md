# Core

![npm (scoped)](https://img.shields.io/npm/v/@knitkode/core?style=flat-square&color=EA2C65)

> For all the documentation refer to the [Knitkode Framework Docs](https://knitkode.github.io/framework/)

## Development

- About tree shacking, `sideEffects` and unused modules see webpack's [side-effects](https://github.com/webpack/webpack/tree/master/examples/side-effects), [harmony-unused](https://github.com/webpack/webpack/tree/master/examples/harmony-unused) and see this [issue with css imports](https://github.com/webpack/webpack/issues/6741)
- About GreenShock premium plugin being on npm, see [this thread](https://greensock.com/forums/topic/20166-using-club-greensock-perks-in-open-source-projects/)
- We might use [SimpleStateManager](http://www.simplestatemanager.com/index.html) to use media queries in javascript, populating its states with the exported sass variables.
- Parallax scrolling well done with CSS variables [basicScroll](https://github.com/electerious/basicScroll) or [Rellax](https://dixonandmoe.com/rellax/)
- For masonry like grid [infiniteGrid](https://naver.github.io/egjs-infinitegrid/#home) seems ok.
- For simple SSR components abstraction see [gia](https://github.com/giantcz/gia)
- For SPA like behaviour try [Stimulus](https://github.com/stimulusjs/stimulus) with [Turbolinks](https://github.com/turbolinks/turbolinks)

### TODO

- Aggiungere descrizione del modulo visibile quando fai hover sull import in vscode: `/// <reference path='./index.d.ts' />`
- use new `isType` functions where appropriate
- Maybe use https://www.npmjs.com/package/throttle-debounce instead of lodash ones
- Incorporate autocomplete in library as abstraction

#### Typescript migration

- Change `player` to named export `Player`:

```js
import { Player } from "@knitkode/core-player";
```

in `techlab/src/components/Slider/index.js`
in `acusa-pronetwork/src/components/DialogVideo/index.js`
