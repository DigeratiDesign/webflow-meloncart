# AGENTS.md

## Project purpose

This repository contains Digerati's front-end JavaScript/TypeScript for the Meloncart Webflow site.

The current priority is to migrate proven JavaScript effects out of Webflow embeds and into this repository without changing their behaviour. Webflow remains responsible for markup, classes, custom `mc-*` attributes, and the visual build. This repository owns the runtime behaviour.

## Working principles

- Preserve existing behaviour first. Refactor only after behavioural parity has been verified.
- Do not rewrite a working effect merely to make it more elegant.
- Make small, reviewable changes.
- Prefer existing project conventions over introducing new patterns.
- Do not add production dependencies without explicit approval.
- Before changing build tooling, package scripts, lint rules, TypeScript config, or Finsweet starter configuration, explain why the change is necessary.
- Treat the current published Webflow behaviour as the reference implementation during migration.
- Never remove an existing Webflow embed until the repository version has been verified on the published/dev site.
- Avoid console noise in production. Debug logging should be gated behind the MC debugger or an explicit debug flag.

## Repository discovery

Before the first code change in a task:

1. Read `package.json`.
2. Inspect the existing source tree.
3. Identify the package manager from the lockfile.
4. Identify the existing dev, build, lint, format, and typecheck commands.
5. Use the repository's existing commands. Do not invent replacements.
6. If the Finsweet Developer Starter has an established entry-point or module convention, follow it.

If a requested task conflicts with the current starter architecture, report the conflict before restructuring the project.

## TypeScript and module structure

- Use TypeScript for migrated source code.
- Prefer one module per MC effect.
- Keep effect-specific logic inside that effect's module.
- Shared infrastructure belongs in a small `mc` core layer.
- Avoid a single monolithic animation file.
- Do not create abstractions until at least two modules genuinely need them.
- Keep public MC APIs explicit and small.
- Use DOM types rather than `any` where practical.
- Guard optional globals such as GSAP plugins when required.
- Preserve compatibility with Webflow's published DOM.

Suggested conceptual structure:

```text
src/
  mc/
    core/
      motion.ts
      debug.ts
      registry.ts
    effects/
      depth.ts
      chalk.ts
      illustration.ts
      colour-reveal.ts
      ...
    index.ts
```

This is a direction, not a command to reorganise the repo if the starter already has a better established structure.

## MC attribute conventions

All custom runtime hooks use the `mc-*` namespace.

General rules:

- The base attribute enables the effect.
- Configuration lives in additional namespaced attributes.
- Attribute names should describe user-facing configuration, not implementation details.
- Missing optional attributes must fall back to safe defaults.
- Do not silently rename existing published attributes.

Examples currently in use include:

```text
mc-depth
mc-chalk
mc-chalk-sequence
mc-illustration
mc-illustration-sequence
mc-colour-reveal
mc-native-webflow-motion
```

Colour Reveal currently follows:

```text
mc-colour-reveal
mc-colour-reveal-duration
mc-colour-reveal-colour
mc-colour-reveal-colour-duration
mc-colour-reveal-stagger
```

## MC debugger architecture

The debugger is generic infrastructure. It must not contain effect-specific knowledge.

Each effect owns and registers:

- its label
- instances or groups
- controls
- stats
- replay actions
- getters/setters
- any effect-specific rebuild behaviour

The debugger only knows how to render generic control types.

Expected control types include:

```text
range
toggle
button
select
stat
```

Do not add hard-coded checks such as `if effect === "chalk"` to the debugger.

An effect should expose a small public controller API, for example:

```ts
interface MCController {
  get?(key: string): unknown;
  set?(key: string, value: unknown): void;
  replay?(): void;
  rebuild?(): void;
  destroy?(): void;
}
```

The exact shared type may evolve, but effect-specific behaviour stays in the effect module.

## Reduced motion

Reduced motion is a first-class requirement.

All MC effects must use the shared `MC.motion` state rather than independently inventing motion preferences.

Supported modes:

```text
system
reduce
full
```

Meaning:

- `system`: follow `prefers-reduced-motion`
- `reduce`: force reduced motion for debugging
- `full`: force normal motion for debugging

The motion core dispatches:

