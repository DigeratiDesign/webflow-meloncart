import {
  getScrollTriggerDebug,
  gsap,
  onScrollTriggerDebugChange,
  ScrollTrigger,
} from '../../digerati/core/gsap';
import { createLogger } from '../../digerati/core/logger';
import type { MCDebugSchema, MCNamespace } from '../../digerati/core/types';

const SVG_NS = 'http://www.w3.org/2000/svg';
const XLINK_NS = 'http://www.w3.org/1999/xlink';

const CHALK_SELECTOR = '[mc-chalk]';
const STAMP_SELECTOR = '[mc-chalk-stamp]';
const SEQUENCE_SELECTOR = '[mc-chalk-sequence]';

const DEFAULTS = {
  bend: 6,
  maskMultiplier: 0.7,
  strokeWidth: 5.6,
  seed: 42,
  brushDensity: 100,
  stampDensity: 100,
  duration: 0.5,
  start: 'top 75%',
  stagger: 0.12,
  debug: false,
};
const logger = createLogger('melon', 'chalk');

type ChalkStamp = {
  path: string;
  viewBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

type BrushLayer = {
  group: SVGGElement;
  circles: SVGCircleElement[];
  length: number;
  revealed: number;
  rebuildDensity: (nextDensity: number) => void;
};

type ChalkDensityTarget = {
  guide: SVGGeometryElement;
  brushLayer: BrushLayer;
  stampLayer: SVGGElement;
  strokeWidth: number;
  seed: number;
};

type ChalkInstance = {
  wrapper: HTMLElement;
  svg: SVGSVGElement;
  treated: SVGGElement;
  brushLayers: BrushLayer[];
  densityTargets: ChalkDensityTarget[];
  generatedElements: number;
  settings: {
    bend: number;
    maskWidth: number;
    brushDensity: number;
    stampDensity: number;
  };
  get: (name: string) => unknown;
  set: (name: string, rawValue: unknown) => void;
};

type ChalkSequenceController = {
  element: HTMLElement;
  instances: ChalkInstance[];
  settings: {
    duration: number;
    stagger: number;
    start: string;
    debug: boolean;
  };
  get: (key: string) => unknown;
  set: (key: string, value: unknown) => void;
  rebuild: () => void;
  applyMotionPreference: () => void;
  show: () => void;
  hide: () => void;
  replay: () => void;
};

type ChalkStats = {
  icons: number;
  generatedElements: number;
  averagePerIcon: number;
  perIcon: Array<{
    index: number;
    generatedElements: number;
  }>;
};

type MCChalkNamespace = MCNamespace & {
  chalk?: ChalkInstance[];
  chalkSequences?: ChalkSequenceController[];
  chalkStats?: ChalkStats;
};

declare global {
  interface Window {
    __mcChalkMotionListener?: boolean;
  }
}

let uid = 0;

const stampTransformCache = new Map<string, string[]>();
const chalkInstances = new Map<HTMLElement, ChalkInstance>();
const sequenceControllers: ChalkSequenceController[] = [];

const ensureMC = (): MCChalkNamespace => {
  window.MC ||= {};

  return window.MC as MCChalkNamespace;
};

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

const reduceMotionEnabled = () => {
  if (window.MC?.motion && typeof window.MC.motion.reduced === 'boolean') {
    return window.MC.motion.reduced;
  }

  return reducedMotionQuery.matches;
};

const numberAttribute = (element: Element, name: string, fallback: number) => {
  const value = parseFloat(element.getAttribute(name) || '');

  return Number.isFinite(value) ? value : fallback;
};

const stringAttribute = (element: Element, name: string, fallback: string) => {
  const value = element.getAttribute(name);

  return value !== null && value.trim() !== '' ? value.trim() : fallback;
};

const booleanAttribute = (element: Element, name: string, fallback = false) => {
  const value = element.getAttribute(name);

  if (value === null) {
    return fallback;
  }

  return value === '' || value === '1' || value === 'true' || value === 'yes';
};

const seededRandom = (seed: number) => {
  let state = seed >>> 0 || 1;

  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;

    return state / 4294967296;
  };
};

