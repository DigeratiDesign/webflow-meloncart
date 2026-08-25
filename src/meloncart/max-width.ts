const SELECTOR = '[mc-max-width]';
const TYPED_ATTR_VALUE = 'attr(mc-max-width type(<length>))';

const applyFallback = () => {
  if (window.CSS?.supports('max-width', TYPED_ATTR_VALUE)) {
    return;
  }

  document.querySelectorAll<HTMLElement>(SELECTOR).forEach((element) => {
    const value = element.getAttribute('mc-max-width');

    if (value) {
      element.style.maxWidth = value;
    }
  });
};

/** Applies mc-max-width values where typed CSS attr() values are unsupported. */
export const initMCMaxWidth = () => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyFallback, { once: true });
    return;
  }

  applyFallback();
};
