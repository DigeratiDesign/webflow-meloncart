import { gsap } from '../../digerati/core/gsap';
import { createLogger, isMCDebugEnabled } from '../../digerati/core/logger';
import type { MCController, MCDebugSchema, MCNamespace } from '../../digerati/core/types';

const SCENE_SELECTOR = '[mc-reward="scene"]';
const SHAPE_SELECTOR = '[mc-reward="shape"]';
const EDGE_PADDING = 100;
const ENTER_DURATION = 1.15;
const ENTER_STAGGER = 0.085;
const ROTATION_MIN = 300;
const ROTATION_MAX = 540;
const DEFAULT_ROTATION_AMOUNT = 0.45;
const INITIAL_SCALE = 0.94;
const DEFAULT_SCROLL_DISTANCE = 110;
const logger = createLogger('melon', 'reward', { debug: isMCDebugEnabled });

type RewardDirection = 'left' | 'right' | 'top' | 'bottom';

type RewardShape = {
  element: HTMLElement;
  index: number;
  depth: number;
};

type MCRewardNamespace = MCNamespace & {
  reward?: MCRewardScene[];
  rewardController?: MCRewardController;
};

declare global {
  interface HTMLElement {
    __mcReward?: MCRewardScene;
  }
}

const ensureMC = (): MCRewardNamespace => {
  window.MC ||= {};

  return window.MC as MCRewardNamespace;
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

class MCRewardScene {
  element: HTMLElement;
  shapes: RewardShape[] = [];
  timeline: GSAPTimeline | null = null;
  rotationAmount = DEFAULT_ROTATION_AMOUNT;
  scrollFrame: number | null = null;
  scrollParallaxStarted = false;
  scrollParallaxStartY = 0;

  constructor(element: HTMLElement) {
    this.element = element;
    this.hydrateShapes();
  }

  get parentOwned() {
    return this.element.hasAttribute('mc-animation-owner');
  }

  get scrollParallaxEnabled() {
    const settingElement = this.element.closest<HTMLElement>('[mc-reward-scroll-parallax]');
    const setting = settingElement?.getAttribute('mc-reward-scroll-parallax');

    if (setting === 'off') {
      return false;
    }

    return setting !== undefined;
  }

  private readonly handleScroll = () => {
    if (this.scrollFrame !== null) {
      return;
    }

    this.scrollFrame = requestAnimationFrame(() => {
      this.scrollFrame = null;
      this.applyScrollParallax();
    });
  };

  private hydrateShapes() {
    this.shapes = [...this.element.querySelectorAll<HTMLElement>(SHAPE_SELECTOR)].map(
      (element, index) => ({
        element,
        index,
        depth: gsap.utils.clamp(
          0,
          1,
          Number.parseFloat(element.getAttribute('mc-reward-depth') ?? '') || 0
        ),
      })
    );
  }

  private applyScrollParallax() {
    if (!this.scrollParallaxEnabled || !this.shapes.length) {
      return;
    }

    const viewportHeight = window.innerHeight;

    if (!viewportHeight) {
      return;
    }

    const distanceScrolled = Math.max(0, window.scrollY - this.scrollParallaxStartY);
    const offset = gsap.utils.clamp(0, 1, distanceScrolled / viewportHeight);
    const distance = Math.max(
      0,
      Number.parseFloat(this.element.getAttribute('mc-reward-scroll-distance') ?? '') ||
        DEFAULT_SCROLL_DISTANCE
    );

    this.shapes.forEach((shape) => {
      gsap.set(shape.element, { y: -offset * distance * shape.depth });
    });
  }

  get entranceDuration() {
    if (!this.shapes.length) {
      return 0;
    }

    const lastIndex = this.shapes.length - 1;

    return 0.08 + lastIndex * ENTER_STAGGER + ENTER_DURATION + (lastIndex % 3) * 0.05;
  }

  startScrollParallax() {
    // Reward scenes intentionally never use scroll parallax.
  }

  private directionFor(shape: HTMLElement): RewardDirection {
    const direction = shape.getAttribute('mc-reward-from');

    if (direction === 'right' || direction === 'top' || direction === 'bottom') {
      return direction;
    }

    return 'left';
  }

  private getOffscreenTransform(shape: HTMLElement, from: RewardDirection) {
    const sceneRect = this.element.getBoundingClientRect();
    const shapeRect = shape.getBoundingClientRect();
    let x = 0;
    let y = 0;

    if (from === 'left') x = sceneRect.left - shapeRect.right - EDGE_PADDING;
    if (from === 'right') x = sceneRect.right - shapeRect.left + EDGE_PADDING;
    if (from === 'top') y = sceneRect.top - shapeRect.bottom - EDGE_PADDING;
    if (from === 'bottom') y = sceneRect.bottom - shapeRect.top + EDGE_PADDING;

    return { x, y };
  }

  private getRotation(shape: HTMLElement, index: number, from: RewardDirection) {
    const amount = ROTATION_MIN + ((index % 4) / 3) * (ROTATION_MAX - ROTATION_MIN);
    const heroMultiplier = shape.getAttribute('mc-reward-spin') === 'hero' ? 1.35 : 1;
    let direction = 1;

    if (from === 'left') direction = -1;
    if (from === 'top') direction = index % 2 === 0 ? -1 : 1;
    if (from === 'bottom') direction = index % 2 === 0 ? 1 : -1;

    return amount * direction * this.rotationAmount * heroMultiplier;
  }

  private showStatic() {
    gsap.set(
      this.shapes.map(({ element }) => element),
      { x: 0, y: 0, rotation: 0, opacity: 1 }
    );
  }

  destroy() {
    this.timeline?.kill();
    this.timeline = null;
    window.removeEventListener('scroll', this.handleScroll);
    if (this.scrollFrame !== null) {
      cancelAnimationFrame(this.scrollFrame);
      this.scrollFrame = null;
    }
    this.scrollParallaxStarted = false;
    this.scrollParallaxStartY = 0;
    gsap.killTweensOf(this.shapes.map(({ element }) => element));
  }

  prepare() {
    this.destroy();
    this.hydrateShapes();

    if (!this.shapes.length) {
      logger.debug('Skipping scene with no shapes', { element: this.element });
      return;
    }

    if (reducedMotionEnabled()) {
      this.showStatic();
      return;
    }

    gsap.set(
      this.shapes.map(({ element }) => element),
      {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        autoAlpha: 0,
        transformOrigin: '50% 50%',
      }
    );
  }

  play() {
    if (reducedMotionEnabled() || !this.shapes.length) {
      return;
    }

    this.timeline = gsap.timeline({ delay: 0.08 });
    this.shapes.forEach(({ element }, index) => {
      const from = this.directionFor(element);
      const { x, y } = this.getOffscreenTransform(element, from);
      const duration = ENTER_DURATION + (index % 3) * 0.05;
      const position = index * ENTER_STAGGER;

      this.timeline?.fromTo(
        element,
        {
          x,
          y,
          rotation: this.getRotation(element, index, from),
          scale: INITIAL_SCALE,
          autoAlpha: 0,
        },
        {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          autoAlpha: 1,
          // Angular velocity falls away rapidly as each shape reaches its final position.
          duration,
          ease: 'power4.out',
        },
        position
      );
    });
    this.timeline.eventCallback('onComplete', () => this.startScrollParallax());
  }

  init() {
    this.prepare();

    if (!this.parentOwned) {
      this.play();
    }
  }

  replay() {
    this.prepare();
    this.play();
  }

  showFinal() {
    this.destroy();
    this.hydrateShapes();
    this.showStatic();
  }
}

class MCRewardController implements MCController {
  scenes: MCRewardScene[];
  settings = { rotationAmount: DEFAULT_ROTATION_AMOUNT };

  constructor(scenes: MCRewardScene[]) {
    this.scenes = scenes;
  }

  get(key: string) {
    if (key === 'rotationAmount') return this.settings.rotationAmount;
  }

  set(key: string, value: unknown) {
    if (key !== 'rotationAmount') return;

    const amount = Number(value);

    if (!Number.isFinite(amount)) return;

    this.settings.rotationAmount = Math.max(0, amount);
    this.replay();
  }

  replay() {
    let parentOwnedScene = false;

    this.scenes.forEach((scene) => {
      scene.rotationAmount = this.settings.rotationAmount;

      if (scene.parentOwned) {
        scene.prepare();
        parentOwnedScene = true;
        return;
      }

      scene.replay();
    });

    if (parentOwnedScene) {
      window.dispatchEvent(new Event('mcRewardSettingsChange'));
    }
  }
}

export const initMCReward = () => {
  const initialise = () => {
    const mc = ensureMC();
    const scenes = [...document.querySelectorAll<HTMLElement>(SCENE_SELECTOR)].map((element) => {
      if (element.__mcReward) return element.__mcReward;

      const instance = new MCRewardScene(element);
      element.__mcReward = instance;
      return instance;
    });
    const controller = new MCRewardController(scenes);

    mc.reward = scenes;
    mc.rewardController = controller;
    scenes.forEach((scene) => scene.init());

    registerDebug({
      id: 'reward',
      label: 'Reward',
      instances: () => {
        const { rewardController } = ensureMC();

        return rewardController ? [rewardController] : [];
      },
      orderElement: () => ensureMC().reward?.[0]?.element || null,
      instanceLabel: 'All Reward Scenes',
      stats: [
        {
          label: 'Shapes',
          value: () =>
            (ensureMC().reward || []).reduce((total, scene) => total + scene.shapes.length, 0),
        },
      ],
      controls: [
        {
          type: 'range',
          key: 'rotationAmount',
          label: 'Rotation Amount',
          description: 'Controls the entry spin for every reward shape.',
          min: 0,
          max: 1.5,
          step: 0.1,
          suffix: 'x',
          decimals: 1,
          event: 'change',
        },
        { type: 'button', label: 'Replay', action: 'replay' },
      ],
    });

    window.addEventListener('mcMotionPreferenceChange', () => {
      ensureMC().rewardController?.replay();
    });

    const shapeCount = scenes.reduce((total, scene) => total + scene.shapes.length, 0);
    logger.info(`Initialised ${scenes.length} reward scene(s) with ${shapeCount} shape(s).`);
  };

  const boot = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(initialise);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
    return;
  }

  boot();
};