const getViewBox = (svg: SVGSVGElement) => {
  const viewBox = svg.viewBox?.baseVal;

  if (viewBox && viewBox.width && viewBox.height) {
    return {
      x: viewBox.x,
      y: viewBox.y,
      width: viewBox.width,
      height: viewBox.height,
    };
  }

  return {
    x: 0,
    y: 0,
    width: 48,
    height: 48,
  };
};

const getLength = (element: SVGGeometryElement) => {
  try {
    return Math.max(0.01, element.getTotalLength());
  } catch {
    return 0;
  }
};

const registerDebugSchema = (schema: MCDebugSchema) => {
  const mc = ensureMC();

  if (mc.debug?.register) {
    mc.debug.register(schema);
    return;
  }

  mc.__debugQueue ||= [];
  mc.__debugQueue.push(schema);
};

const loadStamp = async (): Promise<ChalkStamp> => {
  const stampElement = document.querySelector<HTMLElement>(STAMP_SELECTOR);

  if (!stampElement) {
    throw new Error('[🍈:chalk] No element with [mc-chalk-stamp] found.');
  }

  const stampUrl = stampElement.getAttribute('mc-chalk-stamp');

  if (!stampUrl) {
    throw new Error('[🍈:chalk] [mc-chalk-stamp] has no SVG URL.');
  }

  const response = await fetch(stampUrl);

  if (!response.ok) {
    throw new Error(`[🍈:chalk] Could not load chalk stamp: ${response.status}`);
  }

  const source = await response.text();
  const parsed = new DOMParser().parseFromString(source, 'image/svg+xml');

  if (parsed.querySelector('parsererror')) {
    throw new Error('[🍈:chalk] Chalk stamp SVG could not be parsed.');
  }

  const sourceSvg = parsed.querySelector('svg');
  const sourcePath = parsed.querySelector('path');

  if (!sourceSvg || !sourcePath) {
    throw new Error('[🍈:chalk] Chalk stamp SVG does not contain a path.');
  }

  const pathData = sourcePath.getAttribute('d');
  const viewBox = sourceSvg.getAttribute('viewBox');

  if (!pathData || !viewBox) {
    throw new Error('[🍈:chalk] Chalk stamp SVG is invalid.');
  }

  const values = viewBox
    .trim()
    .split(/[\s,]+/)
    .map(Number);

  if (values.length !== 4 || values.some((value) => !Number.isFinite(value))) {
    throw new Error('[🍈:chalk] Invalid chalk stamp viewBox.');
  }

  logger.info('Stamp loaded:', stampUrl);

  return {
    path: pathData,
    viewBox: {
      x: values[0],
      y: values[1],
      width: values[2],
      height: values[3],
    },
  };
};

const addBendFilter = (
  defs: SVGDefsElement,
  id: string,
  bend: number,
  seed: number,
  geometryScale: number
) => {
  const filter = document.createElementNS(SVG_NS, 'filter');

  filter.setAttribute('id', id);
  filter.setAttribute('x', '-45%');
  filter.setAttribute('y', '-45%');
  filter.setAttribute('width', '190%');
  filter.setAttribute('height', '190%');
  filter.setAttribute('color-interpolation-filters', 'sRGB');

  if (bend <= 0.001) {
    defs.appendChild(filter);

    return;
  }

  const turbulence = document.createElementNS(SVG_NS, 'feTurbulence');
  turbulence.setAttribute('type', 'fractalNoise');
  turbulence.setAttribute('baseFrequency', (0.0095 + bend * 0.004).toFixed(4));
  turbulence.setAttribute('numOctaves', '2');
  turbulence.setAttribute('seed', String(seed));
  turbulence.setAttribute('result', 'bendNoise');

  const blur = document.createElementNS(SVG_NS, 'feGaussianBlur');
  blur.setAttribute('in', 'bendNoise');
  blur.setAttribute('stdDeviation', '0.45');
  blur.setAttribute('result', 'softNoise');

  const displacement = document.createElementNS(SVG_NS, 'feDisplacementMap');
  displacement.setAttribute('in', 'SourceGraphic');
  displacement.setAttribute('in2', 'softNoise');
  displacement.setAttribute('scale', ((0.45 + bend * 1.05) * geometryScale).toFixed(3));
  displacement.setAttribute('xChannelSelector', 'R');
  displacement.setAttribute('yChannelSelector', 'G');

  filter.append(turbulence, blur, displacement);
  defs.appendChild(filter);
};

