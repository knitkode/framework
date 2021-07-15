// Type definitions for @knitkode/core
// Project: @knitkode/core
// Definitions by: KnitKode <knitkode@gmail.com> (https://knitkode.github.io)

declare interface Window {
  /** Data exposed from the server through `<x-data />` */
  __DATA: { string: any };

  /** Google tag manager `dataLayer` is nearly always injected in production websites. */
  dataLayer: any[];
  /** Google tag manager `object`, . */
  google_tag_manager?: any;
}

declare var __DEV__: boolean;
