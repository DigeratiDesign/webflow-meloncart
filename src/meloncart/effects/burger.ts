import { createLogger, isMCDebugEnabled } from '../../digerati/core/logger';

const SELECTOR = '[mc-burger]';
const OPEN_CLASS = 'is-open';
const ARIA_EXPANDED = 'aria-expanded';
const REDUCED_MOTION_EVENT = 'mcMotionPreferenceChange';
const LOWER_OPEN_SELECTOR = '[data-mc-burger-animation="lower-open"]';
const LOWER_CLOSE_SELECTOR = '[data-mc-burger-animation="lower-close"]';
const UPPER_OPEN_SELECTOR = '[data-mc-burger-animation="upper-open"]';
const UPPER_CLOSE_SELECTOR = '[data-mc-burger-animation="upper-close"]';
const LOWER_PATH_OPEN = 'M12.08 11.92L6 18';
const LOWER_PATH_CLOSED = 'M8.5 18.5L5.5 15.5';
const UPPER_PATH_OPEN = 'M18 6L11.92 12.08';
const UPPER_PATH_CLOSED = 'M18.5 8.5L15.5 5.5';

const logger = createLogger('melon', 'burger', { debug: isMCDebugEnabled });

type BurgerAnimationGroup = {
  open: Array<SVGAnimationElement | null>;
  close: Array<SVGAnimationElement | null>;
};

declare global {
  interface HTMLElement {
    __mcBurger?: MCBurger;
  }
}

let motionListenerRegistered = false;

const reducedMotionEnabled = () => window.MC?.motion?.reduced ?? false;

class MCBurger {
  element: HTMLElement;
  svg: SVGSVGElement;
  lowerPath: SVGPathElement | null;
  upperPath: SVGPathElement | null;
  animations: BurgerAnimationGroup;
  observer: MutationObserver | null = null;
  open: boolean;

  constructor(element: HTMLElement, svg: SVGSVGElement) {
    this.element = element;
    this.svg = svg;
    this.lowerPath = svg.querySelector<SVGPathElement>('.mc-burger_lower');
    this.upperPath = svg.querySelector<SVGPathElement>('.mc-burger_upper');
    this.animations = {
      open: [
        svg.querySelector<SVGAnimationElement>(LOWER_OPEN_SELECTOR),
        svg.querySelector<SVGAnimationElement>(UPPER_OPEN_SELECTOR),
      ],
      close: [
        svg.querySelector<SVGAnimationElement>(LOWER_CLOSE_SELECTOR),
        svg.querySelector<SVGAnimationElement>(UPPER_CLOSE_SELECTOR),
      ],
    };
    this.open = this.webflowOpen;
  }

  get webflowOpen() {
    return this.element.getAttribute(ARIA_EXPANDED) === 'true';
  }

  private setStaticState(isOpen: boolean) {
    this.lowerPath?.setAttribute('d', isOpen ? LOWER_PATH_OPEN : LOWER_PATH_CLOSED);
    this.upperPath?.setAttribute('d', isOpen ? UPPER_PATH_OPEN : UPPER_PATH_CLOSED);
  }

  private playSVGAnimations(isOpen: boolean) {
    const group = isOpen ? this.animations.open : this.animations.close;
    const ready = group.every(
      (animation) => animation && typeof animation.beginElement === 'function'
    );

    if (!ready) {
      logger.debug('Expected SVG animation node missing; using static fallback.', {
        element: this.element,
        state: isOpen ? 'open' : 'close',
      });
      this.setStaticState(isOpen);
      return;
    }

    group.forEach((animation) => {
      animation?.beginElement();
    });
  }

  private applyState(isOpen: boolean) {
    this.open = isOpen;
    this.element.classList.toggle(OPEN_CLASS, isOpen);

    if (reducedMotionEnabled()) {
      this.setStaticState(isOpen);
      return;
    }

    this.playSVGAnimations(isOpen);
  }

  private syncToWebflowState() {
    const nextOpen = this.webflowOpen;

    if (nextOpen === this.open) {
      return;
    }

    logger.debug('Resynchronised visual state from Webflow.', {
      element: this.element,
      open: nextOpen,
    });
    this.applyState(nextOpen);
  }

  private handlePointerDown = () => {
    this.applyState(!this.open);
  };

  init() {
    if (!this.lowerPath || !this.upperPath) {
      logger.debug('Burger SVG paths missing; skipping visual animation.', {
        element: this.element,
      });
      return;
    }

    this.setStaticState(this.open);
    this.element.classList.toggle(OPEN_CLASS, this.open);
    this.element.addEventListener('pointerdown', this.handlePointerDown);

    this.observer = new MutationObserver(() => this.syncToWebflowState());
    this.observer.observe(this.element, {
      attributes: true,
      attributeFilter: [ARIA_EXPANDED],
    });

    logger.info('Initialised burger.', { element: this.element, open: this.open });
  }

  applyMotionPreference() {
    this.open = this.webflowOpen;
    this.element.classList.toggle(OPEN_CLASS, this.open);
    this.setStaticState(this.open);
  }
}

export const initMCBurger = () => {
  const initialise = () => {
    const burgers = [...document.querySelectorAll<HTMLElement>(SELECTOR)];
    const instances: MCBurger[] = [];

    burgers.forEach((element) => {
      if (element.__mcBurger) {
        instances.push(element.__mcBurger);
        return;
      }

      const svg = element.querySelector<SVGSVGElement>('svg');

      if (!svg) {
        logger.debug('mc-burger element is missing its SVG; skipping.', element);
        return;
      }

      const instance = new MCBurger(element, svg);
      element.__mcBurger = instance;
      instance.init();
      instances.push(instance);
    });

    if (!motionListenerRegistered) {
      motionListenerRegistered = true;
      window.addEventListener(REDUCED_MOTION_EVENT, () => {
        document.querySelectorAll<HTMLElement>(SELECTOR).forEach((element) => {
          element.__mcBurger?.applyMotionPreference();
        });
      });
    }

    logger.info(`Initialised ${instances.length} burger button(s).`);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
    return;
  }

  initialise();
};
