# Task 10 - Hero Sequence Implementation

Read `AGENTS.md` and inspect:
- Digerati Motion and Debug infrastructure
- shared GSAP setup
- Meloncart Depth and Colour Reveal implementations
- the Hero Sequence planning brief in `codex-tasks/09-hero-sequence-planning.md`

## Goal

Implement a Meloncart-only Hero Sequence that composes independent effects into one
page-load animation without giving child effects any Hero-specific knowledge.

## Confirmed Webflow DOM Contract

The Hero section has `mc-hero-sequence`. Within that section:

```text
mc-depth-reveal       Existing Depth image hook and configuration
mc-hero-eyebrow       Eyebrow copy
mc-colour-reveal      Existing heading Colour Reveal hook and configuration
mc-hero-body          Body-copy wrapper; animate its rendered text lines
mc-hero-cta           CTA group
mc-hero-footnote      Supporting / footnote copy
mc-underline          Brushstroke visual; standalone ScrollTrigger or Hero-owned wipe
```

At startup, the Hero module claims `mc-animation-owner="hero-sequence"` on its
Depth and Colour Reveal children before those effects initialise. The attribute may
also be authored explicitly. It is a generic ownership marker that prevents a child
from creating a competing standalone trigger.

Do not require initial opacity or transforms to be authored in Webflow. Runtime code
must own animated states while leaving content readable if JavaScript does not run.

## Required Choreography

1. Begin the Depth Reveal.
2. Fade in the eyebrow.
3. Run the heading's existing Colour Reveal as the primary movement.
4. Reveal body-copy lines with a rapid, subtle vertical fade-up, overlapping the end
   of the heading reveal.
5. Fade up the CTA group.
6. Fade up the footnote shortly after the CTA.

Do not add horizontal movement to copy. The heading owns the expressive motion.
On workflow heroes, the optional `[mc-hero-image]` is the visual alternative to
Depth and may slide in from the right.

## Architecture And Ownership

- Add `src/meloncart/effects/hero-sequence.ts`; wire it from `src/index.ts` after
  its child effects initialise.
- One controller owns one parent GSAP timeline per `[mc-hero-sequence]` section.
- A child belongs to the closest Hero Sequence section only; nested sections must
  not be double-initialised.
- Depth and Colour Reveal remain independently reusable. Add only small generic
  parent-ownership APIs necessary to prevent their standalone automatic triggers
  and allow the parent to control replay/start timing.
- Do not put Hero-specific branching in Digerati core, Depth, or Colour Reveal.
- Rebuild and kill owned timelines cleanly; avoid duplicate listeners or triggers.

## Motion, Debug, And Replay

- Under reduced motion, do not create a Hero timeline. Depth must use its static
  source image without loading its depth map; all copy must show in final state.
- Respond to live `mcMotionPreferenceChange` changes by rebuilding or showing the
  static final state as appropriate.
- Register a generic-debugger schema owned by Hero Sequence with absolute cue-time
  controls, measured from the beginning of the Hero, and one whole-sequence Replay
  button. This lets reviewers reorder or overlap hero elements through exported
  JSON settings without changing Webflow attributes.
- Replay must respect reduced motion and coordinate child effects rather than
  duplicating their animation logic.

## Responsive Behaviour

- Wait for fonts before splitting/rebuilding text lines.
- Refresh/rebuild safely after font or layout changes that affect line wrapping.
- Use existing GSAP and ScrollTrigger conventions; no new production dependencies.

## Validation

1. Run `pnpm lint`, `pnpm check`, and `pnpm build`.
2. Confirm the built bundle loads once on the Webflow dev/published page.
3. Verify standard-motion choreography, replay, debugger controls, and no console
   errors.
4. Verify System / Reduce / Full motion modes, including a reduced-motion initial
   load that does not request the depth map.
5. Verify heading/body line wrapping after responsive viewport and font changes.
6. Do not remove or alter previous Webflow embeds until manual verification passes.
7. Stop and report validation results for manual Webflow verification before any
   release/tagging work.
