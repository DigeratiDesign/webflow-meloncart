import { initMCDebug } from './mc/core/debug';
import { initMCMotion } from './mc/core/motion';
import { initMCChalk } from './mc/effects/chalk';
import { initMCColourReveal } from './mc/effects/colour-reveal';
import { initMCDepth } from './mc/effects/depth';
import { initMCIllustration } from './mc/effects/illustration';

initMCMotion();
initMCDebug();
initMCChalk();
initMCColourReveal();
initMCDepth();
initMCIllustration();
