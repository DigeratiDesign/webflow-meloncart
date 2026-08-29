import { gsap, requestScrollTriggerRefresh, SplitText } from '../../digerati/core/gsap';
import { createLogger, isMCDebugEnabled } from '../../digerati/core/logger';
import type { MCController, MCDebugSchema, MCNamespace } from '../../digerati/core/types';

const SEQUENCE_SELECTOR = '[mc-hero-sequence]';
const OWNER_VALUE = 'hero-sequence';
const logger = createLogger('melon', 'hero-sequence', { debug: isMCDebugEnabled });
let effectEnabled = true;
let effectListenerRegistered = false;
const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
const HERO_SETTING_ATTRIBUTES = {
  eyebrowStart: 'mc-hero-eyebrow-start',
  headingStart: 'mc-hero-heading-start',
  visualStart: 'mc-hero-visual-start',
  imageScrollDistance: 'mc-hero-image-scroll-distance',
  underlineStart: 'mc-hero-underline-start',
  underlineDurationOffset: 'mc-hero-underline-duration-offset',
  copyStart: 'mc-hero-copy-start',
  bodyStagger: 'mc-hero-body-stagger',
  cardsStart: 'mc-hero-cards-start',
  cardsDuration: 'mc-hero-cards-duration',
  cardsStagger: 'mc-hero-cards-stagger',
  cardsY: 'mc-hero-cards-y',
  ctaStart: 'mc-hero-cta-start',
  footnoteStart: 'mc-hero-footnote-start',
} as const;

type MCDepthController = MCController & {
  image: HTMLImageElement;
  effectLoaded: boolean;
  ready: boolean;
  prepare: () => Promise<void>;
  resetForParent: () => void;
  showStaticImage: () => void;
};

type MCColourRevealController = MCController & {
  component: HTMLElement;
  createTimeline: (options?: { onTimelineRebuilt?: (timeline: GSAPTimeline) => void }) => Promise<{
    timeline: GSAPTimeline | null;
    lastLineStart: number;
    lastLineDuration: number;
  }>;
  showFinal: () => void;
};

type MCUnderlineController = MCController & {
  createTimeline: (options: {
    attachScrollTrigger: boolean;
    paused: boolean;
    duration?: number;
  }) => GSAPTimeline;
  showFinal: () => void;
};

type MCRewardController = MCController & {
  readonly entranceDuration: number;
  prepare: () => void;
  play: () => void;
  startScrollParallax: () => void;
  showFinal: () => void;
};

type MCParallaxController = MCController & {
  prepare: () => void;
  playIntro: () => void;
  showFinal: () => void;
};

type MCDepthElement = HTMLImageElement & {
  __mcDepthReveal?: MCDepthController;
};

type MCColourRevealElement = HTMLElement & {
  __mcColourReveal?: MCColourRevealController;
};

type MCUnderlineElement = HTMLElement & {
  __mcUnderline?: MCUnderlineController;
};

type MCRewardElement = HTMLElement & {
  __mcReward?: MCRewardController;
};

type MCParallaxElement = HTMLElement & {
  __mcParallax?: MCParallaxController;
};

type MCPreloaderAPI = {
  readonly active: boolean;
  heroReady: (play?: () => void) => void;
};

type MCHeroNamespace = MCNamespace & {
  heroSequences?: MCHeroSequence[];
  depth?: MCDepthController[];
  colourReveal?: MCColourRevealController[];
  preloader?: MCPreloaderAPI;
};

type TimelineCueKey =
  | 'underlineStart'
  | 'visualStart'
  | 'copyStart'
  | 'cardsStart'
  | 'ctaStart'
  | 'footnoteStart';

const ensureMC = (): MCHeroNamespace => {
  window.MC ||= {};
  return window.MC as MCHeroNamespace;
};

const reducedMotionEnabled = () => window.MC?.motion?.reduced ?? false;
const isEffectEnabled = (id: string) => window.MC?.debug?.isEffectEnabled(id) ?? true;

const numberAttribute = (element: HTMLElement, name: string, fallback: number) => {
  const value = Number.parseFloat(element.getAttribute(name) ?? '');

  return Number.isFinite(value) ? value : fallback;
};

