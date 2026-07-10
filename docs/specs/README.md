# Spec-driven development workflow

All feature and story specs live in this folder. The workflow is built on one core principle: **design and architecture happen at FEATURE level** so the result is cohesive. Stories are delivery slices carved out of an already-designed feature; they reference the feature-level design and architecture instead of producing their own. Splitting happens AFTER architecture, so stories reflect real dependencies and component boundaries.

## Lifecycles

Feature lifecycle (design and architecture live here):

```
draft → design → architecture → adversarial-review → awaiting-approval → approved → in-progress → done
```

Story lifecycle (stories are created only after the feature is approved):

```
draft → qa → adversarial-review → awaiting-approval → approved → implementing → verifying → done
```

Quick lane (bug fixes and trivial changes):

```
draft → adversarial-review → awaiting-approval → approved → implementing → done
```

## Approval gates

There are two gates, and both belong to Jeroen alone:

1. **Feature direction** — a feature must be `approved` before the scrum-master may split it into stories.
2. **Story implementation** — a story must be `approved` before the developer may implement it.

Only Jeroen may set `status: approved` and fill `approved_by`, on features AND stories. No agent ever sets, suggests setting, or works past this gate. A spec in `awaiting-approval` is waiting for Jeroen; the only valid agent action is to report and stop. Each agent advances the status only for its own phase, and only after completing its section. Story-level changes that contradict the approved feature design or architecture require amending the feature spec first (which flags it for Jeroen), never a silent local override.

## Command reference (in workflow order)

| Command | What it does |
| --- | --- |
| `/spec:feature <idea>` | Product-owner creates the feature spec |
| `/spec:design FEAT-XXX` | Ui-designer builds the cohesive prototype for the whole feature |
| `/spec:arch FEAT-XXX` | Architect works out the complete technical design |
| `/spec:review FEAT-XXX` | Adversarial-reviewer attacks the spec (full mode) |
| **APPROVE** | Jeroen reviews and sets `status: approved` on the feature |
| `/spec:split FEAT-XXX` | Scrum-master slices the approved feature into stories |
| Per story: `/spec:qa ST-YY` | Qa-planner writes the test plan |
| Per story: `/spec:review ST-YY` | Adversarial-reviewer, lite mode |
| **APPROVE** | Jeroen sets `status: approved` on the story |
| `/spec:implement ST-YY` | Developer implements the approved story |
| `/spec:verify ST-YY` | Qa-verifier checks the implementation against spec and prototype |
| `/spec:quick <description>` | Fast lane for bug fixes and trivial changes |
| `/spec:status` | Show all specs and their current status |

## Folder structure

```
docs/specs/
  README.md                          # this file
  TEMPLATE-feature.md
  TEMPLATE-story.md
  FEAT-XXX-<kebab-name>/
    spec.md                          # the feature spec
    prototype.html                   # cohesive prototype of the entire feature
    assets/                          # screenshots, mockups, sketches
    stories/
      ST-YY-<kebab-name>/
        spec.md                      # the story spec (thin: references the feature)
  QUICK-XXX-<kebab-name>/
    spec.md                          # quick-lane mini spec
```

## Quick lane

For bug fixes and trivial changes, `/spec:quick` creates a `QUICK-XXX-<name>/spec.md` mini spec (problem, proposed change, affected files, test impact), runs a lite adversarial review, and stops at `awaiting-approval` for Jeroen. After approval, `/spec:implement` works on quick specs too, including the components.md and Tailwind rules.

## Work item convention

Jira/work items only carry a link to the spec folder and the PR. The spec is the single source of truth; nothing is duplicated into work item descriptions.
