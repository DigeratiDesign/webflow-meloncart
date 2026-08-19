import { initThemeCollector } from './collector';
import { initThemeScrollAnimation } from './scroll-animation';

export const initTheme = (): void => {
  initThemeScrollAnimation();
  initThemeCollector();
};
