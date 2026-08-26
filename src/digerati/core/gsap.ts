import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import SplitText from 'gsap/SplitText';

let registered = false;
let scrollTriggerDebug = false;
let scrollTriggerRefreshFrame: number | null = null;

const scrollTriggerDebugListeners = new Set<(enabled: boolean) => void>();

const registerPlugins = (): void => {
  if (registered) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger, SplitText);
  registered = true;
};

registerPlugins();

export const getScrollTriggerDebug = (): boolean => scrollTriggerDebug;

export const setScrollTriggerDebug = (enabled: boolean): void => {
  if (scrollTriggerDebug === enabled) {
    return;
  }

  scrollTriggerDebug = enabled;

  scrollTriggerDebugListeners.forEach((listener) => {
    listener(scrollTriggerDebug);
  });
};

export const onScrollTriggerDebugChange = (listener: (enabled: boolean) => void): (() => void) => {
  scrollTriggerDebugListeners.add(listener);

  return () => {
    scrollTriggerDebugListeners.delete(listener);
  };
};

/** Coalesce layout-heavy ScrollTrigger refreshes requested during the same frame. */
export const requestScrollTriggerRefresh = (): void => {
  if (scrollTriggerRefreshFrame !== null) {
    return;
  }

  scrollTriggerRefreshFrame = requestAnimationFrame(() => {
    scrollTriggerRefreshFrame = null;
    ScrollTrigger.refresh();
  });
};

export { gsap, registerPlugins, ScrollTrigger, SplitText };
