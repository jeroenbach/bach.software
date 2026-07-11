---
id: FEAT-000
type: feature
status: draft
created: YYYY-MM-DD
approved_by: ""
---

# Feature: <name>

## Problem & goal
What problem this solves and for whom. What success looks like.

## Scope
### In scope
### Out of scope (explicit)

## Functional overview
User-facing behavior, main flows.

## Design (feature level)
Filled by ui-designer. Link to `prototype.html` (the cohesive prototype of the ENTIRE feature) and `assets/`. Design language decisions, layout system, states policy (loading, empty, error handled consistently across the feature), responsive strategy. Each screen/section in the prototype has an HTML anchor id so stories can deep-link to their slice.

## Architecture (feature level)
Filled by architect. The complete technical design: component plan for the whole feature (reuse / modify / new, referencing docs/components.md), component APIs with variants, full API contract (Kiota client impact, C# endpoints), data flow and composables, Nuxt SSR/client boundaries, Mermaid diagrams, ADR-style notes for every real decision.

## Adversarial review
Filled by adversarial-reviewer at feature level. Findings and resolutions.

## Constraints & assumptions

## Open questions
Questions for Jeroen. Must be resolved before approval.

## Stories
Filled by scrum-master AFTER approval. Links to story folders with implementation order and dependency notes.