const getStampTransforms = (
  guide: SVGGeometryElement,
  strokeWidth: number,
  seed: number,
  stamp: ChalkStamp,
  density = 100
) => {
  const length = getLength(guide);

  if (!length) {
    return [];
  }

  const key = [guide.getAttribute('d') || guide.outerHTML, strokeWidth, seed, density].join('|');

  if (stampTransformCache.has(key)) {
    return stampTransformCache.get(key)!;
  }

  const random = seededRandom(seed);
  const referenceSize = 365;
  const stampSize = Math.max(stamp.viewBox.width, stamp.viewBox.height);
  const stampCorrection = referenceSize / stampSize;
  const baseScale = 0.0123288 * (strokeWidth / 4.5) * stampCorrection;
  const spacing = Math.max(0.42, (strokeWidth * 0.46) / Math.max(0.01, density / 100));
  const transforms: string[] = [];
  const stampCenterX = stamp.viewBox.x + stamp.viewBox.width / 2;
  const stampCenterY = stamp.viewBox.y + stamp.viewBox.height / 2;

  for (let distance = 0; distance <= length; ) {
    const point = guide.getPointAtLength(Math.min(length, distance));
    const before = guide.getPointAtLength(Math.max(0, distance - 0.18));
    const after = guide.getPointAtLength(Math.min(length, distance + 0.18));
    const tangent = (Math.atan2(after.y - before.y, after.x - before.x) * 180) / Math.PI;
    const rotation = tangent + (random() - 0.5) * 84;
    const scale = baseScale * (0.86 + random() * 0.28);

    transforms.push(
      [
        `translate(${point.x.toFixed(3)} ${point.y.toFixed(3)})`,
        `scale(${scale.toFixed(6)})`,
        `rotate(${rotation.toFixed(2)})`,
        `translate(${-stampCenterX} ${-stampCenterY})`,
      ].join(' ')
    );

    distance += spacing * (0.82 + random() * 0.34);
  }

  stampTransformCache.set(key, transforms);

  return transforms;
};

const revealBrushLayer = (brushLayer: BrushLayer, progress: number) => {
  const { circles } = brushLayer;
  const count = circles.length;
  const target = progress >= 1 ? count : Math.max(0, Math.min(count, Math.floor(count * progress)));

  if (target > brushLayer.revealed) {
    for (let i = brushLayer.revealed; i < target; i += 1) {
      circles[i].style.display = '';
    }
  }

  if (target < brushLayer.revealed) {
    for (let i = target; i < brushLayer.revealed; i += 1) {
      circles[i].style.display = 'none';
    }
  }

  brushLayer.revealed = target;
};

const createBrushLayer = (guide: SVGGeometryElement, radius: number, density = 100): BrushLayer => {
  const group = document.createElementNS(SVG_NS, 'g');
  group.setAttribute('class', 'mc-chalk-brush-layer');

  const length = getLength(guide);
  const spacing = Math.max(0.02, (radius * 0.1) / Math.max(0.01, density / 100));
  const circles: SVGCircleElement[] = [];

  for (let distance = 0; distance < length; distance += spacing) {
    const point = guide.getPointAtLength(distance);
    const circle = document.createElementNS(SVG_NS, 'circle');

    circle.setAttribute('cx', point.x.toFixed(3));
    circle.setAttribute('cy', point.y.toFixed(3));
    circle.setAttribute('r', radius.toFixed(3));
    circle.setAttribute('fill', '#ffffff');

    group.appendChild(circle);
    circles.push(circle);
  }

  const endPoint = guide.getPointAtLength(length);
  const endCircle = document.createElementNS(SVG_NS, 'circle');

  endCircle.setAttribute('cx', endPoint.x.toFixed(3));
  endCircle.setAttribute('cy', endPoint.y.toFixed(3));
  endCircle.setAttribute('r', radius.toFixed(3));
  endCircle.setAttribute('fill', '#ffffff');

  group.appendChild(endCircle);
  circles.push(endCircle);

  return {
    group,
    circles,
    length,
    revealed: circles.length,
    rebuildDensity(nextDensity) {
      const progress = this.circles.length ? this.revealed / this.circles.length : 1;
      const fresh = createBrushLayer(
        guide,
        Number(this.circles[0]?.getAttribute('r') || radius),
        nextDensity
      );

      group.replaceChildren(...fresh.circles);
      this.circles.splice(0, this.circles.length, ...fresh.circles);
      this.revealed = this.circles.length;
      revealBrushLayer(this, progress);
    },
  };
};

