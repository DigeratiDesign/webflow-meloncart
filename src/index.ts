import { initMCDebug } from './digerati/core/debug';
import { initMCMotion } from './digerati/core/motion';
import { initForm } from './digerati/form/form';
import { initMCChalk } from './meloncart/effects/chalk';
import { initMCColourReveal } from './meloncart/effects/colour-reveal';
import { initMCDepth } from './meloncart/effects/depth';
import {
  claimMCHeroSequenceOwnership,
  initMCHeroSequence,
} from './meloncart/effects/hero-sequence';
import { initMCIllustration } from './meloncart/effects/illustration';
import { initMCImageReveal } from './meloncart/effects/image-reveal';
import { initMCUnderline } from './meloncart/effects/underline';
import { initPrefillUtility } from './meloncart/forms/prefill';
import { initMCPreloader } from './meloncart/preloader';
import { initTheme } from './meloncart/theme';

initMCMotion();
initMCDebug();
initMCPreloader();
initMCChalk();
claimMCHeroSequenceOwnership();
initMCColourReveal();
initMCDepth();
initMCIllustration();
initMCImageReveal();
initMCUnderline();
initMCHeroSequence();
initForm();
initPrefillUtility();
initTheme();
