import { initMCDebug } from './mc/core/debug';
import { initMCMotion } from './mc/core/motion';
import { initMCChalk } from './mc/effects/chalk';
import { initMCColourReveal } from './mc/effects/colour-reveal';
import { initMCDepth } from './mc/effects/depth';
import { initMCIllustration } from './mc/effects/illustration';
import { initForm } from './site/form';
import { initPrefillUtility } from './site/prefill';
import { initTheme } from './site/theme';

initMCMotion();
initMCDebug();
initMCChalk();
initMCColourReveal();
initMCDepth();
initMCIllustration();
initForm();
initPrefillUtility();
initTheme();
