import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import SplitText from 'gsap/SplitText';

let registered = false;

const registerPlugins = (): void => {
  if (registered) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger, SplitText);
  registered = true;
};

registerPlugins();

export { gsap, registerPlugins, ScrollTrigger, SplitText };
