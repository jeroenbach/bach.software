# SEO Link-Building Research

Research into online communities (Stack Overflow, Reddit, GitHub Discussions, Microsoft Q&A, HashiCorp Discuss, Indie Hackers, dev.to, etc.) where people ask questions that the bach.software blog posts answer. The goal: post genuinely helpful answers that naturally link back to the posts, building backlinks and referral traffic.

**Research date:** 2026-07-05 · **Method:** 5 parallel web-research passes (one per post), every URL verified against the live platform or its API before inclusion.

## Files

| File | Post | Verified opportunities |
|---|---|---|
| [post-1-vue-generics-conditional-props.md](./post-1-vue-generics-conditional-props.md) | Mastering Conditional Property Types with Vue 3.3 Generics | 22 |
| [post-2-plausible-on-azure-kubernetes.md](./post-2-plausible-on-azure-kubernetes.md) | Ditching the Cookie Banners: Run Plausible Analytics on Azure Kubernetes | 16 |
| [post-3-track-article-reads-plausible.md](./post-3-track-article-reads-plausible.md) | Track how many people read your articles (Plausible, Vue.js, Azure Functions) | 18 |
| [post-4-terraform-aks.md](./post-4-terraform-aks.md) | Deploy a production-ready Kubernetes Cluster on Azure with Terraform | 19 |
| [post-5-typescript-array-to-map.md](./post-5-typescript-array-to-map.md) | Array to Map conversion in Typescript, with type safety | 20 |

## Top 10 opportunities across all posts

Ranked by traffic potential × relevance × likelihood the answer sticks:

1. **[SO: Convert object array to hash map, indexed by an attribute](https://stackoverflow.com/questions/26264956/convert-object-array-to-hash-map-indexed-by-an-attribute-value-of-the-object)** (post 5) — 697k views, **no accepted answer**. A TypeScript-focused answer fills a real gap among 25 mostly-JS answers.
2. **[GitHub: Kubernetes Support · plausible/analytics #4348](https://github.com/plausible/analytics/discussions/4348)** (post 2) — maintainers confirmed there's no official k8s support and won't add it; the post is exactly the missing documentation.
3. **[SO: vue 3.3 generics and conditional properties](https://stackoverflow.com/questions/78082236/vue-3-3-generics-and-conditional-properties)** (post 1) — near-exact topic match, no accepted answer.
4. **[GitHub: Conditional properties through discriminated unions · vuejs/core #8952](https://github.com/vuejs/core/issues/8952)** (post 1) — the canonical open upstream issue; a workaround comment will be found from Google for years.
5. **[GitHub: Page scroll depth · plausible/analytics #121](https://github.com/plausible/analytics/discussions/121)** (post 3) — highest-visibility scroll-depth thread; recent commenters need the DIY approach the post teaches.
6. **[Microsoft Q&A: How can I improve cost efficiency of Azure Kubernetes?](https://learn.microsoft.com/en-us/answers/questions/2121105/how-can-i-improve-cost-efficiency-of-azure-kuberne)** (posts 2 & 4 — link one, not both) — no accepted answer; a concrete "here's my real bill" answer stands out.
7. **[SO: How to avoid ClusterIssuer dependency on cert-manager CRDs in Terraform](https://stackoverflow.com/questions/69765121/how-to-avoid-clusterissuer-dependency-on-helm-cert-manager-crds-in-terraform-pla)** (post 4) — score 14, no accepted answer, active through Jan 2025.
8. **[HashiCorp Discuss: Reusable Terraform modules for AKS — feedback welcome](https://discuss.hashicorp.com/t/reusable-terraform-modules-for-enterprise-aks-deployments-feedback-welcome/77497)** (post 4) — fresh (June 2026), explicitly asks for exactly this experience; the most natural placement found.
9. **[GitHub: Should Unique Visitors or Total Pageviews count as "reads"? · plausible #2435](https://github.com/plausible/analytics/discussions/2435)** (post 3) — the asker literally wants an article read count; the existing answer misses actual *reads*.
10. **[Indie Hackers: Cheap, simple, privacy friendly analytics?](https://www.indiehackers.com/post/cheap-simple-privacy-friendly-analytics-495a9dbf7c)** (post 2) — thread's unresolved tension (Plausible price vs self-host) is the post's thesis; IH ranks well for the query.

## Cross-cutting findings

- **Stack Overflow is the richest platform overall** (posts 1, 4, 5 especially). Questions never close for new answers, and several high-traffic ones have no accepted answer. SO norms: the answer must stand alone; the link is supplementary ("full write-up here"). Comment-only links get flagged.
- **GitHub Discussions on plausible/analytics is the single best venue for posts 2 & 3** — k8s and custom-event questions accumulate there unanswered because maintainers deliberately don't support those paths.
- **Microsoft Q&A is underrated** for AKS-cost content: recurring questions, weak existing answers, good Google visibility, and late answers are rewarded.
- **Reddit is high-value but must be worked manually and quickly**: automated access is blocked, threads archive after ~6 months, so the listed 2024–2025 threads need commentability checks while logged in. For ongoing wins, watch r/vuejs, r/typescript, r/selfhosted, r/Terraform, r/AZURE for *fresh* threads and answer within days.
- **Hacker News is not viable for reply-based link building** (threads lock after ~2 weeks). Quora and forum.vuejs.org were dead ends.
- **Duplicate-target warning:** the Microsoft Q&A AKS-cost question appears in both post 2 and post 4 lists — answer it once, with one link.

## Etiquette rules (apply everywhere)

1. **Answer first, link second.** The reply must fully solve the question even if the link is removed. Include working code inline.
2. **Disclose ownership** where the platform culture expects it ("I wrote up the full pattern here"). SO, Reddit, and GitHub all react badly to undisclosed self-promotion, and SO requires affiliation disclosure.
3. **Pace yourself** — a burst of link-containing answers across platforms in one day pattern-matches to spam. Spread the High-priority items over several weeks.
4. **Match the platform tone:** GitHub comments should be workaround-framed and technical; Reddit casual and experience-based; SO complete and self-contained; Microsoft Q&A checklist-style.
5. **Check thread state before posting:** Reddit archiving, GitHub issue locks, and SO duplicate-closure can all change after research date.

## Suggested working order

Week 1: items 1–3 above. Week 2: items 4–6. Week 3: items 7–10. Then work down the Medium-priority items in each post file, and set up manual Reddit monitoring (saved searches) for fresh threads.
