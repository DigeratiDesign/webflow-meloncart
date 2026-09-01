const SELECTOR = '[mc-gradient]';
const TYPED_ATTR_VALUE = 'attr(mc-gradient type(<color>))';
const COLOUR_PROPERTY = '--mc-gradient-colour';
const TYPED_ATTR_PATTERN = /attr\(\s*mc-gradient\s+type\(\s*<color>\s*\)\s*\)/gi;

const replaceTypedAttribute = (value: string) =>
  value.replace(TYPED_ATTR_PATTERN, `var(${COLOUR_PROPERTY})`);

const replaceInStyleElements = () => {
  document.querySelectorAll<HTMLStyleElement>('style').forEach((styleElement) => {
    const source = styleElement.textContent;

    if (source && TYPED_ATTR_PATTERN.test(source)) {
      styleElement.textContent = replaceTypedAttribute(source);
    }

    TYPED_ATTR_PATTERN.lastIndex = 0;
  });
};

const applyFallback = () => {
  if (
    window.CSS?.supports(
      'background-image',
      `linear-gradient(0deg, ${TYPED_ATTR_VALUE}, transparent)`
    )
  ) {
    return;
  }

  document.querySelectorAll<HTMLElement>(SELECTOR).forEach((element) => {
    const value = element.getAttribute('mc-gradient');

    if (value) element.style.setProperty(COLOUR_PROPERTY, value);
  });

  replaceInStyleElements();
};

/** Replaces typed mc-gradient attributes while preserving the authored CSS cascade. */
export const initMCGradient = () => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyFallback, { once: true });
    return;
  }

  applyFallback();
};
