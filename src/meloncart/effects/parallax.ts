import { gsap } from '../../digerati/core/gsap';
import { createLogger, isMCDebugEnabled } from '../../digerati/core/logger';
import type { MCDebugSchema, MCNamespace } from '../../digerati/core/types';

const SCENE_SELECTOR = '[mc-parallax="scene"]';
const LAYER_SELECTOR = '[mc-parallax="layer"]';
const DEFAULT_MAX_X = 34;
const DEFAULT_MAX_Y = 24;
const DEFAULT_DEPTH = 0.5;
const DEFAULT_DURATION = 0.8;
const DEFAULT_INTRO_SCALE = 2.2;
const DEFAULT_INTRO_DURATION = 1.2;
const logger = createLogger('melon', 'parallax', { debug: isMCDebugEnabled });
let effectEnabled = true;

type MCParallaxNamespace = MCNamespace & {
  parallax?: MCParallaxScene[];
};

type ParallaxLayer = {
  element: HTMLElement;
  depth: number;
  xTo?: (value: number) => void;
  yTo?: (value: number) => void;
};

declare global {
  interface HTMLElement {
    __mcParallax?: MCParallaxScene;
  }
}

const ensureMC = (): MCParallaxNamespace => {
  window.MC ||= {};

  return window.MC as MCParallaxNamespace;
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

const reducedMotionEnabled = () => window.MC?.motion?.reduced ?? false;

const numberAttribute = (element: HTMLElement, name: string, fallback: number) => {
  const value = Number.parseFloat(element.getAttribute(name) ?? '');

  return Number.isFinite(value) ? value : fallback;
};

class MCParallaxScene {
  element: HTMLElement;
  layers: ParallaxLayer[] = [];
  maxX: number;
  maxY: number;
  duration: number;
  introScale: number;
  introDuration: number;
  introTween: gsap.core.Tween | null = null;
  originalInlineOverflow: string;

  private readonly handlePointerMove = (event: PointerEvent) => {
    const rect = this.element.getBoundingClientRect();

    if (!rect.width || !rect.height) {
      return;
    }

    const pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

    this.layers.forEach((layer) => {
      layer.xTo?.(pointerX * this.maxX * layer.depth);
      layer.yTo?.(pointerY * this.maxY * layer.depth);
    });
  };

  private readonly handlePointerLeave = () => {
    this.reset();
  };

  constructor(element: HTMLElement) {
    this.element = element;
    this.originalInlineOverflow = element.style.overflow;
    this.maxX = numberAttribute(element, 'mc-parallax-max-x', DEFAULT_MAX_X);
    this.maxY = numberAttribute(element, 'mc-parallax-max-y', DEFAULT_MAX_Y);
    this.duration = Math.max(
      0.1,
      numberAttribute(element, 'mc-parallax-duration', DEFAULT_DURATION)
    );
    this.introScale = Math.max(
      1,
      numberAttribute(element, 'mc-parallax-intro-scale', DEFAULT_INTRO_SCALE)
    );
    this.introDuration = Math.max(
      0.1,
      numberAttribute(element, 'mc-parallax-intro-duration', DEFAULT_INTRO_DURATION)
    );
    this.hydrateLayers();
  }

  get parentOwned() {
    return this.element.hasAttribute('mc-animation-owner');
  }

  private hydrateLayers() {
    const layerElements = [...this.element.querySelectorAll<HTMLElement>(LAYER_SELECTOR)];

    this.layers = layerElements.map((layer) => {
      const depth = gsap.utils.clamp(
        0,
        1,
        numberAttribute(layer, 'mc-parallax-depth', DEFAULT_DEPTH)
      );

      return {
        element: layer,
        depth,
      };
    });
  }

  private attachAnimatedLayers() {
    this.layers = this.layers.map((layer) => ({
      ...layer,
      xTo: gsap.quickTo(layer.element, 'x', {
        duration: this.duration,
        ease: 'power3.out',
      }),
      yTo: gsap.quickTo(layer.element, 'y', {
        duration: this.duration,
        ease: 'power3.out',
      }),
    }));
  }

  private setStaticLayers() {
    this.layers.forEach((layer) => {
      gsap.set(layer.element, { x: 0, y: 0, scale: 1 });
    });
  }

  private startPointerTracking() {
    this.attachAnimatedLayers();
    this.element.addEventListener('pointermove', this.handlePointerMove, { passive: true });
    this.element.addEventListener('pointerleave', this.handlePointerLeave);
  }

  playIntro() {
    if (reducedMotionEnabled()) {
      return;
    }

    if (this.introScale === 1) {
      this.startPointerTracking();
      return;
    }

    this.introTween = gsap.to(
      this.layers.map(({ element }) => element),
      {
        scale: 1,
        duration: this.introDuration,
        ease: 'power3.out',
        onComplete: () => {
          this.introTween = null;
          this.startPointerTracking();
        },
      }
    );
  }

  destroy() {
    this.element.removeEventListener('pointermove', this.handlePointerMove);
    this.element.removeEventListener('pointerleave', this.handlePointerLeave);
    this.introTween?.kill();
    this.introTween = null;
    this.element.style.overflow = this.originalInlineOverflow;

    this.layers.forEach((layer) => {
      gsap.killTweensOf(layer.element);
      gsap.set(layer.element, { x: 0, y: 0, scale: 1 });
    });
  }

  reset() {
    this.layers.forEach((layer) => {
      layer.xTo?.(0);
      layer.yTo?.(0);
    });
  }

  get(key: string) {
    if (key === 'maxX') return this.maxX;
    if (key === 'maxY') return this.maxY;
    if (key === 'duration') return this.duration;
    if (key === 'introScale') return this.introScale;
    if (key === 'introDuration') return this.introDuration;
  }

  set(key: string, value: unknown) {
    const nextValue = Number(value);

    if (!Number.isFinite(nextValue)) {
      return;
    }

    if (key === 'maxX') this.maxX = Math.max(0, nextValue);
    if (key === 'maxY') this.maxY = Math.max(0, nextValue);
    if (key === 'duration') {
      this.duration = Math.max(0.1, nextValue);
      this.rebuild();
    }
    if (key === 'introScale') {
      this.introScale = Math.max(1, nextValue);
      this.rebuild();
    }
    if (key === 'introDuration') {
      this.introDuration = Math.max(0.1, nextValue);
      this.rebuild();
    }
  }

  private rebuild() {
    this.init();

    if (this.parentOwned) {
      window.dispatchEvent(new Event('mcParallaxSettingsChange'));
    }
  }

  replay() {
    if (this.parentOwned) {
      this.rebuild();
      return;
    }

    this.prepare();
    this.playIntro();
  }

  showFinal() {
    this.destroy();
    this.hydrateLayers();
    this.setStaticLayers();
  }

  prepare() {
    this.destroy();
    this.hydrateLayers();

    if (!this.layers.length) {
      logger.debug('Skipping scene with no layers', { element: this.element });
      return;
    }

    this.setStaticLayers();

    if (reducedMotionEnabled()) {
      logger.debug('Reduced motion enabled; scene remains static', { element: this.element });
      return;
    }

    this.element.style.overflow = 'hidden';
    this.layers.forEach((layer) => {
      const sceneRect = this.element.getBoundingClientRect();
      const layerRect = layer.element.getBoundingClientRect();
      const originX = sceneRect.left + sceneRect.width / 2 - layerRect.left;
      const originY = sceneRect.top + sceneRect.height / 2 - layerRect.top;

      gsap.set(layer.element, {
        scale: this.introScale,
        transformOrigin: `${originX}px ${originY}px`,
      });
    });
  }

  init() {
    if (!effectEnabled) {
      this.showFinal();
      return;
    }
    this.prepare();

    if (!this.parentOwned) {
      this.playIntro();
    }
  }
}

export const initMCParallax = () => {
  const initialise = () => {
    const mc = ensureMC();
    const scenes = [...document.querySelectorAll<HTMLElement>(SCENE_SELECTOR)].map((element) => {
      if (element.__mcParallax) {
        return element.__mcParallax;
      }

      const instance = new MCParallaxScene(element);
      element.__mcParallax = instance;

      return instance;
    });

    mc.parallax = scenes;
    scenes.forEach((scene) => scene.init());

    registerDebug({
      id: 'parallax',
      label: 'Parallax',
      effect: {
        enabled: () => effectEnabled,
        setEnabled(enabled) {
          effectEnabled = enabled;
          (ensureMC().parallax || []).forEach((scene) => {
            if (!enabled) scene.showFinal();
            else scene.init();
          });
          window.dispatchEvent(new Event('mcEffectEnabledChange'));
        },
      },
      instances: () => ensureMC().parallax || [],
      orderElement: () => ensureMC().parallax?.[0]?.element || null,
      instanceLabel: 'Scene',
      stats: [
        {
          label: 'Layers',
          value: () =>
            (ensureMC().parallax || []).reduce((total, scene) => total + scene.layers.length, 0),
        },
      ],
      controls: [
        {
          type: 'range',
          key: 'maxX',
          label: 'Horizontal Travel',
          description: 'Maximum horizontal movement for a layer with depth 1.',
          min: 0,
          max: 120,
          step: 1,
          suffix: 'px',
        },
        {
          type: 'range',
          key: 'maxY',
          label: 'Vertical Travel',
          description: 'Maximum vertical movement for a layer with depth 1.',
          min: 0,
          max: 120,
          step: 1,
          suffix: 'px',
        },
        {
          type: 'range',
          key: 'duration',
          label: 'Response',
          description: 'Higher values create a slower, more pronounced trailing response.',
          min: 0.1,
          max: 2,
          step: 0.05,
          suffix: 's',
          event: 'change',
        },
        {
          type: 'range',
          key: 'introScale',
          label: 'Intro Zoom',
          description: 'Initial camera zoom before the parallax composition pulls back.',
          min: 1,
          max: 4,
          step: 0.1,
          suffix: 'x',
          decimals: 1,
          event: 'change',
        },
        {
          type: 'range',
          key: 'introDuration',
          label: 'Pull-back Duration',
          description: 'How long the camera-style pull-back takes.',
          min: 0.1,
          max: 3,
          step: 0.05,
          suffix: 's',
          event: 'change',
        },
        { type: 'button', label: 'Replay Intro', action: 'replay' },
      ],
    });

    window.addEventListener('mcMotionPreferenceChange', () => {
      ensureMC().parallax?.forEach((scene) => scene.init());
    });

    const layerCount = scenes.reduce((total, scene) => total + scene.layers.length, 0);

    logger.info(`Initialised ${scenes.length} parallax scene(s) with ${layerCount} layer(s).`);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
    return;
  }

  initialise();
};
