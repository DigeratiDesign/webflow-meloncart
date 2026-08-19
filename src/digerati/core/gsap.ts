import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import SplitText from 'gsap/SplitText';

let registered = false;
let scrollTriggerDebug = false;

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

export { gsap, registerPlugins, ScrollTrigger, SplitText };
