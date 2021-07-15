declare namespace Dialog {
  type rooter = string | HTMLElement | skeletonCreator;

  type initialiser = (
    /** The DOM selector to run the dialog upon, defaults to ".dialog" */
    rooter: rooter,
    options?: options,
    hooks?: hooks
  ) => instance;

  type initialiserAsync = (options?: options, hooks?: hooks) => instance;

  type skeletonCreator = () => {
    $root: HTMLElement;
    $backdrop: HTMLElement;
    $cage: HTMLElement;
    $wrap: HTMLElement;
    $content: HTMLElement;
    $centerer?: HTMLElement;
    $loader?: HTMLElement;
  };

  type options = {
    /** Identifier to recycle the DOM on close/open, setting this to a string will not destroy the Dialog DOM on close and reuse it on next open */
    id?: string;
    /** Template string with/without HTML to render in the dialog content */
    tpl?: string;
    /** Optional class name/s to add to the root dialog element */
    rootClass?: string;
    /** Transition duration in "ms", by default is set to `300`ms */
    transition?: number;
    /** Fill gaps targets array, an iterable list of element to fill gaps of when locking scroll on dialog open */
    gaps?: HTMLElement[] | NodeList;
  };

  type instance = {
    /** Optional dialog id */
    id?: string;
    /** Dialog root element */
    $root: HTMLElement;
    /** Dialog cage, useful reference because scrollLock acts on this element */
    $cage: HTMLElement;
    /** Dialog wrap, useful reference for custom animations on open/close */
    $wrap: HTMLElement;
    /** Dialog content, useful reference for dynamically rendered dialogs */
    $content: HTMLElement;
    /** Flags whether the diloag is currently opened or not */
    opened: boolean;
    /** Open dialog programmatically, `customData` will be passed to `opening` and `closed` opened */
    open: () => void;
    /** Close dialog programmatically, `customData` will be passed to `closing` and `closed` hooks */
    close: (event: Event, customData: any) => void;
    /** Destroy the dialog, unbind its listeners */
    destroy: () => void;
    /** Renders a HTML string inside the dialog `$content` element */
    render: (content: string) => void;
    /** Add loading status (`is-loading` class on `$root` element) */
    load: () => void;
    /** Remove loading status (`is-loading` class on `$root` element) */
    loaded: () => void;
  };

  interface Hooks<instance> {
    /** Called just after the dialog template has been appended to the DOM (if not already there) and listeners are binded */
    mounted?: (instance: instance) => void;
    /** Called just after the dialog dynamic template (if any) has rendered */
    rendered?: (instance: instance) => void;
    /** Called just before the dialog is closing */
    closing?: (instance: instance, customData: any) => void;
    /** Called just after the dialog has closed */
    closed?: (instance: instance, customData: any) => void;
    /** Called just before the dialog is opening */
    opening?: (instance: instance, customData: any) => void;
    /** Called just after the dialog has opened */
    opened?: (instance: instance, customData: any) => void;
  }

  type hooks = Hooks<instance>;
}
