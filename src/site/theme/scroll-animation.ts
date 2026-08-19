/* eslint-disable no-console */
import {
  getScrollTriggerDebug,
  gsap,
  onScrollTriggerDebugChange,
  ScrollTrigger,
} from '../../mc/core/gsap';
import type { ColorThemeValues } from '../../mc/core/types';

let currentTriggers: ScrollTrigger[] = [];
let initialized = false;

const applyThemeValues = (targets: NodeListOf<Element>, themeValues: ColorThemeValues): void => {
  gsap.to(targets, {
    ...themeValues,
    duration: 0.5,
    ease: 'power1.out',
    overwrite: 'auto',
    onStart() {
      console.log('[MC Theme] GSAP started');
    },
    onComplete() {
      console.log('[MC Theme] GSAP completed');
    },
  });
};

const handleColorThemesReady = (): void => {
  console.log('[MC Theme] colorThemesReady received');

  currentTriggers.forEach((trigger) => trigger.kill());
  currentTriggers = [];

  if (!window.colorThemes) {
    console.warn('[MC Theme] colorThemes API not ready');
    return;
  }

  const targets = document.querySelectorAll('[mc-theme="target"]');

  console.log('[MC Theme] Targets found:', targets.length, targets);

  if (!targets.length) {
    console.warn('[MC Theme] No [mc-theme="target"] elements found');

    return;
  }

  const triggers = document.querySelectorAll('[data-animate-theme-to]');

  console.log('[MC Theme] Triggers found:', triggers.length, triggers);

  triggers.forEach((trigger, index) => {
    const feature = trigger.getAttribute('data-animate-theme-to') || '';
    const cta = trigger.getAttribute('data-animate-cta-to') || '';
    const icon = trigger.getAttribute('data-animate-icon-to') || '';
    const values = window.colorThemes.getTheme(feature, cta, icon);

    console.log(`[MC Theme] Trigger ${index + 1}`, {
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
        console.log(`[MC Theme] Trigger ${index + 1} toggle`, {
          isActive,
          feature,
          cta,
          icon,
        });

        if (!isActive) {
          return;
        }

        const themeValues = window.colorThemes.getTheme(feature, cta, icon);

        console.log('[MC Theme] Applying:', themeValues);

        if (!Object.keys(themeValues).length) {
          console.warn('[MC Theme] Theme resolved to an empty object');

          return;
        }

        applyThemeValues(targets, themeValues);
      },
    });

    currentTriggers.push(scrollTrigger);

    console.log(`[MC Theme] ScrollTrigger ${index + 1} created`);
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