const optionalNumberAttribute = (element: HTMLElement, name: string) => {
  const value = Number.parseFloat(element.getAttribute(name) ?? '');

  return Number.isFinite(value) ? value : null;
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

/** Claims generic child ownership before standalone effect modules initialise. */
export const claimMCHeroSequenceOwnership = () => {
  let claimed = 0;

  document.querySelectorAll<HTMLElement>(SEQUENCE_SELECTOR).forEach((sequence) => {
    sequence
      .querySelectorAll<HTMLElement>(
        'img[mc-depth-reveal], [mc-colour-reveal], [mc-underline], [mc-reward="scene"], [mc-parallax="scene"]'
      )
      .forEach((child) => {
        if (
          child.closest(SEQUENCE_SELECTOR) !== sequence ||
          child.hasAttribute('mc-animation-owner')
        ) {
          return;
        }

        child.setAttribute('mc-animation-owner', OWNER_VALUE);
        claimed += 1;
      });
  });

  logger.debug('Claimed child ownership', { claimed });
};

class MCHeroSequence implements MCController {
  element: HTMLElement;
  index: number;
  settings = {
    eyebrowStart: 0.25,
    headingStart: 0.45,
    underlineStart: null as number | null,
    visualStart: null as number | null,
    copyStart: null as number | null,
    ctaStart: null as number | null,
    footnoteStart: null as number | null,
    bodyDuration: 0.28,
    bodyStagger: 0.08,
    cardsStart: null as number | null,
    cardsDuration: 0.5,
    cardsStagger: 0.12,
    cardsY: 24,
    underlineDurationOffset: 0.12,
    imageScrollDistance: 50,
  };
  timeline: GSAPTimeline | null = null;
  imageScrollTween: gsap.core.Tween | null = null;
  bodySplit: InstanceType<typeof SplitText> | null = null;
  rebuildFrame: number | null = null;
  initialising = false;
  hasStartedPlayback = false;

  constructor(element: HTMLElement, index: number) {
    this.element = element;
    this.index = index;
    this.settings.eyebrowStart = numberAttribute(
      element,
      HERO_SETTING_ATTRIBUTES.eyebrowStart,
      this.settings.eyebrowStart
    );
    this.settings.headingStart = numberAttribute(
      element,
      HERO_SETTING_ATTRIBUTES.headingStart,
      this.settings.headingStart
    );
    this.settings.visualStart = optionalNumberAttribute(
      element,
      HERO_SETTING_ATTRIBUTES.visualStart
    );
    this.settings.imageScrollDistance = numberAttribute(
      element,
      HERO_SETTING_ATTRIBUTES.imageScrollDistance,
      this.settings.imageScrollDistance
    );
    this.settings.underlineStart = optionalNumberAttribute(
      element,
      HERO_SETTING_ATTRIBUTES.underlineStart
    );
    this.settings.underlineDurationOffset = numberAttribute(
      element,
      HERO_SETTING_ATTRIBUTES.underlineDurationOffset,
      this.settings.underlineDurationOffset
    );
    this.settings.copyStart = optionalNumberAttribute(element, HERO_SETTING_ATTRIBUTES.copyStart);
    this.settings.bodyStagger = numberAttribute(
      element,
      HERO_SETTING_ATTRIBUTES.bodyStagger,
      this.settings.bodyStagger
    );
    this.settings.cardsStart = optionalNumberAttribute(element, HERO_SETTING_ATTRIBUTES.cardsStart);
    this.settings.cardsDuration = numberAttribute(
      element,
      HERO_SETTING_ATTRIBUTES.cardsDuration,
      this.settings.cardsDuration
    );
    this.settings.cardsStagger = numberAttribute(
      element,
      HERO_SETTING_ATTRIBUTES.cardsStagger,
      this.settings.cardsStagger
    );
    this.settings.cardsY = numberAttribute(
      element,
      HERO_SETTING_ATTRIBUTES.cardsY,
      this.settings.cardsY
    );
    this.settings.ctaStart = optionalNumberAttribute(element, HERO_SETTING_ATTRIBUTES.ctaStart);
    this.settings.footnoteStart = optionalNumberAttribute(
      element,
      HERO_SETTING_ATTRIBUTES.footnoteStart
    );
  }

  get(key: string) {
    if (key === 'eyebrowStart' && !this.child<HTMLElement>('[mc-hero-eyebrow]')) {
      return null;
    }

    if (key === 'headingStart' && !this.colourReveal) {
      return null;
    }

    if (key === 'copyStart' && !this.child<HTMLElement>('[mc-hero-body]')) {
      return null;
    }

    if (
      (key === 'cardsStart' ||
        key === 'cardsDuration' ||
        key === 'cardsStagger' ||
        key === 'cardsY') &&
      !this.cards.length
    ) {
      return null;
    }

    if (
      key === 'visualStart' &&
      !this.depth &&
      !this.reward &&
      !this.parallax &&
      !this.child<HTMLElement>('[mc-hero-image]')
    ) {
      return null;
    }

    if (key === 'imageScrollDistance' && !this.child<HTMLElement>('[mc-hero-image]')) {
      return null;
    }

    if (key === 'footnoteStart' && !this.child<HTMLElement>('[mc-hero-footnote]')) {
      return null;
    }

    if (key === 'ctaStart' && !this.child<HTMLElement>('[mc-hero-cta]')) {
      return null;
    }

    return this.settings[key as keyof typeof this.settings];
  }

  set(key: string, value: unknown) {
    if (!(key in this.settings)) return;

    const number = Number(value);
    if (!Number.isFinite(number)) return;

    (this.settings as Record<string, number | null>)[key] = Math.max(0, number);
    const attribute = HERO_SETTING_ATTRIBUTES[key as keyof typeof HERO_SETTING_ATTRIBUTES];

    if (attribute) {
      this.element.setAttribute(attribute, String(Math.max(0, number)));
    }
    void this.rebuild(true);
  }

  private resolveCue(key: TimelineCueKey, fallback: number) {
    const current = this.settings[key];

    if (current !== null) {
      return current;
    }

    const resolved = Math.max(0, fallback);
    this.settings[key] = resolved;
    return resolved;
  }

  private child<T extends HTMLElement>(selector: string): T | null {
    const candidate = this.element.querySelector<T>(selector);
    return candidate?.closest<HTMLElement>(SEQUENCE_SELECTOR) === this.element ? candidate : null;
  }

  private get depth(): MCDepthController | null {
    if (!isEffectEnabled('depth')) return null;
    return (
      (this.child<HTMLImageElement>('img[mc-depth-reveal]') as MCDepthElement | null)
        ?.__mcDepthReveal || null
    );
  }

  private get colourReveal(): MCColourRevealController | null {
    if (!isEffectEnabled('colourReveal')) return null;
    return (
      (this.child<HTMLElement>('[mc-colour-reveal]') as MCColourRevealElement | null)
        ?.__mcColourReveal || null
    );
  }

  private get underline() {
    return (
      (this.child<HTMLElement>('[mc-underline]') as MCUnderlineElement | null)?.__mcUnderline ||
      null
    );
  }

  private get reward() {
    return (
      (this.child<MCRewardElement>('[mc-reward="scene"]') as MCRewardElement | null)?.__mcReward ||
      null
    );
  }

  private get parallax() {
    return (
      (this.child<MCParallaxElement>('[mc-parallax="scene"]') as MCParallaxElement | null)
        ?.__mcParallax || null
    );
  }

  private get cards() {
    const container = this.child<HTMLElement>('[mc-hero-cards]');

    if (!container) {
      return [];
    }

    return [...container.querySelectorAll<HTMLElement>('[mc-hero-card]')].filter(
      (card) => card.closest<HTMLElement>(SEQUENCE_SELECTOR) === this.element
    );
  }

  private killTimeline() {
    this.timeline?.kill();
    this.timeline = null;
    this.imageScrollTween?.scrollTrigger?.kill();
    this.imageScrollTween?.kill();
    this.imageScrollTween = null;
    this.bodySplit?.revert();
    this.bodySplit = null;
  }

  private createImageScrollMotion(image: HTMLElement) {
    this.imageScrollTween?.scrollTrigger?.kill();
    this.imageScrollTween?.kill();

    this.imageScrollTween = gsap.to(image, {
      x: -this.settings.imageScrollDistance,
      ease: 'none',
      scrollTrigger: {
        trigger: this.element,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    logger.debug('Hero image scroll motion created', {
      sequence: this.index + 1,
      image,
    });
  }

  showFinal() {
    this.killTimeline();
    this.depth?.showStaticImage();
    this.colourReveal?.showFinal();
    this.underline?.showFinal();
    this.reward?.showFinal();
    this.parallax?.showFinal();

    const { cards } = this;

    const finalElements = [
      this.child<HTMLElement>('[mc-hero-eyebrow]'),
      this.child<HTMLElement>('[mc-hero-body]'),
      this.child<HTMLElement>('[mc-hero-cta]'),
      this.child<HTMLElement>('[mc-hero-footnote]'),
      this.child<HTMLElement>('[mc-hero-image]'),
      ...cards,
    ].filter(Boolean);

    gsap.set(finalElements, { autoAlpha: 1, clearProps: 'transform' });
  }

  releaseChildren() {
    this.element
      .querySelectorAll<HTMLElement>('[mc-animation-owner="hero-sequence"]')
      .forEach((child) => child.removeAttribute('mc-animation-owner'));

    void (this.child<HTMLImageElement>('img[mc-depth-reveal]') as MCDepthElement | null)
      ?.__mcDepthReveal?.init();
    void (this.child<HTMLElement>('[mc-colour-reveal]') as MCColourRevealElement | null)
      ?.__mcColourReveal?.init();
    (this.child<HTMLElement>('[mc-parallax="scene"]') as MCParallaxElement | null)
      ?.__mcParallax?.init();
  }

  async rebuild(playImmediately = false) {
    if (this.initialising) return;
    this.initialising = true;
    this.killTimeline();

    logger.debug('Building sequence', {
      sequence: this.index + 1,
      playImmediately,
      reducedMotion: reducedMotionEnabled(),
    });

    if (reducedMotionEnabled()) {
      this.showFinal();
      if (playImmediately && ensureMC().preloader?.active) {
        ensureMC().preloader?.heroReady();
      }
      this.initialising = false;
      return;
    }

    const eyebrow = this.child<HTMLElement>('[mc-hero-eyebrow]');
    const body = this.child<HTMLElement>('[mc-hero-body]');
    const cta = this.child<HTMLElement>('[mc-hero-cta]');
    const footnote = this.child<HTMLElement>('[mc-hero-footnote]');
    const image = this.child<HTMLElement>('[mc-hero-image]');
    const { cards } = this;

    logger.debug('Resolved hero content elements', {
      sequence: this.index + 1,
      eyebrow: Boolean(eyebrow),
      body: Boolean(body),
      cta: Boolean(cta),
      footnote: Boolean(footnote),
      image: Boolean(image),
      cards: cards.length,
    });

    if (this.child<HTMLElement>('[mc-reward="scene"]') && !this.reward) {
      await nextFrame();
      await nextFrame();
    }

    const [depth, colourReveal, underline, reward, parallax] = [
      this.depth,
      this.colourReveal,
      this.underline,
      this.reward,
      this.parallax,
    ];
    logger.debug('Resolved child controllers', {
      sequence: this.index + 1,
      depth: Boolean(depth),
      colourReveal: Boolean(colourReveal),
      underline: Boolean(underline),
      reward: Boolean(reward),
      parallax: Boolean(parallax),
    });
    await depth?.prepare();
    depth?.resetForParent();
    reward?.prepare();
    parallax?.prepare();
    logger.debug('Depth preparation complete', {
      sequence: this.index + 1,
      effectLoaded: depth?.effectLoaded,
      ready: depth?.ready,
    });
    const timeline = gsap.timeline({ paused: true });
    this.timeline = timeline;
    let headingTimeline: GSAPTimeline | null | undefined;
    let headingLastLineStart = 0;
    let headingLastLineDuration = 0;

    try {
      const heading = await colourReveal?.createTimeline({
        onTimelineRebuilt: (rebuiltTimeline) => {
          timeline.add(
            rebuiltTimeline as unknown as gsap.core.Animation,
            this.settings.headingStart
          );
          rebuiltTimeline.paused(false);
        },
      });
      headingTimeline = heading?.timeline;
      headingLastLineStart = heading?.lastLineStart || 0;
      headingLastLineDuration = heading?.lastLineDuration || 0;
      logger.debug('Heading timeline prepared', {
        sequence: this.index + 1,
        timeline: Boolean(headingTimeline),
        lastLineStart: headingLastLineStart,
        lastLineDuration: headingLastLineDuration,
      });
    } catch (error) {
      logger.error('Heading Colour Reveal could not be prepared:', error);
    }

    if (reducedMotionEnabled()) {
      this.showFinal();
      if (playImmediately && ensureMC().preloader?.active) {
        ensureMC().preloader?.heroReady();
      }
      this.initialising = false;
      return;
    }

    if (eyebrow) {
      timeline.fromTo(
        eyebrow,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.22, ease: 'power1.out' },
        this.settings.eyebrowStart
      );
    }

    if (headingTimeline && colourReveal) {
      timeline.set(colourReveal.component, { autoAlpha: 1 }, this.settings.headingStart);
    }

    const underlineTimeline = underline?.createTimeline({
      attachScrollTrigger: false,
      paused: true,
      duration: headingLastLineDuration
        ? headingLastLineDuration + this.settings.underlineDurationOffset
        : undefined,
    });
    const underlinePosition = this.resolveCue(
      'underlineStart',
      this.settings.headingStart + headingLastLineStart
    );
    const visualPosition = this.resolveCue(
      'visualStart',
      this.settings.headingStart + headingLastLineStart
    );

    timeline.call(() => void depth?.replay?.(), [], visualPosition);
    timeline.call(() => reward?.play(), [], visualPosition);
    timeline.call(
      () => reward?.startScrollParallax(),
      [],
      visualPosition + (reward?.entranceDuration || 0)
    );
    timeline.call(() => parallax?.playIntro(), [], visualPosition);

    if (image) {
      timeline.fromTo(
        image,
        { autoAlpha: 0, x: 48 },
        { autoAlpha: 1, x: 0, duration: 0.6, ease: 'power3.out' },
        visualPosition
      );
    }

    if (underlineTimeline) {
      timeline.add(underlineTimeline as unknown as gsap.core.Animation, underlinePosition);
      underlineTimeline.paused(false);
    }

    const bodyPosition = this.resolveCue(
      'copyStart',
      underlineTimeline
        ? underlinePosition + underlineTimeline.duration() + 0.1
        : this.settings.headingStart + 0.1
    );

    let bodyLineCount = 0;

    if (body) {
      try {
        this.bodySplit = SplitText.create(body, {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          onSplit: (split) => {
            bodyLineCount = split.lines.length;
            const bodyTimeline = gsap.timeline();

            bodyTimeline.set(body, { autoAlpha: 1 });
            bodyTimeline.fromTo(
              split.lines,
              { autoAlpha: 0, y: 12 },
              {
                autoAlpha: 1,
                y: 0,
                duration: this.settings.bodyDuration,
                stagger: this.settings.bodyStagger,
                ease: 'power1.out',
              }
            );
            timeline.add(bodyTimeline, bodyPosition);

            logger.debug('Body lines prepared', {
              sequence: this.index + 1,
              lines: bodyLineCount,
            });

            return bodyTimeline;
          },
        });
      } catch (error) {
        // A non-text body should not prevent later hero elements from animating.
        this.bodySplit = null;
        timeline.fromTo(
          body,
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: this.settings.bodyDuration, ease: 'power1.out' },
          bodyPosition
        );
        logger.error('Body line split failed; using the body fade fallback.', {
          sequence: this.index + 1,
          error,
        });
      }
    }

    logger.debug('Hero content animation scheduled', {
      sequence: this.index + 1,
      body: Boolean(body),
      bodyLines: bodyLineCount,
      bodyPosition,
      cta: Boolean(cta),
    });

    if (cards.length) {
      const bodyEnd =
        bodyPosition +
        this.settings.bodyDuration +
        Math.max(0, bodyLineCount - 1) * this.settings.bodyStagger;
      const cardsPosition = this.resolveCue('cardsStart', bodyEnd + 0.2);

      timeline.fromTo(
        cards,
        { autoAlpha: 0, y: this.settings.cardsY },
        {
          autoAlpha: 1,
          y: 0,
          duration: this.settings.cardsDuration,
          stagger: this.settings.cardsStagger,
          ease: 'power1.out',
        },
        cardsPosition
      );
    }

    const ctaPosition = this.resolveCue('ctaStart', bodyPosition + 0.12);
    if (cta) {
      timeline.fromTo(
        cta,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.28, ease: 'power1.out' },
        ctaPosition
      );
    }

    if (footnote) {
      timeline.fromTo(
        footnote,
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.24, ease: 'power1.out' },
        this.resolveCue('footnoteStart', ctaPosition + 0.1)
      );
    }

    // Commit every entrance's first frame before the preloader reveals the Hero.
    headingTimeline?.totalTime(0, true);
    gsap.set(
      [eyebrow, colourReveal?.component, body, cta, footnote, image, ...cards].filter(Boolean),
      { autoAlpha: 0 }
    );
    if (!bodyLineCount && body) {
      gsap.set(body, { autoAlpha: 0, y: 12 });
    }
    if (cards.length) {
      gsap.set(cards, { autoAlpha: 0, y: this.settings.cardsY });
    }
    timeline.totalTime(0, true);

    this.initialising = false;
    requestScrollTriggerRefresh();
    window.MC?.debug?.refresh();
    logger.debug('Sequence timeline built', {
      sequence: this.index + 1,
      duration: timeline.duration(),
    });

    const playSequence = () => {
      if (this.timeline !== timeline || reducedMotionEnabled()) {
        return;
      }

      timeline.play(0);
      this.hasStartedPlayback = true;
      logger.debug('Sequence playback started', { sequence: this.index + 1 });
    };

    if (playImmediately) {
      const { preloader } = ensureMC();

      if (preloader?.active) {
        preloader.heroReady(playSequence);
        logger.debug('Sequence playback waiting for preloader dismissal', {
          sequence: this.index + 1,
        });
      } else {
        playSequence();
      }
    }

    if (image) {
      timeline.eventCallback('onComplete', () => this.createImageScrollMotion(image));
    }
  }

  replay() {
    void this.rebuild(true);
  }

  scheduleRebuild = () => {
    if (this.hasStartedPlayback) {
      logger.debug('Skipping resize rebuild after sequence playback has started', {
        sequence: this.index + 1,
      });
      return;
    }

    if (this.rebuildFrame !== null) {
      cancelAnimationFrame(this.rebuildFrame);
    }

    this.rebuildFrame = requestAnimationFrame(() => {
      this.rebuildFrame = null;
      void this.rebuild(true);
    });
  };

  async init() {
    if (!effectEnabled) {
      this.showFinal();
      return;
    }
    await this.rebuild(true);
  }
}

