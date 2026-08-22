# Spec-driven development workflow

All epic, feature, and story specs live in this folder. The workflow is built around one core principle:

> **Design and architecture happen at FEATURE level.** The ui-designer prototypes the entire feature in one cohesive `prototype.html`, and the architect designs the complete technical solution for the whole feature. Stories are delivery slices carved out of that already-designed feature AFTER architecture: they reference the feature-level design and architecture (deep-linking into prototype anchors) instead of producing their own, so slicing reflects real dependencies and component boundaries, and the shipped result stays cohesive.

The hierarchy is: an **epic** (optional) groups several **features**; a feature is split into **stories**; the **quick lane** is a standalone fast path. Only features carry design and architecture; epics are lightweight containers and stories are slices.

## Lifecycles

**Epic** (optional container grouping several features; no design or architecture of its own):

```
draft → awaiting-approval → approved → in-progress → done
```

**Feature** (design and architecture live here):

```
draft → design → architecture → adversarial-review → awaiting-approval → approved → in-progress → done
```

**Story** (created only after the feature is approved):

```
draft → qa → adversarial-review → awaiting-approval → approved → implementing → verifying → done
```

**Quick lane** (bug fixes and trivial changes):

```
draft → adversarial-review → awaiting-approval → approved → implementing → done
```

## Epics (optional grouping above features)

Most work starts at feature level. When an initiative is too big for one feature and naturally spans several, wrap it in an **epic**. An epic is a lightweight container only:

- It holds a vision and a **feature breakdown** (candidate features with a one-line scope each and rough order). It has **no** design, prototype, or architecture of its own; those always live at feature level.
- The link is **flat**: a feature belonging to an epic sets `epic: EPIC-XXX` in its frontmatter. Feature folders are **never** nested inside the epic folder; epic folders and feature folders both sit at the top of `docs/specs/`. This keeps every feature independently designed, approved, and shipped.
- Create one with `/spec:epic <idea>` (product-owner in EPIC mode). After Jeroen approves the epic, elaborate each candidate feature with `/spec:feature <idea> EPIC-XXX`, which stamps `epic: EPIC-XXX` on the new feature and links it under the epic's Features section. The epic moves to `in-progress` when its first feature starts and to `done` when all its features are `done`.

Epics are optional. A standalone feature just leaves `epic: ""` and behaves exactly as before.

## Approval gates: only Jeroen approves

There are three approval gates, and all belong to Jeroen alone:

1. **Epic direction (optional):** an epic in `awaiting-approval` waits for Jeroen to review the vision, scope, and feature breakdown before any child feature is elaborated. Only Jeroen sets `status: approved`.
2. **Feature direction:** a feature in `awaiting-approval` waits for Jeroen to review the functional scope, the prototype, the architecture, and the adversarial findings. Only Jeroen sets `status: approved` and fills `approved_by`. The scrum-master refuses to split an unapproved feature.
3. **Story implementation:** each story (and quick spec) in `awaiting-approval` waits for Jeroen the same way. The developer refuses to implement an unapproved story.

No agent ever sets `status: approved`, suggests setting it, or works past the gate. When a spec is in `awaiting-approval`, agents do nothing but report.

Related hard rules: each agent only advances the status for its own phase, after completing its own section. A story that needs to overturn a feature-level decision never does so silently; it flags the conflict and the feature spec is amended first.

## Command reference (in workflow order)

| Command | Does |
| --- | --- |
| `/spec:epic <idea>` | product-owner (EPIC mode) creates an epic that decomposes into candidate features |
| **APPROVE** | Jeroen sets `status: approved` on the epic (optional; only when grouping features) |
| `/spec:feature <idea> [EPIC-XXX]` | product-owner creates the feature spec from an idea (optionally under an epic) |
| `/spec:design FEAT-XXX` | ui-designer builds the cohesive prototype for the ENTIRE feature |
| `/spec:arch FEAT-XXX` | architect works out the complete technical design |
| `/spec:review FEAT-XXX` | adversarial-reviewer attacks the spec (full mode) |
| **APPROVE** | Jeroen reviews and sets `status: approved` on the feature |
| `/spec:split FEAT-XXX` | scrum-master slices the approved feature into stories |
| per story: `/spec:qa ST-YY` | qa-planner writes the test plan |
| per story: `/spec:review ST-YY` | adversarial-reviewer, lite mode |
| **APPROVE** | Jeroen sets `status: approved` on the story |
| `/spec:implement ST-YY` | developer implements the approved slice |
| `/spec:verify ST-YY` | qa-verifier checks the result against spec and prototype |

