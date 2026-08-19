import { initThemeCollector } from '../../digerati/theme/collector';
import { initThemeScrollAnimation } from './scroll-animation';

export const initTheme = (): void => {
  initThemeScrollAnimation();
  initThemeCollector();
};
