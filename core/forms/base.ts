import ajax from "@knitkode/core-ajax";
import ajaxLaravel from "@knitkode/core-ajax/laravel";
import { $, addClass, removeClass, getDataAttr } from "@knitkode/core-dom";
import Validation, { ValidationError, ValidationOptions } from "./validation";
import { getPostData, getFormData } from "./helpers";
// import scrollTo from "@knitkode/core-scroll/scrollTo";
import "@knitkode/core-progress/loading.scss";

type FormsBaseInstance = {
  $root: HTMLElement;
  $form: HTMLFormElement;
  $submit: HTMLButtonElement;
  destroy: () => any;
};

export type FormsBaseOptions = {
  /** If undefined the `<form action="...">` value will be used appending a `/ajax` suffix to the URL */
  endpoint?: string;
  /** The full URL to send the form to */
  url?: string;
  /** Called at an invalid submission attempt */
  invalid?: (errors: ValidationError[], instance: FormsBaseInstance) => void;
  /** Called at an invalid submission attempt */
  valid?: (instance: FormsBaseInstance) => void;
  /** Called just before a valid submission attempt */
  before?: (instance: FormsBaseInstance) => void;
  /** Called just after a succesfull server response */
  succeded?: (instance: FormsBaseInstance) => void;
  /** Called just after a failed server response */
  failed?: (instance: FormsBaseInstance) => void;
  /** Called on successful submitted data, it passes along the sent data, useful for analytics tracking */
  sent?: (formData: Object) => void;
};

/**
 * Core: FormsBase
 *
 * @param {HTMLElement} $form The root DOM Element that contains the `<form>`
 * @param {string} $string The `<form>` selector
 */
export default function FormsBase(
  $root: HTMLElement,
  selector: string = "form",
  options: FormsBaseOptions = {}
) {
  const $form = $(selector, $root) as HTMLFormElement;
  if (!$form) {
    if (__DEV__) {
      console.warn(
        `[@knitkode/core-forms/base] Initialised FormBase with a not existing DOM element '${selector}'`
      );
    }
    return;
  }
  $root = $root || $form;
  const $submit = $("[type='submit']", $form) as HTMLButtonElement;
  const instance = {
    $form,
    destroy,
  };
  const hasAjaxSubmit =
    !!getDataAttr($form, "ajax-submit") || !!options.endpoint || !!options.url;

  // init form validation
  const validationOptions = {
    onerror: handleInvalidSubmit,
  } as ValidationOptions;
  if (hasAjaxSubmit) validationOptions.onsuccess = handleValidSubmit;

  const validation = Validation($form, validationOptions);

  /**
   * Handle invalid submission attempt (before sending to server)
   *
   * Default behaviour might be to scroll to first element with error
   */
  function handleInvalidSubmit(errors: ValidationError[]) {
    callHookSafely("invalid", errors);
    // const firstEl = errors[0].element;

    // scrollTo(firstEl, {
    //   offset: 100,
    //   onstop: () => firstEl.focus(),
    // });
  }

  /**
   * Handle valid submit
   */
  function handleValidSubmit() {
    onSubmitStart();
    const formData = getFormData($form);
    callHookSafely("valid", formData);

    const { endpoint, url } = options;
    const requestUrl = url || endpoint || $form.action + "ajax/";
    const requestOptions = {
      method: "POST",
      data: getPostData(formData),
    } as const;
    const request = url
      ? ajax(requestUrl, requestOptions)
      : ajaxLaravel(requestUrl, requestOptions);

    request
      .then((response) => {
        onSubmitEnd();
        callHookSafely("succeded", formData, response);
        if (__DEV__) console.log("success", response);
      })
      .catch((response) => {
        onSubmitEnd();
        callHookSafely("failed", formData, response);
        if (__DEV__) console.log("error", response);
      });

    return request;
  }

  /**
   * Call hook safely (if defined)
   *
   * @param {keyof Forms.Base.options} hookName
   * @param {any} specificData
   * @param {object} [response={}]
   */
  function callHookSafely(hookName, specificData, response = {}) {
    // @ts-ignore
    if (options[hookName]) options[hookName](specificData, instance, response);
  }

  /**
   * On submit start default behaviour
   */
  function onSubmitStart() {
    $submit.disabled = true;
    addClass($root, "is-loading");
  }

  /**
   * On submit end default behaviour
   */
  function onSubmitEnd() {
    $submit.disabled = false;
    removeClass($root, "is-loading");
  }

  function destroy() {
    validation.destroy();
  }
}
