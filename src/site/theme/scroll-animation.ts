/* eslint-disable no-console */
import type { ColorThemeValues } from '../../mc/core/types';

type GSAPLike = {
  registerPlugin: (plugin: unknown) => void;
  to: (targets: NodeListOf<Element>, vars: Record<string, unknown>) => void;
};

type ScrollTriggerLike = {
  create: (config: {
    trigger: Element;
    start: string;
    end: string;
    onToggle: (state: { isActive: boolean }) => void;
  }) => void;
};

declare const gsap: GSAPLike | undefined;
declare const ScrollTrigger: ScrollTriggerLike | undefined;

const applyThemeValues = (targets: NodeListOf<Element>, themeValues: ColorThemeValues): void => {
  gsap?.to(targets, {
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

  if (typeof gsap === 'undefined') {
    console.error('[MC Theme] GSAP not loaded');

    return;
  }

  if (typeof ScrollTrigger === 'undefined') {
    console.error('[MC Theme] ScrollTrigger not loaded');

    return;
  }

  gsap.registerPlugin(ScrollTrigger);

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

    ScrollTrigger.create({
      trigger,
      start: 'top center',
      end: 'bottom center',
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

    console.log(`[MC Theme] ScrollTrigger ${index + 1} created`);
  });
};

export const initThemeScrollAnimation = (): void => {
  document.addEventListener('colorThemesReady', handleColorThemesReady);
};
