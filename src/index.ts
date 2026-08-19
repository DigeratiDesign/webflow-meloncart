import { initMCDebug } from './digerati/core/debug';
import { initMCMotion } from './digerati/core/motion';
import { initForm } from './digerati/form/form';
import { initMCChalk } from './meloncart/effects/chalk';
import { initMCColourReveal } from './meloncart/effects/colour-reveal';
import { initMCDepth } from './meloncart/effects/depth';
import { initMCIllustration } from './meloncart/effects/illustration';
import { initPrefillUtility } from './meloncart/forms/prefill';
import { initTheme } from './meloncart/theme';

initMCMotion();
initMCDebug();
initMCChalk();
initMCColourReveal();
initMCDepth();
initMCIllustration();
initForm();
initPrefillUtility();
initTheme();
