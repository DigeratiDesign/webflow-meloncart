const NOISE_SELECTOR = '#mc-broken-noise';
const DISPLACEMENT_SELECTOR = '#mc-broken-displacement';
const MIN_DELAY = 1800;
const MAX_DELAY = 4200;

const random = (min: number, max: number) => Math.random() * (max - min) + min;
const reducedMotionEnabled = () => window.MC?.motion?.reduced ?? false;

class MCBrokenGlitch {
  noise: SVGFETurbulenceElement;
  displacement: SVGFEDisplacementMapElement;
  private timers = new Set<number>();
  private active = false;

  constructor(noise: SVGFETurbulenceElement, displacement: SVGFEDisplacementMapElement) {
    this.noise = noise;
    this.displacement = displacement;
  }

  private setTimer(callback: () => void, delay: number) {
    const timer = window.setTimeout(() => {
      this.timers.delete(timer);
      callback();
    }, delay);

    this.timers.add(timer);
  }

  private setGlitch(scale: number) {
    this.noise.setAttribute(
      'baseFrequency',
      `${random(0.008, 0.025).toFixed(4)} ${random(0.16, 0.32).toFixed(4)}`
    );
    this.noise.setAttribute('seed', `${Math.floor(random(1, 100))}`);
    this.displacement.setAttribute('scale', scale.toFixed(2));
  }

  private clearGlitch() {
    this.displacement.setAttribute('scale', '0');
  }

  private burst() {
    if (!this.active) return;

    const hits = Math.floor(random(2, 5));
    let hit = 0;

    const nextHit = () => {
      if (!this.active) return;

      if (hit >= hits) {
        this.clearGlitch();
        this.scheduleBurst();
        return;
      }

      this.setGlitch(random(20, 48));
      this.setTimer(
        () => {
          this.clearGlitch();
          this.setTimer(
            () => {
              hit += 1;
              nextHit();
            },
            random(25, 70)
          );
        },
        random(35, 90)
      );
    };

    nextHit();
  }

  private scheduleBurst() {
    if (!this.active) return;

    this.setTimer(() => this.burst(), random(MIN_DELAY, MAX_DELAY));
  }

  start() {
    if (this.active || reducedMotionEnabled()) return;

    this.active = true;
    this.scheduleBurst();
  }

  stop() {
    this.active = false;
    this.timers.forEach((timer) => window.clearTimeout(timer));
    this.timers.clear();
    this.clearGlitch();
  }
}

export const initMCBrokenGlitch = () => {
  const noise = document.querySelector<SVGFETurbulenceElement>(NOISE_SELECTOR);
  const displacement = document.querySelector<SVGFEDisplacementMapElement>(DISPLACEMENT_SELECTOR);

  if (!noise || !displacement) return;

  const glitch = new MCBrokenGlitch(noise, displacement);
  const updateMotion = () => {
    if (reducedMotionEnabled()) {
      glitch.stop();
      return;
    }

    glitch.start();
  };

  updateMotion();
  window.addEventListener('mcMotionPreferenceChange', updateMotion);
  window.addEventListener('pagehide', () => glitch.stop(), { once: true });
};
