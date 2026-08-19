import { getScrollTriggerDebug, gsap, onScrollTriggerDebugChange, SplitText } from '../core/gsap';
import { createLogger } from '../core/logger';
import type { MCDebugSchema, MCNamespace } from '../core/types';

const SELECTOR = '[mc-colour-reveal]';

const DEFAULTS = {
  duration: 0.8,
  colourDuration: 0.8,
  stagger: 0.8,
  colour: '#ffffff',
  start: 'top bottom',
};
const logger = createLogger('melon', 'colour-reveal');

type SplitTextResult = InstanceType<typeof SplitText>;
type BuildTimelineOptions = {
  attachScrollTrigger: boolean;
  paused: boolean;
  playImmediately: boolean;
};

type MCColourRevealInstance = MCColourReveal;

type MCColourRevealNamespace = MCNamespace & {
  colourReveal?: MCColourRevealInstance[];
};

declare global {
  interface HTMLElement {
    __mcColourReveal?: MCColourRevealInstance;
  }
}

const ensureMC = (): MCColourRevealNamespace => {
  window.MC ||= {};

  return window.MC as MCColourRevealNamespace;
};

const numberAttribute = (element: HTMLElement, name: string, fallback: number) => {
  const value = parseFloat(element.getAttribute(name) || '');

  return Number.isFinite(value) ? value : fallback;
};

const reducedMotionEnabled = () => {
  if (window.MC?.motion && typeof window.MC.motion.reduced === 'boolean') {
    return window.MC.motion.reduced;
  }

  return !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
};

const registerDebug = (schema: MCDebugSchema) => {
  const mc = ensureMC();

  if (mc.debug && typeof mc.debug.register === 'function') {
    mc.debug.register(schema);

    return;
  }

  mc.__debugQueue ||= [];
  mc.__debugQueue.push(schema);
};

class MCColourReveal {
  component: HTMLElement;
  index: number;
  settings: {
    duration: number;
    colourDuration: number;
    stagger: number;
    colour: string;
    start: string;
  };
  split: SplitTextResult | null;
  timeline: GSAPTimeline | null;
  ready: boolean;
  initialising: boolean;

  constructor(component: HTMLElement, index: number) {
    this.component = component;
    this.index = index;

    this.settings = {
      duration: numberAttribute(component, 'mc-colour-reveal-duration', DEFAULTS.duration),
      colourDuration: numberAttribute(
        component,
        'mc-colour-reveal-colour-duration',
        DEFAULTS.colourDuration
      ),
      stagger: numberAttribute(component, 'mc-colour-reveal-stagger', DEFAULTS.stagger),
      colour: component.getAttribute('mc-colour-reveal-colour') || DEFAULTS.colour,
      start: component.getAttribute('mc-colour-reveal-start') || DEFAULTS.start,
    };

    this.split = null;
    this.timeline = null;
    this.ready = false;
    this.initialising = false;

    this.component.style.setProperty('--mc-colour-reveal', this.settings.colour);
  }

  get(key: string) {
    return this.settings[key as keyof typeof this.settings];
  }

  set(key: string, rawValue: unknown) {
    if (!Object.prototype.hasOwnProperty.call(this.settings, key)) {
      return;
    }

    if (key === 'colour') {
      this.settings.colour = String(rawValue);

      this.component.setAttribute('mc-colour-reveal-colour', this.settings.colour);
      this.component.style.setProperty('--mc-colour-reveal', this.settings.colour);

      return;
    }

    if (key === 'start') {
      const value = String(rawValue || '').trim();

      if (!value) {
        return;
      }

      this.settings.start = value;
      this.component.setAttribute('mc-colour-reveal-start', this.settings.start);

      if (this.ready && !reducedMotionEnabled()) {
        void this.buildAnimated({
          attachScrollTrigger: false,
          paused: true,
          playImmediately: true,
        });
      }

      return;
    }

    const value = Number(rawValue);

    if (!Number.isFinite(value)) {
      return;
    }

    if (key === 'duration') {
      this.settings.duration = Math.max(0.01, value);
      this.component.setAttribute('mc-colour-reveal-duration', String(this.settings.duration));
    }

    if (key === 'colourDuration') {
      this.settings.colourDuration = Math.max(0.01, value);
      this.component.setAttribute(
        'mc-colour-reveal-colour-duration',
        String(this.settings.colourDuration)
      );
    }

    if (key === 'stagger') {
      this.settings.stagger = Math.max(0, value);
      this.component.setAttribute('mc-colour-reveal-stagger', String(this.settings.stagger));
    }

    if (this.ready && !reducedMotionEnabled()) {
      void this.buildAnimated({
        attachScrollTrigger: false,
        paused: true,
        playImmediately: true,
      });
    }
  }

  showFinal() {
    this.destroyAnimation();

    this.component.style.visibility = 'visible';
    this.component.style.setProperty('--clip-progress', '100%');
    this.component.style.setProperty('--color-progress', '0%');

    this.ready = true;
  }

  destroyAnimation() {
    if (this.timeline) {
      if (this.timeline.scrollTrigger) {
        this.timeline.scrollTrigger.kill();
      }

      this.timeline.kill();
      this.timeline = null;
    }

    if (this.split) {
      try {
        this.split.revert();
      } catch (error) {
        logger.warn('SplitText revert failed', error);
      }

      this.split = null;
    }
  }

  createGSAPTimeline({
    attachScrollTrigger,
    paused,
  }: Omit<BuildTimelineOptions, 'playImmediately'>): GSAPTimeline {
    return gsap!.timeline({
      paused,
      scrollTrigger: attachScrollTrigger
        ? {
            trigger: this.component,
            start: this.settings.start,
            end: 'top 80%',
            markers: getScrollTriggerDebug(),
            toggleActions: 'none play none reset',
          }
        : undefined,
    });
  }

