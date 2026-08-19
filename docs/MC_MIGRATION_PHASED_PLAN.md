# MC Migration Phased Plan

Last updated: August 19, 2026

## Goal

Migrate the known-good Meloncart JavaScript currently living in `reference/webflow/` into this Finsweet Developer Starter TypeScript project while preserving runtime behaviour first.

This plan assumes:

- Webflow remains the source of markup, classes, and `mc-*` attributes.
- The repository becomes the source of runtime behaviour.
- Behavioural parity is more important than architectural cleanup during the first migration pass.

## Current Finsweet Starter Workflow

- Author code in `src/`.
- Use `src/index.ts` as the browser entry point.
- Run `pnpm dev` to bundle with esbuild, watch for changes, and serve the local bundle from `http://localhost:3000`.
- Load the dev bundle into the Webflow development site with a script tag such as:

```html
<script defer src="http://localhost:3000/index.js"></script>
```

- Run `pnpm build` for production output into `dist/`.
- Use existing validation commands:
  - `pnpm lint`
  - `pnpm check`
  - `pnpm build`
  - `pnpm test` when relevant

## What Exists Today

### Starter project

- Minimal starter code currently exists in `src/`.
- The real MC runtime has not yet been migrated into TypeScript.

### Reference implementations

Under `reference/webflow/`:

- `mc-motion.js`
- `mc-debug.js`
- `mc-depth.js`
- `mc-chalk.js`
- `mc-illustration.js`
- `mc-colour-reveal.js`
- `mc-form.js`
- `mc-prefill.js`
- `mc-theme.js`

## Important Runtime Dependencies

### Shared globals used by the reference code

- `window.MC`
- `window.MC.motion`
- `window.MC.debug`
- `window.MC.__debugQueue`
- `window.gsap`
- `window.ScrollTrigger`
- `window.SplitText`
- `window.colorThemes`

### Dependency notes

- `mc-motion` should exist before effects for the cleanest behaviour.
- `mc-debug` can load after effects because effects queue schemas into `window.MC.__debugQueue`.
- `mc-depth` only needs GSAP and ScrollTrigger when scroll tracking is used.
- `mc-chalk` and `mc-illustration` rely on GSAP and ScrollTrigger for animated sequences.
- `mc-colour-reveal` relies on GSAP, ScrollTrigger, and SplitText.
- `mc-theme` is not part of the MC effects core and should be treated separately.

## Recommended Target Structure

```text
src/
  index.ts
  mc/
    index.ts
    core/
      global.ts
      motion.ts
      debug.ts
      types.ts
    effects/
      depth.ts
      chalk.ts
      illustration.ts
      colour-reveal.ts
  site/
    form.ts
    prefill.ts
    theme/
      collector.ts
      scroll-animation.ts
```

## Migration Principles

- Preserve working behaviour first.
- Keep one module per effect where practical.
- Do not redesign effects during the first move into TypeScript.
- Keep the current `mc-*` attributes unchanged.
- Preserve reduced-motion behaviour exactly.
- Preserve debugger self-registration and replay behaviour.
- Verify each migrated module on the live Webflow development site before removing its old embed.

## Two-Phase Migration Strategy

## Phase 1: Behavioural Parity

Purpose:

- Move working code into the starter project with the fewest runtime changes possible.
- Keep current Webflow-provided global dependencies during this phase.
- Verify each module one at a time in the live Webflow development site.

Why this phase exists:

- It limits risk.
- It avoids mixing dependency/tooling changes with behaviour migration.
- It makes regressions easier to isolate.

### Phase 1 Order

1. `mc-motion`
2. `mc-debug`
3. `mc-depth`
4. `mc-chalk`
5. `mc-illustration`
6. `mc-colour-reveal`
7. `mc-prefill`
8. `mc-form`
9. `mc-theme`

### Phase 1 Acceptance Criteria Per Step

For each migrated module:

- TypeScript compiles.
- The dev bundle loads from the starter.
- The module initialises once.
- Existing `mc-*` configuration still works.
- Reduced Motion works.
- Debugger registration works where applicable.
- Live controls work where applicable.
- Replay works where applicable.
- No new console errors are introduced.
- Behaviour is checked on the Webflow development site before removing the old embed.

### Phase 1 Implementation Notes

#### 1. Motion core

Source:

- `reference/webflow/mc-motion.js`

Responsibilities to preserve:

- `window.MC.motion`
- `mode`, `systemReduced`, `reduced`, `setMode()`, `refresh()`
- `data-mc-reduced-motion` on `<html>`
- `mcMotionPreferenceChange`
- native Webflow reduced-motion neutralisation for `[mc-native-webflow-motion]`

Acceptance focus:

- System / Reduce / Full all behave correctly
- motion changes propagate live

#### 2. Generic debug registry

Source:

- `reference/webflow/mc-debug.js`

Responsibilities to preserve:

