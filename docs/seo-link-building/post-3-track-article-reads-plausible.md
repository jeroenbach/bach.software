# Link-building opportunities — Post 3: "Track how many people read your articles, using Plausible.io, Vue.js and Azure functions"

**Post URL:** https://bach.software/posts/3-track-how-many-people-read-your-articles-using-plausible_io-vue_js-and-azure-functions

> Research date: 2026-07-05. Each entry is a real, verified thread where a helpful reply can naturally link to the post. Always write a substantive answer first — the link supports the answer, not the other way around.

## GitHub Discussions (plausible/analytics) — richest platform

### [Page scroll depth · Discussion #121](https://github.com/plausible/analytics/discussions/121)
- **Platform:** GitHub Discussions (plausible/analytics)
- **Status:** Feature implemented (Mar 2025) but thread still active — users were commenting as of May 2025 asking for API docs and custom-implementation guidance
- **Why it matches:** The original, highest-visibility thread on scroll depth in Plausible (open since 2020). Recent comments are from people who can't use the built-in feature (self-hosted CE, custom tracker libraries) and want a DIY approach — exactly what the post provides.
- **Suggested answer angle:** Reply to the recent comments about custom implementations: explain that you can roll your own with custom events + goals (works on self-hosted too), and that read-stages (opened/peeked/half-read/read) based on Medium-style read time are more meaningful than raw scroll %. Link the post as a full worked example with a Vue composable.
- **Priority:** High

### [Should Unique Visitors or Total Pageviews be used as a metric for how many times an article has been read? · Discussion #2435](https://github.com/plausible/analytics/discussions/2435)
- **Platform:** GitHub Discussions
- **Status:** Answered by maintainer (Nov 2022), open for comments
- **Why it matches:** Near-perfect topical match — the asker literally wants an "article read count," and the accepted answer only distinguishes visitors vs pageviews, not actual *reads*.
- **Suggested answer angle:** Add a comment: neither metric tells you if anyone *read* the article — a pageview can be a 3-second bounce. Describe firing a custom "read" event when the reader has spent the estimated read time / reached the end, then pulling that goal's count from the Stats API to display "X people read this". Link the post as the implementation.
- **Priority:** High

### [Keeping track of how long someone stays on a page · Discussion #1743](https://github.com/plausible/analytics/discussions/1743)
- **Platform:** GitHub Discussions
- **Status:** Answered (Mar 2022), open for comments
- **Why it matches:** Asker wants to measure time actually spent on a single page; maintainer explained pings don't affect time-on-page. The post's active-read-time measurement + staged custom events is the practical workaround.
- **Suggested answer angle:** Comment that a robust pattern is measuring engaged time client-side (visibility- and scroll-aware) and emitting threshold custom events, which sidesteps the time-on-page calculation limits entirely. Link the post's composable as a reference implementation.
- **Priority:** High

### [How can I track custom events sent via "/api/event" api endpoint? · Discussion #4651](https://github.com/plausible/analytics/discussions/4651)
- **Platform:** GitHub Discussions
- **Status:** Self-answered same day (Oct 2024), open for comments
- **Why it matches:** The stumbling block (custom events invisible until a matching goal is created) is exactly the setup walked through in the post; asker was in a React/Vite SPA — same SPA context.
- **Suggested answer angle:** Add a confirming comment expanding the self-answer: goals must match event names, and show what a full pipeline looks like (SPA composable → custom events → goals → Stats API). Link the post as an end-to-end tutorial.
- **Priority:** Medium

### [Is it possible to view custom events without defining them as a 'goal'? · Discussion #1772](https://github.com/plausible/analytics/discussions/1772)
- **Platform:** GitHub Discussions
- **Status:** Partially answered (2022), open; stray comment as recent as Mar 2026
- **Why it matches:** About the custom-events/goals model the post relies on; the "events are recorded regardless" nuance is exactly what the post demonstrates when querying via API.
- **Suggested answer angle:** Comment clarifying the event-vs-goal distinction and note that the Stats API can still aggregate events once goals exist — with the post linked as a concrete example of defining read-stage goals deliberately.
- **Priority:** Medium

### [API stats for a goal · Discussion #1617](https://github.com/plausible/analytics/discussions/1617)
- **Platform:** GitHub Discussions
- **Status:** Answered/resolved (Jan 2022), open for comments
- **Why it matches:** Fetching stats for a specific goal via the Stats API is precisely what the post's Azure Function does (`filters=event:name==...`).
- **Suggested answer angle:** Add a comment showing a production use of this endpoint — a serverless function that fetches the "read" goal count per article and renders "X people read this article," with caching to respect rate limits. Natural place for the link.
- **Priority:** Medium

