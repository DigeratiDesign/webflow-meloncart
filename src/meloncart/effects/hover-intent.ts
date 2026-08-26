import { createLogger, isMCDebugEnabled } from '../../digerati/core/logger';

const SELECTOR = '[mc-hover-intent]';
const DROPDOWN_SELECTOR = '.w-dropdown';
const TOGGLE_SELECTOR = '.w-dropdown-toggle';
const MENU_SELECTOR = '.w-dropdown-list';
const DEFAULT_INTENT_DELAY = 650;
const SHORT_CLOSE_DELAY = 180;
const SIBLING_INTENT_PAUSE = 120;
const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';
const DIAGNOSTIC_LIMIT = 100;

const logger = createLogger('melon', 'hover-intent', { debug: isMCDebugEnabled });

declare global {
  interface HTMLElement {
    __mcHoverIntent?: MCHoverIntent;
  }

  interface Window {
    __mcHoverIntentLog?: MCHoverIntentDiagnostic[];
  }
}

type MCHoverIntentDiagnostic = {
  event: string;
  relatedTarget: string | null;
  time: number;
  trigger: string;
};

type PointerPosition = {
  x: number;
  y: number;
};

const targetLabel = (target: EventTarget | null) => {
  if (!(target instanceof Element)) return null;

  const label = target.getAttribute('aria-label') || target.textContent?.trim();
  return label ? label.slice(0, 80) : target.tagName.toLowerCase();
};

const delayAttribute = (element: HTMLElement) => {
  const attribute = element.getAttribute('mc-hover-intent-delay')?.trim();
  if (!attribute) return DEFAULT_INTENT_DELAY;

  const value = Number(attribute);
  return Number.isFinite(value) ? Math.max(0, value) : DEFAULT_INTENT_DELAY;
};

class MCHoverIntent {
  private closeTimer: number | null = null;
  private siblingPauseTimer: number | null = null;
  private closeStartedAt: number | null = null;
  private lastPointer: PointerPosition | null = null;
  private intentExtended = false;
  private trackingPointer = false;
  private releasingToWebflow = false;
  private readonly dropdown: HTMLElement;
  private readonly menu: HTMLElement;
  private readonly delay: number;

  constructor(dropdown: HTMLElement, menu: HTMLElement, delay: number) {
    this.dropdown = dropdown;
    this.menu = menu;
    this.delay = delay;
  }

  private log(event: string, relatedTarget: EventTarget | null = null) {
    const entries = (window.__mcHoverIntentLog ??= []);
    entries.push({
      event,
      relatedTarget: targetLabel(relatedTarget),
      time: Math.round(performance.now()),
      trigger: targetLabel(this.dropdown.querySelector(TOGGLE_SELECTOR)) ?? 'unnamed dropdown',
    });

    if (entries.length > DIAGNOSTIC_LIMIT) entries.splice(0, entries.length - DIAGNOSTIC_LIMIT);
  }

  private clearCloseTimer() {
    if (this.closeTimer === null) return;

    window.clearTimeout(this.closeTimer);
    this.closeTimer = null;
  }

  private clearSiblingPauseTimer() {
    if (this.siblingPauseTimer === null) return;

    window.clearTimeout(this.siblingPauseTimer);
    this.siblingPauseTimer = null;
  }

  private stopPointerTracking() {
    if (!this.trackingPointer) return;

    document.removeEventListener('pointermove', this.handlePointerMove, true);
    document.removeEventListener('mouseover', this.handleSiblingHover, true);
    this.clearSiblingPauseTimer();
    this.trackingPointer = false;
    this.lastPointer = null;
  }

  private readonly cancelClose = () => {
    if (this.closeTimer === null) return;

    this.clearCloseTimer();
    this.clearSiblingPauseTimer();
    this.stopPointerTracking();
    this.closeStartedAt = null;
    this.intentExtended = false;
    this.log('close-cancelled');
  };

  private readonly releaseToWebflow = () => {
    this.closeTimer = null;
    this.closeStartedAt = null;
    this.stopPointerTracking();
    this.releasingToWebflow = true;
    this.log('close-released-to-webflow');

    // Webflow's hover dropdown listens for mouseout to begin its own close flow.
    this.dropdown.dispatchEvent(
      new MouseEvent('mouseout', {
        bubbles: true,
        relatedTarget: document.body,
        view: window,
      })
    );

    this.releasingToWebflow = false;
  };

  private scheduleClose(delay: number, event: string) {
    this.clearCloseTimer();
    this.closeTimer = window.setTimeout(this.releaseToWebflow, delay);
    this.log(`${event}-${Math.round(delay)}ms`);
  }

  private distanceToMenu({ x, y }: PointerPosition) {
    const bounds = this.menu.getBoundingClientRect();
    const nearestX = Math.max(bounds.left, Math.min(x, bounds.right));
    const nearestY = Math.max(bounds.top, Math.min(y, bounds.bottom));

    return Math.hypot(x - nearestX, y - nearestY);
  }

