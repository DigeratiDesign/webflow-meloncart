import { initMCDebug } from './digerati/core/debug';
import { initMCMotion } from './digerati/core/motion';
import { initForm } from './digerati/form/form';
import { initMCChalk } from './meloncart/effects/chalk';
import { initMCColourReveal } from './meloncart/effects/colour-reveal';
import { initMCDepth } from './meloncart/effects/depth';
import { initMCFooterLinkSweep } from './meloncart/effects/footer-link-sweep';
import {
  claimMCHeroSequenceOwnership,
  initMCHeroSequence,
} from './meloncart/effects/hero-sequence';
import { initMCIllustration } from './meloncart/effects/illustration';
import { initMCImageReveal } from './meloncart/effects/image-reveal';
import { initMCPageNav } from './meloncart/effects/page-nav';
import { initMCParallax } from './meloncart/effects/parallax';
import { initMCReward } from './meloncart/effects/reward';
import { initMCSubmitProxy } from './meloncart/effects/submit-proxy';
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
initMCFooterLinkSweep();
initMCIllustration();
initMCImageReveal();
initMCParallax();
initMCPageNav();
initMCReward();
initMCSubmitProxy();
initMCUnderline();
initMCHeroSequence();
initForm();
initPrefillUtility();
initTheme();
