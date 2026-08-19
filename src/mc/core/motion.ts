import type { MCNamespace, MotionMode } from './types';

const MEDIA_QUERY = '(prefers-reduced-motion: reduce)';
const ROOT_ATTRIBUTE = 'data-mc-reduced-motion';
const NATIVE_SELECTOR = '[mc-native-webflow-motion]';
const STYLE_ID = 'mc-native-webflow-motion-style';
const VALID_MODES = ['system', 'reduce', 'full'] as const;

type MCMotionChangeDetail = {
  mode: MotionMode;
  reduced: boolean;
  systemReduced: boolean;
};

const ensureMC = (): MCNamespace => {
  window.MC ||= {};

  return window.MC;
};

const installNativeMotionCSS = () => {
  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
      html[${ROOT_ATTRIBUTE}="true"]
      ${NATIVE_SELECTOR} {
        opacity: 1 !important;
        transform: none !important;
        transition: none !important;
        animation: none !important;
        will-change: auto !important;
      }

      html[${ROOT_ATTRIBUTE}="true"]
      ${NATIVE_SELECTOR}::before,
      html[${ROOT_ATTRIBUTE}="true"]
      ${NATIVE_SELECTOR}::after {
        transition: none !important;
        animation: none !important;
      }
    `;

  document.head.appendChild(style);
};

const systemReduced = () => !!window.matchMedia?.(MEDIA_QUERY).matches;

const resolvedReduced = (mode: MotionMode) => {
  if (mode === 'reduce') {
    return true;
  }

  if (mode === 'full') {
    return false;
  }

  return systemReduced();
};

const applyState = () => {
  const { motion } = ensureMC();
  const reduced = motion?.reduced ?? systemReduced();

  document.documentElement.setAttribute(ROOT_ATTRIBUTE, reduced ? 'true' : 'false');

  return reduced;
};

const dispatchChange = () => {
  const { motion } = ensureMC();

  if (!motion) {
    return;
  }

  const detail: MCMotionChangeDetail = {
    mode: motion.mode,
    reduced: motion.reduced,
    systemReduced: motion.systemReduced,
  };

  window.dispatchEvent(
    new CustomEvent<MCMotionChangeDetail>('mcMotionPreferenceChange', { detail })
  );
};

const isMotionMode = (value: unknown): value is MotionMode =>
  typeof value === 'string' && VALID_MODES.includes(value as MotionMode);

export const initMCMotion = () => {
  const mc = ensureMC();
  const existingMode = mc.motion?.mode;

  mc.motion = {
    mode: isMotionMode(existingMode) ? existingMode : 'system',

    get systemReduced() {
      return systemReduced();
    },

    get reduced() {
      return resolvedReduced(this.mode);
    },

    setMode(mode) {
      if (!isMotionMode(mode)) {
        return;
      }

      if (this.mode === mode) {
        applyState();
        dispatchChange();

        return;
      }

      this.mode = mode;

      applyState();
      dispatchChange();
    },

    refresh() {
      applyState();
      dispatchChange();
    },
  };

  installNativeMotionCSS();
  applyState();

  const media = window.matchMedia?.(MEDIA_QUERY);

  if (media) {
    const onSystemChange = () => {
      if (ensureMC().motion?.mode !== 'system') {
        return;
      }

      applyState();
      dispatchChange();
    };

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', onSystemChange);
    } else if (typeof media.addListener === 'function') {
      media.addListener(onSystemChange);
    }
  }

  // eslint-disable-next-line no-console
  console.log('[MC Motion] Ready', {
    mode: ensureMC().motion?.mode,
    reduced: ensureMC().motion?.reduced,
    nativeTargets: document.querySelectorAll(NATIVE_SELECTOR).length,
  });
};
