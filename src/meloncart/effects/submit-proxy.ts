import { createLogger, isMCDebugEnabled } from '../../digerati/core/logger';

const SELECTOR = '[mc-submit-proxy]';
const logger = createLogger('melon', 'submit-proxy', { debug: isMCDebugEnabled });

declare global {
  interface HTMLElement {
    __mcSubmitProxy?: MCSubmitProxy;
  }
}

class MCSubmitProxy {
  source: HTMLButtonElement;
  form: HTMLFormElement;
  target: HTMLInputElement;
  observer?: MutationObserver;

  constructor(source: HTMLButtonElement, form: HTMLFormElement, target: HTMLInputElement) {
    this.source = source;
    this.form = form;
    this.target = target;
  }

  private hideNativeSubmit() {
    this.target.style.opacity = '0';
    this.target.style.pointerEvents = 'none';
  }

  private syncDisabledState() {
    const { disabled } = this.target;
    this.source.disabled = disabled;

    if (disabled) {
      this.source.setAttribute('aria-disabled', 'true');
      return;
    }

    this.source.removeAttribute('aria-disabled');
  }

  private handleClick = (event: MouseEvent) => {
    event.preventDefault();

    if (this.target.disabled) {
      return;
    }

    // Preserve native validation, Webflow handling, and submit-event behavior.
    this.target.click();
  };

  init() {
    // Prevent the custom button from submitting independently.
    this.source.type = 'button';
    this.hideNativeSubmit();
    this.syncDisabledState();
    this.source.addEventListener('click', this.handleClick);

    // Webflow may update the native input's disabled attribute during submission.
    this.observer = new MutationObserver(() => this.syncDisabledState());
    this.observer.observe(this.target, {
      attributes: true,
      attributeFilter: ['disabled'],
    });
  }
}

export const initMCSubmitProxy = () => {
  const initialise = () => {
    const sources = [...document.querySelectorAll<HTMLElement>(SELECTOR)];
    let initialised = 0;

    sources.forEach((element) => {
      if (element.__mcSubmitProxy) {
        return;
      }

      if (!(element instanceof HTMLButtonElement)) {
        logger.warn('mc-submit-proxy must be applied to a <button> element.', element);
        return;
      }

      const form = element.closest('form');

      if (!form) {
        logger.warn('mc-submit-proxy button is not inside a form.', element);
        return;
      }

      const target = form.querySelector<HTMLInputElement>('input[type="submit"]');

      if (!target) {
        logger.warn('No Webflow input[type="submit"] found in the same form.', form);
        return;
      }

      const instance = new MCSubmitProxy(element, form, target);
      element.__mcSubmitProxy = instance;
      instance.init();
      initialised += 1;
    });

    logger.info(`Initialised ${initialised} submit proxy button(s).`);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
    return;
  }

  initialise();
};
