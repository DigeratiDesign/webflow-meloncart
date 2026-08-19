gsap.registerPlugin(ScrollTrigger);

(() => {

    function registerDebugSchema(schema) {
        window.MC = window.MC || {};

        if (window.MC.debug?.register) {
            window.MC.debug.register(schema);
            return;
        }

        window.MC.__debugQueue =
            window.MC.__debugQueue || [];

        window.MC.__debugQueue.push(schema);
    }

    const DEFAULT_DURATION = 1;
    const DEFAULT_START = 'top 75%';
    const DEFAULT_STAGGER = 0.25;
    const EASE = 'power3.out';

    /**
     * ------------------------------------------------------------
     * CONFIG
     * ------------------------------------------------------------
     */

    function getSequenceConfig(section) {
        const durationAttr = parseFloat(section.getAttribute('mc-illustration-duration'));

        const staggerAttr = parseFloat(section.getAttribute('mc-illustration-stagger'));

        const debugAttr = section.getAttribute('mc-illustration-debug');

        return {
            duration: Number.isFinite(durationAttr) ? durationAttr : DEFAULT_DURATION,

            stagger: Number.isFinite(staggerAttr) ? staggerAttr : DEFAULT_STAGGER,

            start: section.getAttribute('mc-illustration-start') || DEFAULT_START,

            debug: debugAttr === '1' || debugAttr === 'true',
        };
    }

    /**
     * ------------------------------------------------------------
     * PREPARE INITIAL STATES
     * ------------------------------------------------------------
     */

    function prepareIllustration(element) {
        const type = element.getAttribute('mc-illustration');

        switch (type) {
            /**
             * STOREFRONT
             */
            case 'storefront': {
                const centreAwning = element.querySelector('.awning.a2');

                const outerAwnings = element.querySelectorAll('.awning.a1, .awning.a3');

                const centrePieces = element.querySelectorAll('.centre');

                const wings = element.querySelectorAll('.wing');

                const dots = element.querySelectorAll('.dot');

                gsap.set(centreAwning, {
                    y: -18,
                    opacity: 0,
                });

                gsap.set(outerAwnings, {
                    y: -18,
                    opacity: 0,
                });

                centrePieces.forEach((piece) => {
                    const styles = getComputedStyle(piece);

                    const x = parseFloat(styles.getPropertyValue('--tx')) || 0;

                    const y = parseFloat(styles.getPropertyValue('--ty')) || 0;

                    gsap.set(piece, {
                        x,
                        y,
                        scale: 1.03,
                        opacity: 0,
                        transformOrigin: 'center center',
                    });
                });

                wings.forEach((wing) => {
                    const styles = getComputedStyle(wing);

                    const x = parseFloat(styles.getPropertyValue('--x')) || 0;

                    gsap.set(wing, {
                        x,
                        scale: 1.03,
                        opacity: 0,
                        transformOrigin: 'center center',
                    });
                });

                gsap.set(dots, {
                    scale: 0,
                    opacity: 0,
                    transformOrigin: 'center center',
                });

                break;
            }

            /**
             * LINKED FORMS — BLUE
             */
            case 'linked-forms': {
                gsap.set(element.querySelector('.left-dark-arc'), {
                    rotation: -75,
                    opacity: 0,
                    transformOrigin: '121.936px 108.788px',
                });

                gsap.set(element.querySelector('.right-dark-arc'), {
                    rotation: 75,
                    opacity: 0,
                    transformOrigin: '198.786px 108.787px',
                });

                gsap.set(element.querySelectorAll('.left-top-light, .left-upper-pale, .left-side-mid'), {
                    scale: 0.82,
                    opacity: 0,
                    transformOrigin: '121.936px 108.788px',
                });

                gsap.set(element.querySelectorAll('.right-left-pale, .right-right-pale, .right-top-light'), {
                    scale: 0.82,
                    opacity: 0,
                    transformOrigin: '198.786px 108.787px',
                });

                break;
            }

            /**
             * LINKED MECHANISMS — GREEN
             */
            case 'linked-mechanisms': {
                const mechanisms = element.querySelectorAll('.mechanism');

                mechanisms.forEach((mechanism, index) => {
                    const pieceA = mechanism.querySelector('.mechanism-piece--a');

                    const pieceB = mechanism.querySelector('.mechanism-piece--b');

                    const direction = index % 2 === 0 ? -1 : 1;

                    gsap.set(pieceB, {
                        rotation: 85 * direction,
                        opacity: 0,
                        transformOrigin: 'center center',
                    });

                    gsap.set(pieceA, {
                        scale: 0.78,
                        opacity: 0,
                        transformOrigin: 'center center',
                    });
                });

                break;
            }

            /**
             * FOUNDATION CORE
             */
            case 'foundation-core': {
                gsap.set(element.querySelector('.core-piece-1'), {
                    opacity: 0,
                    scale: 0.72,
                    rotation: -7,
                    transformOrigin: 'center center',
                });

                gsap.set(element.querySelector('.core-piece-2'), {
                    opacity: 0,
                    scale: 0.78,
                    rotation: 12,
                    transformOrigin: 'center center',
                });

                gsap.set(element.querySelector('.core-piece-3'), {
                    opacity: 0,
                    x: -18,
                    scale: 0.92,
                });

                gsap.set(element.querySelector('.core-piece-4'), {
                    opacity: 0,
                    x: 18,
                    scale: 0.92,
                });

                gsap.set(element.querySelector('.core-piece-5'), {
                    opacity: 0,
                    x: -18,
                    scale: 0.92,
                });

                const stroke = element.querySelector('.core-stroke');

                if (stroke) {
                    const length = stroke.getTotalLength();

                    gsap.set(stroke, {
                        strokeDasharray: length,
                        strokeDashoffset: length,
                    });
                }

                break;
            }

            /**
             * FOUNDATION BUILD
             */
            case 'foundation-build': {
                gsap.set(element.querySelector('.build-curve-left'), {
                    opacity: 0,
                    rotation: -70,
                    scale: 0.9,
                    transformOrigin: 'center center',
                });

                gsap.set(element.querySelector('.build-curve-right'), {
                    opacity: 0,
                    rotation: 70,
                    scale: 0.9,
                    transformOrigin: 'center center',
                });

                gsap.set(element.querySelector('.build-pie-left'), {
                    opacity: 0,
                    x: -24,
                });

                gsap.set(element.querySelector('.build-pie-right'), {
                    opacity: 0,
                    x: 24,
                });

                break;
            }

            /**
             * FOUNDATION FREEDOM
             */
            case 'foundation-freedom': {
                gsap.set(element.querySelector('.freedom-piece-1'), {
                    opacity: 0,
                    scale: 0.72,
                    rotation: -7,
                    transformOrigin: 'center center',
                });

                gsap.set(element.querySelector('.freedom-piece-2'), {
                    opacity: 0,
                    scale: 0.78,
                    rotation: 12,
                    transformOrigin: 'center center',
                });

                gsap.set(element.querySelector('.freedom-piece-3'), {
                    opacity: 0,
                    x: 18,
                    scale: 0.92,
                });

                gsap.set(element.querySelector('.freedom-piece-4'), {
                    opacity: 0,
                    scale: 0.78,
                    rotation: 12,
                    transformOrigin: 'center center',
                });

                gsap.set(element.querySelector('.freedom-dot'), {
                    opacity: 0,
                    scale: 0.35,
                    transformOrigin: 'center center',
                });

                element.querySelectorAll('.freedom-stroke').forEach((stroke) => {
                    const length = stroke.getTotalLength();

                    gsap.set(stroke, {
                        strokeDasharray: length,
                        strokeDashoffset: length,
                    });
                });

                break;
            }

            /**
             * FOUNDATION OWNERSHIP
             */
            case 'foundation-ownership': {
                gsap.set(element.querySelector('.ownership-curve-left'), {
                    opacity: 0,
                    rotation: -70,
                    scale: 0.9,
                    transformOrigin: 'center center',
                });

                gsap.set(element.querySelector('.ownership-curve-right'), {
                    opacity: 0,
                    rotation: 70,
                    scale: 0.9,
                    transformOrigin: 'center center',
                });

                gsap.set(element.querySelector('.ownership-pie-left'), {
                    opacity: 0,
                    x: -24,
                });

                gsap.set(element.querySelector('.ownership-pie-right'), {
                    opacity: 0,
                    x: 24,
                });

                break;
            }
        }
    }

    /**
     * ------------------------------------------------------------
     * ORIGINAL SET TIMELINES
     * ------------------------------------------------------------
     */

    function createStorefrontAnimation(element, duration) {
        const centreAwning = element.querySelector('.awning.a2');

        const outerAwnings = element.querySelectorAll('.awning.a1, .awning.a3');

        const centrePieces = element.querySelectorAll('.centre');

        const wings = element.querySelectorAll('.wing');

        const dots = element.querySelectorAll('.dot');

        const tl = gsap.timeline({
            defaults: {
                ease: EASE,
            },
        });

        tl.to(
            centreAwning,
            {
                y: 0,
                opacity: 1,
                duration: duration * 0.38,
            },
            0,
        );

        tl.to(
            outerAwnings,
            {
                y: 0,
                opacity: 1,
                duration: duration * 0.38,
            },
            duration * 0.08,
        );

        tl.to(
            centrePieces,
            {
                x: 0,
                y: 0,
                scale: 1,
                opacity: 1,
                duration: duration * 0.5,
            },
            duration * 0.22,
        );

        tl.to(
            wings,
            {
                x: 0,
                scale: 1,
                opacity: 1,
                duration: duration * 0.42,
            },
            duration * 0.42,
        );

        tl.to(
            dots,
            {
                scale: 1,
                opacity: 1,
                duration: duration * 0.28,
            },
            duration * 0.66,
        );

        return tl;
    }

    function createLinkedFormsAnimation(element, duration) {
        const leftArc = element.querySelector('.left-dark-arc');

        const rightArc = element.querySelector('.right-dark-arc');

        const leftPieces = element.querySelectorAll('.left-top-light, .left-upper-pale, .left-side-mid');

        const rightPieces = element.querySelectorAll('.right-left-pale, .right-right-pale, .right-top-light');

        const tl = gsap.timeline({
            defaults: {
                ease: EASE,
            },
        });

        tl.to(
            leftArc,
            {
                rotation: 0,
                opacity: 1,
                duration: duration * 0.68,
            },
            0,
        );

        tl.to(
            rightArc,
            {
                rotation: 0,
                opacity: 1,
                duration: duration * 0.68,
            },
            0,
        );

        tl.to(
            leftPieces,
            {
                scale: 1,
                opacity: 1,
                duration: duration * 0.38,
                stagger: 0.04,
            },
            duration * 0.48,
        );

        tl.to(
            rightPieces,
            {
                scale: 1,
                opacity: 1,
                duration: duration * 0.38,
                stagger: 0.04,
            },
            duration * 0.48,
        );

        return tl;
    }

    function createLinkedMechanismsAnimation(element, duration) {
        const mechanisms = element.querySelectorAll('.mechanism');

        const tl = gsap.timeline({
            defaults: {
                ease: EASE,
            },
        });

        mechanisms.forEach((mechanism, index) => {
            const pieceA = mechanism.querySelector('.mechanism-piece--a');

            const pieceB = mechanism.querySelector('.mechanism-piece--b');

            const start = index * duration * 0.09;

            tl.to(
                pieceB,
                {
                    rotation: 0,
                    opacity: 1,
                    duration: duration * 0.62,
                },
                start,
            );

            tl.to(
                pieceA,
                {
                    scale: 1,
                    opacity: 1,
                    duration: duration * 0.36,
                },
                start + duration * 0.38,
            );
        });

        return tl;
    }

    /**
     * ------------------------------------------------------------
     * FOUNDATION TIMELINES
     * ------------------------------------------------------------
     */

    function createFoundationCoreAnimation(element, duration) {
        const piece1 = element.querySelector('.core-piece-1');

        const piece2 = element.querySelector('.core-piece-2');

        const piece3 = element.querySelector('.core-piece-3');

        const piece4 = element.querySelector('.core-piece-4');

        const piece5 = element.querySelector('.core-piece-5');

        const stroke = element.querySelector('.core-stroke');

        const tl = gsap.timeline({
            defaults: {
                ease: EASE,
            },
        });

        tl.to(
            piece1,
            {
                opacity: 1,
                scale: 1,
                rotation: 0,
                duration: duration * 0.72,
            },
            duration * 0.08,
        );

        tl.to(
            piece2,
            {
                opacity: 1,
                scale: 1,
                rotation: 0,
                duration: duration * 0.72,
            },
            duration * 0.2,
        );

        tl.to(
            piece3,
            {
                opacity: 1,
                x: 0,
                scale: 1,
                duration: duration * 0.72,
            },
            duration * 0.3,
        );

        tl.to(
            piece4,
            {
                opacity: 1,
                x: 0,
                scale: 1,
                duration: duration * 0.72,
            },
            duration * 0.4,
        );

        tl.to(
            piece5,
            {
                opacity: 1,
                x: 0,
                scale: 1,
                duration: duration * 0.72,
            },
            duration * 0.48,
        );

        if (stroke) {
            tl.to(
                stroke,
                {
                    strokeDashoffset: 0,
                    duration: duration * 0.62,
                    ease: 'power2.out',
                },
                duration * 0.56,
            );
        }

        return tl;
    }

    function createFoundationBuildAnimation(element, duration) {
        const leftCurve = element.querySelector('.build-curve-left');

        const rightCurve = element.querySelector('.build-curve-right');

        const leftPie = element.querySelector('.build-pie-left');

        const rightPie = element.querySelector('.build-pie-right');

        const tl = gsap.timeline({
            defaults: {
                ease: EASE,
            },
        });

        tl.to(
            leftCurve,
            {
                opacity: 1,
                rotation: 0,
                scale: 1,
                duration: duration * 0.72,
            },
            duration * 0.06,
        );

        tl.to(
            rightCurve,
            {
                opacity: 1,
                rotation: 0,
                scale: 1,
                duration: duration * 0.72,
            },
            duration * 0.18,
        );

        tl.to(
            leftPie,
            {
                opacity: 1,
                x: 0,
                duration: duration * 0.72,
            },
            duration * 0.38,
        );

        tl.to(
            rightPie,
            {
                opacity: 1,
                x: 0,
                duration: duration * 0.72,
            },
            duration * 0.5,
        );

        return tl;
    }

    function createFoundationFreedomAnimation(element, duration) {
        const piece1 = element.querySelector('.freedom-piece-1');

        const piece2 = element.querySelector('.freedom-piece-2');

        const piece3 = element.querySelector('.freedom-piece-3');

        const piece4 = element.querySelector('.freedom-piece-4');

        const dot = element.querySelector('.freedom-dot');

        const strokes = element.querySelectorAll('.freedom-stroke');

        const tl = gsap.timeline({
            defaults: {
                ease: EASE,
            },
        });

        tl.to(
            piece1,
            {
                opacity: 1,
                scale: 1,
                rotation: 0,
                duration: duration * 0.72,
            },
            duration * 0.06,
        );

        tl.to(
            piece2,
            {
                opacity: 1,
                scale: 1,
                rotation: 0,
                duration: duration * 0.72,
            },
            duration * 0.17,
        );

        tl.to(
            piece3,
            {
                opacity: 1,
                x: 0,
                scale: 1,
                duration: duration * 0.72,
            },
            duration * 0.29,
        );

        tl.to(
            piece4,
            {
                opacity: 1,
                scale: 1,
                rotation: 0,
                duration: duration * 0.72,
            },
            duration * 0.4,
        );

        strokes.forEach((stroke, index) => {
            tl.to(
                stroke,
                {
                    strokeDashoffset: 0,
                    duration: duration * 0.62,
                    ease: 'power2.out',
                },
                duration * (index === 0 ? 0.5 : 0.54),
            );
        });

        tl.to(
            dot,
            {
                opacity: 1,
                scale: 1,
                duration: duration * 0.42,
                ease: 'back.out(1.7)',
            },
            duration * 0.58,
        );

        return tl;
    }

    function createFoundationOwnershipAnimation(element, duration) {
        const leftCurve = element.querySelector('.ownership-curve-left');

        const rightCurve = element.querySelector('.ownership-curve-right');

        const leftPie = element.querySelector('.ownership-pie-left');

        const rightPie = element.querySelector('.ownership-pie-right');

        const tl = gsap.timeline({
            defaults: {
                ease: EASE,
            },
        });

        tl.to(
            leftCurve,
            {
                opacity: 1,
                rotation: 0,
                scale: 1,
                duration: duration * 0.72,
            },
            duration * 0.06,
        );

        tl.to(
            rightCurve,
            {
                opacity: 1,
                rotation: 0,
                scale: 1,
                duration: duration * 0.72,
            },
            duration * 0.18,
        );

        tl.to(
            leftPie,
            {
                opacity: 1,
                x: 0,
                duration: duration * 0.72,
            },
            duration * 0.38,
        );

        tl.to(
            rightPie,
            {
                opacity: 1,
                x: 0,
                duration: duration * 0.72,
            },
            duration * 0.5,
        );

        return tl;
    }

    /**
     * ------------------------------------------------------------
     * ROUTER
     * ------------------------------------------------------------
     */

    function createIllustrationTimeline(element, duration) {
        const type = element.getAttribute('mc-illustration');

        switch (type) {
            case 'storefront':
                return createStorefrontAnimation(element, duration);

            case 'linked-forms':
                return createLinkedFormsAnimation(element, duration);

            case 'linked-mechanisms':
                return createLinkedMechanismsAnimation(element, duration);

            case 'foundation-core':
                return createFoundationCoreAnimation(element, duration);

            case 'foundation-build':
                return createFoundationBuildAnimation(element, duration);

            case 'foundation-freedom':
                return createFoundationFreedomAnimation(element, duration);

            case 'foundation-ownership':
                return createFoundationOwnershipAnimation(element, duration);

            default:
                console.warn(`[MC Illustration] Unknown illustration: ${type}`, element);

                return null;
        }
    }

    /**
     * ------------------------------------------------------------
     * REDUCED MOTION
     * ------------------------------------------------------------
     */

    function reducedMotionEnabled() {
        if (
            window.MC?.motion &&
            typeof window.MC.motion.reduced === 'boolean'
        ) {
            return window.MC.motion.reduced;
        }

        return !!window.matchMedia?.(
            '(prefers-reduced-motion: reduce)'
        ).matches;
    }


    /**
     * ------------------------------------------------------------
     * FINAL / STATIC STATE
     * ------------------------------------------------------------
     */

    function showIllustrationFinal(
        element,
        duration
    ) {
        prepareIllustration(
            element
        );

        const timeline =
            createIllustrationTimeline(
                element,
                duration
            );

        if (!timeline) {
            return;
        }

        /*
         * Jump immediately to the authored final state,
         * then remove the temporary timeline.
         */
        timeline.progress(1);
        timeline.kill();
    }


    /**
     * ------------------------------------------------------------
     * SEQUENCE CONTROLLER
     * ------------------------------------------------------------
     */

    const sequenceControllers = [];

    function createSequenceController(
        section,
        sectionIndex
    ) {
        const initial =
            getSequenceConfig(
                section
            );

        const settings = {
            duration:
                initial.duration,

            stagger:
                initial.stagger,

            start:
                initial.start,

            debug:
                initial.debug,
        };

        const illustrations = [
            ...section.querySelectorAll(
                '[mc-illustration]'
            ),
        ];

        let master = null;
        let trigger = null;

        function kill() {
            if (master) {
                master.kill();
                master = null;
            }

            if (trigger) {
                trigger.kill();
                trigger = null;
            }
        }

        function showFinal() {
            kill();

            illustrations.forEach(
                (element) => {
                    showIllustrationFinal(
                        element,
                        settings.duration
                    );
                }
            );

            section.dataset
                .mcIllustrationReducedMotion =
                '1';
        }

        function buildAnimated() {
            kill();

            delete section.dataset
                .mcIllustrationReducedMotion;

            illustrations.forEach(
                prepareIllustration
            );

            master =
                gsap.timeline({
                    paused: true,
                });

            illustrations.forEach(
                (
                    element,
                    index
                ) => {
                    const timeline =
                        createIllustrationTimeline(
                            element,
                            settings.duration
                        );

                    if (!timeline) {
                        return;
                    }

                    master.add(
                        timeline,
                        index *
                        settings.stagger
                    );
                }
            );

            master.pause(0);

            trigger =
                ScrollTrigger.create({
                    id:
                        `mc-illustration-sequence-${sectionIndex + 1}`,

                    trigger:
                        section,

                    start:
                        settings.start,

                    markers:
                        settings.debug,

                    onEnter: () => {
                        master.play(0);
                    },

                    onLeaveBack: () => {
                        master.pause(0);

                        illustrations.forEach(
                            prepareIllustration
                        );
                    },
                });

            section.dataset
                .mcIllustrationSequenceReady =
                '1';
        }

        function rebuild() {
            if (
                reducedMotionEnabled()
            ) {
                showFinal();
            } else {
                buildAnimated();
            }

            requestAnimationFrame(
                () => {
                    ScrollTrigger.refresh();
                }
            );
        }

        const controller = {
            element:
                section,

            illustrations,

            settings,

            get(key) {
                return settings[
                    key
                ];
            },

            set(
                key,
                rawValue
            ) {
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
                    settings.duration =
                        Math.max(
                            0.01,
                            value
                        );

                    section.setAttribute(
                        'mc-illustration-duration',
                        String(
                            settings.duration
                        )
                    );

                    rebuild();

                    return;
                }

                if (
                    key ===
                    'stagger'
                ) {
                    settings.stagger =
                        Math.max(
                            0,
                            value
                        );

                    section.setAttribute(
                        'mc-illustration-stagger',
                        String(
                            settings.stagger
                        )
                    );

                    rebuild();
                }
            },

            rebuild,

            showFinal,

            replay() {
                /*
                 * Reduced motion: stay in the completed state.
                 */
                if (
                    reducedMotionEnabled()
                ) {
                    showFinal();

                    return;
                }

                /*
                 * Make sure the animated timeline exists.
                 */
                if (!master) {
                    buildAnimated();
                }

                /*
                 * Reset the authored starting state before replay.
                 */
                illustrations.forEach(
                    prepareIllustration
                );

                master.pause(0);
                master.play(0);
            },

            destroy:
                kill,
        };

        rebuild();

        if (
            settings.debug
        ) {
            console.log(
                '[MC Illustration] Sequence ready',
                {
                    sequence:
                        sectionIndex + 1,

                    illustrations:
                        illustrations.map(
                            (
                                element
                            ) =>
                                element.getAttribute(
                                    'mc-illustration'
                                )
                        ),

                    duration:
                        settings.duration,

                    stagger:
                        settings.stagger,

                    start:
                        settings.start,

                    reducedMotion:
                        reducedMotionEnabled(),
                }
            );
        }

        return controller;
    }


    function initIllustrationSequences() {
        const sections =
            document.querySelectorAll(
                '[mc-illustration-sequence]'
            );

        sequenceControllers
            .splice(
                0,
                sequenceControllers.length
            );

        sections.forEach(
            (
                section,
                sectionIndex
            ) => {
                const controller =
                    createSequenceController(
                        section,
                        sectionIndex
                    );

                sequenceControllers.push(
                    controller
                );
            }
        );

        window.MC =
            window.MC || {};

        window.MC.illustrationSequences =
            sequenceControllers;

        console.log(
            `[MC Illustration] Registered ${sequenceControllers.length} sequence(s).`
        );

        registerDebugSchema({
            id: 'illustration-sequences',
            label: 'Illustration Sequence',
            instances: () =>
                window.MC.illustrationSequences || [],
            instanceLabel: 'Sequence',
            controls: [
                {
                    type: 'range',
                    key: 'duration',
                    label: 'Duration',
                    min: 0.1,
                    max: 3,
                    step: 0.05,
                    suffix: 's',
                    decimals: 2,
                    event: 'change',
                },
                {
                    type: 'range',
                    key: 'stagger',
                    label: 'Stagger',
                    min: 0,
                    max: 1.5,
                    step: 0.05,
                    suffix: 's',
                    decimals: 2,
                    event: 'change',
                },
                {
                    type: 'button',
                    label: 'Replay',
                    action: 'replay',
                },
            ],
        });
    }


    /**
     * ------------------------------------------------------------
     * LIVE REDUCED MOTION
     * ------------------------------------------------------------
     */

    function rebuildAllSequences() {
        sequenceControllers.forEach(
            (
                controller
            ) => {
                controller.rebuild();
            }
        );
    }

    window.addEventListener(
        'mcMotionPreferenceChange',
        rebuildAllSequences
    );

    const motionMedia =
        window.matchMedia?.(
            '(prefers-reduced-motion: reduce)'
        );

    if (motionMedia) {
        const onSystemMotionChange =
            () => {
                if (
                    !window.MC?.motion ||
                    window.MC.motion.mode ===
                    'system'
                ) {
                    rebuildAllSequences();
                }
            };

        if (
            typeof motionMedia
                .addEventListener ===
            'function'
        ) {
            motionMedia.addEventListener(
                'change',
                onSystemMotionChange
            );
        } else if (
            typeof motionMedia
                .addListener ===
            'function'
        ) {
            motionMedia.addListener(
                onSystemMotionChange
            );
        }
    }


    /**
     * ------------------------------------------------------------
     * INIT
     * ------------------------------------------------------------
     */

    function init() {
        initIllustrationSequences();

        requestAnimationFrame(
            () => {
                ScrollTrigger.refresh();
            }
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