const hideBrushLayer = (brushLayer: BrushLayer) => {
  brushLayer.circles.forEach((circle) => {
    circle.style.display = 'none';
  });

  brushLayer.revealed = 0;
};

const showBrushLayer = (brushLayer: BrushLayer) => {
  brushLayer.circles.forEach((circle) => {
    circle.style.display = '';
  });

  brushLayer.revealed = brushLayer.circles.length;
};

const refreshChalkStats = () => {
  const instances = [...chalkInstances.values()];
  const generatedElements = instances.reduce(
    (n, instance) => n + (instance.generatedElements || 0),
    0
  );
  const mc = ensureMC();

  mc.chalkStats = {
    icons: instances.length,
    generatedElements,
    averagePerIcon: instances.length ? generatedElements / instances.length : 0,
    perIcon: instances.map((instance, index) => ({
      index: index + 1,
      generatedElements: instance.generatedElements || 0,
    })),
  };

  window.dispatchEvent(new CustomEvent('mcChalkStatsChange', { detail: mc.chalkStats }));
};

const applyChalk = (wrapper: HTMLElement, index: number, stamp: ChalkStamp) => {
  if (wrapper.dataset.mcChalkReady === '1') {
    return chalkInstances.get(wrapper) || null;
  }

  const svg = wrapper.querySelector<SVGSVGElement>('svg');
  const domNodesBefore = svg ? svg.querySelectorAll('*').length : 0;

  if (!svg) {
    logger.warn('No inline SVG found:', wrapper);

    return null;
  }

  const originals = [
    ...svg.querySelectorAll<SVGGeometryElement>(
      'path, circle, ellipse, line, polyline, polygon, rect'
    ),
  ].filter((element) => !element.closest('defs'));

  if (!originals.length) {
    logger.warn('No SVG geometry found:', wrapper);

    return null;
  }

  wrapper.dataset.mcChalkReady = '1';

  uid += 1;
  const id = uid;
  const bend = Math.max(0, numberAttribute(wrapper, 'mc-chalk-bend', DEFAULTS.bend));
  const maskMultiplier = Math.max(
    0,
    numberAttribute(wrapper, 'mc-chalk-mask-width', DEFAULTS.maskMultiplier)
  );
  const brushDensity = Math.max(
    1,
    numberAttribute(wrapper, 'mc-chalk-brush-density', DEFAULTS.brushDensity)
  );
  const stampDensity = Math.max(
    1,
    numberAttribute(wrapper, 'mc-chalk-stamp-density', DEFAULTS.stampDensity)
  );

  const viewBox = getViewBox(svg);
  const geometryScale = Math.max(viewBox.width, viewBox.height) / 48;
  const strokeWidth = DEFAULTS.strokeWidth * geometryScale;
  const automaticMaskWidth = Math.max(strokeWidth + 3.5 * geometryScale, strokeWidth * 1.394643);
  const maskStrokeWidth = Math.max(0.25, automaticMaskWidth * maskMultiplier);
  const radius = maskStrokeWidth / 2;

  let defs = svg.querySelector<SVGDefsElement>(':scope > defs');

  if (!defs) {
    defs = document.createElementNS(SVG_NS, 'defs');
    svg.insertBefore(defs, svg.firstChild);
  }

  const stampId = `mc-chalk-stamp-${id}`;
  const maskId = `mc-chalk-mask-${id}`;
  const bendId = `mc-chalk-bend-${id}`;

  const stampDefinition = document.createElementNS(SVG_NS, 'g');
  stampDefinition.setAttribute('id', stampId);

  const stampPath = document.createElementNS(SVG_NS, 'path');
  stampPath.setAttribute('d', stamp.path);
  stampPath.setAttribute('fill', 'currentColor');
  stampDefinition.appendChild(stampPath);
  defs.appendChild(stampDefinition);

  addBendFilter(defs, bendId, bend, DEFAULTS.seed + index * 17, geometryScale);

  const mask = document.createElementNS(SVG_NS, 'mask');
  mask.setAttribute('id', maskId);
  mask.setAttribute('maskUnits', 'userSpaceOnUse');
  mask.setAttribute('maskContentUnits', 'userSpaceOnUse');
  mask.setAttribute('style', 'mask-type:luminance');

  const padding = Math.max(viewBox.width, viewBox.height) * 0.9;
  mask.setAttribute('x', String(viewBox.x - padding));
  mask.setAttribute('y', String(viewBox.y - padding));
  mask.setAttribute('width', String(viewBox.width + padding * 2));
  mask.setAttribute('height', String(viewBox.height + padding * 2));
  defs.appendChild(mask);

  const treated = document.createElementNS(SVG_NS, 'g');
  treated.setAttribute('class', 'mc-chalk-output');
  treated.setAttribute('mask', `url(#${maskId})`);

  if (bend > 0.001) {
    treated.setAttribute('filter', `url(#${bendId})`);
  }

  treated.setAttribute('fill', 'currentColor');
  treated.style.color = 'inherit';

  const brushLayers: BrushLayer[] = [];
  const densityTargets: ChalkDensityTarget[] = [];

  originals.forEach((original, pathIndex) => {
    const guide = original.cloneNode(false) as SVGGeometryElement;

    guide.removeAttribute('id');
    guide.setAttribute('fill', 'none');
    guide.setAttribute('stroke', 'transparent');
    guide.setAttribute('stroke-width', '0.001');
    guide.style.opacity = '0';
    guide.style.pointerEvents = 'none';

    svg.appendChild(guide);

    const brushLayer = createBrushLayer(guide, radius, brushDensity);
    mask.appendChild(brushLayer.group);
    brushLayers.push(brushLayer);

    const stampLayer = document.createElementNS(SVG_NS, 'g');
    stampLayer.setAttribute('fill', 'currentColor');

    const seed = DEFAULTS.seed + index * 101 + pathIndex * 37;
    const transforms = getStampTransforms(guide, strokeWidth, seed, stamp, stampDensity);

    transforms.forEach((transform) => {
      const use = document.createElementNS(SVG_NS, 'use');

      use.setAttribute('href', `#${stampId}`);
      use.setAttributeNS(XLINK_NS, 'xlink:href', `#${stampId}`);
      use.setAttribute('transform', transform);
      use.setAttribute('fill', 'currentColor');

      stampLayer.appendChild(use);
    });

    treated.appendChild(stampLayer);

    densityTargets.push({
      guide,
      brushLayer,
      stampLayer,
      strokeWidth,
      seed,
    });

    original.style.display = 'none';
  });

  svg.appendChild(treated);
  svg.setAttribute('overflow', 'visible');
  svg.style.overflow = 'visible';

  const domNodesAfter = svg.querySelectorAll('*').length;

  const instance: ChalkInstance = {
    wrapper,
    svg,
    treated,
    brushLayers,
    densityTargets,
    generatedElements: Math.max(0, domNodesAfter - domNodesBefore),
    settings: {
      bend,
      maskWidth: maskMultiplier,
      brushDensity,
      stampDensity,
    },
    get(name) {
      return this.settings[name as keyof typeof this.settings];
    },
    set(name, rawValue) {
      const value = Number(rawValue);

      if (!Number.isFinite(value)) {
        return;
      }

      if (name === 'bend') {
        const next = Math.max(0, value);

        this.settings.bend = next;
        wrapper.setAttribute('mc-chalk-bend', String(next));

        const oldFilter = defs.querySelector(`#${bendId}`);
        if (oldFilter) {
          oldFilter.remove();
        }

        addBendFilter(defs, bendId, next, DEFAULTS.seed + index * 17, geometryScale);

        if (next > 0.001) {
          treated.setAttribute('filter', `url(#${bendId})`);
        } else {
          treated.removeAttribute('filter');
        }

        return;
      }

      if (name === 'brushDensity' || name === 'stampDensity') {
        const next = Math.max(1, value);
        this.settings[name] = next;

        wrapper.setAttribute(
          name === 'brushDensity' ? 'mc-chalk-brush-density' : 'mc-chalk-stamp-density',
          String(next)
        );

        if (name === 'brushDensity') {
          this.densityTargets.forEach((target) => target.brushLayer.rebuildDensity(next));
        } else {
          this.densityTargets.forEach((target) => {
            const transforms = getStampTransforms(
              target.guide,
              target.strokeWidth,
              target.seed,
              stamp,
              next
            );

            target.stampLayer.replaceChildren();

            transforms.forEach((transform) => {
              const use = document.createElementNS(SVG_NS, 'use');
              use.setAttribute('href', `#${stampId}`);
              use.setAttributeNS(XLINK_NS, 'xlink:href', `#${stampId}`);
              use.setAttribute('transform', transform);
              use.setAttribute('fill', 'currentColor');
              target.stampLayer.appendChild(use);
            });
          });
        }

        this.generatedElements = Math.max(0, svg.querySelectorAll('*').length - domNodesBefore);
        refreshChalkStats();
        return;
      }

      if (name === 'maskWidth') {
        const next = Math.max(0, value);
        this.settings.maskWidth = next;
        wrapper.setAttribute('mc-chalk-mask-width', String(next));

        const nextMaskStrokeWidth = Math.max(0.25, automaticMaskWidth * next);
        const nextRadius = nextMaskStrokeWidth / 2;

        this.brushLayers.forEach((layer) => {
          layer.circles.forEach((circle) => {
            circle.setAttribute('r', nextRadius.toFixed(3));
          });
        });
      }
    },
  };

  chalkInstances.set(wrapper, instance);

  return instance;
};

