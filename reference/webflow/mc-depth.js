(() => {
    'use strict';

    function ensureMotionAPI() {
        window.MC = window.MC || {};

        if (!window.MC.motion) {
            window.MC.motion = {
                mode: 'system',
                get systemReduced() {
                    return !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
                },
                get reduced() {
                    if (this.mode === 'reduce') return true;
                    if (this.mode === 'full') return false;
                    return this.systemReduced;
                },
                setMode(mode) {
                    if (!['system', 'reduce', 'full'].includes(mode)) return;
                    this.mode = mode;
                    window.dispatchEvent(new CustomEvent('mcMotionPreferenceChange', {
                        detail: { mode: this.mode, reduced: this.reduced, systemReduced: this.systemReduced }
                    }));
                }
            };
        }

        return window.MC.motion;
    }

    function registerDebugSchema(schema) {
        window.MC = window.MC || {};
        if (window.MC.debug?.register) {
            window.MC.debug.register(schema);
            return;
        }
        window.MC.__debugQueue = window.MC.__debugQueue || [];
        window.MC.__debugQueue.push(schema);
    }

    const motion = ensureMotionAPI();


    const SELECTOR = 'img[mc-depth-reveal]';

    const DEFAULTS = {
        trace: 1.35,
        lineWidth: 1,
        pressure: 1,
        threshold: 0.18,
        initialFade: 700,
        finalFade: 900,
        trackX: 0,
        trackY: 0,
        scrollX: 0,
        scrollY: 0,
        autoX: 0,
        autoY: 0,
        autoZoom: 0,
        autoDuration: 40,
        zoom: 1.04,
        direction: 1,
        duration: 2850,
    };

    const clamp = (value, min = 0, max = 1) =>
        Math.min(max, Math.max(min, value));

    const ease = (t) =>
        t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const attrNumber = (element, name, fallback) => {
        const raw = element.getAttribute(name);

        if (raw === null || raw === '') {
            return fallback;
        }

        const value = Number(raw);

        return Number.isFinite(value)
            ? value
            : fallback;
    };

    const waitForImage = (image) => {
        if (image.complete && image.naturalWidth > 0) {
            return Promise.resolve(image);
        }

        return new Promise((resolve, reject) => {
            image.addEventListener(
                'load',
                () => resolve(image),
                { once: true }
            );

            image.addEventListener(
                'error',
                () => reject(
                    new Error('Source image could not load')
                ),
                { once: true }
            );
        });
    };

    const loadImage = (src) =>
        new Promise((resolve, reject) => {
            const image = new Image();

            image.crossOrigin = 'anonymous';
            image.decoding = 'async';

            image.onload = () => resolve(image);

            image.onerror = () =>
                reject(
                    new Error(`Image could not load: ${src}`)
                );

            image.src = src;
        });

    const waitForWindowLoad = () => {
        if (document.readyState === 'complete') {
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            window.addEventListener(
                'load',
                resolve,
                { once: true }
            );
        });
    };

    const nextFrame = () =>
        new Promise((resolve) =>
            requestAnimationFrame(resolve)
        );

    const compileShader = (gl, type, source) => {
        const shader = gl.createShader(type);

        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (
            !gl.getShaderParameter(
                shader,
                gl.COMPILE_STATUS
            )
        ) {
            const message =
                gl.getShaderInfoLog(shader) ||
                'Shader compilation failed';

            gl.deleteShader(shader);

            throw new Error(message);
        }

        return shader;
    };

    class MCDepthReveal {
        constructor(image) {
            this.image = image;

            this.settings = {
                trace: attrNumber(
                    image,
                    'mc-depth-trace',
                    DEFAULTS.trace
                ),

                lineWidth: attrNumber(
                    image,
                    'mc-depth-line-width',
                    DEFAULTS.lineWidth
                ),

                pressure: attrNumber(
                    image,
                    'mc-depth-pressure',
                    DEFAULTS.pressure
                ),

                threshold: attrNumber(
                    image,
                    'mc-depth-threshold',
                    DEFAULTS.threshold
                ),

                initialFade: attrNumber(
                    image,
                    'mc-depth-initial-fade',
                    DEFAULTS.initialFade
                ),

                finalFade: attrNumber(
                    image,
                    'mc-depth-final-fade',
                    DEFAULTS.finalFade
                ),

                trackX: attrNumber(
                    image,
                    'mc-depth-track-x',
                    DEFAULTS.trackX
                ),

                trackY: attrNumber(
                    image,
                    'mc-depth-track-y',
                    DEFAULTS.trackY
                ),

                scrollX: attrNumber(
                    image,
                    'mc-depth-scroll-x',
                    DEFAULTS.scrollX
                ),

                scrollY: attrNumber(
                    image,
                    'mc-depth-scroll-y',
                    DEFAULTS.scrollY
                ),

                autoX: attrNumber(
                    image,
                    'mc-depth-auto-x',
                    DEFAULTS.autoX
                ),

                autoY: attrNumber(
                    image,
                    'mc-depth-auto-y',
                    DEFAULTS.autoY
                ),

                autoZoom: attrNumber(
                    image,
                    'mc-depth-auto-zoom',
                    DEFAULTS.autoZoom
                ),

                autoDuration: attrNumber(
                    image,
                    'mc-depth-auto-duration',
                    DEFAULTS.autoDuration
                ),

                zoom: attrNumber(
                    image,
                    'mc-depth-zoom',
                    DEFAULTS.zoom
                ),

                direction: attrNumber(
                    image,
                    'mc-depth-direction',
                    DEFAULTS.direction
                ),

                duration: attrNumber(
                    image,
                    'mc-depth-duration',
                    DEFAULTS.duration
                ),
            };

            this.depthSrc =
                image.getAttribute('mc-depth-map');

            this.canvas = null;
            this.gl = null;
            this.program = null;

            this.imageTexture = null;
            this.depthTexture = null;

            this.imageRes = [1, 1];
            this.canvasCssSize = [1, 1];

            this.pointer = {
                x: 0,
                y: 0,
            };

            this.target = {
                x: 0,
                y: 0,
            };

            this.scroll = { x: 0, y: 0 };
            this.auto = { x: 0, y: 0, zoom: 0 };
            this.autoElapsed = 0;
            this.autoLastTime = null;

            this.pointerTrackingEnabled =
                this.settings.trackX !== 0 || this.settings.trackY !== 0;
            this.scrollTrackingEnabled =
                this.settings.scrollX !== 0 || this.settings.scrollY !== 0;
            this.autoTrackingEnabled =
                this.settings.autoX !== 0 || this.settings.autoY !== 0 || this.settings.autoZoom !== 0;

            this.scrollTween = null;
            this.scrollTrigger = null;
            this.effectLoaded = false;
            this.loadingEffect = false;
            this.reducedStatic = false;

            this.inView = false;
            this.ready = false;
            this.revealComplete = false;

            this.startTime = null;
            this.frameId = null;

            this.parentPositionChanged = false;
            this.originalParentPosition = '';

            this.boundPointerMove =
                this.onPointerMove.bind(this);

            this.boundResize =
                this.onResize.bind(this);

            this.boundMotionChange =
                this.onMotionPreferenceChange.bind(this);

            window.addEventListener(
                'mcMotionPreferenceChange',
                this.boundMotionChange
            );

            this.init();
        }

        async init() {
            /*
             * Reduced motion gets the cheapest possible path:
             * show the authored image and do NOT request the depth map.
             */
            if (motion.reduced) {
                this.showStaticImage();
                return;
            }

            await this.loadEffect();
        }

        async loadEffect() {
            if (this.effectLoaded || this.loadingEffect || motion.reduced) return;

            if (!this.depthSrc) {
                console.warn('[MC Depth] Missing mc-depth-map:', this.image);
                this.showStaticImage();
                return;
            }

            this.loadingEffect = true;

            try {
                await waitForImage(this.image);

                if (motion.reduced) {
                    this.loadingEffect = false;
                    this.showStaticImage();
                    return;
                }

                const sourceSrc = this.image.currentSrc || this.image.src;
                const [sourceImage, depthImage] = await Promise.all([
                    loadImage(sourceSrc),
                    loadImage(this.depthSrc),
                ]);

                if (motion.reduced) {
                    this.loadingEffect = false;
                    this.showStaticImage();
                    return;
                }

                this.sourceImage = sourceImage;
                this.depthImage = depthImage;
                this.imageRes = [sourceImage.naturalWidth, sourceImage.naturalHeight];

                const imageAspect = sourceImage.naturalWidth / sourceImage.naturalHeight;
                const depthAspect = depthImage.naturalWidth / depthImage.naturalHeight;

                if (Math.abs(imageAspect - depthAspect) > 0.001) {
                    console.warn('[MC Depth] Source/depth aspect ratios differ:', {
                        image: [sourceImage.naturalWidth, sourceImage.naturalHeight],
                        depth: [depthImage.naturalWidth, depthImage.naturalHeight],
                        element: this.image,
                    });
                }

                this.image.style.opacity = '0';

                this.createCanvas();
                this.createWebGL();
                this.uploadTextures();
                this.createObserver();

                window.addEventListener('resize', this.boundResize, { passive: true });

                if (this.pointerTrackingEnabled) {
                    window.addEventListener('pointermove', this.boundPointerMove, { passive: true });
                }

                if (this.scrollTrackingEnabled) this.createScrollTracking();

                this.ready = true;
                this.effectLoaded = true;
                this.loadingEffect = false;
                this.reducedStatic = false;

                await waitForWindowLoad();
                await nextFrame();
                await nextFrame();

                if (!motion.reduced) this.startReveal();

                console.log('[MC Depth] Initialised');
            } catch (error) {
                this.loadingEffect = false;
                console.error('[MC Depth] Initialisation failed:', error, this.image);
                this.showStaticImage();
            }
        }

        showStaticImage() {
            this.reducedStatic = true;
            this.image.style.opacity = '1';

            if (this.canvas) this.canvas.style.display = 'none';

            if (this.frameId !== null) {
                cancelAnimationFrame(this.frameId);
                this.frameId = null;
            }

            this.autoLastTime = null;
        }

        async onMotionPreferenceChange() {
            if (motion.reduced) {
                this.showStaticImage();
                return;
            }

            if (!this.effectLoaded) {
                await this.loadEffect();
                return;
            }

            this.reducedStatic = false;
            this.image.style.opacity = '0';
            if (this.canvas) this.canvas.style.display = 'block';
            this.startReveal();
        }

        get(name) {
            return this.settings[name];
        }

        set(name, rawValue) {
            if (!(name in this.settings)) return;
            const value = Number(rawValue);
            if (!Number.isFinite(value)) return;

            if (name === 'autoDuration') {
                const oldMs = Math.max(1, this.settings.autoDuration * 1000);
                const progress = (this.autoElapsed % oldMs) / oldMs;
                this.settings.autoDuration = Math.max(1, value);
                this.autoElapsed = progress * this.settings.autoDuration * 1000;
                this.autoLastTime = null;
            } else {
                this.settings[name] = value;
            }

            this.pointerTrackingEnabled = this.settings.trackX !== 0 || this.settings.trackY !== 0;
            this.scrollTrackingEnabled = this.settings.scrollX !== 0 || this.settings.scrollY !== 0;
            this.autoTrackingEnabled = this.settings.autoX !== 0 || this.settings.autoY !== 0 || this.settings.autoZoom !== 0;

            if (!motion.reduced) this.requestFrame();
        }

        replay() {
            if (motion.reduced) {
                this.showStaticImage();
                return;
            }

            if (!this.effectLoaded) {
                this.loadEffect();
                return;
            }

            this.image.style.opacity = '0';
            if (this.canvas) this.canvas.style.display = 'block';
            this.startReveal();
        }

        createCanvas() {
            const parent = this.image.parentElement;

            if (!parent) {
                throw new Error(
                    'Depth reveal image has no parent element'
                );
            }

            const parentStyle =
                getComputedStyle(parent);

            if (parentStyle.position === 'static') {
                this.originalParentPosition =
                    parent.style.position;

                parent.style.position = 'relative';

                this.parentPositionChanged = true;
            }

            const canvas =
                document.createElement('canvas');

            canvas.setAttribute(
                'aria-hidden',
                'true'
            );

            canvas.style.position = 'absolute';
            canvas.style.pointerEvents = 'none';
            canvas.style.display = 'block';
            canvas.style.zIndex = '1';
            canvas.style.opacity = '0';
            canvas.style.background = 'transparent';

            canvas.style.borderRadius =
                getComputedStyle(
                    this.image
                ).borderRadius;

            parent.appendChild(canvas);

            this.canvas = canvas;

            this.positionCanvas();
        }

        positionCanvas() {
            if (!this.canvas) {
                return;
            }

            const imageRect =
                this.image.getBoundingClientRect();

            const parentRect =
                this.image.parentElement
                    .getBoundingClientRect();

            const left =
                imageRect.left - parentRect.left;

            const top =
                imageRect.top - parentRect.top;

            this.canvas.style.left =
                `${left}px`;

            this.canvas.style.top =
                `${top}px`;

            this.canvas.style.width =
                `${imageRect.width}px`;

            this.canvas.style.height =
                `${imageRect.height}px`;

            this.canvasCssSize = [
                Math.max(1, imageRect.width),
                Math.max(1, imageRect.height),
            ];

            this.resizeCanvas();
        }

        resizeCanvas() {
            if (!this.canvas || !this.gl) {
                return;
            }

            const dpr = Math.min(
                window.devicePixelRatio || 1,
                2
            );

            const rect =
                this.canvas.getBoundingClientRect();

            this.canvasCssSize = [
                Math.max(1, rect.width),
                Math.max(1, rect.height),
            ];

            const width = Math.max(
                1,
                Math.round(rect.width * dpr)
            );

            const height = Math.max(
                1,
                Math.round(rect.height * dpr)
            );

            if (
                this.canvas.width !== width ||
                this.canvas.height !== height
            ) {
                this.canvas.width = width;
                this.canvas.height = height;

                this.gl.viewport(
                    0,
                    0,
                    width,
                    height
                );
            }
        }

        onResize() {
            this.positionCanvas();

            this.scrollTrigger?.refresh();

            if (
                this.ready &&
                this.inView &&
                !motion.reduced
            ) {
                this.requestFrame();
            }
        }

        createScrollTracking() {
            if (!window.gsap || !window.ScrollTrigger) {
                console.warn('[MC Depth] Scroll tracking requested but GSAP/ScrollTrigger unavailable.');
                return;
            }

            window.gsap.registerPlugin(window.ScrollTrigger);

            this.scrollTween = window.gsap.to(this.scroll, {
                x: this.settings.scrollX,
                y: this.settings.scrollY,
                ease: 'none',
                scrollTrigger: {
                    trigger: this.image.parentElement || this.image,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true,
                    invalidateOnRefresh: true,
                    onUpdate: () => {
                        if (this.ready && this.revealComplete && this.inView && !motion.reduced) this.requestFrame();
                    },
                },
            });

            this.scrollTrigger = this.scrollTween.scrollTrigger;
        }

        updateAuto(now) {
            if (!this.autoTrackingEnabled || !this.revealComplete || !this.inView || motion.reduced) {
                this.autoLastTime = null;
                return;
            }

            if (this.autoLastTime === null) {
                this.autoLastTime = now;
                return;
            }

            const delta = Math.min(now - this.autoLastTime, 100);
            this.autoLastTime = now;
            this.autoElapsed += delta;

            const durationMs = Math.max(1000, this.settings.autoDuration * 1000);
            const phase = ((this.autoElapsed % durationMs) / durationMs) * Math.PI * 2;
            const travel = 0.5 - 0.5 * Math.cos(phase);

            this.auto.x = travel * this.settings.autoX;
            this.auto.y = travel * this.settings.autoY;
            this.auto.zoom = travel * this.settings.autoZoom;
        }

        createWebGL() {
            const gl =
                this.canvas.getContext(
                    'webgl2',
                    {
                        alpha: true,
                        antialias: false,
                        premultipliedAlpha: true,
                        powerPreference: 'high-performance',
                    }
                );

            if (!gl) {
                throw new Error(
                    'WebGL2 could not start'
                );
            }

            this.gl = gl;

            gl.clearColor(0, 0, 0, 0);

            const vertexShader = `#version 300 es

in vec2 aPosition;
out vec2 vUv;

void main() {
  vUv = aPosition * .5 + .5;

  gl_Position = vec4(
    aPosition,
    0.0,
    1.0
  );
}
`;

            const fragmentShader = `#version 300 es

precision highp float;

uniform sampler2D uImage;
uniform sampler2D uDepth;

uniform vec2 uImageRes;
uniform vec2 uCanvasSize;
uniform vec2 uPointer;
uniform vec2 uScroll;
uniform vec2 uAuto;
uniform float uAutoZoom;

uniform float uTime;
uniform float uProgress;

uniform float uTrace;
uniform float uLineWidth;
uniform float uPressure;
uniform float uThreshold;

uniform float uFinalFade;
uniform float uInitialFade;

uniform float uTrackX;
uniform float uTrackY;
uniform float uZoom;
uniform float uDirection;

in vec2 vUv;

out vec4 outColor;


vec2 alignedUv(vec2 uv) {
  float zoom = uZoom + uAutoZoom;
  return (uv - .5) / zoom + .5;
}


vec3 blurImage(
  vec2 uv,
  float radius
) {

  vec2 px =
    1.0 / uImageRes;

  vec3 c =
    texture(
      uImage,
      uv
    ).rgb * .16;

  c += texture(
    uImage,
    uv + vec2(1., 0.) *
    px * radius
  ).rgb * .105;

  c += texture(
    uImage,
    uv + vec2(-1., 0.) *
    px * radius
  ).rgb * .105;

  c += texture(
    uImage,
    uv + vec2(0., 1.) *
    px * radius
  ).rgb * .105;

  c += texture(
    uImage,
    uv + vec2(0., -1.) *
    px * radius
  ).rgb * .105;

  c += texture(
    uImage,
    uv + vec2(.707, .707) *
    px * radius
  ).rgb * .105;

  c += texture(
    uImage,
    uv + vec2(-.707, .707) *
    px * radius
  ).rgb * .105;

  c += texture(
    uImage,
    uv + vec2(.707, -.707) *
    px * radius
  ).rgb * .105;

  c += texture(
    uImage,
    uv + vec2(-.707, -.707) *
    px * radius
  ).rgb * .105;

  return c;
}


float depthEdge(
  vec2 uv,
  float widthPx
) {

  vec2 p =
    (1.0 / uImageRes) *
    widthPx;

  float c =
    texture(
      uDepth,
      uv
    ).r;

  float dx = max(
    abs(
      c -
      texture(
        uDepth,
        uv + vec2(p.x, 0)
      ).r
    ),
    abs(
      c -
      texture(
        uDepth,
        uv - vec2(p.x, 0)
      ).r
    )
  );

  float dy = max(
    abs(
      c -
      texture(
        uDepth,
        uv + vec2(0, p.y)
      ).r
    ),
    abs(
      c -
      texture(
        uDepth,
        uv - vec2(0, p.y)
      ).r
    )
  );

  return max(dx, dy);
}


float hash(vec2 p) {
  return fract(
    sin(
      dot(
        p,
        vec2(
          127.1,
          311.7
        )
      )
    ) *
    43758.5453123
  );
}


void main() {

  vec2 base =
    alignedUv(vUv);

  float d0 =
    texture(
      uDepth,
      base
    ).r;


  float interaction =
    smoothstep(
      .84,
      1.0,
      uProgress
    );


  vec2 pointerPx =
    uPointer *
    vec2(
      uTrackX,
      uTrackY
    );

  vec2 offsetPx =
    pointerPx +
    uScroll +
    uAuto;

  vec2 offsetUv =
    offsetPx /
    max(
      uCanvasSize,
      vec2(1.0)
    );

  float depthWeight =
    clamp(d0, 0.0, 1.0);

  vec2 parallax =
    offsetUv *
    depthWeight *
    interaction;

  vec2 uv =
    base + parallax;


  float depth =
    texture(
      uDepth,
      uv
    ).r;


  float revealDepth =
    uDirection < 0.0
      ? 1.0 - depth
      : depth;


  float sweep =
    mix(
      1.35,
      -.10,
      uProgress
    );


  float focus =
    smoothstep(
      sweep - .15,
      sweep + .055,
      revealDepth
    );


  float blurRadius =
    mix(
      34.0,
      0.0,
      focus
    );


  vec3 blurred =
    blurImage(
      uv,
      blurRadius
    );


  vec3 sharp =
    texture(
      uImage,
      uv
    ).rgb;


  vec3 colour =
    mix(
      blurred,
      sharp,
      focus
    );


  float depthReveal =
    smoothstep(
      sweep - .22,
      sweep + .12,
      revealDepth
    );


  float edge =
    depthEdge(
      uv,
      uLineWidth
    );


  float line =
    smoothstep(
      uThreshold,
      uThreshold + .08,
      edge
    );


  float nearBand =
    1.0 -
    smoothstep(
      .06,
      .22,
      abs(
        revealDepth - sweep
      )
    );


  float flicker =
    .56 +
    .44 *
    hash(
      floor(
        gl_FragCoord.xy *
        .24
      ) +
      floor(
        uTime *
        18.0
      )
    );


  float traceLife =
    (
      1.0 -
      smoothstep(
        .58,
        .93,
        uProgress
      )
    ) *
    nearBand;


  vec3 traceColour =
    vec3(
      .58,
      .86,
      .33
    );


  float traceAlpha =
    line *
    traceLife *
    flicker *
    uTrace *
    uPressure;


  colour =
    mix(
      colour,
      traceColour,
      clamp(
        traceAlpha,
        0.0,
        .92
      )
    );


  float alpha =
    max(
      depthReveal,
      clamp(
        traceAlpha,
        0.0,
        .92
      )
    );


  vec3 finalColour =
    texture(
      uImage,
      uv
    ).rgb;


  colour =
    mix(
      colour,
      finalColour,
      uFinalFade
    );


  alpha =
    mix(
      alpha,
      1.0,
      uFinalFade
    );


  alpha *=
    uInitialFade;


  float edgeGuard =
    min(
      min(
        uv.x,
        1.0 - uv.x
      ),
      min(
        uv.y,
        1.0 - uv.y
      )
    );


  float edgeAlpha =
    smoothstep(
      -.015,
      .012,
      edgeGuard
    );


  alpha *= edgeAlpha;


  outColor =
    vec4(
      colour * alpha,
      alpha
    );
}
`;

            const vertex =
                compileShader(
                    gl,
                    gl.VERTEX_SHADER,
                    vertexShader
                );

            const fragment =
                compileShader(
                    gl,
                    gl.FRAGMENT_SHADER,
                    fragmentShader
                );

            const program =
                gl.createProgram();

            gl.attachShader(
                program,
                vertex
            );

            gl.attachShader(
                program,
                fragment
            );

            gl.linkProgram(
                program
            );

            if (
                !gl.getProgramParameter(
                    program,
                    gl.LINK_STATUS
                )
            ) {
                throw new Error(
                    gl.getProgramInfoLog(program) ||
                    'Program link failed'
                );
            }

            gl.useProgram(program);

            this.program = program;

            const buffer =
                gl.createBuffer();

            gl.bindBuffer(
                gl.ARRAY_BUFFER,
                buffer
            );

            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array([
                    -1, -1,
                    1, -1,
                    -1, 1,

                    -1, 1,
                    1, -1,
                    1, 1,
                ]),
                gl.STATIC_DRAW
            );

            const position =
                gl.getAttribLocation(
                    program,
                    'aPosition'
                );

            gl.enableVertexAttribArray(
                position
            );

            gl.vertexAttribPointer(
                position,
                2,
                gl.FLOAT,
                false,
                0,
                0
            );

            const uniform = (name) =>
                gl.getUniformLocation(
                    program,
                    name
                );

            this.uniforms = {
                image:
                    uniform('uImage'),

                depth:
                    uniform('uDepth'),

                imageRes:
                    uniform('uImageRes'),

                canvasSize:
                    uniform('uCanvasSize'),

                pointer:
                    uniform('uPointer'),

                scroll:
                    uniform('uScroll'),

                auto:
                    uniform('uAuto'),

                autoZoom:
                    uniform('uAutoZoom'),

                time:
                    uniform('uTime'),

                progress:
                    uniform('uProgress'),

                trace:
                    uniform('uTrace'),

                lineWidth:
                    uniform('uLineWidth'),

                pressure:
                    uniform('uPressure'),

                threshold:
                    uniform('uThreshold'),

                finalFade:
                    uniform('uFinalFade'),

                initialFade:
                    uniform('uInitialFade'),

                trackX:
                    uniform('uTrackX'),

                trackY:
                    uniform('uTrackY'),

                zoom:
                    uniform('uZoom'),

                direction:
                    uniform('uDirection'),
            };

            gl.uniform1i(
                this.uniforms.image,
                0
            );

            gl.uniform1i(
                this.uniforms.depth,
                1
            );

            this.imageTexture =
                this.createTexture(
                    gl.TEXTURE0
                );

            this.depthTexture =
                this.createTexture(
                    gl.TEXTURE1
                );

            this.resizeCanvas();
        }

        createTexture(unit) {
            const gl = this.gl;

            const texture =
                gl.createTexture();

            gl.activeTexture(unit);

            gl.bindTexture(
                gl.TEXTURE_2D,
                texture
            );

            gl.texParameteri(
                gl.TEXTURE_2D,
                gl.TEXTURE_MIN_FILTER,
                gl.LINEAR
            );

            gl.texParameteri(
                gl.TEXTURE_2D,
                gl.TEXTURE_MAG_FILTER,
                gl.LINEAR
            );

            gl.texParameteri(
                gl.TEXTURE_2D,
                gl.TEXTURE_WRAP_S,
                gl.CLAMP_TO_EDGE
            );

            gl.texParameteri(
                gl.TEXTURE_2D,
                gl.TEXTURE_WRAP_T,
                gl.CLAMP_TO_EDGE
            );

            return texture;
        }

        uploadTextures() {
            const gl = this.gl;

            gl.pixelStorei(
                gl.UNPACK_FLIP_Y_WEBGL,
                true
            );

            gl.activeTexture(
                gl.TEXTURE0
            );

            gl.bindTexture(
                gl.TEXTURE_2D,
                this.imageTexture
            );

            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                this.sourceImage
            );

            gl.activeTexture(
                gl.TEXTURE1
            );

            gl.bindTexture(
                gl.TEXTURE_2D,
                this.depthTexture
            );

            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                this.depthImage
            );
        }

        createObserver() {
            this.observer =
                new IntersectionObserver(
                    (entries) => {
                        const entry =
                            entries[0];

                        this.inView =
                            entry.isIntersecting;

                        this.autoLastTime = null;

                        if (this.inView) {
                            this.positionCanvas();

                            if (this.revealComplete && !motion.reduced) {
                                this.requestFrame();
                            }
                        } else {
                            this.target.x = 0;
                            this.target.y = 0;
                        }
                    },
                    {
                        threshold: 0,
                    }
                );

            this.observer.observe(
                this.image
            );
        }

        startReveal() {
            if (motion.reduced || !this.effectLoaded) {
                this.showStaticImage();
                return;
            }

            this.reducedStatic = false;
            this.startTime = null;
            this.revealComplete = false;

            this.pointer.x = 0;
            this.pointer.y = 0;

            this.target.x = 0;
            this.target.y = 0;

            this.auto.x = 0;
            this.auto.y = 0;
            this.auto.zoom = 0;
            this.autoElapsed = 0;
            this.autoLastTime = null;

            const now = performance.now();

            this.drawFrame(now, 0);

            requestAnimationFrame(() => {
                this.canvas.style.opacity = '1';

                requestAnimationFrame((startTime) => {
                    this.startTime = startTime;
                    this.requestFrame();
                });
            });
        }

        onPointerMove(event) {
            if (
                !this.pointerTrackingEnabled ||
                !this.ready ||
                !this.revealComplete ||
                !this.inView ||
                motion.reduced
            ) {
                return;
            }

            const rect =
                this.image.getBoundingClientRect();

            if (
                event.clientX < rect.left ||
                event.clientX > rect.right ||
                event.clientY < rect.top ||
                event.clientY > rect.bottom
            ) {
                this.target.x = 0;
                this.target.y = 0;

                this.requestFrame();

                return;
            }

            this.target.x =
                (
                    (
                        event.clientX -
                        rect.left
                    ) /
                    rect.width -
                    0.5
                ) *
                2;

            this.target.y =
                -(
                    (
                        (
                            event.clientY -
                            rect.top
                        ) /
                        rect.height -
                        0.5
                    ) *
                    2
                );

            this.requestFrame();
        }

        requestFrame() {
            if (this.frameId !== null) {
                return;
            }

            this.frameId =
                requestAnimationFrame(
                    (now) =>
                        this.render(now)
                );
        }

        render(now) {
            this.frameId = null;

            if (!this.ready) {
                return;
            }

            if (this.startTime === null) {
                this.startTime = now;
            }

            const elapsed =
                now - this.startTime;

            this.updateAuto(now);

            this.drawFrame(
                now,
                elapsed
            );

            if (!this.revealComplete) {
                this.requestFrame();
                return;
            }

            if (!this.inView || motion.reduced) {
                return;
            }

            if (this.autoTrackingEnabled) {
                this.requestFrame();
                return;
            }

            const dx =
                Math.abs(
                    this.target.x -
                    this.pointer.x
                );

            const dy =
                Math.abs(
                    this.target.y -
                    this.pointer.y
                );

            if (
                dx > 0.0001 ||
                dy > 0.0001
            ) {
                this.requestFrame();
            }
        }

        drawFrame(now, elapsed) {
            this.resizeCanvas();

            const initialFade =
                this.settings.initialFade <= 0
                    ? 1
                    : ease(
                        clamp(
                            elapsed /
                            this.settings.initialFade
                        )
                    );

            const rawProgress =
                clamp(
                    elapsed /
                    this.settings.duration
                );

            const progress =
                ease(rawProgress);

            const fadeStart =
                this.settings.duration -
                this.settings.finalFade;

            const finalFade =
                this.settings.finalFade <= 0
                    ? (
                        elapsed >=
                            this.settings.duration
                            ? 1
                            : 0
                    )
                    : ease(
                        clamp(
                            (
                                elapsed -
                                fadeStart
                            ) /
                            this.settings.finalFade
                        )
                    );

            if (
                !this.revealComplete &&
                elapsed >=
                this.settings.duration
            ) {
                this.revealComplete = true;

                this.pointer.x = 0;
                this.pointer.y = 0;

                this.target.x = 0;
                this.target.y = 0;

                this.auto.x = 0;
                this.auto.y = 0;
                this.auto.zoom = 0;
                this.autoElapsed = 0;
                this.autoLastTime = null;
            }

            if (
                this.revealComplete &&
                this.inView &&
                this.pointerTrackingEnabled
            ) {
                this.pointer.x +=
                    (
                        this.target.x -
                        this.pointer.x
                    ) *
                    0.045;

                this.pointer.y +=
                    (
                        this.target.y -
                        this.pointer.y
                    ) *
                    0.045;
            }

            const gl = this.gl;
            const u = this.uniforms;

            gl.clear(
                gl.COLOR_BUFFER_BIT
            );

            gl.useProgram(
                this.program
            );

            gl.uniform2f(
                u.imageRes,
                this.imageRes[0],
                this.imageRes[1]
            );

            gl.uniform2f(
                u.canvasSize,
                this.canvasCssSize[0],
                this.canvasCssSize[1]
            );

            gl.uniform2f(
                u.pointer,
                this.revealComplete && this.pointerTrackingEnabled ? this.pointer.x : 0,
                this.revealComplete && this.pointerTrackingEnabled ? this.pointer.y : 0
            );

            gl.uniform2f(
                u.scroll,
                this.revealComplete && this.scrollTrackingEnabled ? this.scroll.x : 0,
                this.revealComplete && this.scrollTrackingEnabled ? this.scroll.y : 0
            );

            gl.uniform2f(
                u.auto,
                this.revealComplete && this.autoTrackingEnabled ? this.auto.x : 0,
                this.revealComplete && this.autoTrackingEnabled ? this.auto.y : 0
            );

            gl.uniform1f(
                u.autoZoom,
                this.revealComplete && this.autoTrackingEnabled ? this.auto.zoom : 0
            );

            gl.uniform1f(
                u.time,
                now * 0.001
            );

            gl.uniform1f(
                u.progress,
                progress
            );

            gl.uniform1f(
                u.trace,
                this.settings.trace
            );

            gl.uniform1f(
                u.lineWidth,
                this.settings.lineWidth
            );

            gl.uniform1f(
                u.pressure,
                this.settings.pressure
            );

            gl.uniform1f(
                u.threshold,
                this.settings.threshold
            );

            gl.uniform1f(
                u.finalFade,
                finalFade
            );

            gl.uniform1f(
                u.initialFade,
                initialFade
            );

            gl.uniform1f(
                u.trackX,
                this.settings.trackX
            );

            gl.uniform1f(
                u.trackY,
                this.settings.trackY
            );

            gl.uniform1f(
                u.zoom,
                this.settings.zoom
            );

            gl.uniform1f(
                u.direction,
                this.settings.direction
            );

            gl.drawArrays(
                gl.TRIANGLES,
                0,
                6
            );
        }

        restoreImage() {
            this.image.style.opacity = '1';

            if (this.canvas) {
                this.canvas.remove();
            }

            if (
                this.parentPositionChanged &&
                this.image.parentElement
            ) {
                this.image.parentElement.style.position =
                    this.originalParentPosition;
            }
        }
    }

    const motionMedia = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (motionMedia) {
        const onSystemMotionChange = () => {
            if (motion.mode === 'system') {
                window.dispatchEvent(new CustomEvent('mcMotionPreferenceChange', {
                    detail: { mode: motion.mode, reduced: motion.reduced, systemReduced: motion.systemReduced }
                }));
            }
        };
        if (typeof motionMedia.addEventListener === 'function') {
            motionMedia.addEventListener('change', onSystemMotionChange);
        } else if (typeof motionMedia.addListener === 'function') {
            motionMedia.addListener(onSystemMotionChange);
        }
    }

    const initialise = () => {
        const images = [...document.querySelectorAll(SELECTOR)];

        if (!images.length) {
            console.log('[MC Depth] No depth reveal images found');
            return;
        }

        window.MC = window.MC || {};
        window.MC.depth = window.MC.depth || [];

        images.forEach((image) => {
            if (image.__mcDepthReveal) {
                if (!window.MC.depth.includes(image.__mcDepthReveal)) {
                    window.MC.depth.push(image.__mcDepthReveal);
                }
                return;
            }

            const instance = new MCDepthReveal(image);
            image.__mcDepthReveal = instance;
            window.MC.depth.push(instance);
        });

        registerDebugSchema({
            id: 'depth',
            label: 'Depth',
            instances: () => window.MC.depth || [],
            instanceLabel: 'Depth Hero',
            controls: [
                { type: 'range', key: 'autoX', label: 'Auto X', min: -150, max: 150, step: 1, suffix: 'px' },
                { type: 'range', key: 'autoY', label: 'Auto Y', min: -150, max: 150, step: 1, suffix: 'px' },
                { type: 'range', key: 'autoZoom', label: 'Auto Zoom', min: -0.05, max: 0.08, step: 0.001, decimals: 3 },
                { type: 'range', key: 'autoDuration', label: 'Duration', min: 4, max: 60, step: 1, suffix: 's' },
                { type: 'button', label: 'Replay', action: 'replay' },
            ],
        });

        console.log(`[MC Depth] Found ${images.length} image(s)`);
    };

    if (
        document.readyState === 'loading'
    ) {
        document.addEventListener(
            'DOMContentLoaded',
            initialise,
            { once: true }
        );
    } else {
        initialise();
    }
})();