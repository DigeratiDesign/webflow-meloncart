# MC Effects Architecture

## Goal

The MC runtime is a collection of small, attribute-driven effects used by the Meloncart Webflow site.

Webflow authors the DOM and configuration. TypeScript supplies behaviour.

## Core responsibilities

### Motion core

Owns the global motion preference.

Public state:

```ts
MC.motion.mode
MC.motion.systemReduced
MC.motion.reduced
MC.motion.setMode(...)
MC.motion.refresh()
```

It synchronises the real `prefers-reduced-motion` media query, debugger overrides, `data-mc-reduced-motion` on `<html>`, the `mcMotionPreferenceChange` event, and legacy Webflow targets marked with `mc-native-webflow-motion`.

### Debug core

The debugger is a renderer and registry, not an effect controller.

It should accept effect registrations, render generic controls, call public instance APIs, refresh when registrations change, display stats supplied by effects, and expose global motion mode.

It should not know implementation details of Depth, Chalk, Illustration, etc.

### Effects

Each effect discovers its own DOM targets, parses its own `mc-*` attributes, owns defaults, creates/destroys its own runtime state, exposes any live controller API, handles Reduced Motion, registers its debugger schema, and provides replay where appropriate.

## Registration model

Conceptually:

```ts
MC.debug.register({
  id: 'example',
  label: 'Example',
  instances: () => MC.example,
  controls: [
    {
      type: 'range',
      key: 'duration',
      label: 'Duration',
      min: 0.1,
      max: 2,
      step: 0.05,
      suffix: 's',
    },
    {
      type: 'button',
      action: 'replay',
      label: 'Replay',
    },
  ],
});
```

The concrete API should follow the already working implementation during migration.

## Effects currently established

### MC Depth

Responsibilities include depth-map reveal, post-reveal camera/Ken Burns-style movement, live tuning, replay, and Reduced Motion.

Important Reduced Motion rule: if Reduced Motion is active before initialisation, display the ordinary source image and do not request the depth map.

### MC Chalk

Responsibilities include chalk treatment, bend, mask width, brush density, stamp density, generated DOM statistics, sequence duration, sequence stagger, replay, and Reduced Motion.

The density controls are performance controls. They may rebuild generated SVG geometry.

### MC Illustration

Responsibilities include illustration-specific initial states, illustration timelines, sequence duration, sequence stagger, replay, and Reduced Motion final/static state.

### MC Colour Reveal

Attributes:

```text
mc-colour-reveal
mc-colour-reveal-duration
mc-colour-reveal-colour
mc-colour-reveal-colour-duration
mc-colour-reveal-stagger
```

Responsibilities include SplitText line splitting only when motion is enabled, clip reveal, colour sweep, timing controls, replay, and Reduced Motion final text state.

Reduced Motion should avoid SplitText and ScrollTrigger entirely.

## Legacy Webflow motion

Elements animated by Webflow's legacy interaction engine and requiring Reduced Motion support are marked:

```html
mc-native-webflow-motion
```

The motion core applies the reduced visual state to these targets. Do not disable Webflow IX2 globally.

## Future effects

New effects should require no modification to the generic debugger unless they introduce a genuinely new generic control type.

If a new effect needs a slider, button, toggle, select, or stat, it should self-register using the existing debugger primitives.
