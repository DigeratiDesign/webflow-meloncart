import { gsap } from '../../digerati/core/gsap';
import { createLogger, isMCDebugEnabled } from '../../digerati/core/logger';
import type { MCController, MCDebugSchema, MCNamespace } from '../../digerati/core/types';

const LINK_SELECTOR = '[mc-footer-link-sweep] a';
const CHARACTER_CLASS = 'mc-footer-char';
const SPROUT = 'var(--_primitives---color--sprout)';
const WHITE = '#ffffff';
const IN_SWEEP_DURATION = 0.16;
const OUT_SWEEP_DURATION = 0.14;
const WHITE_DURATION = 0.045;
const SPROUT_DURATION = 0.07;
const SPROUT_DELAY = 0.1;
const DEFAULT_SWEEP_DURATION = IN_SWEEP_DURATION + SPROUT_DELAY + SPROUT_DURATION;
const logger = createLogger('melon', 'footer-link-sweep', { debug: isMCDebugEnabled });

type MCFooterLinkSweepNamespace = MCNamespace & {
  footerLinkSweep?: MCFooterLinkSweep[];
  footerLinkSweepController?: MCFooterLinkSweepController;
};

declare global {
  interface HTMLElement {
    __mcFooterLinkSweep?: MCFooterLinkSweep;
  }
}

const ensureMC = (): MCFooterLinkSweepNamespace => {
  window.MC ||= {};

  return window.MC as MCFooterLinkSweepNamespace;
};

const reducedMotionEnabled = () => window.MC?.motion?.reduced ?? false;

const registerDebug = (schema: MCDebugSchema) => {
  const mc = ensureMC();

  if (mc.debug?.register) {
    mc.debug.register(schema);
    return;
  }

  mc.__debugQueue ||= [];
  mc.__debugQueue.push(schema);
};

class MCFooterLinkSweep {
  element: HTMLElement;
  chars: HTMLElement[] = [];
  restingColor = '';
  restingOpacity = 1;
  iconWrapper: HTMLElement | null = null;
  private enabled = false;
  private timingScale = 1;

  private readonly handleMouseEnter = () => {
    if (!this.enabled) {
      return;
    }

    gsap.killTweensOf(this.chars);
    const inStagger = this.staggerFor(IN_SWEEP_DURATION * this.timingScale);
    const timeline = gsap.timeline();

    timeline.to(
      this.chars,
      {
        color: WHITE,
        opacity: 1,
        duration: WHITE_DURATION * this.timingScale,
        stagger: { each: inStagger, from: 'start' },
        ease: 'none',
      },
      0
    );
    timeline.to(
      this.chars,
      {
        color: SPROUT,
        opacity: 1,
        duration: SPROUT_DURATION * this.timingScale,
        stagger: { each: inStagger, from: 'start' },
        // Matches the Colour Reveal's default GSAP easing as the link reaches Sprout.
        ease: 'power1.out',
      },
      SPROUT_DELAY * this.timingScale
    );
  };

  private readonly handleMouseLeave = () => {
    if (!this.enabled) {
      return;
    }

    gsap.killTweensOf(this.chars);
    gsap.to(this.chars, {
      color: this.restingColor,
      opacity: this.restingOpacity,
      duration: 0.09 * this.timingScale,
      stagger: { each: this.staggerFor(OUT_SWEEP_DURATION * this.timingScale), from: 'end' },
      ease: 'power1.out',
      overwrite: true,
    });
  };

  constructor(element: HTMLElement) {
    this.element = element;

    const computed = window.getComputedStyle(element);
    this.restingColor = computed.color;
    this.restingOpacity = Number.parseFloat(computed.opacity) || 1;
    this.iconWrapper = element.querySelector<HTMLElement>('[class*="icon"]');
    this.splitText();
  }

  private staggerFor(duration: number) {
    return this.chars.length > 1 ? duration / (this.chars.length - 1) : 0;
  }

