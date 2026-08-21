import {
  getScrollTriggerDebug,
  gsap,
  onScrollTriggerDebugChange,
  ScrollTrigger,
} from '../../digerati/core/gsap';
import { createLogger, isMCDebugEnabled } from '../../digerati/core/logger';
import type { MCDebugSchema, MCNamespace } from '../../digerati/core/types';

const SELECTOR = '[mc-underline]';
const OWNER_ATTRIBUTE = 'mc-animation-owner';
const logger = createLogger('melon', 'underline', { debug: isMCDebugEnabled });

const DEFAULTS = {
  duration: 0.55,
  start: 'top 80%',
};

type MCUnderlineNamespace = MCNamespace & {
  underlines?: MCUnderline[];
};

declare global {
  interface HTMLElement {
    __mcUnderline?: MCUnderline;
  }
}

const ensureMC = (): MCUnderlineNamespace => {
  window.MC ||= {};
  return window.MC as MCUnderlineNamespace;
};

const reducedMotionEnabled = () => window.MC?.motion?.reduced ?? false;

const numberAttribute = (element: HTMLElement, name: string, fallback: number) => {
  const value = Number(element.getAttribute(name));
  return Number.isFinite(value) ? value : fallback;
};

const registerDebug = (schema: MCDebugSchema) => {
  const mc = ensureMC();

  if (mc.debug?.register) {
    mc.debug.register(schema);
    return;
  }

  mc.__debugQueue ||= [];
  mc.__debugQueue.push(schema);
};

class MCUnderline {
  element: HTMLElement;
  settings: { duration: number; start: string };
  timeline: GSAPTimeline | null = null;

  constructor(element: HTMLElement) {
    this.element = element;
    this.settings = {
      duration: Math.max(
        0.01,
        numberAttribute(element, 'mc-underline-duration', DEFAULTS.duration)
      ),
      start: element.getAttribute('mc-underline-start') || DEFAULTS.start,
    };
  }

  get parentOwned() {
    return this.element.hasAttribute(OWNER_ATTRIBUTE);
  }

  get(key: string) {
    return this.settings[key as keyof typeof this.settings];
  }

  set(key: string, rawValue: unknown) {
    if (key === 'start') {
      const start = String(rawValue).trim();
      if (!start) return;
      this.settings.start = start;
      this.element.setAttribute('mc-underline-start', start);
    } else if (key === 'duration') {
      const duration = Number(rawValue);
      if (!Number.isFinite(duration)) return;
      this.settings.duration = Math.max(0.01, duration);
      this.element.setAttribute('mc-underline-duration', String(this.settings.duration));
    } else {
      return;
    }

    if (!this.parentOwned) {
      this.init();
    }
  }

  destroy() {
    this.timeline?.scrollTrigger?.kill();
    this.timeline?.kill();
    this.timeline = null;
  }

  showFinal() {
    this.destroy();
    gsap.set(this.element, { clearProps: 'clipPath' });
  }

  createTimeline({
    attachScrollTrigger,
    paused,
    duration = this.settings.duration,
  }: {
    attachScrollTrigger: boolean;
    paused: boolean;
    duration?: number;
  }) {
    this.destroy();

    const timeline = gsap.timeline({
      paused,
      scrollTrigger: attachScrollTrigger
        ? {
            trigger: this.element,
            start: this.settings.start,
            markers: getScrollTriggerDebug(),
            toggleActions: 'play none none reset',
            onEnter: () => logger.debug('Scroll trigger entered', { element: this.element }),
          }
        : undefined,
    });

    timeline.fromTo(
      this.element,
      { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', duration, ease: 'power3.out' }
    );

    this.timeline = timeline;
    logger.debug('Timeline created', { element: this.element, parentOwned: this.parentOwned });

    return timeline;
  }

  replay() {
    if (reducedMotionEnabled()) {
      this.showFinal();
      return;
    }

    if (this.parentOwned) {
      return;
    }

    this.createTimeline({ attachScrollTrigger: false, paused: false }).play(0);
  }

  init() {
    if (reducedMotionEnabled()) {
      this.showFinal();
      return;
    }

    if (this.parentOwned) {
      logger.debug('Standalone initialisation deferred to parent', { element: this.element });
      return;
    }

    this.createTimeline({ attachScrollTrigger: true, paused: false });
  }

  motionChanged() {
    this.init();
  }
}

class MCUnderlineGroup {
  underlines: MCUnderline[];
  settings: { enabled: boolean; duration: number; start: string };

