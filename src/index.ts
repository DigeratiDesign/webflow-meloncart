import { initMCDebug } from './digerati/core/debug';
import { initMCMotion } from './digerati/core/motion';
import { initForm } from './digerati/form/form';
import { initMCBrokenGlitch } from './meloncart/effects/broken-glitch';
import { initMCBurger } from './meloncart/effects/burger';
import { initMCChalk } from './meloncart/effects/chalk';
import { initMCColourReveal } from './meloncart/effects/colour-reveal';
import { initMCDepth } from './meloncart/effects/depth';
import { initMCFooterLinkSweep } from './meloncart/effects/footer-link-sweep';
import {
  claimMCHeroSequenceOwnership,
  initMCHeroSequence,
} from './meloncart/effects/hero-sequence';
import { initMCHoverIntent } from './meloncart/effects/hover-intent';
import { initMCIllustration } from './meloncart/effects/illustration';
import { initMCImageReveal } from './meloncart/effects/image-reveal';
import { initMCParallax } from './meloncart/effects/parallax';
import { initMCReward } from './meloncart/effects/reward';
import { initMCSubmitProxy } from './meloncart/effects/submit-proxy';
import { initMCUnderline } from './meloncart/effects/underline';
import { initPrefillUtility } from './meloncart/forms/prefill';
import { initMCGradient } from './meloncart/gradient';
import { initMCMaxWidth } from './meloncart/max-width';
import { initMCPreloader } from './meloncart/preloader';
import { initTheme } from './meloncart/theme';

initMCMotion();
initMCDebug();
initMCBurger();
initMCBrokenGlitch();
initMCChalk();
claimMCHeroSequenceOwnership();
initMCColourReveal();
initMCDepth();
initMCFooterLinkSweep();
initMCGradient();
initMCHoverIntent();
initMCIllustration();
initMCImageReveal();
initMCMaxWidth();
initMCParallax();
initMCReward();
initMCSubmitProxy();
initMCUnderline();
initMCPreloader();
initMCHeroSequence();
initForm();
initPrefillUtility();
initTheme();
