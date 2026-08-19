# Codex Migration Plan

## Objective

Move the existing, proven MC JavaScript from Webflow custom-code embeds into the Finsweet Developer Starter TypeScript repository while preserving behaviour.

This is a migration first and a refactor second.

## Phase 1 — repository reconnaissance

Ask Codex:

> Read AGENTS.md, package.json, the lockfile, TypeScript config, and the current source tree. Do not edit anything. Explain the Finsweet starter's entry point, module conventions, dev command, build command, lint/typecheck commands, and how the current Webflow dev bundle is loaded.

Do not begin migration until this is understood.

## Phase 2 — create the MC core

Migrate the shared infrastructure first:

1. Motion core
2. Generic debugger registry

Acceptance criteria:

- global `MC` namespace exists once
- motion System / On / Off works
- `data-mc-reduced-motion` stays synchronised
- `mcMotionPreferenceChange` fires
- `[mc-native-webflow-motion]` responds
- debugger opens with D
- debugger accepts effect registrations without hard-coded effect knowledge

## Phase 3 — migrate one effect at a time

Recommended order:

1. Depth
2. Chalk
3. Illustration
4. Colour Reveal
5. remaining effects

For every effect:

1. Move the latest known-working JavaScript into a TypeScript module with the fewest runtime changes possible.
2. Add types without redesigning the effect.
3. Wire it into the existing project entry point.
4. Verify in Webflow.
5. Remove the corresponding Webflow embed only after parity is confirmed.
6. Create a reviewable checkpoint before moving to the next effect.

## Phase 4 — cleanup

After all effects work from the repository:

- remove duplicated helper code
- extract shared types only where useful
- remove temporary compatibility shims
- reduce production logging
- document public `mc-*` attributes
- add lightweight tests for pure parsing/configuration functions
- retain visual/manual Webflow verification for animation choreography

## Suggested first Codex prompts

### Reconnaissance

> Read the repository and AGENTS.md. Do not edit files. Tell me how this Finsweet Developer Starter project is structured, which file is the browser entry point, how development and production builds work, and what commands I should use for linting/typechecking/building.

### Motion migration

> Migrate the supplied working MC Motion script into the existing TypeScript architecture. Preserve behaviour exactly. Follow AGENTS.md. Do not refactor unrelated code. Run the repository's existing validation commands and report the changed files and results.

### Effect migration

> Migrate the supplied working MC Chalk script into TypeScript with behavioural parity. Preserve all current mc-* attributes, debugger self-registration, Reduced Motion behaviour, density controls, DOM statistics, sequence controls, and replay. Do not remove or rename behaviour. Run validation, then stop for review before any cleanup refactor.

## Review rule

If Codex proposes a substantial rewrite while performing the initial migration, reject it and ask for a smaller parity-first change.
