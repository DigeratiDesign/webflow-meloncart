(() => {
    'use strict';

    const SELECTOR =
        '[mc-colour-reveal]';

    const DEFAULTS = {
        duration: 0.8,
        colourDuration: 0.8,
        stagger: 0.8,
        colour: '#ffffff',
    };

    window.MC =
        window.MC || {};

    window.MC.colourReveal =
        window.MC.colourReveal || [];


    /* ------------------------------------------------------------
       HELPERS
    ------------------------------------------------------------ */

    function numberAttribute(
        element,
        name,
        fallback
    ) {
        const value =
            parseFloat(
                element.getAttribute(
                    name
                )
            );

        return Number.isFinite(value)
            ? value
            : fallback;
    }


    function reducedMotionEnabled() {
        if (
            window.MC?.motion &&
            typeof window.MC.motion.reduced ===
            'boolean'
        ) {
            return window.MC.motion.reduced;
        }

        return !!window.matchMedia?.(
            '(prefers-reduced-motion: reduce)'
        ).matches;
    }


    function registerDebug(
        schema
    ) {
        window.MC =
            window.MC || {};

        if (
            window.MC.debug &&
            typeof window.MC.debug.register ===
            'function'
        ) {
            window.MC.debug.register(
                schema
            );

            return;
        }

        window.MC.__debugQueue =
            window.MC.__debugQueue || [];

        window.MC.__debugQueue.push(
            schema
        );
    }


    /* ------------------------------------------------------------
       CONTROLLER
    ------------------------------------------------------------ */

    class MCColourReveal {
        constructor(
            component,
            index
        ) {
            this.component =
                component;

            this.index =
                index;

            this.settings = {
                duration:
                    numberAttribute(
                        component,
                        'mc-colour-reveal-duration',
                        DEFAULTS.duration
                    ),

                colourDuration:
                    numberAttribute(
                        component,
                        'mc-colour-reveal-colour-duration',
                        DEFAULTS.colourDuration
                    ),

                stagger:
                    numberAttribute(
                        component,
                        'mc-colour-reveal-stagger',
                        DEFAULTS.stagger
                    ),

                colour:
                    component.getAttribute(
                        'mc-colour-reveal-colour'
                    ) ||
                    DEFAULTS.colour,
            };

            this.split =
                null;

            this.timeline =
                null;

            this.ready =
                false;

            this.initialising =
                false;

            this.component.style.setProperty(
                '--mc-colour-reveal',
                this.settings.colour
            );
        }


        /* ----------------------------------------------------------
           PUBLIC API
        ---------------------------------------------------------- */

        get(
            key
        ) {
            return this.settings[
                key
            ];
        }


        set(
            key,
            rawValue
        ) {
            if (
                !Object.prototype.hasOwnProperty.call(
                    this.settings,
                    key
                )
            ) {
                return;
            }

            if (
                key ===
                'colour'
            ) {
                this.settings.colour =
                    String(
                        rawValue
                    );

                this.component.setAttribute(
                    'mc-colour-reveal-colour',
                    this.settings.colour
                );

                this.component.style.setProperty(
                    '--mc-colour-reveal',
                    this.settings.colour
                );

                return;
            }

            const value =
                Number(
                    rawValue
                );

            if (
                !Number.isFinite(value)
            ) {
                return;
            }

            if (
                key ===
                'duration'
            ) {
                this.settings.duration =
                    Math.max(
                        0.01,
                        value
                    );

                this.component.setAttribute(
                    'mc-colour-reveal-duration',
                    String(
                        this.settings.duration
                    )
                );
            }


            if (
                key ===
                'colourDuration'
            ) {
                this.settings.colourDuration =
                    Math.max(
                        0.01,
                        value
                    );

                this.component.setAttribute(
                    'mc-colour-reveal-colour-duration',
                    String(
                        this.settings.colourDuration
                    )
                );
            }


            if (
                key ===
                'stagger'
            ) {
                this.settings.stagger =
                    Math.max(
                        0,
                        value
                    );

                this.component.setAttribute(
                    'mc-colour-reveal-stagger',
                    String(
                        this.settings.stagger
                    )
                );
            }


            /*
             * Debug timing changes rebuild
             * the animation using the new values.
             */
            if (
                this.ready &&
                !reducedMotionEnabled()
            ) {
                this.buildAnimated(
                    true
                );
            }
        }


        /* ----------------------------------------------------------
           FINAL STATIC STATE
        ---------------------------------------------------------- */

        showFinal() {
            this.destroyAnimation();

            /*
             * No SplitText or ScrollTrigger is
             * needed for reduced motion.
             */
            this.component.style.visibility =
                'visible';

            this.component.style.setProperty(
                '--clip-progress',
                '100%'
            );

            this.component.style.setProperty(
                '--color-progress',
                '0%'
            );

            this.ready =
                true;
        }


        /* ----------------------------------------------------------
           CLEANUP
        ---------------------------------------------------------- */

        destroyAnimation() {
            if (
                this.timeline
            ) {
                if (
                    this.timeline.scrollTrigger
                ) {
                    this.timeline
                        .scrollTrigger
                        .kill();
                }

                this.timeline.kill();

                this.timeline =
                    null;
            }


            if (
                this.split
            ) {
                try {
                    this.split.revert();
                } catch (error) {
                    console.warn(
                        '[MC Colour Reveal] SplitText revert failed',
                        error
                    );
                }

                this.split =
                    null;
            }
        }


        /* ----------------------------------------------------------
           BUILD ANIMATED VERSION
        ---------------------------------------------------------- */

        async buildAnimated(
            replayImmediately = false
        ) {
            if (
                this.initialising
            ) {
                return;
            }

            this.initialising =
                true;

            this.destroyAnimation();


            /*
             * Wait for fonts before calculating
             * line wrapping.
             */
            if (
                document.fonts?.ready
            ) {
                await document.fonts.ready;
            }


            /*
             * Motion may have been disabled
             * while fonts were loading.
             */
            if (
                reducedMotionEnabled()
            ) {
                this.initialising =
                    false;

                this.showFinal();

                return;
            }


            this.component.style.setProperty(
                '--mc-colour-reveal',
                this.settings.colour
            );


            /*
             * Remove inherited final-state vars
             * left by Reduced Motion.
             */
            this.component.style.removeProperty(
                '--clip-progress'
            );

            this.component.style.removeProperty(
                '--color-progress'
            );


            this.split =
                SplitText.create(
                    this.component,
                    {
                        type:
                            'lines',

                        autoSplit:
                            true,

                        mask:
                            'lines',

                        linesClass:
                            'line',

                        onSplit:
                            (
                                self
                            ) => {
                                const timeline =
                                    gsap.timeline({
                                        paused:
                                            replayImmediately,

                                        scrollTrigger:
                                            replayImmediately
                                                ? undefined
                                                : {
                                                    trigger:
                                                        this.component,

                                                    start:
                                                        'top bottom',

                                                    end:
                                                        'top 80%',

                                                    toggleActions:
                                                        'none play none reset',
                                                },
                                    });


                                /*
                                 * Reveal component.
                                 */
                                timeline.set(
                                    this.component,
                                    {
                                        visibility:
                                            'visible',
                                    }
                                );


                                /*
                                 * Reveal text.
                                 */
                                timeline.fromTo(
                                    self.lines,

                                    {
                                        '--clip-progress':
                                            '0%',
                                    },

                                    {
                                        '--clip-progress':
                                            '100%',

                                        duration:
                                            this.settings.duration,

                                        stagger: {
                                            amount:
                                                this.settings.stagger,
                                        },
                                    }
                                );


                                /*
                                 * Sweep colour away.
                                 */
                                timeline.fromTo(
                                    self.lines,

                                    {
                                        '--color-progress':
                                            '100%',
                                    },

                                    {
                                        '--color-progress':
                                            '0%',

                                        delay:
                                            0.2,

                                        duration:
                                            this.settings
                                                .colourDuration,

                                        stagger: {
                                            amount:
                                                this.settings.stagger,
                                        },
                                    },

                                    0
                                );


                                this.timeline =
                                    timeline;


                                if (
                                    replayImmediately
                                ) {
                                    timeline.play(
                                        0
                                    );
                                }


                                return timeline;
                            },
                    }
                );


            this.ready =
                true;

            this.initialising =
                false;
        }


        /* ----------------------------------------------------------
           REPLAY
        ---------------------------------------------------------- */

        async replay() {
            if (
                reducedMotionEnabled()
            ) {
                this.showFinal();

                return;
            }


            if (
                !this.split ||
                !this.timeline
            ) {
                await this.buildAnimated(
                    true
                );

                return;
            }


            this.component.style.visibility =
                'visible';

            this.timeline.restart(
                true
            );
        }


        /* ----------------------------------------------------------
           MOTION MODE CHANGED
        ---------------------------------------------------------- */

        async motionChanged() {
            if (
                reducedMotionEnabled()
            ) {
                this.showFinal();

                return;
            }


            await this.buildAnimated(
                false
            );
        }


        /* ----------------------------------------------------------
           INIT
        ---------------------------------------------------------- */

        async init() {
            if (
                reducedMotionEnabled()
            ) {
                /*
                 * Important:
                 *
                 * Do not invoke SplitText at all
                 * when reduced motion is active.
                 */
                this.showFinal();

                return;
            }


            await this.buildAnimated(
                false
            );
        }
    }


    /* ------------------------------------------------------------
       DEBUG REGISTRATION
    ------------------------------------------------------------ */

    registerDebug({
        id:
            'colourReveal',

        label:
            'Colour Reveal',

        instances:
            () =>
                window.MC
                    .colourReveal,

        instanceLabel:
            (
                instance,
                index,
                total
            ) =>
                total > 1
                    ? `Heading ${index + 1}`
                    : 'Heading',

        controls: [
            {
                type:
                    'range',

                key:
                    'duration',

                label:
                    'Reveal Duration',

                min:
                    0.1,

                max:
                    2,

                step:
                    0.05,

                suffix:
                    's',

                event:
                    'change',
            },

            {
                type:
                    'range',

                key:
                    'colourDuration',

                label:
                    'Colour Duration',

                min:
                    0.1,

                max:
                    2,

                step:
                    0.05,

                suffix:
                    's',

                event:
                    'change',
            },

            {
                type:
                    'range',

                key:
                    'stagger',

                label:
                    'Line Stagger',

                min:
                    0,

                max:
                    2,

                step:
                    0.05,

                suffix:
                    's',

                event:
                    'change',
            },

            {
                type:
                    'button',

                label:
                    'Replay',

                action:
                    'replay',
            },
        ],
    });


    /* ------------------------------------------------------------
       LIVE REDUCED MOTION
    ------------------------------------------------------------ */

    function updateMotion() {
        window.MC
            .colourReveal
            .forEach(
                (
                    instance
                ) => {
                    instance
                        .motionChanged();
                }
            );
    }


    window.addEventListener(
        'mcMotionPreferenceChange',
        updateMotion
    );


    const motionMedia =
        window.matchMedia?.(
            '(prefers-reduced-motion: reduce)'
        );


    if (
        motionMedia
    ) {
        const systemChanged =
            () => {
                if (
                    !window.MC?.motion ||
                    window.MC.motion.mode ===
                    'system'
                ) {
                    updateMotion();
                }
            };


        if (
            typeof motionMedia
                .addEventListener ===
            'function'
        ) {
            motionMedia.addEventListener(
                'change',
                systemChanged
            );
        } else if (
            typeof motionMedia
                .addListener ===
            'function'
        ) {
            motionMedia.addListener(
                systemChanged
            );
        }
    }


    /* ------------------------------------------------------------
       MAIN INIT
    ------------------------------------------------------------ */

    async function init() {
        if (
            typeof gsap ===
            'undefined' ||
            typeof ScrollTrigger ===
            'undefined' ||
            typeof SplitText ===
            'undefined'
        ) {
            console.error(
                '[MC Colour Reveal] GSAP, ScrollTrigger and SplitText must be loaded.'
            );

            /*
             * Never leave headings invisible
             * if dependencies fail.
             */
            document
                .querySelectorAll(
                    SELECTOR
                )
                .forEach(
                    (
                        component
                    ) => {
                        component.style.visibility =
                            'visible';

                        component.style.setProperty(
                            '--clip-progress',
                            '100%'
                        );

                        component.style.setProperty(
                            '--color-progress',
                            '0%'
                        );
                    }
                );

            return;
        }


        gsap.registerPlugin(
            ScrollTrigger,
            SplitText
        );


        const components = [
            ...document.querySelectorAll(
                SELECTOR
            ),
        ];


        components.forEach(
            (
                component,
                index
            ) => {
                if (
                    component
                        .__mcColourReveal
                ) {
                    return;
                }


                component.setAttribute(
                    'data-mc-colour-reveal-init',
                    ''
                );


                const instance =
                    new MCColourReveal(
                        component,
                        index
                    );


                component
                    .__mcColourReveal =
                    instance;


                window.MC
                    .colourReveal
                    .push(
                        instance
                    );


                instance.init();
            }
        );


        window.MC.debug?.refresh?.();


        console.log(
            `[MC Colour Reveal] Initialised ${components.length} element(s).`
        );
    }


    if (
        document.readyState ===
        'loading'
    ) {
        document.addEventListener(
            'DOMContentLoaded',
            init,
            {
                once: true,
            }
        );
    } else {
        init();
    }

})();