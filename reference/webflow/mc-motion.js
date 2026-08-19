(() => {
    'use strict';

    window.MC =
        window.MC || {};

    const MEDIA_QUERY =
        '(prefers-reduced-motion: reduce)';

    const ROOT_ATTRIBUTE =
        'data-mc-reduced-motion';

    const NATIVE_SELECTOR =
        '[mc-native-webflow-motion]';

    const STYLE_ID =
        'mc-native-webflow-motion-style';

    function installNativeMotionCSS() {
        if (
            document.getElementById(
                STYLE_ID
            )
        ) {
            return;
        }

        const style =
            document.createElement(
                'style'
            );

        style.id =
            STYLE_ID;

        style.textContent = `
      html[${ROOT_ATTRIBUTE}="true"]
      ${NATIVE_SELECTOR} {
        opacity: 1 !important;
        transform: none !important;
        transition: none !important;
        animation: none !important;
        will-change: auto !important;
      }

      html[${ROOT_ATTRIBUTE}="true"]
      ${NATIVE_SELECTOR}::before,
      html[${ROOT_ATTRIBUTE}="true"]
      ${NATIVE_SELECTOR}::after {
        transition: none !important;
        animation: none !important;
      }
    `;

        document.head.appendChild(
            style
        );
    }

    function systemReduced() {
        return !!window.matchMedia?.(
            MEDIA_QUERY
        ).matches;
    }

    function resolvedReduced(
        mode
    ) {
        if (
            mode === 'reduce'
        ) {
            return true;
        }

        if (
            mode === 'full'
        ) {
            return false;
        }

        return systemReduced();
    }

    function applyState() {
        const reduced =
            window.MC.motion
                .reduced;

        document.documentElement
            .setAttribute(
                ROOT_ATTRIBUTE,
                reduced
                    ? 'true'
                    : 'false'
            );

        return reduced;
    }

    function dispatchChange() {
        const motion =
            window.MC.motion;

        window.dispatchEvent(
            new CustomEvent(
                'mcMotionPreferenceChange',
                {
                    detail: {
                        mode:
                            motion.mode,

                        reduced:
                            motion.reduced,

                        systemReduced:
                            motion.systemReduced
                    }
                }
            )
        );
    }

    /*
     * Preserve an existing mode if another MC script
     * created the motion API before this one.
     */
    const existingMode =
        window.MC.motion?.mode;

    window.MC.motion = {
        mode:
            [
                'system',
                'reduce',
                'full'
            ].includes(
                existingMode
            )
                ? existingMode
                : 'system',

        get systemReduced() {
            return systemReduced();
        },

        get reduced() {
            return resolvedReduced(
                this.mode
            );
        },

        setMode(
            mode
        ) {
            if (
                ![
                    'system',
                    'reduce',
                    'full'
                ].includes(
                    mode
                )
            ) {
                return;
            }

            if (
                this.mode === mode
            ) {
                applyState();
                dispatchChange();

                return;
            }

            this.mode =
                mode;

            applyState();
            dispatchChange();
        },

        refresh() {
            applyState();
            dispatchChange();
        }
    };

    installNativeMotionCSS();
    applyState();

    const media =
        window.matchMedia?.(
            MEDIA_QUERY
        );

    if (media) {
        const onSystemChange =
            () => {
                if (
                    window.MC.motion
                        .mode !==
                    'system'
                ) {
                    return;
                }

                applyState();
                dispatchChange();
            };

        if (
            typeof media
                .addEventListener ===
            'function'
        ) {
            media.addEventListener(
                'change',
                onSystemChange
            );
        } else if (
            typeof media
                .addListener ===
            'function'
        ) {
            media.addListener(
                onSystemChange
            );
        }
    }

    console.log(
        '[MC Motion] Ready',
        {
            mode:
                window.MC.motion.mode,

            reduced:
                window.MC.motion.reduced,

            nativeTargets:
                document.querySelectorAll(
                    NATIVE_SELECTOR
                ).length
        }
    );
})();