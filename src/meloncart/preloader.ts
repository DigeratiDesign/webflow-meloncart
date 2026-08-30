import { gsap } from '../digerati/core/gsap';
import { createLogger, isMCDebugEnabled } from '../digerati/core/logger';
import type { MCNamespace } from '../digerati/core/types';

const SELECTOR = '[dd-preloader]';
const HERO_SELECTOR = '[mc-hero-sequence]';
const ROOT_ATTRIBUTE = 'data-mc-preloader-active';
const DISMISSED_ROOT_ATTRIBUTE = 'data-mc-preloader-dismissed';
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
  minimumDisplayTimer: number | null = null;
  minimumDisplayElapsed = false;
  presentationReady = false;
  dismissalReason: string | null = null;
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
    document.documentElement.removeAttribute(DISMISSED_ROOT_ATTRIBUTE);
    this.element.removeAttribute('aria-hidden');
    this.element.setAttribute('aria-busy', 'true');
    // Webflow's retired page-load interaction can leave these inline states behind.
    this.element.style.display = 'flex';
    this.element.style.opacity = '1';
    this.element.style.visibility = 'visible';
    this.element.style.pointerEvents = 'auto';

    this.fallbackTimer = window.setTimeout(() => {
      this.dismiss('fallback timeout', true);
    }, FALLBACK_TIMEOUT);

    if (!document.querySelector(HERO_SELECTOR)) {
      this.dismiss('no Hero sequence');
    }

    logger.debug('Initialised', { element: this.element });
    this.waitForPresentation();
  }

  heroReady(play?: () => void) {
    // eslint-disable-next-line no-console -- temporary cross-browser startup diagnostic.
    console.info('[🍈:preloader]', {
      time: performance.now(),
      signal: 'window.MC.preloader.heroReady(playSequence)',
      message: 'Received hero readiness signal',
      hasPlayback: Boolean(play),
    });

    if (play) {
      this.heroPlayback = play;
    }

    if (this.dismissed) {
      this.heroPlayback?.();
      this.heroPlayback = null;
      return;
    }

    if (!this.dismissing) {
      this.dismiss('Hero sequence ready');
    }
  }

  private waitForPresentation() {
    // rAF runs before a repaint; the second callback runs after a rendering opportunity.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (this.dismissed) return;

        this.presentationReady = true;
        logger.debug('Visible', { element: this.element });
        this.completeWhenReady();
      });
    });
  }

  private clearTimers() {
    if (this.fallbackTimer !== null) {
      window.clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }

    if (this.minimumDisplayTimer !== null) {
      window.clearTimeout(this.minimumDisplayTimer);
      this.minimumDisplayTimer = null;
    }
  }

  private completeWhenReady() {
    if (
      this.dismissed ||
      !this.dismissing ||
      !this.presentationReady ||
      !this.minimumDisplayElapsed
    ) {
      return;
    }

    this.completeDismissal(this.dismissalReason || 'ready');
  }

  private completeDismissal(reason: string) {
    if (this.dismissed) return;

    // eslint-disable-next-line no-console -- temporary cross-browser startup diagnostic.
    console.info('[🍈:preloader]', {
      time: performance.now(),
      signal: 'MCPreloader.completeDismissal()',
      message: 'Preloader hide triggered',
      reason,
    });

    this.dismissed = true;
    this.dismissing = false;
    this.clearTimers();
    this.element.setAttribute('aria-hidden', 'true');
    this.element.removeAttribute('aria-busy');
    document.documentElement.setAttribute(DISMISSED_ROOT_ATTRIBUTE, 'true');
    gsap.set(this.element, { autoAlpha: 0, display: 'none', pointerEvents: 'none' });
    document.documentElement.removeAttribute(ROOT_ATTRIBUTE);

    const playback = this.heroPlayback;
    this.heroPlayback = null;
    playback?.();

    logger.debug('Exit complete', { reason });
  }

  private dismiss(reason: string, force = false) {
    if (this.dismissed) return;

    if (this.dismissing) {
      if (force) {
        logger.warn('Fallback forcing exit before presentation readiness', { reason });
        this.completeDismissal(reason);
      }
      return;
    }

    this.dismissing = true;
    this.dismissalReason = reason;

    // eslint-disable-next-line no-console -- temporary cross-browser startup diagnostic.
    console.info('[🍈:preloader]', {
      time: performance.now(),
      signal: 'MCPreloader.dismiss()',
      message: 'Preloader exit requested',
      reason,
      force,
    });

    if (force) {
      logger.warn('Fallback forcing exit before presentation readiness', { reason });
      this.completeDismissal(reason);
      return;
    }

    const wait = Math.max(0, MINIMUM_DISPLAY_TIME - (performance.now() - this.startedAt));
    logger.debug('Ready to exit', { reason, wait });

    if (wait) {
      this.minimumDisplayTimer = window.setTimeout(() => {
        this.minimumDisplayTimer = null;
        this.minimumDisplayElapsed = true;
        this.completeWhenReady();
      }, wait);
      return;
    }

    this.minimumDisplayElapsed = true;
    this.completeWhenReady();
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
  // eslint-disable-next-line no-console -- temporary cross-browser startup diagnostic.
  console.info('[🍈:preloader]', {
    time: performance.now(),
    signal: 'window.MC.preloader.heroReady(playSequence)',
    message: 'Registered hero readiness signal receiver',
  });
  ensureMC().preloader = preloader;
  preloader.init();
};
