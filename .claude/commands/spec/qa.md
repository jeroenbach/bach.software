---
description: Create the test plan for a story
argument-hint: ST-YY
---

Read `CLAUDE.md` and the referenced spec before acting.

Invoke the **qa-planner** agent on the story identified in the arguments below. It reads the story spec plus the parent feature's design and architecture sections, maps every acceptance criterion to a concrete test (unit, component, or manual) following the project's test conventions, lists required states from the feature's states policy, records regression risks, flags untestable criteria with rewrite proposals, and sets the story status to `adversarial-review`.

Arguments:

$ARGUMENTS
