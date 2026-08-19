  /**
   * Meloncart Webflow Theme Collector
   *
   * Collects Webflow variable modes from:
   *
   *   .ui-theme_feature_*
   *   .ui-theme_cta_*
   *   .ui-theme_icon_*
   *
   * Exposes:
   *
   *   colorThemes.getTheme(
   *     featureTheme,
   *     ctaTheme,
   *     iconTheme
   *   )
   *
   * Example:
   *
   *   colorThemes.getTheme(
   *     'moss',
   *     'sprout',
   *     'wheat'
   *   )
   */

  function getColorThemes() {

    const DEBUG = true;


    /* ----------------------------------------
       Logging
    ---------------------------------------- */

    const log = (...args) => {
      if (DEBUG) {
        console.log(
          '[MC Theme]',
          ...args
        );
      }
    };

    const warn = (...args) => {
      if (DEBUG) {
        console.warn(
          '[MC Theme]',
          ...args
        );
      }
    };

    const error = (...args) => {
      console.error(
        '[MC Theme]',
        ...args
      );
    };


    /* ----------------------------------------
       Configuration
    ---------------------------------------- */

    const STORAGE_KEYS = {
      THEMES:
        'colorThemes_data_v3',

      PUBLISH_DATE:
        'colorThemes_publishDate_v3',
    };


    const CLASS_PREFIXES = {

      feature:
        'ui-theme_feature_',

      cta:
        'ui-theme_cta_',

      icon:
        'ui-theme_icon_',

    };


    /* ----------------------------------------
       Public API
    ---------------------------------------- */

    window.colorThemes = {

      themes: {},

      ctaThemes: {},

      iconThemes: {},


      getTheme(
        featureName = '',
        ctaName = '',
        iconName = ''
      ) {

        const result = {};


        /* Feature theme */

        if (featureName) {

          const featureTheme =
            this.themes[
              featureName
            ];


          if (!featureTheme) {

            warn(
              `Feature theme "${featureName}" not found`,
              Object.keys(
                this.themes
              )
            );

          } else {

            Object.assign(
              result,
              featureTheme
            );

          }
        }


        /* CTA theme */

        if (ctaName) {

          const ctaTheme =
            this.ctaThemes[
              ctaName
            ];


          if (!ctaTheme) {

            warn(
              `CTA theme "${ctaName}" not found`,
              Object.keys(
                this.ctaThemes
              )
            );

          } else {

            Object.assign(
              result,
              ctaTheme
            );

          }
        }


        /* Icon theme */

        if (iconName) {

          const iconTheme =
            this.iconThemes[
              iconName
            ];


          if (!iconTheme) {

            warn(
              `Icon theme "${iconName}" not found`,
              Object.keys(
                this.iconThemes
              )
            );

          } else {

            Object.assign(
              result,
              iconTheme
            );

          }
        }


        log(
          'getTheme()',
          {
            featureName,
            ctaName,
            iconName,
            result,
          }
        );


        return result;
      },
    };


    /* ----------------------------------------
       Publish date
    ---------------------------------------- */

    function getPublishDate() {

      try {

        const htmlComment =
          document.documentElement
            .previousSibling;


        if (
          !htmlComment ||
          htmlComment.nodeType !==
            Node.COMMENT_NODE
        ) {

          return null;
        }


        const match =
          htmlComment.textContent.match(
            /Last Published: (.+?) GMT/
          );


        if (!match) {
          return null;
        }


        return new Date(
          match[1]
        ).getTime();

      } catch (err) {

        warn(
          'Could not determine Webflow publish date:',
          err
        );

        return null;
      }
    }


    /* ----------------------------------------
       Storage
    ---------------------------------------- */

    function loadFromStorage() {

      try {

        const storedPublishDate =
          localStorage.getItem(
            STORAGE_KEYS.PUBLISH_DATE
          );


        const currentPublishDate =
          getPublishDate();


        if (
          !currentPublishDate ||
          !storedPublishDate ||
          storedPublishDate !==
            currentPublishDate.toString()
        ) {

          log(
            'No valid cached theme data'
          );

          return null;
        }


        const raw =
          localStorage.getItem(
            STORAGE_KEYS.THEMES
          );


        if (!raw) {
          return null;
        }


        const data =
          JSON.parse(raw);


        log(
          'Loaded theme data from cache:',
          data
        );


        return data;

      } catch (err) {

        warn(
          'Failed to load theme cache:',
          err
        );

        return null;
      }
    }


    function saveToStorage() {

      try {

        const publishDate =
          getPublishDate();


        if (!publishDate) {

          warn(
            'Publish date unavailable — theme cache skipped'
          );

          return;
        }


        const data = {

          themes:
            window.colorThemes
              .themes,

          ctaThemes:
            window.colorThemes
              .ctaThemes,

          iconThemes:
            window.colorThemes
              .iconThemes,

        };


        localStorage.setItem(
          STORAGE_KEYS.PUBLISH_DATE,
          publishDate.toString()
        );


        localStorage.setItem(
          STORAGE_KEYS.THEMES,
          JSON.stringify(data)
        );


        log(
          'Theme data cached'
        );

      } catch (err) {

        warn(
          'Failed to cache themes:',
          err
        );

      }
    }


    /* ----------------------------------------
       CSS helpers
    ---------------------------------------- */

    function escapeRegExp(
      value
    ) {

      return value.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );
    }


    /*
     * Find the declaration block for
     * one Webflow mode class.
     */

    function getRuleBlock(
      cssText,
      className
    ) {

      const escaped =
        escapeRegExp(
          className
        );


      const regex =
        new RegExp(
          `\\.${escaped}\\{([^}]*)\\}`,
          'g'
        );


      const match =
        regex.exec(
          cssText
        );


      return match
        ? match[1]
        : '';
    }


    /*
     * Collect custom properties declared
     * by the specified mode.
     */

    function getVariableNames(
      cssText,
      className
    ) {

      const block =
        getRuleBlock(
          cssText,
          className
        );


      if (!block) {

        warn(
          `No CSS rule found for .${className}`
        );

        return [];
      }


      const variables = [];


      const regex =
        /(--[^:;{}]+)\s*:/g;


      let match;


      while (
        (match =
          regex.exec(block)) !==
        null
      ) {

        const variable =
          match[1].trim();


        /*
         * Ignore old Webflow deleted
         * variable references.
         */

        if (
          variable.includes(
            '\\<deleted\\|'
          )
        ) {

          continue;
        }


        variables.push(
          variable
        );
      }


      return [
        ...new Set(
          variables
        )
      ];
    }


    /* ----------------------------------------
       Resolve a Webflow mode
    ---------------------------------------- */

    function resolveMode(
      className,
      variableNames,
      probe
    ) {

      probe.className =
        className;


      const computed =
        getComputedStyle(
          probe
        );


      const values = {};


      variableNames.forEach(
        variable => {

          const value =
            computed
              .getPropertyValue(
                variable
              )
              .trim();


          if (value) {

            values[
              variable
            ] = value;

          }
        }
      );


      log(
        `Resolved .${className}:`,
        values
      );


      return values;
    }


    /* ----------------------------------------
       Discover mode classes
    ---------------------------------------- */

    function discoverClasses(
      cssText,
      prefix
    ) {

      const escaped =
        escapeRegExp(
          prefix
        );


      const regex =
        new RegExp(
          `\\.${escaped}[\\w-]+`,
          'g'
        );


      const matches =
        cssText.match(
          regex
        ) || [];


      return [
        ...new Set(
          matches.map(
            value =>
              value.replace(
                '.',
                ''
              )
          )
        )
      ];
    }


    /* ----------------------------------------
       Collect a theme family
    ---------------------------------------- */

    function collectThemeFamily({
      cssText,
      classes,
      prefix,
      destination,
      label,
      probe,
    }) {

      classes.forEach(
        className => {

          const themeName =
            className.replace(
              prefix,
              ''
            );


          const variableNames =
            getVariableNames(
              cssText,
              className
            );


          /*
           * Ignore classes matching the
           * naming convention which don't
           * actually define variables.
           */

          if (
            !variableNames.length
          ) {

            log(
              `Skipping ${label} "${themeName}" — no custom properties`
            );

            return;
          }


          log(
            `${label} "${themeName}" variables:`,
            variableNames
          );


          destination[
            themeName
          ] =
            resolveMode(
              className,
              variableNames,
              probe
            );
        }
      );
    }


    /* ----------------------------------------
       Ready
    ---------------------------------------- */

    function ready() {

      log(
        'Feature themes:',
        window.colorThemes
          .themes
      );


      log(
        'CTA themes:',
        window.colorThemes
          .ctaThemes
      );


      log(
        'Icon themes:',
        window.colorThemes
          .iconThemes
      );


      log(
        'Dispatching colorThemesReady'
      );


      document.dispatchEvent(
        new CustomEvent(
          'colorThemesReady'
        )
      );
    }


    /* ----------------------------------------
       Start
    ---------------------------------------- */

    log(
      'Theme Collector starting'
    );


    /* ----------------------------------------
       Cache
    ---------------------------------------- */

    const cached =
      loadFromStorage();


    if (cached) {

      window.colorThemes
        .themes =
          cached.themes || {};


      window.colorThemes
        .ctaThemes =
          cached.ctaThemes || {};


      window.colorThemes
        .iconThemes =
          cached.iconThemes || {};


      ready();


      return;
    }


    /* ----------------------------------------
       Find Webflow stylesheet
    ---------------------------------------- */

    const stylesheet =
      Array
        .from(
          document.querySelectorAll(
            'link[rel="stylesheet"]'
          )
        )
        .find(
          link =>
            link.href.includes(
              'webflow'
            )
        ) ||
      document.querySelector(
        'link[rel="stylesheet"]'
      );


    if (!stylesheet?.href) {

      error(
        'Could not find Webflow stylesheet'
      );

      return;
    }


    log(
      'Fetching stylesheet:',
      stylesheet.href
    );


    /* ----------------------------------------
       Fetch stylesheet
    ---------------------------------------- */

    fetch(
      stylesheet.href
    )

      .then(
        response => {

          log(
            'Stylesheet response:',
            response.status
          );


          if (!response.ok) {

            throw new Error(
              `Stylesheet fetch failed: ${response.status}`
            );
          }


          return response.text();
        }
      )

      .then(
        cssText => {

          log(
            'Stylesheet loaded:',
            `${cssText.length} chars`
          );


          /* ----------------------------------
             Discover modes
          ---------------------------------- */

          const featureClasses =
            discoverClasses(
              cssText,
              CLASS_PREFIXES
                .feature
            );


          const ctaClasses =
            discoverClasses(
              cssText,
              CLASS_PREFIXES
                .cta
            );


          const iconClasses =
            discoverClasses(
              cssText,
              CLASS_PREFIXES
                .icon
            );


          log(
            'Feature mode classes:',
            featureClasses
          );


          log(
            'CTA mode classes:',
            ctaClasses
          );


          log(
            'Icon mode classes:',
            iconClasses
          );


          /* ----------------------------------
             Probe element
          ---------------------------------- */

          const probe =
            document.createElement(
              'div'
            );


          probe.setAttribute(
            'aria-hidden',
            'true'
          );


          Object.assign(
            probe.style,
            {
              position:
                'fixed',

              width:
                '0',

              height:
                '0',

              overflow:
                'hidden',

              visibility:
                'hidden',

              pointerEvents:
                'none',

              top:
                '-9999px',

              left:
                '-9999px',
            }
          );


          document.body
            .appendChild(
              probe
            );


          /* ----------------------------------
             Feature themes
          ---------------------------------- */

          collectThemeFamily({

            cssText,

            classes:
              featureClasses,

            prefix:
              CLASS_PREFIXES
                .feature,

            destination:
              window.colorThemes
                .themes,

            label:
              'Feature mode',

            probe,

          });


          /* ----------------------------------
             CTA themes
          ---------------------------------- */

          collectThemeFamily({

            cssText,

            classes:
              ctaClasses,

            prefix:
              CLASS_PREFIXES
                .cta,

            destination:
              window.colorThemes
                .ctaThemes,

            label:
              'CTA mode',

            probe,

          });


          /* ----------------------------------
             Icon themes
          ---------------------------------- */

          collectThemeFamily({

            cssText,

            classes:
              iconClasses,

            prefix:
              CLASS_PREFIXES
                .icon,

            destination:
              window.colorThemes
                .iconThemes,

            label:
              'Icon mode',

            probe,

          });


          /* ----------------------------------
             Cleanup
          ---------------------------------- */

          probe.remove();


          /* ----------------------------------
             Cache + ready
          ---------------------------------- */

          saveToStorage();

          ready();
        }
      )

      .catch(
        err => {

          error(
            'Theme Collector failed:',
            err
          );

        }
      );
  }


  /* ----------------------------------------
     Initialise collector
  ---------------------------------------- */

  window.addEventListener(
    'DOMContentLoaded',
    getColorThemes
  );