  private isWithinMenuAim(pointer: PointerPosition) {
    if (!this.lastPointer) return false;

    const bounds = this.menu.getBoundingClientRect();
    const origin = this.lastPointer;
    const edgeY = origin.y <= bounds.top ? bounds.top : bounds.bottom;
    const firstCorner = { x: bounds.left, y: edgeY };
    const secondCorner = { x: bounds.right, y: edgeY };
    const sign = (first: PointerPosition, second: PointerPosition, third: PointerPosition) =>
      (first.x - third.x) * (second.y - third.y) - (second.x - third.x) * (first.y - third.y);

    const firstSign = sign(pointer, origin, firstCorner) < 0;
    const secondSign = sign(pointer, firstCorner, secondCorner) < 0;
    const thirdSign = sign(pointer, secondCorner, origin) < 0;

    return firstSign === secondSign && secondSign === thirdSign;
  }

  private extendClose(event: string) {
    if (this.closeStartedAt === null || this.intentExtended) return;

    const elapsed = performance.now() - this.closeStartedAt;
    const remaining = Math.max(0, this.delay - elapsed);
    this.intentExtended = true;
    this.scheduleClose(remaining, event);
  }

  private readonly handlePointerMove = (event: PointerEvent) => {
    if (!this.lastPointer || this.closeStartedAt === null) return;

    this.clearSiblingPauseTimer();
    const pointer = { x: event.clientX, y: event.clientY };
    const wasCloser = this.distanceToMenu(pointer) + 2 < this.distanceToMenu(this.lastPointer);
    this.lastPointer = pointer;

    if (wasCloser) {
      this.extendClose('close-extended-toward-menu');
      return;
    }

    if (!this.intentExtended) return;

    this.intentExtended = false;
    this.closeStartedAt = performance.now();
    this.scheduleClose(SHORT_CLOSE_DELAY, 'close-shortened-away-from-menu');
  };

  private readonly handleSiblingHover = (event: MouseEvent) => {
    if (this.dropdown.contains(event.target as Node | null)) return;

    const pointer = { x: event.clientX, y: event.clientY };
    if (!this.isWithinMenuAim(pointer)) return;

    // Keep a sibling hover from closing the active dropdown mid-trajectory.
    event.stopImmediatePropagation();
    this.log('sibling-hover-held', event.target);
    this.extendClose('close-extended-through-sibling');
    this.clearSiblingPauseTimer();
    this.siblingPauseTimer = window.setTimeout(() => {
      this.siblingPauseTimer = null;
      this.intentExtended = false;
      this.closeStartedAt = performance.now();
      this.scheduleClose(SHORT_CLOSE_DELAY, 'close-shortened-on-sibling-pause');
    }, SIBLING_INTENT_PAUSE);
  };

  private startClose(event: MouseEvent) {
    this.clearCloseTimer();
    this.closeStartedAt = performance.now();
    this.lastPointer = { x: event.clientX, y: event.clientY };
    this.intentExtended = false;

    if (!this.trackingPointer) {
      document.addEventListener('pointermove', this.handlePointerMove, true);
      document.addEventListener('mouseover', this.handleSiblingHover, true);
      this.trackingPointer = true;
    }

    this.scheduleClose(SHORT_CLOSE_DELAY, 'close-scheduled');
  }

  private readonly handleMouseOut = (event: MouseEvent) => {
    if (this.releasingToWebflow || this.dropdown.contains(event.relatedTarget as Node | null)) {
      this.log('mouseout-within-dropdown', event.relatedTarget);
      return;
    }

    // Hold Webflow's close only while the pointer crosses the visual gap.
    event.stopImmediatePropagation();
    this.log('mouseout-held', event.relatedTarget);
    this.startClose(event);
  };

  init() {
    this.dropdown.addEventListener('mouseenter', this.cancelClose);
    this.dropdown.addEventListener('pointerenter', this.cancelClose);

    // Capture before Webflow's hover handler receives the native mouseout.
    this.dropdown.addEventListener('mouseout', this.handleMouseOut, true);
    this.log(`initialised-${this.delay}ms`);
  }
}

export const initMCHoverIntent = () => {
  const initialise = () => {
    if (!window.matchMedia(FINE_POINTER_QUERY).matches) return;

    window.__mcHoverIntentLog = [];

    const dropdowns = new Map<HTMLElement, HTMLElement>();

    document.querySelectorAll<HTMLElement>(SELECTOR).forEach((element) => {
      const dropdown = element.matches(DROPDOWN_SELECTOR)
        ? element
        : element.closest<HTMLElement>(DROPDOWN_SELECTOR);

      if (!dropdown) {
        logger.warn('Expected mc-hover-intent inside a Webflow dropdown:', element);
        return;
      }

      dropdowns.set(dropdown, element);
    });

    dropdowns.forEach((configuredElement, dropdown) => {
      if (dropdown.__mcHoverIntent) return;

      const toggle = dropdown.querySelector(TOGGLE_SELECTOR);
      const menu = dropdown.querySelector<HTMLElement>(MENU_SELECTOR);
      if (!toggle || !menu) {
        logger.warn('Expected a Webflow dropdown toggle and list:', dropdown);
        return;
      }

      const instance = new MCHoverIntent(dropdown, menu, delayAttribute(configuredElement));
      dropdown.__mcHoverIntent = instance;
      instance.init();
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
    return;
  }

  initialise();
};
