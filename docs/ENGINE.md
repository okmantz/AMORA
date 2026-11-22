# How AMORA builds a reply

`Engine.respond(text, ctx)` in `js/engine/engine.js` is a deterministic (seedable) pipeline. `ctx = { persona, mem, rel, conv, settings, mode, now }`. It returns `{ messages:[{text, expression, delay}], fx, debug }`.

1. **Analyse** (`text.js`) — normalise, tokenise, sentiment score, question detection, key words.
2. **Safety** — crisis phrases → supportive response with crisis-line guidance; stated age under 18 → polite refusal. Neither can be overridden by rules.
3. **Scenario turn** — if a scripted scene is active, deliver the next step (or end on “stop”).
4. **Learn facts** (`memory.js`) — name, age, job, location, pets, favorites, likes/dislikes, family, dates, “remember that…”.
5. **Custom rules** (`rules.js`) — your rules by priority; may replace, prefix or suffix the reply.
6. **Prohibited topics/words** — gentle deflection.
7. **Pending question** — if she asked something last turn, interpret your answer in that light (unless you clearly changed subject).
8. **Intent selection** (`intents.js`) — ~70 intents scored by regex; synthesized `vent` / `good_share` intents for emotional statements without keywords; secondary “combo” intents (e.g. greeting + how-are-you).
9. **Pieces** — intent response (`DB.intent.*`), topic reaction/opinion (`topics-data.js`), or an honest fallback (reflection, echo of a key word, or “that's outside my little dialogue database”).
10. **Enrichment** — mood check-in, callbacks to earlier mentions and dates, flirt (gated by stage + romance + flirt slider), quirk/catchphrase.
11. **Follow-up** — a question chosen from the intent/topic/getting-to-know pools, steered by curiosity, mode and conversation pacing.
12. **Compose** (`compose`) — choose pieces up to the length slider, render templates (`templates.js`: weighted, repetition-aware, trait- and stage-filtered), apply style (`style.js`: vocabulary, shy hesitation, exclamation level, lowercase, nickname, emoji), split into bubbles and compute typing delays.

**Trait influence** — each trait biases which pool is sampled (e.g. high sarcasm weights `sarcastic`, high shyness adds hesitation and `shy` lines), and conversation **mode** applies temporary trait deltas. Emotional intents suppress sarcasm and jokes.

**State** — `conv` (per-thread: mood, pending, topic, recent intents, jokes told, scenario) lives with each conversation; `rel` (points, stage, milestones) is per companion; `mem` (what she knows about you) is shared across companions.

**Testing** — `tests/engine.test.mjs` covers intents, variation, memory, trait/style influence, rules, scenarios, relationship and safety. `tests/play.mjs` is an interactive harness.