</script>


<script>
  /**
   * Meloncart Theme Scroll Animation
   *
   * Trigger attributes:
   *
   * data-animate-theme-to="moss"
   * data-animate-cta-to="sprout"
   * data-animate-icon-to="wheat"
   *
   * Target:
   *
   * mc-theme="target"
   */

  document.addEventListener(
    'colorThemesReady',
    () => {

      console.log(
        '[MC Theme] colorThemesReady received'
      );


      /* ----------------------------------------
         Dependencies
      ---------------------------------------- */

      if (
        typeof gsap ===
        'undefined'
      ) {

        console.error(
          '[MC Theme] GSAP not loaded'
        );

        return;
      }


      if (
        typeof ScrollTrigger ===
        'undefined'
      ) {

        console.error(
          '[MC Theme] ScrollTrigger not loaded'
        );

        return;
      }


      gsap.registerPlugin(
        ScrollTrigger
      );


      /* ----------------------------------------
         Targets
      ---------------------------------------- */

      const targets =
        document.querySelectorAll(
          '[mc-theme="target"]'
        );


      console.log(
        '[MC Theme] Targets found:',
        targets.length,
        targets
      );


      if (
        !targets.length
      ) {

        console.warn(
          '[MC Theme] No [mc-theme="target"] elements found'
        );

        return;
      }


      /* ----------------------------------------
         Triggers
      ---------------------------------------- */

      const triggers =
        document.querySelectorAll(
          '[data-animate-theme-to]'
        );


      console.log(
        '[MC Theme] Triggers found:',
        triggers.length,
        triggers
      );


      triggers.forEach(
        (trigger, index) => {

          const feature =
            trigger.getAttribute(
              'data-animate-theme-to'
            ) || '';


          const cta =
            trigger.getAttribute(
              'data-animate-cta-to'
            ) || '';


          const icon =
            trigger.getAttribute(
              'data-animate-icon-to'
            ) || '';


          const values =
            colorThemes.getTheme(
              feature,
              cta,
              icon
            );


          console.log(
            `[MC Theme] Trigger ${index + 1}`,
            {
              trigger,
              feature,
              cta,
              icon,
              values,
            }
          );


          ScrollTrigger.create({

            trigger,

            start:
              'top center',

            end:
              'bottom center',


            onToggle({
              isActive
            }) {

              console.log(
                `[MC Theme] Trigger ${index + 1} toggle`,
                {
                  isActive,
                  feature,
                  cta,
                  icon,
                }
              );


              if (
                !isActive
              ) {

                return;
              }


              const themeValues =
                colorThemes.getTheme(
                  feature,
                  cta,
                  icon
                );


              console.log(
                '[MC Theme] Applying:',
                themeValues
              );


              if (
                !Object.keys(
                  themeValues
                ).length
              ) {

                console.warn(
                  '[MC Theme] Theme resolved to an empty object'
                );

                return;
              }


              gsap.to(
                targets,
                {
                  ...themeValues,

                  duration:
                    0.5,

                  ease:
                    'power1.out',

                  overwrite:
                    'auto',

                  onStart() {

                    console.log(
                      '[MC Theme] GSAP started'
                    );

                  },

                  onComplete() {

                    console.log(
                      '[MC Theme] GSAP completed'
                    );

                  },
                }
              );
            },
          });


          console.log(
            `[MC Theme] ScrollTrigger ${index + 1} created`
          );
        }
      );
    }
  );