- `window.MC.debug`
- generic schema registration
- queued schema support via `window.MC.__debugQueue`
- global motion control
- keyboard toggle with `D`

Acceptance focus:

- no effect-specific logic hardcoded into the debugger
- queued registrations still work

#### 3. Depth

Source:

- `reference/webflow/mc-depth.js`

Responsibilities to preserve:

- WebGL depth reveal
- source/depth image loading
- pointer tracking
- optional scroll tracking
- optional auto movement
- replay
- debugger registration
- reduced-motion static path

Acceptance focus:

- if reduced motion is active at init, do not load the depth map
- scroll-driven behaviour matches the reference when enabled

#### 4. Chalk

Source:

- `reference/webflow/mc-chalk.js`

Responsibilities to preserve:

- chalk SVG treatment
- brush density and stamp density
- sequence animation
- DOM statistics
- debugger registration
- reduced-motion completed-artwork state

Acceptance focus:

- density changes preserve current behaviour
- static chalk icons still reveal correctly
- sequence reset and replay remain correct

#### 5. Illustration

Source:

- `reference/webflow/mc-illustration.js`

Responsibilities to preserve:

- known illustration types
- initial state preparation
- sequence timelines
- debugger registration
- replay
- reduced-motion final state

Acceptance focus:

- each illustration type matches its current choreography
- scroll-back/reset remains correct

#### 6. Colour Reveal

Source:

- `reference/webflow/mc-colour-reveal.js`

Responsibilities to preserve:

- `[mc-colour-reveal]` discovery
- `mc-colour-reveal-duration`
- `mc-colour-reveal-colour-duration`
- `mc-colour-reveal-stagger`
- `mc-colour-reveal-colour`
- CSS variable contract:
  - `--mc-colour-reveal`
  - `--clip-progress`
  - `--color-progress`
- SplitText line splitting
- ScrollTrigger-based reveal
- replay
- reduced-motion final state without SplitText or ScrollTrigger

Acceptance focus:

- line wrapping behaviour matches the current reference
- font-load timing does not change reveal structure
- reduced motion skips SplitText entirely

#### 7-9. Site scripts

Sources:

- `reference/webflow/mc-prefill.js`
- `reference/webflow/mc-form.js`
- `reference/webflow/mc-theme.js`

Note:

- These should be migrated after the MC core/effects.
- `mc-theme` should be treated as site functionality, not MC effects infrastructure.

## Phase 2: Bundle Dependencies Into the Repo

Purpose:

- Move the site from “repository code + Webflow dependency scripts” to a more self-contained bundled runtime.

Desired end state:

- the final site can load one project bundle rather than separate dependency scripts in Webflow

### GSAP Recommendation

Yes, GSAP should be installable as part of the plan, but not as the first migration step.

Reason:

- Bundling GSAP is a sensible end state.
- Installing and switching dependency loading during the initial parity pass would mix behaviour risk with build/dependency risk.

Recommended timing:

- install GSAP only after Motion, Debug, Depth, Chalk, Illustration, and Colour Reveal are already migrated and verified in the live Webflow development site

### Phase 2 Steps

1. Install `gsap`.
2. Confirm the required plugins are available in the package version being used:
   - `ScrollTrigger`
   - `SplitText`
3. Create a shared local GSAP module for imports and plugin registration.
4. Update migrated MC modules to import GSAP/plugins instead of relying on Webflow globals.
5. Re-verify all migrated effects on the live Webflow development site.
6. Remove no-longer-needed dependency scripts from Webflow only after bundled parity is confirmed.

### Phase 2 Cautions

- Do not change behaviour while changing dependency loading.
- Preserve current plugin registration behaviour.
- Verify `SplitText` availability in the chosen GSAP package workflow before committing to the switch.
- Treat the dependency-bundling pass as its own reviewable checkpoint.

## Validation Workflow

After each migration step:

1. Run:
   - `pnpm lint`
   - `pnpm check`
   - `pnpm build`
2. Verify in the Webflow development site:
   - normal motion
   - reduced motion
   - debugger behaviour where applicable
   - replay where applicable
   - scroll-back/reset behaviour where applicable
3. Keep the Webflow embed in place until parity is confirmed.

## Suggested Execution Sequence

### First implementation checkpoint

- migrate `mc-motion`

### Second implementation checkpoint

- migrate `mc-debug`

### Then iterate effect by effect

- `mc-depth`
- `mc-chalk`
- `mc-illustration`
- `mc-colour-reveal`

### Then migrate site scripts

- `mc-prefill`
- `mc-form`
- `mc-theme`

### Then dependency bundling

- install and bundle GSAP/plugins
- re-verify
- remove external dependency scripts

## Summary

The safest path is:

1. preserve working behaviour first
2. migrate the shared MC core
3. migrate one effect at a time
4. verify every step on the live Webflow development site
5. bundle GSAP only after the MC runtime is already stable in TypeScript

This keeps the migration small, reviewable, and aligned with the current Finsweet Developer Starter workflow.