  async buildAnimated({
    attachScrollTrigger,
    paused,
    playImmediately,
  }: BuildTimelineOptions): Promise<GSAPTimeline | null> {
    if (this.initialising) {
      return this.timeline;
    }

    this.initialising = true;

    this.destroyAnimation();

    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    if (reducedMotionEnabled()) {
      this.initialising = false;
      this.showFinal();

      return null;
    }

    this.component.style.setProperty('--mc-colour-reveal', this.settings.colour);
    this.component.style.removeProperty('--clip-progress');
    this.component.style.removeProperty('--color-progress');

    this.split = SplitText.create(this.component, {
      type: 'lines',
      autoSplit: true,
      mask: 'lines',
      linesClass: 'line',
      onSplit: (self) => {
        const timeline = this.createGSAPTimeline({
          attachScrollTrigger,
          paused,
        });

        timeline.set(this.component, {
          visibility: 'visible',
        });

        timeline.fromTo(
          self.lines,
          {
            '--clip-progress': '0%',
          },
          {
            '--clip-progress': '100%',
            duration: this.settings.duration,
            stagger: {
              amount: this.settings.stagger,
            },
          }
        );

        timeline.fromTo(
          self.lines,
          {
            '--color-progress': '100%',
          },
          {
            '--color-progress': '0%',
            delay: 0.2,
            duration: this.settings.colourDuration,
            stagger: {
              amount: this.settings.stagger,
            },
          },
          0
        );

        this.timeline = timeline;

        if (playImmediately) {
          timeline.play(0);
        }

        return timeline;
      },
    });

    this.ready = true;
    this.initialising = false;

    return this.timeline;
  }

  /**
   * Creates a paused colour reveal timeline without its standalone ScrollTrigger.
   * A parent GSAP timeline can add and own this returned animation.
   */
  async createTimeline(): Promise<GSAPTimeline | null> {
    return this.buildAnimated({
      attachScrollTrigger: false,
      paused: true,
      playImmediately: false,
    });
  }

  async replay() {
    if (reducedMotionEnabled()) {
      this.showFinal();

      return;
    }

    await this.buildAnimated({
      attachScrollTrigger: false,
      paused: true,
      playImmediately: true,
    });
  }

  async motionChanged() {
    if (reducedMotionEnabled()) {
      this.showFinal();

      return;
    }

    await this.buildAnimated({
      attachScrollTrigger: true,
      paused: false,
      playImmediately: false,
    });
  }

  async refreshScrollTriggerDebug() {
    if (reducedMotionEnabled() || !this.ready) {
      return;
    }

    await this.buildAnimated({
      attachScrollTrigger: true,
      paused: false,
      playImmediately: false,
    });
  }

  async init() {
    if (reducedMotionEnabled()) {
      this.showFinal();

      return;
    }

    await this.buildAnimated({
      attachScrollTrigger: true,
      paused: false,
      playImmediately: false,
    });
  }
}

const updateMotion = () => {
  const mc = ensureMC();

  (mc.colourReveal || []).forEach((instance) => {
    void instance.motionChanged();
  });
};

export const initMCColourReveal = () => {
  const mc = ensureMC();
  mc.colourReveal ||= [];

  registerDebug({
    id: 'colourReveal',
    label: 'Colour Reveal',
    instances: () => ensureMC().colourReveal || [],
    instanceLabel: (_instance, index, total) => (total > 1 ? `Heading ${index + 1}` : 'Heading'),
    controls: [
      {
        type: 'text',
        key: 'start',
        placeholder: 'GSAP Start',
        event: 'change',
      },
      {
        type: 'range',
        key: 'duration',
        label: 'Reveal Duration',
        min: 0.1,
        max: 2,
        step: 0.05,
        suffix: 's',
        event: 'change',
      },
      {
        type: 'range',
        key: 'colourDuration',
        label: 'Colour Duration',
        min: 0.1,
        max: 2,
        step: 0.05,
        suffix: 's',
        event: 'change',
      },
      {
        type: 'range',
        key: 'stagger',
        label: 'Line Stagger',
        min: 0,
        max: 2,
        step: 0.05,
        suffix: 's',
        event: 'change',
      },
      {
        type: 'button',
        label: 'Replay',
        action: 'replay',
      },
    ],
  });

  window.addEventListener('mcMotionPreferenceChange', updateMotion);
  onScrollTriggerDebugChange(() => {
    mc.colourReveal?.forEach((instance) => {
      void instance.refreshScrollTriggerDebug();
    });
  });

  const motionMedia = window.matchMedia?.('(prefers-reduced-motion: reduce)');

  if (motionMedia) {
    const systemChanged = () => {
      if (!window.MC?.motion || window.MC.motion.mode === 'system') {
        updateMotion();
      }
    };

    if (typeof motionMedia.addEventListener === 'function') {
      motionMedia.addEventListener('change', systemChanged);
    } else if (typeof motionMedia.addListener === 'function') {
      motionMedia.addListener(systemChanged);
    }
  }

  const init = async () => {
    const components = [...document.querySelectorAll<HTMLElement>(SELECTOR)];

    components.forEach((component, index) => {
      if (component.__mcColourReveal) {
        return;
      }

      component.setAttribute('data-mc-colour-reveal-init', '');

      const instance = new MCColourReveal(component, index);

      component.__mcColourReveal = instance;
      mc.colourReveal?.push(instance);

      void instance.init();
    });

    mc.debug?.refresh?.();

    logger.info(`Initialised ${components.length} element(s).`);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => void init(), {
      once: true,
    });
  } else {
    void init();
  }
};