const hideInstance = (instance: ChalkInstance) => {
  instance.brushLayers.forEach(hideBrushLayer);
};

const showInstance = (instance: ChalkInstance) => {
  instance.brushLayers.forEach(showBrushLayer);
};

const revealWrapper = (instance: ChalkInstance | null | undefined) => {
  if (instance?.wrapper) {
    instance.wrapper.style.opacity = '1';
  }
};

const revealWrappers = (instances: ChalkInstance[]) => {
  instances.forEach(revealWrapper);
};

const addInstanceToTimeline = (
  timeline: GSAPTimeline,
  instance: ChalkInstance,
  duration: number,
  startPosition: number
) => {
  const { brushLayers: layers } = instance;

  if (!layers.length) {
    return;
  }

  const totalLength = layers.reduce((total, layer) => total + layer.length, 0) || 1;
  let elapsed = 0;

  layers.forEach((layer) => {
    const segmentDuration = Math.max(0.08, duration * (layer.length / totalLength));
    const proxy = { progress: 0 };

    timeline.to(
      proxy,
      {
        progress: 1,
        duration: segmentDuration,
        ease: 'none',
        onUpdate: () => {
          revealBrushLayer(layer, proxy.progress);
        },
        onComplete: () => {
          revealBrushLayer(layer, 1);
        },
      },
      startPosition + elapsed
    );

    elapsed += segmentDuration * 0.88;
  });
};

