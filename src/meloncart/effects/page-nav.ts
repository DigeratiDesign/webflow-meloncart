import { createLogger, isMCDebugEnabled } from '../../digerati/core/logger';

const PAGE_NAV_SELECTOR = '[mc-page-nav]';
const MAIN_NAV_HEIGHT_REM = 4.5;
const SCROLL_DURATION = 900;
const logger = createLogger('melon', 'page-nav', { debug: isMCDebugEnabled });

const reducedMotionEnabled = () => window.MC?.motion?.reduced ?? false;

const easeInOutCubic = (time: number) =>
  time < 0.5 ? 4 * time * time * time : 1 - Math.pow(-2 * time + 2, 3) / 2;

class MCPageNav {
  element: HTMLElement;
  private frameId: number | null = null;

  private readonly applyHashOffset = () => {
    const { hash } = window.location;

    if (!hash || hash === '#') {
      return;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const section = this.findTarget(hash);

        if (section) {
          this.scrollTo(this.targetTop(section), false);
        }
      });
    });
  };

  private readonly handleClick = (event: MouseEvent) => {
    const { target } = event;

    if (!(target instanceof Element)) {
      return;
    }

    const link = target.closest<HTMLAnchorElement>('[mc-page-nav] a[href^="#"]');

    if (!link) {
      return;
    }

    const href = link.getAttribute('href');

    if (!href || href === '#') {
      return;
    }

    const section = this.findTarget(href);

    if (!section) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    this.scrollTo(this.targetTop(section));
    window.history.pushState(null, '', href);
  };

  constructor(element: HTMLElement) {
    this.element = element;
  }

  init() {
    this.element.ownerDocument.addEventListener('click', this.handleClick, true);
    this.applyHashOffset();
    window.addEventListener('load', this.applyHashOffset, { once: true });
  }

  destroy() {
    this.element.ownerDocument.removeEventListener('click', this.handleClick, true);
    window.removeEventListener('load', this.applyHashOffset);

    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  private findTarget(hash: string) {
    try {
      return document.querySelector<HTMLElement>(hash);
    } catch {
      return null;
    }
  }

  private targetTop(section: HTMLElement) {
    const rootFontSize = Number.parseFloat(
      window.getComputedStyle(document.documentElement).fontSize
    );
    const mainNavHeight = MAIN_NAV_HEIGHT_REM * rootFontSize;

    return (
      window.scrollY +
      section.getBoundingClientRect().top -
      mainNavHeight -
      this.element.getBoundingClientRect().height
    );
  }

  private scrollTo(targetY: number, animate = true) {
    if (!animate || reducedMotionEnabled()) {
      window.scrollTo(0, targetY);
      return;
    }

    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
    }

    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / SCROLL_DURATION, 1);

      window.scrollTo(0, startY + distance * easeInOutCubic(progress));

      if (progress < 1) {
        this.frameId = requestAnimationFrame(step);
        return;
      }

      this.frameId = null;
    };

    this.frameId = requestAnimationFrame(step);
  }
}

export const initMCPageNav = () => {
  const initialise = () => {
    const element = document.querySelector<HTMLElement>(PAGE_NAV_SELECTOR);

    if (!element) {
      logger.debug('No page navigation found');
      return;
    }

    const instance = new MCPageNav(element);
    instance.init();
    logger.info('Initialised');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
    return;
  }

  initialise();
};
