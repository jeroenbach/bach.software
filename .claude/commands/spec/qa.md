---
description: Create the test plan for a story
argument-hint: ST-YY
---

Read `CLAUDE.md` and the referenced spec before acting.

Invoke the qa-planner agent on the story: $ARGUMENTS

The qa-planner reads the story spec plus the parent feature's design and architecture sections, maps every acceptance criterion to a concrete test (unit, component, or manual), lists required fixtures and states to assert, records regression risks, then sets the story status to `adversarial-review`.
