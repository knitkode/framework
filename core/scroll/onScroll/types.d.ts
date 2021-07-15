declare namespace ScrollTrigger {
  type trigger = {
    add: (target: OnScroll.initialiserTarget, options: options) => trigger;
    element: HTMLElement;
    target: any;
  };

  type callback = (trigger?: trigger) => void;

  type options = {
    once?: boolean;
    offset?: {
      viewport?: {
        x?: number | ((frame: any, direction: any) => number);
        y?: number | ((frame: any, direction: any) => number);
      };
      element?: {
        x?: number | ((rect: any, direction: any) => number);
        y?: number | ((rect: any, direction: any) => number);
      };
    };
    toggle?: {
      class?: {
        in?: string | string[];
        out?: string | string[];
      };
      callback?: {
        in?: callback;
        visible?: callback;
        out?: callback;
      };
    };
  };
}

declare namespace OnScroll {
  type trigger = ScrollTrigger.trigger;

  type target = ScrollTrigger.target;

  type triggerCallback = ScrollTrigger.callback;

  type triggerOptions = ScrollTrigger.options;

  /** Simplified options interface for `ScrollTrigger` */
  type options = {
    onin?: (element: HTMLElement) => any;
    onout?: (element: HTMLElement) => any;
    onchange?: (element: HTMLElement) => any;
    once?: boolean;
  };

  type initialiserTarget = string | HTMLElement;

  type initaliserOptions = options["onin"] | (options & triggerOptions);

  type initaliser = (
    target: initialiserTarget,
    optionsOrOnin: initaliserOptions
  ) => { trigger: trigger; target: target };
}
