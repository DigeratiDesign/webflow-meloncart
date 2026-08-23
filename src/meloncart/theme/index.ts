import { initThemeCollector } from '../../digerati/theme/collector';
import { initAutoHideAccordionItem } from './auto-hide-accordion-item';
import { initThemeScrollAnimation } from './scroll-animation';
import { initMCWidowControl } from './widow-control';

export const initTheme = (): void => {
  initThemeScrollAnimation();
  initThemeCollector();
  initAutoHideAccordionItem();
  initMCWidowControl();
};