const initSequence = (sequenceElement: HTMLElement) => {
  const settings = {
    duration: Math.max(
      0.01,
      numberAttribute(sequenceElement, 'mc-chalk-duration', DEFAULTS.duration)
    ),
    stagger: Math.max(0, numberAttribute(sequenceElement, 'mc-chalk-stagger', DEFAULTS.stagger)),
    start: stringAttribute(sequenceElement, 'mc-chalk-start', DEFAULTS.start),
    debug: booleanAttribute(sequenceElement, 'mc-chalk-debug', DEFAULTS.debug),
  };

  const wrappers = [...sequenceElement.querySelectorAll<HTMLElement>(CHALK_SELECTOR)].filter(
    (wrapper) => wrapper.closest(SEQUENCE_SELECTOR) === sequenceElement
  );

  const instances = wrappers
    .map((wrapper) => chalkInstances.get(wrapper))
    .filter((instance): instance is ChalkInstance => Boolean(instance));

  if (!instances.length) {
    return null;
  }

  let timeline: GSAPTimeline | null = null;
  let trigger: ScrollTrigger | null = null;

  const build = () => {
    if (timeline) {
      timeline.kill();
      timeline = null;
    }

    if (trigger) {
      trigger.kill();
      trigger = null;
    }

    if (reduceMotionEnabled()) {
      instances.forEach(showInstance);
      revealWrappers(instances);

      sequenceElement.dataset.mcChalkSequenceReady = '1';
      sequenceElement.dataset.mcChalkReducedMotion = '1';

      return;
    }

    delete sequenceElement.dataset.mcChalkReducedMotion;

    instances.forEach(hideInstance);

    timeline = gsap!.timeline({
      paused: true,
    });

    instances.forEach((instance, index) => {
      addInstanceToTimeline(timeline!, instance, settings.duration, index * settings.stagger);
    });

    trigger = ScrollTrigger!.create({
      trigger: sequenceElement,
      start: settings.start,
      markers: getScrollTriggerDebug(),
      once: true,
      onEnter: () => {
        revealWrappers(instances);
        timeline?.pause(0);
        instances.forEach(hideInstance);
        timeline?.restart();
      },
    });

    sequenceElement.dataset.mcChalkSequenceReady = '1';
  };

  const controller: ChalkSequenceController = {
    element: sequenceElement,
    instances,
    settings,
    get(key) {
      return settings[key as keyof typeof settings];
    },
    set(key, value) {
      if (key === 'start') {
        const start = String(value || '').trim();

        if (!start) {
          return;
        }

        settings.start = start;
        sequenceElement.setAttribute('mc-chalk-start', settings.start);
        build();
        return;
      }

      const number = Number(value);

      if (!Number.isFinite(number)) {
        return;
      }

      if (key === 'duration') {
        settings.duration = Math.max(0.01, number);
        sequenceElement.setAttribute('mc-chalk-duration', String(settings.duration));
        build();
        return;
      }

      if (key === 'stagger') {
        settings.stagger = Math.max(0, number);
        sequenceElement.setAttribute('mc-chalk-stagger', String(settings.stagger));
        build();
      }
    },
    rebuild: build,
    applyMotionPreference() {
      build();
    },
    show() {
      revealWrappers(instances);

      if (timeline) {
        timeline.pause();
      }

      instances.forEach(showInstance);
    },
    hide() {
      if (timeline) {
        timeline.pause(0);
      }

      instances.forEach(hideInstance);
    },
    replay() {
      if (reduceMotionEnabled()) {
        revealWrappers(instances);
        instances.forEach(showInstance);
        return;
      }

      if (!timeline) {
        build();
      }

      revealWrappers(instances);
      instances.forEach(hideInstance);
      timeline?.restart();
    },
  };

  build();

  logger.info('Sequence initialised', {
    element: sequenceElement,
    items: instances.length,
    duration: settings.duration,
    stagger: settings.stagger,
    start: settings.start,
    debug: settings.debug,
  });

  return controller;
};

