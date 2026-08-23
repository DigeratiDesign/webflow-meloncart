import { createLogger } from '../../digerati/core/logger';

type WidowControlOptions = {
  selector?: string;
  skipSelectors?: string[];
  nowrapCount?: number;
  markAttr?: string;
  debug?: boolean;
};

const WIDOW_ATTR = 'mc-widow';
const WIDOW_WORDS_ATTR = 'mc-widow-words';
const NBSP = '\u00A0';
const DEFAULTS: Required<Omit<WidowControlOptions, 'debug'>> = {
  selector: 'p, li',
  skipSelectors: ['[aria-hidden="true"]'],
  nowrapCount: 2,
  markAttr: 'data-mc-widow',
};

let initialized = false;
const logger = createLogger('melon', 'widow', {
  debug: () => false,
});

const getNowrapCount = (element: HTMLElement, fallback: number): number => {
  const attr = element.getAttribute(WIDOW_WORDS_ATTR);

  if (!attr) {
    return fallback;
  }

  const parsed = Number.parseInt(attr, 10);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(2, parsed);
};

const getEligibleTextNodes = (root: HTMLElement, skipSelectors: string[]): Text[] => {
  const nodes: Text[] = [];
  const skipSelector = skipSelectors.join(',');

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const text = node.nodeValue ?? '';

      if (!/\S/.test(text)) {
        return NodeFilter.FILTER_REJECT;
      }

      const parent = node.parentElement;

      if (!parent) {
        return NodeFilter.FILTER_REJECT;
      }

      const noFixParent = parent.closest(`[${WIDOW_ATTR}="no-fix"]`);

      if (noFixParent && noFixParent !== root) {
        return NodeFilter.FILTER_REJECT;
      }

      if (skipSelector) {
        const skippedParent = parent.closest(skipSelector);

        if (skippedParent && skippedParent !== root) {
          return NodeFilter.FILTER_REJECT;
        }
      }

      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let node = walker.nextNode() as Text | null;

  while (node) {
    nodes.push(node);
    node = walker.nextNode() as Text | null;
  }

  return nodes;
};

const findPreviousNonWhitespace = (
  nodes: Text[],
  nodeIndex: number,
  charIndex: number
): boolean => {
  for (let i = nodeIndex; i >= 0; i--) {
    const value = nodes[i].nodeValue ?? '';
    const start = i === nodeIndex ? charIndex - 1 : value.length - 1;

    for (let j = start; j >= 0; j--) {
      if (!/\s/.test(value[j])) {
        return true;
      }
    }
  }

  return false;
};

const findNextNonWhitespace = (nodes: Text[], nodeIndex: number, charIndex: number): boolean => {
  for (let i = nodeIndex; i < nodes.length; i++) {
    const value = nodes[i].nodeValue ?? '';
    const start = i === nodeIndex ? charIndex + 1 : 0;

    for (let j = start; j < value.length; j++) {
      if (!/\s/.test(value[j])) {
        return true;
      }
    }
  }

  return false;
};

const keepLastNWordsTogether = (
  root: HTMLElement,
  count: number,
  skipSelectors: string[],
  debug: boolean
): boolean => {
  const nodes = getEligibleTextNodes(root, skipSelectors);

  if (!nodes.length) {
    return false;
  }

  const spacesNeeded = count - 1;
  let spacesReplaced = 0;

  for (
    let nodeIndex = nodes.length - 1;
    nodeIndex >= 0 && spacesReplaced < spacesNeeded;
    nodeIndex--
  ) {
    const node = nodes[nodeIndex];
    const value = node.nodeValue ?? '';

    if (!value) {
      continue;
    }

    const chars = value.split('');

    for (
      let charIndex = chars.length - 1;
      charIndex >= 0 && spacesReplaced < spacesNeeded;
      charIndex--
    ) {
      const char = chars[charIndex];

      if (!/\s/.test(char) || char === NBSP) {
        continue;
      }

      const hasContentBefore = findPreviousNonWhitespace(nodes, nodeIndex, charIndex);
      const hasContentAfter = findNextNonWhitespace(nodes, nodeIndex, charIndex);

      if (!hasContentBefore || !hasContentAfter) {
        continue;
      }

      chars[charIndex] = NBSP;
      spacesReplaced += 1;

      if (debug) {
        logger.debug('Replacing trailing whitespace', {
          nodeIndex,
          charIndex,
          spacesReplaced,
          spacesNeeded,
        });
      }
    }

    node.nodeValue = chars.join('');
  }

  return spacesReplaced === spacesNeeded;
};

const revertWidow = (root: HTMLElement): boolean => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let changed = false;
  let node = walker.nextNode() as Text | null;

  while (node) {
    const value = node.nodeValue ?? '';

    if (value.includes(NBSP)) {
      node.nodeValue = value.replace(/\u00A0/g, ' ');
      changed = true;
    }

    node = walker.nextNode() as Text | null;
  }

  return changed;
};

const applyWidowControl = (options: WidowControlOptions = {}): void => {
  const selector = options.selector ?? DEFAULTS.selector;
  const skipSelectors = options.skipSelectors ?? DEFAULTS.skipSelectors;
  const defaultNowrapCount = Math.max(2, options.nowrapCount ?? DEFAULTS.nowrapCount);
  const markAttr = options.markAttr ?? DEFAULTS.markAttr;
  const debug = options.debug ?? false;
  const skipSelector = skipSelectors.join(',');
  const targetSelector = `${selector}, [${WIDOW_ATTR}="fix"]`;
  const targets = Array.from(new Set(document.querySelectorAll<HTMLElement>(targetSelector)));

  targets.forEach((element) => {
    const tag = element.tagName.toLowerCase();
    const widowMode = element.getAttribute(WIDOW_ATTR);
    const forceFix = widowMode === 'fix';
    const noFix = widowMode === 'no-fix';
    const isHeading = /^h[1-6]$/.test(tag);
    const previousState = element.getAttribute(markAttr);

    if (noFix) {
      if (previousState === 'fixed') {
        revertWidow(element);
      }

      element.setAttribute(markAttr, 'skipped-no-fix');
      return;
    }

    if (isHeading && !forceFix) {
      element.setAttribute(markAttr, 'skipped-heading');
      return;
    }

    const matchesSkip =
      skipSelector && (element.matches(skipSelector) || !!element.closest(skipSelector));

    if (matchesSkip) {
      if (previousState === 'fixed') {
        revertWidow(element);
      }

      element.setAttribute(markAttr, 'skipped');
      return;
    }

    if (element.hasAttribute(markAttr)) {
      return;
    }

    const nowrapCount = getNowrapCount(element, defaultNowrapCount);
    const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim();
    const wordCount = text ? text.split(' ').filter(Boolean).length : 0;

    if (wordCount < nowrapCount) {
      element.setAttribute(markAttr, 'skipped-too-few-words');
      return;
    }

    const fixed = keepLastNWordsTogether(element, nowrapCount, skipSelectors, debug);
    element.setAttribute(markAttr, fixed ? 'fixed' : 'noop');
  });
};

export const initMCWidowControl = (options: WidowControlOptions = {}): void => {
  if (initialized) {
    return;
  }

  initialized = true;
  applyWidowControl(options);
};