### [Timeseries of custom events using the stats API · Discussion #3495](https://github.com/plausible/analytics/discussions/3495)
- **Platform:** GitHub Discussions
- **Status:** Resolved (Nov 2023, `events` metric later added), open for comments
- **Why it matches:** Same API surface (custom events via Stats API) and same "pull event counts out of Plausible programmatically" intent.
- **Suggested answer angle:** Brief comment noting the aggregate endpoint pattern for per-page event counts and linking the post as a worked example of consuming these numbers in a frontend.
- **Priority:** Low

### [API: Breakdown custom events by prop and get (non unique) visitors · Discussion #1662](https://github.com/plausible/analytics/discussions/1662)
- **Platform:** GitHub Discussions
- **Status:** Answered (2022), open; note that `metrics=events` isn't in self-hosted versions
- **Why it matches:** Breakdown of custom events by property is how the post separates read stages per article URL.
- **Suggested answer angle:** Comment with the breakdown query pattern used for per-article read stats and link the post; mention the self-hosted caveat.
- **Priority:** Low

## Stack Overflow

### [Rewrite url in Nuxt for analytics purpose](https://stackoverflow.com/questions/77339365/rewrite-url-in-nuxt-for-analytics-purpose)
- **Platform:** Stack Overflow
- **Status:** Unanswered (0 answers, score 1, ~153 views) — Oct 2023
- **Why it matches:** Asker wants Plausible inside a Nuxt (Vue) app with a proxy rewrite — same exact stack as the post (Vue/Nuxt + Plausible + a server-side function in front of Plausible's API).
- **Suggested answer angle:** Write a real answer: show Nitro `routeRules`/server proxy equivalent of the Next.js rewrite, plus how to send events from a composable. Close with "I documented a full Vue + Plausible setup (including reading-behavior events and an API proxy) here: [link]".
- **Priority:** High

### [Count Page Views with Next.js API](https://stackoverflow.com/questions/67530828/count-page-views-with-next-js-api)
- **Platform:** Stack Overflow
- **Status:** Unanswered (0 answers, ~2,500 views) — May 2021
- **Why it matches:** Asker is building a "views per blog post" counter with Firebase and hitting problems; the post's approach (let Plausible count, retrieve via Stats API through a serverless function) is a cleaner alternative answer.
- **Suggested answer angle:** Fix their concrete bug (response not sent before return in the API route), then suggest the alternative: skip the custom database and read counts from your analytics tool's stats API via a serverless function — link the post as a full example of that pattern.
- **Priority:** Medium

### [Plausible Analytics Events API - prevent manipulation](https://stackoverflow.com/questions/70072977/plausible-analytics-events-api-prevent-manipulation)
- **Platform:** Stack Overflow
- **Status:** Answered (1 answer, score 3, ~1,500 views) — Nov 2021, still linkable with a complementary answer
- **Why it matches:** About the Plausible events API's trust model; a server-side function between client and Plausible (the post's Azure Functions pattern) is a legitimate mitigation/architecture answer.
- **Suggested answer angle:** Add an answer describing keeping API keys and event validation server-side by routing through a serverless function, referencing the post's Azure Functions + Plausible setup as an example architecture.
- **Priority:** Medium

### [How to Calculate Average Scroll Depth?](https://stackoverflow.com/questions/53561722/how-to-calculate-average-scroll-depth)
- **Platform:** Stack Overflow
- **Status:** Answered (3 answers, accepted, ~4,500 views) — Nov 2018, evergreen traffic
- **Why it matches:** Milestone-event scroll tracking (10%…100%) is the same mechanism as the post's read stages; existing answers only cover the GA math.
- **Suggested answer angle:** Add an answer noting milestone *stages* (opened/peeked/half-read/read) mapped to goals give a directly readable funnel without averaging math, and that it works in privacy-friendly tools too — link the post as the implementation.
- **Priority:** Low

### [Scroll depth GTM - Gatsby](https://stackoverflow.com/questions/55472262/scroll-depth-gtm-gatsby)
- **Platform:** Stack Overflow
- **Status:** Answered (2 answers, score 9, ~1,850 views) — 2019
- **Why it matches:** Scroll-depth tracking breaking in an SPA — the post solves the SPA case (route changes, recalculating article bounds) in Vue; the concepts transfer to Gatsby/React.
- **Suggested answer angle:** Answer explaining why history-based navigation breaks scroll triggers and how to re-arm measurement per route; mention the post as a framework-agnostic walkthrough of the same problem solved in Vue.
- **Priority:** Low