Any time: `/spec:status` shows the whole pipeline and what is waiting on Jeroen. `/spec:quick <description>` runs the fast lane for small fixes (mini spec, lite review, Jeroen approval, then `/spec:implement`).

## Worked walkthrough: building a feature end to end

This is a concrete run-through of the full lifecycle, using an example feature: **a newsletter signup form in the footer**. Follow the same shape for any real feature. Commands are typed to Claude Code; the **APPROVE** steps are Jeroen editing frontmatter by hand.

### 1. Describe the idea → `/spec:feature`

```
/spec:feature A newsletter signup form in the site footer. Visitors enter an
email, get inline validation and a success/error state. Match the existing
footer styling.
```

The **product-owner** agent creates `docs/specs/FEAT-006-newsletter-signup/spec.md` from `TEMPLATE-feature.md` (the number is the next free `FEAT-XXX`), fills in the problem, scope, and functional overview, checks `docs/components.md` and nearby code so the spec builds on what already exists, and lists open questions for you instead of guessing. It sets `status: design` and stops.

> Read the spec, answer the open questions inline, adjust scope. The spec is the conversation — edit it directly.

### 2. Design the whole feature → `/spec:design`

```
/spec:design FEAT-006
```

The **ui-designer** agent produces one cohesive `FEAT-006-newsletter-signup/prototype.html` covering **every** state of the feature (empty, focused, invalid email, submitting, success, error), inlining `docs/design/tokens.css` so it looks like this app. Screenshots or mockups you drop in `FEAT-006-newsletter-signup/assets/` are used as design input. It fills the spec's Design section, gives each state an anchor id in the prototype, and advances `status: architecture`.

> Open `prototype.html` in a browser. This is the cheapest place to change your mind about the UX, before any Vue is written.

### 3. Work out the technical design → `/spec:arch`

```
/spec:arch FEAT-006
```

The **architect** agent fills the Architecture section covering the whole feature: the component plan against `docs/components.md` (reuse `AppInput`, add a new presentational `NewsletterForm`, wire it from a `NewsletterFormContext`), the component/variant APIs (props in, emits out), data flow, the submit target, ADR notes for any build-vs-reuse decisions, and the seams the feature can be sliced along. Non-trivial flows get a Mermaid diagram. It advances `status: adversarial-review`.

### 4. Attack the spec → `/spec:review`

```
/spec:review FEAT-006
```

The **adversarial-reviewer** runs in FEATURE (full) mode: it tries to break the functional scope, the prototype, and the architecture, writes findings with severities into the spec's Adversarial review section, and routes blockers/should-fixes as `PROPOSED (adversarial review)` edits in the relevant sections. It sets `status: awaiting-approval` and stops.

### 5. APPROVE (Jeroen only)

You review the functional scope, the prototype, the architecture, and the adversarial findings. If it's right, set the frontmatter by hand:

```yaml
status: approved
approved_by: Jeroen
```

No agent may do this. Until it's set, `/spec:split` refuses to run.

### 6. Slice into stories → `/spec:split`

```
/spec:split FEAT-006
```

The **scrum-master** slices the approved feature along the architecture's seams into small, vertically sliced, dependency-ordered stories under `FEAT-006-newsletter-signup/stories/`, e.g.:

- `ST-01-form-markup-and-validation/` — the presentational `NewsletterForm` + inline validation states.
- `ST-02-submit-and-result-states/` — the context wiring, submit, success/error.

Each story is thin: it references the feature's design (deep-links into the prototype anchors) and architecture, and only records its own deltas. The feature goes `status: in-progress`; each story starts at `status: qa`.

