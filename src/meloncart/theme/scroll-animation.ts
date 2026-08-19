import {
  getScrollTriggerDebug,
  gsap,
  onScrollTriggerDebugChange,
  ScrollTrigger,
} from '../../digerati/core/gsap';
import { createLogger } from '../../digerati/core/logger';
import type { ColorThemeValues } from '../../digerati/core/types';

let currentTriggers: ScrollTrigger[] = [];
let initialized = false;
const DEBUG = false;
const themeLogger = createLogger('digerati', 'theme', {
  debug: () => DEBUG,
});
const gsapLogger = createLogger('digerati', 'gsap', {
  debug: () => DEBUG,
});

const applyThemeValues = (targets: NodeListOf<Element>, themeValues: ColorThemeValues): void => {
  gsap.to(targets, {
    ...themeValues,
    duration: 0.5,
    ease: 'power1.out',
    overwrite: 'auto',
    onStart() {
      gsapLogger.debug('started');
    },
    onComplete() {
      gsapLogger.debug('completed');
    },
  });
};

const handleColorThemesReady = (): void => {
  themeLogger.debug('colorThemesReady received');

  currentTriggers.forEach((trigger) => trigger.kill());
  currentTriggers = [];

  if (!window.colorThemes) {
    themeLogger.warn('colorThemes API not ready');
    return;
  }

  const targets = document.querySelectorAll('[mc-theme="target"]');

  themeLogger.debug('Targets found:', targets.length, targets);

  if (!targets.length) {
    themeLogger.warn('No [mc-theme="target"] elements found');

    return;
  }

  const triggers = document.querySelectorAll('[data-animate-theme-to]');

  themeLogger.debug('Triggers found:', triggers.length, triggers);

  triggers.forEach((trigger, index) => {
    const feature = trigger.getAttribute('data-animate-theme-to') || '';
    const cta = trigger.getAttribute('data-animate-cta-to') || '';
    const icon = trigger.getAttribute('data-animate-icon-to') || '';
    const values = window.colorThemes.getTheme(feature, cta, icon);

    themeLogger.debug(`Trigger ${index + 1}`, {
      trigger,
      feature,
      cta,
      icon,
      values,
    });

    const scrollTrigger = ScrollTrigger.create({
      trigger,
      start: 'top center',
      end: 'bottom center',
      markers: getScrollTriggerDebug(),
      onToggle({ isActive }) {
        themeLogger.debug(`Trigger ${index + 1} toggle`, {
          isActive,
          feature,
          cta,
          icon,
        });

        if (!isActive) {
          return;
        }

        const themeValues = window.colorThemes.getTheme(feature, cta, icon);

        gsapLogger.debug('Applying:', themeValues);

        if (!Object.keys(themeValues).length) {
          themeLogger.warn('Theme resolved to an empty object');

          return;
        }

        applyThemeValues(targets, themeValues);
      },
    });

    currentTriggers.push(scrollTrigger);

    themeLogger.debug(`ScrollTrigger ${index + 1} created`);
  });
};

export const initThemeScrollAnimation = (): void => {
  if (initialized) {
    return;
  }

  initialized = true;
  document.addEventListener('colorThemesReady', handleColorThemesReady);
  onScrollTriggerDebugChange(() => {
    handleColorThemesReady();
  });
};