const initSequences = () => {
  sequenceControllers.length = 0;

  const sequences = [...document.querySelectorAll<HTMLElement>(SEQUENCE_SELECTOR)];

  sequences.forEach((sequence) => {
    const controller = initSequence(sequence);

    if (controller) {
      sequenceControllers.push(controller);
    }
  });

  const mc = ensureMC();
  mc.chalkSequences = sequenceControllers;

  ScrollTrigger.refresh();

  if (!window.__mcChalkMotionListener) {
    window.__mcChalkMotionListener = true;

    window.addEventListener('mcMotionPreferenceChange', () => {
      sequenceControllers.forEach((controller) => controller.applyMotionPreference());
      ScrollTrigger.refresh();
    });

    onScrollTriggerDebugChange(() => {
      sequenceControllers.forEach((controller) => controller.rebuild());
      ScrollTrigger.refresh();
    });

    reducedMotionQuery.addEventListener?.('change', () => {
      if (window.MC?.motion && window.MC.motion.mode !== 'system') {
        return;
      }

      sequenceControllers.forEach((controller) => controller.applyMotionPreference());
      ScrollTrigger.refresh();
    });
  }
};

export const initMCChalk = () => {
  const init = async () => {
    const wrappers = [...document.querySelectorAll<HTMLElement>(CHALK_SELECTOR)];

    if (!wrappers.length) {
      return;
    }

    try {
      const stamp = await loadStamp();

      wrappers.forEach((wrapper, index) => {
        applyChalk(wrapper, index, stamp);
      });

      wrappers.forEach((wrapper) => {
        if (wrapper.closest(SEQUENCE_SELECTOR)) {
          return;
        }

        const instance = chalkInstances.get(wrapper);

        if (instance) {
          showInstance(instance);
          revealWrapper(instance);
        }
      });

      initSequences();

      const instances = [...chalkInstances.values()];
      const generatedElements = instances.reduce(
        (total, instance) => total + (instance.generatedElements || 0),
        0
      );
      const averagePerIcon = instances.length ? generatedElements / instances.length : 0;

      const mc = ensureMC();
      mc.chalk = instances;
      mc.chalkStats = {
        icons: instances.length,
        generatedElements,
        averagePerIcon,
        perIcon: instances.map((instance, index) => ({
          index: index + 1,
          generatedElements: instance.generatedElements || 0,
        })),
      };

      logger.info('DOM impact', mc.chalkStats);

      const chalkAppearanceController = {
        get(key: string) {
          const first = ensureMC().chalk?.[0];

          return first?.get?.(key);
        },
        set(key: string, value: unknown) {
          (ensureMC().chalk || []).forEach((instance) => instance.set?.(key, value));
        },
      };

      registerDebugSchema({
        id: 'chalk-appearance',
        label: 'Chalk',
        instances: () => (ensureMC().chalk?.length ? [chalkAppearanceController] : []),
        instanceLabel: 'Global Appearance',
        stats: [
          {
            label: 'Icons',
            value: () => ensureMC().chalkStats?.icons || 0,
          },
          {
            label: 'Generated DOM nodes',
            value: () => ensureMC().chalkStats?.generatedElements || 0,
          },
          {
            label: 'Average / icon',
            value: () => ensureMC().chalkStats?.averagePerIcon || 0,
          },
        ],
        controls: [
          {
            type: 'range',
            key: 'bend',
            label: 'Bend',
            min: 0,
            max: 20,
            step: 0.5,
          },
          {
            type: 'range',
            key: 'maskWidth',
            label: 'Mask Width',
            min: 0.1,
            max: 2,
            step: 0.05,
            decimals: 2,
          },
          {
            type: 'range',
            key: 'brushDensity',
            label: 'Brush Density',
            min: 25,
            max: 200,
            step: 5,
            suffix: '%',
            event: 'change',
          },
          {
            type: 'range',
            key: 'stampDensity',
            label: 'Stamp Density',
            min: 25,
            max: 200,
            step: 5,
            suffix: '%',
            event: 'change',
          },
        ],
      });

      registerDebugSchema({
        id: 'chalk-sequences',
        label: 'Chalk Sequence',
        instances: () => ensureMC().chalkSequences || [],
        instanceLabel: 'Sequence',
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
            label: 'Duration',
            min: 0.05,
            max: 2,
            step: 0.05,
            suffix: 's',
            decimals: 2,
            event: 'change',
          },
          {
            type: 'range',
            key: 'stagger',
            label: 'Stagger',
            min: 0,
            max: 1,
            step: 0.01,
            suffix: 's',
            decimals: 2,
            event: 'change',
          },
          {
            type: 'button',
            label: 'Replay',
            action: 'replay',
          },
        ],
      });

      window.addEventListener('mcChalkStatsChange', () => ensureMC().debug?.refresh?.());

      logger.info(`Applied to ${wrappers.length} element(s).`);
    } catch (error) {
      logger.error(error);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        void init();
      },
      { once: true }
    );
  } else {
    void init();
  }
};
