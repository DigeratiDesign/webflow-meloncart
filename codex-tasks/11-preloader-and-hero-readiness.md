# Task 11 - Preloader And Hero Readiness

Read `AGENTS.md` and inspect:
- the site entry point
- Digerati Motion and Debug infrastructure
- Meloncart Hero Sequence, Depth, Colour Reveal, and font-loading utilities
- the current Webflow implementation of `[dd-preloader]`

## Goal

Replace the Webflow native page-load interaction with a repository-owned Meloncart
preloader. The preloader must remain visible only until critical hero animation
assets and timelines are ready, then exit before the Hero sequence begins playing.

This prevents the preloader from obscuring the eyebrow or any other first Hero
cue while preserving a crawlable, readable page without JavaScript.

## Confirmed DOM Contract

Webflow owns the preloader markup and styling. The base runtime hook is:

```text
dd-preloader
```

The first Hero on a page continues to use:

```text
mc-hero-sequence
```

Do not require Webflow-authored initial opacity or transform states on page content.
The runtime owns animated states only after JavaScript is running.

## Readiness And Playback Model

1. The preloader module detects `[dd-preloader]` and creates a small readiness gate.
2. Hero Sequence initialisation prepares owned Depth, Colour Reveal, underline, body
   SplitText, CTA, footnote, and workflow image states, but leaves its master timeline
   paused when a preloader gate is active.
3. The Hero reports ready only after that master timeline has been fully built and its
   initial visual state is in place.
4. The preloader waits for the relevant above-the-fold Hero readiness promise, then
   removes itself with no transition. It remains visible for at least `500ms` so a
   fast Hero setup does not skip the loading state entirely.
5. Once the preloader exit completes, it releases Hero playback. The eyebrow must be
   visible from its first frame rather than running behind the overlay.
6. Pages without `[mc-hero-sequence]` must not wait for unrelated below-the-fold
   animation effects. They should dismiss after the document's critical readiness
   point, with a bounded fallback timeout.
7. Replay remains independent from the preloader and must continue to work after the
   preloader has dismissed.

## SEO, Accessibility, And Failure Safety

- Never use the preloader to hide, remove, or defer the actual page content from the
  DOM. It is a visual overlay only.
- A no-JavaScript visitor must not be trapped behind an overlay. Add an explicit
  no-JavaScript fallback that hides `[dd-preloader]`.
- Do not make crawlability depend on animation completion, `window.load`, a Depth-map
  request, or a third-party asset.
- The readiness gate needs a short bounded timeout (target `1.8s`) and a failure path:
  log in debug mode, show normal page content, remove the overlay, and allow Hero
  playback rather than leaving the page blocked.
- Respect System, Reduce, and Full motion modes. In reduced motion, show Hero final
  states without starting unnecessary visual effects, then dismiss the preloader
  promptly.
- Preserve keyboard and pointer access once the overlay is dismissed. The preloader
  must not retain focus, pointer interception, or an aria state after removal.

## Architecture

- Create `src/meloncart/preloader.ts`; do not put Meloncart-specific orchestration in
  Digerati core.
- Expose a compact generic readiness API through `window.MC` only if more than Hero
  needs to participate. Otherwise keep the handshake inside the Meloncart modules.
- Hero Sequence owns its own prepare, ready, play, replay, and teardown lifecycle.
  Depth and Colour Reveal remain reusable and must not gain preloader-specific logic.
- The preloader owns only overlay display, readiness waiting, exit animation, timeout,
  and playback release. It must not contain Hero choreography.
- Register preloader status with the generic debugger only if it can provide useful
  state or a safe replay/dismiss action without effect-specific debugger code.

## Webflow Migration

1. Keep the native Webflow interaction in place while the repository implementation
   is built and verified on the Webflow dev page.
2. Verify the repository bundle is loaded before removing the native interaction.
3. Once normal and reduced motion behavior is confirmed, remove the Webflow page-load
   interaction and any obsolete custom code. Keep only the `dd-preloader` markup and
   visual styling required by the new module.

## Validation

1. Run `pnpm lint`, `pnpm check`, and `pnpm build`.
2. Verify normal motion on Home, Features, and a workflow Hero page.
3. Verify the preloader exits before the eyebrow begins and no Hero cue runs behind it.
4. Verify Hero replay after the preloader has dismissed.
5. Verify System, Reduce, and Full motion modes, including a reduced-motion initial
   load that does not request a Depth map.
6. Throttle network and simulate a failed or delayed hero asset. The page must become
   usable after the bounded fallback timeout.
7. Verify JavaScript-disabled and crawler-like rendering still exposes readable page
   content and never leaves the preloader blocking it.
8. Verify no new console errors and no duplicate Hero timelines or ScrollTriggers.
9. Stop for manual Webflow verification before removing the native interaction.