### [Understanding Scroll Depth report](https://stackoverflow.com/questions/56224273/understanding-scroll-depth-report)
- **Platform:** Stack Overflow
- **Status:** 1 answer, none accepted (score 1) — May 2019
- **Why it matches:** Confusion about interpreting scroll-depth data; the post's argument (scroll % alone ≠ reading; combine with read time) is a genuinely useful interpretive answer.
- **Suggested answer angle:** Short answer on why raw scroll-depth reports mislead (fast scrollers, footer overshoot) and how time-aware read stages fix it, linking the post for the full method.
- **Priority:** Low

## Webmasters Stack Exchange

### [Get Google Analytics to report goal conversion by scroll depth](https://webmasters.stackexchange.com/questions/88713/get-google-analytics-to-report-goal-conversion-by-scroll-depth)
- **Platform:** Webmasters SE
- **Status:** Unanswered (0 answers) since Jan 2016
- **Why it matches:** Wants scroll depth as a *goal/conversion* — structurally identical to the post's "read" goals in Plausible.
- **Suggested answer angle:** Answer with the general pattern (fire an event at target depth/read time, define it as a goal), note it's tool-agnostic and show the Plausible variant via the post link.
- **Priority:** Medium

### [Scroll Depth trigger works wrongly, is this a GA4 issue?](https://webmasters.stackexchange.com/questions/139831/scroll-depth-trigger-works-wrongly-is-this-a-ga4-issue)
- **Platform:** Webmasters SE
- **Status:** Unanswered (0 answers, ~300 views) — Jul 2022
- **Why it matches:** GA4's built-in 90%-scroll event misfiring; an answer can explain why DIY measurement of the article element (not the whole page) is more reliable.
- **Suggested answer angle:** Explain the common cause (page height vs. article bounds, short pages auto-firing 90%) and recommend measuring the article container with your own events; link the post as an example of doing that properly.
- **Priority:** Low

## Indie Hackers

### [Best way to detect scroll level in interactive essay?](https://www.indiehackers.com/post/best-way-to-detect-scroll-level-in-interactive-essay-30bb12ec78)
- **Platform:** Indie Hackers
- **Status:** 20 comments, no definitive solution; Feb 2020, still open for replies
- **Why it matches:** Asker wants to know what percentage of a single-page essay users read and where they disengage — the post's exact problem, solved with events + stages.
- **Suggested answer angle:** Reply that combining scroll position with expected read time (Medium-style) and firing staged events into a lightweight tool like Plausible gives a per-essay read funnel; link the post as the write-up. Old thread, but IH threads rank in search for this query.
- **Priority:** Medium

## Other forums

### [Custom Events within Plausible (Analytics)](https://forum.bubble.io/t/custom-events-within-plausible-analytics/290195)
- **Platform:** Bubble Forum
- **Status:** Answered (Oct 2023), open for replies
- **Why it matches:** No-code founders asking how custom events/goals work in Plausible for a one-page app; the post explains the underlying event/goal mechanics they're confused about.
- **Suggested answer angle:** Short reply clarifying how manual `plausible()` calls map to goals and what engagement events (like "read") you can build with them, linking the post as background reading. Off-stack audience, so keep it conceptual.
- **Priority:** Low

## Search queries that worked

- `plausible analytics scroll depth custom events github discussion` — surfaced discussion #121 and docs
- `plausible analytics github discussion "custom events" API stats retrieve display website` — surfaced #3495, #1662, #1617, #4651
- `github discussion plausible show pageview count on website stats API` — surfaced #2435
- `plausible/analytics discussion "time on page" OR "read" article engagement` — surfaced #1743 and related
- `indie hackers "scroll depth" OR "read my posts" analytics discussion` — surfaced the Indie Hackers thread
- Stack Exchange API (`api.stackexchange.com/2.3/search/advanced`, via curl) with `q=plausible analytics`, `q=scroll depth`, `q=show page view count blog` — the only reliable way to find/verify SO questions (direct fetches to stackoverflow.com are blocked; the API returns answered-status, scores, views, and bodies)

## Platform notes

- **Richest platform by far: GitHub Discussions on plausible/analytics.** Discussions stay open indefinitely, are maintainer-tolerated for helpful links, rank well in Google for "plausible + X" queries, and the audience (devs wiring up Plausible) is exactly the post's audience. Start with #121, #2435, #1743.
- **Stack Overflow** has two genuinely unanswered, on-stack questions (Nuxt+Plausible rewrite; Next.js view counter) where a link fits naturally inside a substantive answer. Answer the question first — link second — to survive moderation.
- **Reddit could not be verified from this environment** (reddit.com and its JSON API are blocked). r/vuejs, r/Blogging and r/juststart likely contain matching threads ("how do I know if people read my posts"), but no URL could be confirmed — recommend a manual Reddit search for `"scroll depth"` in r/Blogging and `plausible` in r/selfhosted before posting.
- **Hacker News is a poor target**: comment threads lock after ~2 weeks, so all matching Ask HN threads found (2020–2024) are read-only.