</script>
<script>
(() => {
  'use strict';

  const SELECTOR = 'img[mc-depth-reveal]';

  const DEFAULTS = {
    trace: 1.35,
    lineWidth: 1,
    pressure: 1,
    threshold: 0.18,
    darkness: 0.92,
    initialFade: 700,
    finalFade: 900,
    trackX: 2,
    trackY: 2,
    zoom: 1.04,
    direction: 1,
  };

  const REVEAL_DURATION = 2850;

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
        () =>
          reject(
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

        darkness: attrNumber(
          image,
          'mc-depth-darkness',
          DEFAULTS.darkness
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
      };

      this.depthSrc =
        image.getAttribute('mc-depth-map');

      this.canvas = null;
      this.gl = null;
      this.program = null;

      this.imageTexture = null;
      this.depthTexture = null;

      this.imageRes = [1, 1];

      this.pointer = {
        x: 0,
        y: 0,
      };

      this.target = {
        x: 0,
        y: 0,
      };

      this.inView = false;
      this.ready = false;
      this.revealComplete = false;

      this.startTime = 0;
      this.frameId = null;

      this.parentPositionChanged = false;
      this.originalParentPosition = '';

      this.boundPointerMove =
        this.onPointerMove.bind(this);

      this.boundResize =
        this.onResize.bind(this);

      this.init();
    }

    async init() {
      if (!this.depthSrc) {
        console.warn(
          '[MC Depth] Missing mc-depth-map:',
          this.image
        );

        this.restoreImage();

        return;
      }

      try {
        await waitForImage(this.image);

        const sourceSrc =
          this.image.currentSrc ||
          this.image.src;

        const [sourceImage, depthImage] =
          await Promise.all([
            loadImage(sourceSrc),
            loadImage(this.depthSrc),
          ]);

        this.sourceImage = sourceImage;
        this.depthImage = depthImage;

        this.imageRes = [
          sourceImage.naturalWidth,
          sourceImage.naturalHeight,
        ];

        const imageAspect =
          sourceImage.naturalWidth /
          sourceImage.naturalHeight;

        const depthAspect =
          depthImage.naturalWidth /
          depthImage.naturalHeight;

        if (
          Math.abs(
            imageAspect -
            depthAspect
          ) > 0.001
        ) {
          console.warn(
            '[MC Depth] Source/depth aspect ratios differ:',
            {
              image: [
                sourceImage.naturalWidth,
                sourceImage.naturalHeight,
              ],
              depth: [
                depthImage.naturalWidth,
                depthImage.naturalHeight,
              ],
              element: this.image,
            }
          );
        }

        this.createCanvas();
        this.createWebGL();
        this.uploadTextures();
        this.createObserver();

        window.addEventListener(
          'resize',
          this.boundResize,
          { passive: true }
        );

        window.addEventListener(
          'pointermove',
          this.boundPointerMove,
          { passive: true }
        );

        this.ready = true;

        this.startReveal();

        console.log('[MC Depth] Initialised', {
          element: this.image,
          image: [
            sourceImage.naturalWidth,
            sourceImage.naturalHeight,
          ],
          depth: [
            depthImage.naturalWidth,
            depthImage.naturalHeight,
          ],
          depthMap: this.depthSrc,
          settings: this.settings,
        });
      } catch (error) {
        console.error(
          '[MC Depth] Initialisation failed:',
          error,
          this.image
        );

        this.restoreImage();
      }
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
        this.image.parentElement.getBoundingClientRect();

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

      if (
        this.ready &&
        this.inView
      ) {
        this.requestFrame();
      }
    }

    createWebGL() {
      const gl =
        this.canvas.getContext(
          'webgl2',
          {
            alpha: true,
            antialias: false,
            premultipliedAlpha: false,
            powerPreference:
              'high-performance',
          }
        );

      if (!gl) {
        throw new Error(
          'WebGL2 could not start'
        );
      }

      this.gl = gl;

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
uniform vec2 uPointer;

uniform float uTime;
uniform float uProgress;

uniform float uTrace;
uniform float uLineWidth;
uniform float uPressure;
uniform float uThreshold;
uniform float uDarkness;

uniform float uFinalFade;
uniform float uInitialFade;

uniform float uTrackX;
uniform float uTrackY;
uniform float uZoom;
uniform float uDirection;

in vec2 vUv;

out vec4 outColor;


vec2 alignedUv(vec2 uv) {
  return
    (uv - .5) /
    uZoom +
    .5;
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

  vec2 tracking =
    vec2(
      uTrackX,
      uTrackY
    );

  vec2 parallax =
    (uPointer * tracking) *
    mix(
      .0005,
      .0075,
      d0
    ) *
    interaction;

  vec2 uv =
    base + parallax;

  float depth =
    texture(
      uDepth,
      uv
    ).r;

  /*
   * Reverse ONLY the reveal logic.
   * Mouse tracking continues to use the
   * original depth map values.
   */
  float revealDepth =
    uDirection < 0.0
      ? 1.0 - depth
      : depth;


  float sweep =
    mix(
      1.13,
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


  float depthLight =
    smoothstep(
      sweep - .22,
      sweep + .12,
      revealDepth
    );

  float startLevel =
    mix(
      1.0 - uDarkness,
      1.0,
      depthLight
    );

  colour *=
    startLevel;


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


  colour *=
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

  colour *=
    smoothstep(
      -.015,
      .012,
      edgeGuard
    );

  outColor =
    vec4(
      colour,
      1.0
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
          gl.getProgramInfoLog(
            program
          ) ||
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
          -1,  1,

          -1,  1,
           1, -1,
           1,  1,
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

        pointer:
          uniform('uPointer'),

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

        darkness:
          uniform('uDarkness'),

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

            if (this.inView) {
              this.positionCanvas();
              this.requestFrame();
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
      this.startTime =
        performance.now();

      this.revealComplete = false;

      this.pointer.x = 0;
      this.pointer.y = 0;

      this.target.x = 0;
      this.target.y = 0;

      /*
       * Webflow keeps the original image at opacity: 0
       * to prevent FOUC.
       *
       * Reveal canvas becomes visible only once both
       * textures and WebGL are ready.
       */
      this.canvas.style.opacity = '1';

      this.requestFrame();
    }

    onPointerMove(event) {
      if (
        !this.ready ||
        !this.revealComplete ||
        !this.inView
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
      if (
        this.frameId !== null
      ) {
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

      this.resizeCanvas();

      const elapsed =
        now - this.startTime;

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
          REVEAL_DURATION
        );

      const progress =
        ease(rawProgress);

      const fadeStart =
        REVEAL_DURATION -
        this.settings.finalFade;

      const finalFade =
        this.settings.finalFade <= 0
          ? (
              elapsed >=
              REVEAL_DURATION
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

      const revealEnd =
        REVEAL_DURATION;

      if (
        !this.revealComplete &&
        elapsed >= revealEnd
      ) {
        this.revealComplete = true;

        this.pointer.x = 0;
        this.pointer.y = 0;

        this.target.x = 0;
        this.target.y = 0;
      }

      if (
        this.revealComplete &&
        this.inView
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

      const gl =
        this.gl;

      const u =
        this.uniforms;

      gl.useProgram(
        this.program
      );

      gl.uniform2f(
        u.imageRes,
        this.imageRes[0],
        this.imageRes[1]
      );

      gl.uniform2f(
        u.pointer,
        this.revealComplete
          ? this.pointer.x
          : 0,
        this.revealComplete
          ? this.pointer.y
          : 0
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
        u.darkness,
        this.settings.darkness
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

      if (
        !this.revealComplete
      ) {
        this.requestFrame();
        return;
      }

      if (!this.inView) {
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

    restoreImage() {
      /*
       * If WebGL or either texture fails,
       * reveal the original Webflow image.
       */
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

  const initialise = () => {
    const images =
      document.querySelectorAll(
        SELECTOR
      );

    if (!images.length) {
      console.log(
        '[MC Depth] No depth reveal images found'
      );

      return;
    }

    console.log(
      `[MC Depth] Found ${images.length} image(s)`
    );

    images.forEach((image) => {
      if (
        image.__mcDepthReveal
      ) {
        return;
      }

      image.__mcDepthReveal =
        new MCDepthReveal(image);
    });
  };

  if (
    document.readyState ===
    'loading'
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