export const initMCHeroSequence = () => {
  const initialise = () => {
    const mc = ensureMC();
    const elements = [...document.querySelectorAll<HTMLElement>(SEQUENCE_SELECTOR)];
    const sequences = elements.map((element, index) => new MCHeroSequence(element, index));
    mc.heroSequences = sequences;
    logger.debug('Found hero sequences', { count: sequences.length, elements });

    registerDebug({
      id: 'hero-sequences',
      label: 'Hero Sequence',
      effect: {
        enabled: () => effectEnabled,
        setEnabled(enabled) {
          effectEnabled = enabled;
          (ensureMC().heroSequences || []).forEach((sequence) => {
            if (!enabled) {
              sequence.showFinal();
              sequence.releaseChildren();
            } else {
              claimMCHeroSequenceOwnership();
              void sequence.init();
            }
          });
        },
      },
      order: -1,
      instances: () => ensureMC().heroSequences || [],
      orderElement: () => ensureMC().heroSequences?.[0]?.element || null,
      instanceLabel: (_instance, index, total) => (total > 1 ? `Hero ${index + 1}` : 'Hero'),
      controls: [
        {
          type: 'range',
          key: 'eyebrowStart',
          label: 'Eyebrow Start',
          description: 'Starts the eyebrow fade at this time from the beginning of the Hero.',
          min: 0,
          max: 4,
          step: 0.05,
          suffix: 's',
          event: 'change',
        },
        {
          type: 'range',
          key: 'headingStart',
          label: 'Heading Start',
          description:
            'Starts the heading Colour Reveal at this time from the beginning of the Hero.',
          min: 0,
          max: 4,
          step: 0.05,
          suffix: 's',
          event: 'change',
        },
        {
          type: 'range',
          key: 'visualStart',
          label: 'Visual Start',
          description:
            'Starts the Hero Depth Reveal, Reward entrance, or image entrance at this time from the beginning of the Hero.',
          min: 0,
          max: 4,
          step: 0.05,
          suffix: 's',
          event: 'change',
        },
        {
          type: 'range',
          key: 'imageScrollDistance',
          label: 'Image Scroll Distance',
          description:
            'Sets how far the workflow Hero image moves left while the Hero scrolls out.',
          min: 0,
          max: 160,
          step: 1,
          suffix: 'px',
          event: 'change',
        },
        {
          type: 'range',
          key: 'underlineStart',
          label: 'Underline Start',
          description:
            'Starts the Hero underline wipe at this time from the beginning of the Hero.',
          min: 0,
          max: 4,
          step: 0.05,
          suffix: 's',
          event: 'change',
        },
        {
          type: 'range',
          key: 'underlineDurationOffset',
          label: 'Underline Extend',
          description: 'Extends the Hero underline beyond the final heading line reveal duration.',
          min: 0,
          max: 1,
          step: 0.01,
          suffix: 's',
          event: 'change',
        },
        {
          type: 'range',
          key: 'copyStart',
          label: 'Body Copy Start',
          description: 'Starts the body-copy entrance at this time from the beginning of the Hero.',
          min: 0,
          max: 4,
          step: 0.05,
          suffix: 's',
          event: 'change',
        },
        {
          type: 'range',
          key: 'bodyStagger',
          label: 'Body Copy Line Stagger',
          description: 'Sets the delay between each body-copy line appearing.',
          min: 0,
          max: 0.5,
          step: 0.01,
          suffix: 's',
          event: 'change',
        },
        {
          type: 'range',
          key: 'cardsStart',
          label: 'Cards Start',
          description: 'Starts the Hero information-card entrance at this time.',
          min: 0,
          max: 4,
          step: 0.05,
          suffix: 's',
          event: 'change',
        },
        {
          type: 'range',
          key: 'cardsDuration',
          label: 'Cards Duration',
          description: 'Sets the entrance duration for each Hero information card.',
          min: 0.1,
          max: 2,
          step: 0.05,
          suffix: 's',
          event: 'change',
        },
        {
          type: 'range',
          key: 'cardsStagger',
          label: 'Cards Stagger',
          description: 'Sets the delay between Hero information-card entrances.',
          min: 0,
          max: 1,
          step: 0.01,
          suffix: 's',
          event: 'change',
        },
        {
          type: 'range',
          key: 'cardsY',
          label: 'Cards Rise',
          description: 'Sets how far below their final position Hero cards begin.',
          min: 0,
          max: 80,
          step: 1,
          suffix: 'px',
          event: 'change',
        },
        {
          type: 'range',
          key: 'ctaStart',
          label: 'CTA Start',
          description:
            'Starts the Hero call-to-action entrance at this time from the beginning of the Hero.',
          min: 0,
          max: 4,
          step: 0.05,
          suffix: 's',
          event: 'change',
        },
        {
          type: 'range',
          key: 'footnoteStart',
          label: 'Footnote Start',
          description:
            'Starts the Hero footnote entrance at this time from the beginning of the Hero.',
          min: 0,
          max: 4,
          step: 0.05,
          suffix: 's',
          event: 'change',
        },
        { type: 'button', label: 'Replay', action: 'replay' },
      ],
    });

    sequences.forEach((sequence) => void sequence.init());
    window.addEventListener('mcMotionPreferenceChange', () => {
      sequences.forEach((sequence) => void sequence.rebuild(!reducedMotionEnabled()));
    });
    window.addEventListener('mcRewardSettingsChange', () => {
      sequences.forEach((sequence) => void sequence.rebuild(true));
    });
    window.addEventListener('mcParallaxSettingsChange', () => {
      sequences.forEach((sequence) => void sequence.rebuild(true));
    });
    window.addEventListener(
      'resize',
      () => sequences.forEach((sequence) => sequence.scheduleRebuild()),
      {
        passive: true,
      }
    );

    logger.info(`Initialised ${sequences.length} sequence(s).`);
  };

  if (!effectListenerRegistered) {
    effectListenerRegistered = true;
    window.addEventListener('mcEffectEnabledChange', () => {
      if (effectEnabled) {
        ensureMC().heroSequences?.forEach((sequence) => void sequence.init());
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
    return;
  }

  initialise();
};