  constructor(underlines: MCUnderline[]) {
    this.underlines = underlines;
    const first = underlines[0];
    this.settings = {
      enabled: true,
      duration: first?.settings.duration || DEFAULTS.duration,
      start: first?.settings.start || DEFAULTS.start,
    };
  }

  get(key: string) {
    return this.settings[key as keyof typeof this.settings];
  }

  set(key: string, value: unknown) {
    if (key === 'enabled') {
      this.settings.enabled = Boolean(value);
    } else if (key === 'duration') {
      const duration = Number(value);
      if (!Number.isFinite(duration)) return;
      this.settings.duration = Math.max(0.01, duration);
    } else if (key === 'start') {
      const start = String(value).trim();
      if (!start) return;
      this.settings.start = start;
    } else {
      return;
    }

    this.apply();
  }

  apply() {
    this.underlines.forEach((underline) => {
      if (!this.settings.enabled || reducedMotionEnabled()) {
        underline.showFinal();
        return;
      }

      underline.settings.duration = this.settings.duration;
      underline.settings.start = this.settings.start;
      underline.init();
    });

    ScrollTrigger.refresh();
  }

  replay() {
    if (!this.settings.enabled) return;
    this.underlines.forEach((underline) => underline.replay());
  }
}

export const initMCUnderline = () => {
  const initialise = () => {
    const mc = ensureMC();
    const underlines = [...document.querySelectorAll<HTMLElement>(SELECTOR)].map((element) => {
      if (element.__mcUnderline) {
        return element.__mcUnderline;
      }

      const instance = new MCUnderline(element);
      element.__mcUnderline = instance;
      instance.init();
      return instance;
    });

    mc.underlines = underlines;
    const standaloneUnderlines = underlines.filter((underline) => !underline.parentOwned);
    const group = new MCUnderlineGroup(standaloneUnderlines);
    group.apply();

    registerDebug({
      id: 'underlines',
      label: 'Underlines',
      instances: () => (standaloneUnderlines.length ? [group] : []),
      orderElement: () => standaloneUnderlines[0]?.element || null,
      instanceLabel: 'All Underlines',
      controls: [
        {
          type: 'toggle',
          key: 'enabled',
          label: 'Animate Underlines',
          description: 'Enables scroll-triggered animation for every underline outside the Hero.',
        },
        {
          type: 'text',
          key: 'start',
          label: 'Scroll Start',
          description: 'Sets when all standalone underlines begin their viewport reveal.',
          placeholder: 'GSAP Start',
          event: 'change',
        },
        {
          type: 'range',
          key: 'duration',
          label: 'Wipe Duration',
          description: 'Sets the shared wipe duration for all standalone underlines.',
          min: 0.1,
          max: 2,
          step: 0.05,
          suffix: 's',
          event: 'change',
        },
        { type: 'button', label: 'Replay', action: 'replay' },
      ],
    });

    window.addEventListener('mcMotionPreferenceChange', () => {
      group.apply();
    });
    onScrollTriggerDebugChange(() => {
      group.apply();
    });

    const refresh = () => ScrollTrigger.refresh();
    requestAnimationFrame(refresh);
    window.addEventListener('load', refresh, { once: true });

    logger.info(`Initialised ${underlines.length} underline(s).`);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
    return;
  }

  initialise();
};