### 7. Per story: plan tests → review → APPROVE → implement → verify

Take stories one at a time, in dependency order. For `ST-01`:

```
/spec:qa ST-01        # qa-planner maps every acceptance criterion to a concrete
                      # test (unit / component / manual), lists required states,
                      # notes regression risks → status: adversarial-review
/spec:review ST-01    # adversarial-reviewer in STORY (lite) mode: blockers only
                      # → status: awaiting-approval
```

**APPROVE** the story the same way (`status: approved`, `approved_by: Jeroen`). Then:

```
/spec:implement ST-01 # developer implements the slice against the prototype +
                      # architecture: reuse first per docs/components.md, Tailwind
                      # variant rules, tests from the QA plan alongside the code,
                      # updates docs/components.md for shared component changes
                      # → status: verifying
/spec:verify ST-01    # qa-verifier runs the full suite + lint, walks each
                      # acceptance criterion with evidence, compares against the
                      # prototype anchors, checks process compliance
                      # → status: done (pass) or back to implementing (fail)
```

Repeat 7 for `ST-02`. When every story is `done`, the feature is `done`.

### At any point

```
/spec:status         # pipeline overview: what's waiting on you, what's stuck,
                     # what an agent can pick up next
```

### The fast lane (no feature needed)

For a bug fix or a trivial change, skip the whole feature machinery:

```
/spec:quick The footer newsletter input is missing an aria-label
```

This creates a `QUICK-XXX-<name>/spec.md` (problem, proposed change, affected files, test impact), runs a **lite** adversarial review, and stops at `awaiting-approval`. After you approve, `/spec:implement QUICK-XXX` ships it — still honouring the `docs/components.md` update rule and the Tailwind variant rules. The quick lane skips design, architecture, and story splitting, nothing else.

### Grouping several features under an epic (optional)

If the newsletter work were part of a bigger initiative, say a whole "member accounts" area, you would start one level up:

```
/spec:epic Member accounts: let visitors register, sign in, manage their
profile, and see their order history.
```

The **product-owner** (EPIC mode) creates `docs/specs/EPIC-003-member-accounts/spec.md` with the vision, scope, and a **feature breakdown** (e.g. `registration`, `sign-in`, `profile management`, `order history`), then stops at `awaiting-approval`. You **APPROVE** the epic the same way (`status: approved`). Then elaborate each feature under it:

```
/spec:feature Registration form with email + password and validation. EPIC-003
```

That produces a normal `FEAT-XXX-registration/` feature with `epic: EPIC-003` in its frontmatter (still at the top level of `docs/specs/`, not inside the epic folder), and links it under the epic's Features section. From there each feature runs the exact seven-step flow above. `/spec:status` shows the features grouped under `EPIC-003`, and the epic is `done` once all of them are.

## Folder structure

```
docs/specs/
  TEMPLATE-epic.md
  TEMPLATE-feature.md
  TEMPLATE-story.md
  EPIC-001-example-initiative/
    spec.md              # vision + scope + feature breakdown + live Features index (NO design/architecture)
  FEAT-001-example-feature/
    spec.md              # the feature spec; frontmatter `epic: EPIC-001` links it to the epic above (or "" if standalone)
    prototype.html       # cohesive prototype of the ENTIRE feature, with anchor ids per section
    assets/              # screenshots, mockups, exports the design was based on
    stories/
      ST-01-first-slice/
        spec.md          # thin story: references feature design/architecture, holds only deltas
      ST-02-second-slice/
        spec.md
  QUICK-001-small-fix/
    spec.md
```

Note the flat model: `FEAT-001` is **not** inside `EPIC-001`'s folder. Both live at the top level and the only link between them is the feature's `epic:` frontmatter field, so a feature stays independently designed, approved, and shipped.

Supporting registries the agents rely on:

- `docs/design/tokens.css` — the project's design tokens; the ui-designer inlines these so prototypes look like this app.
- `docs/components.md` — living component inventory; consulted before proposing anything new, updated by the developer on every shared component change.