  private splitText() {
    const existingChars = [...this.element.querySelectorAll<HTMLElement>(`.${CHARACTER_CLASS}`)];

    if (existingChars.length) {
      this.chars = existingChars;
      return;
    }

    const walker = document.createTreeWalker(this.element, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        if (!node.textContent?.trim()) {
          return NodeFilter.FILTER_REJECT;
        }

        const parent = node.parentElement;

        if (
          !parent ||
          parent.closest('svg') ||
          parent.closest(`.${CHARACTER_CLASS}`) ||
          parent.closest('[class*="icon"]')
        ) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const textNodes: Text[] = [];

    while (walker.nextNode()) {
      textNodes.push(walker.currentNode as Text);
    }

    textNodes.forEach((textNode) => {
      const fragment = document.createDocumentFragment();

      [...(textNode.textContent || '')].forEach((character) => {
        const span = document.createElement('span');
        span.className = CHARACTER_CLASS;
        span.textContent = character;

        if (character === ' ') {
          span.style.whiteSpace = 'pre';
        }

        fragment.appendChild(span);
      });

      textNode.replaceWith(fragment);
    });

    this.chars = [...this.element.querySelectorAll<HTMLElement>(`.${CHARACTER_CLASS}`)];
  }

  private showRestingState() {
    gsap.killTweensOf(this.chars);
    gsap.set(this.element, { opacity: 1 });
    gsap.set(this.iconWrapper, { opacity: this.restingOpacity });
    gsap.set(this.chars, { color: this.restingColor, opacity: this.restingOpacity });
  }

  enable() {
    if (this.enabled || !this.chars.length || reducedMotionEnabled()) {
      this.showRestingState();
      return;
    }

    this.showRestingState();
    this.element.style.transition = 'none';
    this.element.addEventListener('mouseenter', this.handleMouseEnter);
    this.element.addEventListener('mouseleave', this.handleMouseLeave);
    this.enabled = true;
  }

  disable() {
    this.element.removeEventListener('mouseenter', this.handleMouseEnter);
    this.element.removeEventListener('mouseleave', this.handleMouseLeave);
    this.enabled = false;
    this.showRestingState();
  }

  setTimingScale(scale: number) {
    this.timingScale = scale;
    this.showRestingState();
  }
}

class MCFooterLinkSweepController implements MCController {
  instances: MCFooterLinkSweep[];
  settings = { duration: DEFAULT_SWEEP_DURATION };

  constructor(instances: MCFooterLinkSweep[]) {
    this.instances = instances;
  }

  get(key: string) {
    if (key === 'duration') return this.settings.duration;
  }

  set(key: string, value: unknown) {
    if (key !== 'duration') return;

    const duration = Number(value);

    if (!Number.isFinite(duration)) return;

    this.settings.duration = Math.max(0.01, duration);
    const scale = this.settings.duration / DEFAULT_SWEEP_DURATION;

    this.instances.forEach((instance) => instance.setTimingScale(scale));
  }
}

export const initMCFooterLinkSweep = () => {
  const initialise = () => {
    const mc = ensureMC();
    const links = [...document.querySelectorAll<HTMLElement>(LINK_SELECTOR)];

    mc.footerLinkSweep = links.map((element) => {
      if (element.__mcFooterLinkSweep) {
        return element.__mcFooterLinkSweep;
      }

      const instance = new MCFooterLinkSweep(element);
      element.__mcFooterLinkSweep = instance;
      return instance;
    });
    const controller = new MCFooterLinkSweepController(mc.footerLinkSweep);

    mc.footerLinkSweepController = controller;

    mc.footerLinkSweep.forEach((instance) => {
      if (reducedMotionEnabled()) {
        instance.disable();
        return;
      }

      instance.enable();
    });

    registerDebug({
      id: 'footer-link-sweep',
      label: 'Footer Link Sweep',
      instances: () => {
        const { footerLinkSweep, footerLinkSweepController } = ensureMC();

        return footerLinkSweepController && footerLinkSweep?.length
          ? [footerLinkSweepController]
          : [];
      },
      orderElement: () => ensureMC().footerLinkSweep?.[0]?.element || null,
      instanceLabel: 'All Footer Links',
      stats: [{ label: 'Links', value: () => ensureMC().footerLinkSweep?.length || 0 }],
      controls: [
        {
          type: 'range',
          key: 'duration',
          label: 'Sweep Duration',
          description: 'Scales the entire hover sweep while preserving its timing relationship.',
          min: 0.1,
          max: 0.8,
          step: 0.01,
          suffix: 's',
          decimals: 2,
          event: 'change',
        },
      ],
    });

    window.addEventListener('mcMotionPreferenceChange', () => {
      ensureMC().footerLinkSweep?.forEach((instance) => {
        if (reducedMotionEnabled()) {
          instance.disable();
          return;
        }

        instance.enable();
      });
    });

    logger.info(`Initialised ${links.length} link(s).`);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
    return;
  }

  initialise();
};