```text
mcMotionPreferenceChange
```

Effects must respond live when practical.

Reduced-motion behaviour should avoid unnecessary work, not merely set animation durations to zero.

Examples:

- Depth: show the normal source image and do not load the depth map when reduced motion is active at initialisation.
- Chalk sequence: display the completed chalk artwork; do not run the sequence animation.
- Illustration sequence: display the final illustration state without running the animation.
- Colour Reveal: display final text and avoid SplitText/ScrollTrigger entirely when reduced motion is active.
- Legacy Webflow interactions: targets carry `mc-native-webflow-motion`; the shared motion core neutralises their visual motion.

Do not remove the visual treatment when only the motion needs to be removed.

## GSAP

GSAP and ScrollTrigger are already part of the project behaviour.

- Use GSAP where it is already the appropriate engine.
- Do not introduce GSAP for effects that deliberately use a lighter native RAF/CSS implementation unless there is a concrete reason.
- Kill timelines and ScrollTriggers when rebuilding an effect.
- Avoid duplicate initialisation.
- Refresh ScrollTrigger only when necessary.
- Replay must respect Reduced Motion.
- Preserve the existing choreography and easing unless the task explicitly changes it.

## Performance

Performance is part of the design.

For expensive effects:

- Do not create DOM nodes that are not required.
- Avoid unnecessary event listeners.
- Avoid pointer/mouse listeners when their configured effect amount is zero.
- Avoid loading assets that Reduced Motion makes unnecessary.
- Rebuild expensive generated geometry on deliberate control changes, not on every pointer event, unless proven safe.
- Preserve the current Chalk density optimisation and DOM statistics.

Chalk currently exposes performance-tuning concepts including brush density and stamp density. The debugger may report generated node totals and average nodes per icon.

## Webflow integration

- Webflow markup and custom attributes are the public integration surface.
- Do not require hand-written DOM changes when an existing `mc-*` attribute can express the configuration.
- Do not depend on Webflow Designer-only behaviour.
- Test against the published/dev Webflow page because custom code behaviour can differ from Designer preview.
- Legacy Webflow IX2 targets that should be neutralised under Reduced Motion use:

```html
mc-native-webflow-motion
```

- Never globally disable all transforms or opacity across the page.

## Migration process

For each existing Webflow effect:

1. Capture the current working source as the behavioural reference.
2. Move it into the repository with minimal structural changes.
3. Add types without changing runtime behaviour.
4. Wire it into the repository entry point.
5. Verify the dev bundle loads in Webflow.
6. Verify normal motion.
7. Verify Reduced Motion: System / On / Off.
8. Verify debugger controls.
9. Verify replay.
10. Verify scroll-back/reset behaviour where applicable.
11. Verify console has no new errors.
12. Only then remove the old Webflow embed.
13. Commit/checkpoint before beginning the next effect.

Do not migrate multiple complex effects in one unreviewed change.

## Validation

After modifying code:

- Run the repository's existing formatter/linter/typecheck/build commands where available.
- Report exactly which validation commands were run and whether they passed.
- If no automated test exists for animation behaviour, say so explicitly.
- Do not claim visual parity without checking the Webflow dev page or receiving user confirmation.
- Do not "fix" unrelated warnings or code while performing a focused migration.

## Git safety

- Do not commit, push, rebase, reset, force-push, or delete branches unless explicitly requested.
- Prefer a clean checkpoint before large migrations.
- Do not modify unrelated files.
- Summarise changed files at the end of each task.

## Current migration order

Prefer this order unless the user requests otherwise:

1. MC Motion core
2. Generic MC Debug registry
3. MC Depth
4. MC Chalk + Chalk Sequence
5. MC Illustration + Illustration Sequence
6. MC Colour Reveal
7. Remaining MC effects
8. Other site scripts

## Definition of done for a migrated effect

An effect is not considered migrated until:

- the TypeScript compiles
- the dev build runs
- the effect initialises once
- published Webflow behaviour matches the previous implementation
- `mc-*` configuration still works
- Reduced Motion works
- debugger registration works
- debugger live controls work
- replay works where supported
- teardown/rebuild does not leak timelines/listeners
- the previous Webflow embed can be removed safely
