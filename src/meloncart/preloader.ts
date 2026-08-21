import { gsap } from '../digerati/core/gsap';
import { createLogger, isMCDebugEnabled } from '../digerati/core/logger';
import type { MCNamespace } from '../digerati/core/types';

const SELECTOR = '[mc-preloader]';
const HERO_SELECTOR = '[mc-hero-sequence]';
const ROOT_ATTRIBUTE = 'data-mc-preloader-active';
const FALLBACK_TIMEOUT = 1800;
const MINIMUM_DISPLAY_TIME = 500;
const logger = createLogger('melon', 'preloader', { debug: isMCDebugEnabled });

type MCPreloaderAPI = {
  readonly active: boolean;
  heroReady: (play?: () => void) => void;
};

type MCPreloaderNamespace = MCNamespace & {
  preloader?: MCPreloaderAPI;
};

const ensureMC = (): MCPreloaderNamespace => {
  window.MC ||= {};
  return window.MC as MCPreloaderNamespace;
};

class MCPreloader implements MCPreloaderAPI {
  element: HTMLElement;
  dismissed = false;
  dismissing = false;
  heroPlayback: (() => void) | null = null;
  fallbackTimer: number | null = null;
  startedAt = 0;

  constructor(element: HTMLElement) {
    this.element = element;
  }

  get active() {
    return !this.dismissed;
  }

  init() {
    this.startedAt = performance.now();
    document.documentElement.setAttribute(ROOT_ATTRIBUTE, 'true');
    this.element.removeAttribute('aria-hidden');
    this.element.setAttribute('aria-busy', 'true');

    this.fallbackTimer = window.setTimeout(() => {
      void this.dismiss('fallback timeout');
    }, FALLBACK_TIMEOUT);

    if (!document.querySelector(HERO_SELECTOR)) {
      requestAnimationFrame(() => void this.dismiss('no Hero sequence'));
    }

    logger.debug('Initialised', { element: this.element });
  }

  heroReady(play?: () => void) {
    if (play) {
      this.heroPlayback = play;
    }

    if (this.dismissed) {
      this.heroPlayback?.();
      this.heroPlayback = null;
      return;
    }

    if (!this.dismissing) {
      void this.dismiss('Hero sequence ready');
    }
  }

  private completeDismissal(reason: string) {
    if (this.dismissed) return;

    this.dismissed = true;
    this.dismissing = false;
    this.element.setAttribute('aria-hidden', 'true');
    this.element.removeAttribute('aria-busy');
    gsap.set(this.element, { autoAlpha: 0, display: 'none', pointerEvents: 'none' });
    document.documentElement.removeAttribute(ROOT_ATTRIBUTE);

    const playback = this.heroPlayback;
    this.heroPlayback = null;
    playback?.();

    logger.debug('Dismissed', { reason });
  }

  private dismiss(reason: string) {
    if (this.dismissed || this.dismissing) return;

    this.dismissing = true;
    if (this.fallbackTimer !== null) {
      window.clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }

    const wait = Math.max(0, MINIMUM_DISPLAY_TIME - (performance.now() - this.startedAt));
    logger.debug('Dismissing', { reason, wait });

    if (wait) {
      window.setTimeout(() => this.completeDismissal(reason), wait);
      return;
    }

    this.completeDismissal(reason);
  }
}

export const initMCPreloader = () => {
  const elements = [...document.querySelectorAll<HTMLElement>(SELECTOR)];
  const element = elements[0];

  if (!element) {
    logger.debug('No preloader found');
    return;
  }

  if (elements.length > 1) {
    logger.warn('Multiple preloaders found; using the first.', { elements });
  }

  const preloader = new MCPreloader(element);
  ensureMC().preloader = preloader;
  preloader.init();
};
