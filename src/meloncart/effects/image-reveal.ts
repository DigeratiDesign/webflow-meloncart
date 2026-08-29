import { createLogger, isMCDebugEnabled } from '../../digerati/core/logger';
import type { MCDebugSchema, MCNamespace } from '../../digerati/core/types';

const IMAGE_SELECTOR =
  'img[loading="lazy"]:not([mc-image-reveal="off"]):not([mc-reward="shape"]), img[mc-image-reveal]:not([mc-image-reveal="off"]):not([mc-reward="shape"])';
// The preloader owns its background and must not be reset by generic Image Reveal.
const BACKGROUND_SELECTOR =
  '[mc-image-reveal]:not(img):not([mc-image-reveal="off"]):not([mc-preloader])';
const REVEAL_DURATION = 600;
const logger = createLogger('melon', 'image-reveal', { debug: isMCDebugEnabled });
let effectEnabled = true;

type MCImageRevealInstance = MCImageReveal;
type MCImageRevealNamespace = MCNamespace & { imageReveal?: MCImageRevealInstance[] };

declare global {
  interface HTMLElement {
    __mcImageReveal?: MCImageRevealInstance;
  }
}

const reducedMotionEnabled = () => window.MC?.motion?.reduced ?? false;

const ensureMC = (): MCImageRevealNamespace => {
  window.MC ||= {};
  return window.MC as MCImageRevealNamespace;
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

const getBackgroundImageUrl = (element: HTMLElement): string | null => {
  const { backgroundImage } = window.getComputedStyle(element);
  if (!backgroundImage || backgroundImage === 'none') return null;
  const match = backgroundImage.match(/url\((['"]?)(.*?)\1\)/);
  return match?.[2] ?? null;
};

class MCImageReveal {
  element: HTMLElement;
  image?: HTMLImageElement;
  backgroundUrl?: string;
  originalBackgroundImage?: string;
  temporaryLayer?: HTMLDivElement;
  revealed = false;
  private changedPosition = false;
  private originalInlinePosition = '';

  constructor(element: HTMLElement) {
    this.element = element;
    if (element instanceof HTMLImageElement) {
      this.image = element;
      return;
    }
    const computedStyle = window.getComputedStyle(element);
    this.originalBackgroundImage = computedStyle.backgroundImage;
    this.backgroundUrl = getBackgroundImageUrl(element) ?? undefined;
  }

  private async decodeImage(image: HTMLImageElement) {
    try {
      if (image.decode) await image.decode();
    } catch {
      // decode() can reject even when the image is usable.
    }
  }

  private restorePosition() {
    if (!this.changedPosition) return;
    this.element.style.position = this.originalInlinePosition;
    this.changedPosition = false;
  }

  private removeTemporaryLayer() {
    if (!this.temporaryLayer) return;
    this.temporaryLayer.remove();
    this.temporaryLayer = undefined;
  }

  private finishBackgroundReveal() {
    if (this.originalBackgroundImage) {
      this.element.style.backgroundImage = this.originalBackgroundImage;
    }
    this.removeTemporaryLayer();
    this.restorePosition();
    this.revealed = true;
  }

  reveal() {
    if (this.revealed) return;
    if (!this.image) {
      this.finishBackgroundReveal();
      return;
    }
    this.revealed = true;
    this.image.style.transition = reducedMotionEnabled()
      ? 'none'
      : `opacity ${REVEAL_DURATION}ms ease`;
    requestAnimationFrame(() => {
      if (this.image) this.image.style.opacity = '1';
    });
  }

  showFinal() {
    this.revealed = true;
    if (this.image) {
      this.image.style.transition = 'none';
      this.image.style.opacity = '1';
      return;
    }
    this.finishBackgroundReveal();
  }

  async decodeAndRevealImage() {
    if (!this.image) return;
    await this.decodeImage(this.image);
    this.reveal();
  }

  private createBackgroundLayer(): HTMLDivElement | null {
    if (!this.originalBackgroundImage) return null;
    const computedStyle = window.getComputedStyle(this.element);
    this.originalInlinePosition = this.element.style.position;
    if (computedStyle.position === 'static') {
      this.element.style.position = 'relative';
      this.changedPosition = true;
    }
    const layer = document.createElement('div');
    layer.setAttribute('aria-hidden', 'true');
    Object.assign(layer.style, {
      position: 'absolute',
      inset: '0',
      backgroundImage: this.originalBackgroundImage,
      backgroundPosition: computedStyle.backgroundPosition,
      backgroundSize: computedStyle.backgroundSize,
      backgroundRepeat: computedStyle.backgroundRepeat,
      backgroundAttachment: computedStyle.backgroundAttachment,
      backgroundOrigin: computedStyle.backgroundOrigin,
      backgroundClip: computedStyle.backgroundClip,
      opacity: '0',
      pointerEvents: 'none',
      borderRadius: computedStyle.borderRadius,
      zIndex: '0',
    });
    this.temporaryLayer = layer;
    return layer;
  }

  async initBackground() {
    if (!this.backgroundUrl || !this.originalBackgroundImage) {
      logger.warn('No background image found for mc-image-reveal element.', this.element);
      return;
    }
    const layer = this.createBackgroundLayer();
    if (!layer) return;
    // Keep the background colour visible while replacing the image with the fading layer.
    this.element.style.backgroundImage = 'none';
    this.element.prepend(layer);
    const preloadImage = new Image();
    preloadImage.src = this.backgroundUrl;
    if (!(preloadImage.complete && preloadImage.naturalWidth > 0)) {
      await new Promise<void>((resolve) => {
        preloadImage.addEventListener('load', () => resolve(), { once: true });
        preloadImage.addEventListener('error', () => resolve(), { once: true });
      });
    }
    await this.decodeImage(preloadImage);
    if (reducedMotionEnabled()) {
      this.finishBackgroundReveal();
      return;
    }
    layer.style.transition = `opacity ${REVEAL_DURATION}ms ease`;
    let completed = false;
    const complete = () => {
      if (completed) return;
      completed = true;
      this.finishBackgroundReveal();
    };
    layer.addEventListener(
      'transitionend',
      (event) => {
        if (event.propertyName === 'opacity') complete();
      },
      { once: true }
    );
    // Ensure cleanup when a browser or external style change suppresses transitionend.
    window.setTimeout(complete, REVEAL_DURATION + 100);
    requestAnimationFrame(() => {
      layer.style.opacity = '1';
    });
  }

  initImage() {
    if (!this.image) return;
    this.image.style.opacity = '0';
    if (this.image.complete && this.image.naturalWidth > 0) {
      void this.decodeAndRevealImage();
      return;
    }
    this.image.addEventListener('load', () => void this.decodeAndRevealImage(), { once: true });
    this.image.addEventListener('error', () => this.showFinal(), { once: true });
  }

  init() {
    if (!effectEnabled) {
      this.showFinal();
      return;
    }
    if (reducedMotionEnabled()) {
      this.showFinal();
      return;
    }
    if (this.image) {
      this.initImage();
      return;
    }
    void this.initBackground();
  }

  restart() {
    this.revealed = false;
    this.init();
  }

  replay() {
    this.restart();
  }
}

export const initMCImageReveal = () => {
  const initialise = () => {
    const mc = ensureMC();
    mc.imageReveal ||= [];
    const imageElements = [...document.querySelectorAll<HTMLImageElement>(IMAGE_SELECTOR)];
    const backgroundElements = [...document.querySelectorAll<HTMLElement>(BACKGROUND_SELECTOR)];
    const elements: HTMLElement[] = [...imageElements, ...backgroundElements];
    let initialised = 0;
    elements.forEach((element) => {
      if (element.__mcImageReveal) return;
      const instance = new MCImageReveal(element);
      element.__mcImageReveal = instance;
      mc.imageReveal?.push(instance);
      instance.init();
      initialised += 1;
    });
    window.addEventListener('mcMotionPreferenceChange', () => {
      ensureMC().imageReveal?.forEach((instance) => {
        if (reducedMotionEnabled()) instance.showFinal();
      });
    });
    registerDebug({
      id: 'image-reveal',
      label: 'Image Reveal',
      showInPanel: false,
      instances: () => ensureMC().imageReveal || [],
      orderElement: () => ensureMC().imageReveal?.[0]?.element || null,
      instanceLabel: 'Image',
      effect: {
        enabled: () => effectEnabled,
        setEnabled(enabled) {
          effectEnabled = enabled;
          (ensureMC().imageReveal || []).forEach((instance) => {
            if (!enabled) instance.showFinal();
            else instance.restart();
          });
        },
      },
    });
    logger.info(
      `Initialised ${initialised} image reveal(s): ${imageElements.length} image(s), ${backgroundElements.length} background(s).`
    );
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
    return;
  }
  initialise();
};
