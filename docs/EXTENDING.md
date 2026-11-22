# Extending AMORA

You can extend AMORA two ways: **in the app** (Dialogue tab — per personality, exportable as JSON) or **in code** (the shared dialogue database that every personality draws from). After any code change run `npm test`.

---

## 1. Template syntax

Used in the database, custom rules, scenarios and the “Her replies” editor.

| Token | Meaning |
|---|---|
| `{user}` | your name (or a nickname / “you” if she doesn't know it) |
| `{nick}` | one of her pet names for you (Her → Style) |
| `{me}` `{age}` | her name and age |
| `{hobby}` `{hobby2}` `{music}` `{movie}` `{book}` `{activity}` `{food}` | a random item from her interests |
| `{color}` `{hair}` `{eyes}` `{outfit}` `{aesthetic}` `{bio}` | her look |
| `{daypart}` | morning / afternoon / evening / night |
| `{status}` `{stage_name}` `{shared}` | relationship status, stage name, a shared memory |
| `{mem:key}` | a remembered fact, e.g. `{mem:job}`, `{mem:pet}`, `{mem:location}`, `{mem:fav_music}`. **If she doesn't know it, the line is skipped** — safe to use. |
| `{word}` | a key word from your message |
| `{reflect}` | your statement turned around (“you're tired of your job”) |
| `{topic}` | the current topic's name |
| `{a\|b\|c}` | random choice between alternatives |

Lines with an unknown variable are skipped automatically, so you never see raw `{braces}`.

A pool entry can be a string **or** an object:

```js
{ t: "I could listen to you talk about this all night.", min: 3, max: 5, mode: 'romantic', tr: { romance: [60, 100] } }
// min/max = relationship stage window · mode = only in that mode · tr = only when trait is in [lo, hi]
```

---

## 2. Adding dialogue lines (code)

Open `js/data/dialogue.js`. Each intent has pools:

```js
greeting: {
  core: ["Hey {user}!", "Hi there — how's your {daypart}?"],     // always eligible
  playful: ["Well, look who showed up."],                         // blended in by trait sliders:
  sarcastic: [...], shy: [...], romantic: [...], confident: [...],// playful, sarcastic, shy, romantic,
  affectionate: [...], humor: [...], smart: [...], expressive: [...], // confident, affectionate, humor, smart, expressive
  stage:  { 3: ["Hey you. I missed you."] },                      // unlocked at stage ≥ 3
  early:  { 1: ["Hello! Nice to see you."] },                     // only at stage ≤ 1
  mode:   { romantic: ["Hello, gorgeous."] },                     // only in that mode
  react:  { shy: ["Oh— hi. 😳"] },                                // chosen by Dialogue → Behavior reaction settings
  ask:    [{ q: "How was your day?", p: 'day' }],                 // follow-up questions; p = what she expects back
  min: 0, reactMin: 0,                                            // minimum stage for the intent / its react pool
}
```

Just add strings to an existing pool. The engine weights pools by the personality's trait sliders, avoids repeating recent lines and tidies punctuation.

**Pending types** (`p:` on a follow-up question) tell the engine how to interpret your next message: `day`, `feeling`, `whathappened`, `listen`, `open`, `hobby`, `fav:<category>`, `topicq:<topic>`, `yesno`, `wyr`, `tot`, `joke`, `name`.

### Topic content — `js/data/topics-data.js`
Per topic: `react`, `opinions`, `asks`, `facts`, `deep`. Facts are deliberately few and well known — AMORA does not “know” arbitrary subjects, and says so.

### System content — `js/data/system-data.js`
Crisis/minor safety text, fallbacks, openers, jokes (`{q, a}`), would-you-rather, this-or-that, daily messages, milestone messages and the built-in **scenarios**.

---

## 3. Adding a new intent (code)

1. **Recognise it** — `js/engine/intents.js`, add to `INTENTS`:
   ```js
   { id: 'her_pet', pr: 11, expr: 'happy',
     pats: [W("\\bdo you have (a )?(pet|cat|dog)s?\\b"), W("\\bwhat('?s| is) your pet\\b")] },
   ```
   `pr` is priority (higher wins; 11 = direct questions about her, 9 = emotional, 5–8 = general). Optional: `emo: true` (emotional – suppresses sarcasm/jokes), `expr` (avatar expression), `aff`/`fam` (relationship points), `combo: true` (can be appended to another intent).
2. **Answer it** — `js/data/dialogue.js`, add `DB.intent.her_pet = { core: [...], playful: [...], ask: [...] }`.
3. **Test it** — add a case to `tests/engine.test.mjs`, or try `printf "do you have a cat?\n" | node tests/play.mjs luna 2 1`.

If an intent needs special logic (state, games), handle it in `Engine.intentPieces` in `js/engine/engine.js`.

## 4. Adding a topic (code)

1. `js/engine/topics.js` — `T('gardening', 'Gardening', '🌱', 'garden|plants?|flowers?|seeds?|compost')`.
2. `js/data/topics-data.js` — add `gardening: { react, opinions, asks, facts, deep }`.
3. Optionally add it to `TOPIC_CHOICES` in `js/data/presets.js` so it appears in the preferred/avoided topic pickers, and to `TRANSITIONS` for natural segues.

---

## 5. Personality rules (in the app)

**Dialogue → Rules → New rule**

| Field | Effect |
|---|---|
| Triggers + “When the message…” | *Any keyword*, *All keywords*, *Exact phrase inside the message*, *Whole message equals*, *Regex*, or a *Built-in intent* (to override a built-in answer) |
| Her replies | One is chosen at random; supports all template tokens. Press Enter after each. |
| How she uses it | **Replace** her normal reply, say it **before**, or add it **after** |
| Priority / Chance | Higher priority rules are checked first; chance < 100 makes it occasional |
| Min stage, mode, topic, sentiment | Restrict when the rule can fire |
| Cooldown / Once | Don't repeat for N messages / only once per conversation |
| Then expect… | Sets the pending type so her next turn interprets your answer |

Use **Dialogue → Tester** (or “Try this rule” inside the editor) to see exactly what fires; “Why did she say that?” lists matched intents, topics, mood and the pieces assembled.

**Behavior tab** — choose her default reaction to compliments, teasing, affection, disagreement and questions; topics she loves or avoids; words she won't discuss.

**Scenarios tab** — an intro, one line per step, and a closing. Start them from the chat `＋` menu or a trigger phrase. Typing “stop” ends one.

**Share / back up** — *Export rules & scenarios* (rules only) or **Her → Library → Export** (the whole personality incl. rules). Import on any device.

### Rule JSON shape
```json
{ "id": "r_1", "name": "Pizza opinion", "enabled": true, "match": "any",
  "triggers": ["pizza", "pineapple"], "intent": "", "responses": ["Pineapple on pizza? Bold. I respect it."],
  "placement": "replace", "priority": 60, "chance": 100, "minStage": 0, "mode": "", "topic": "",
  "sentiment": "any", "expression": "wink", "cooldown": 0, "once": false, "setPending": "" }
```

## 6. Adding a built-in preset personality

`js/data/presets.js` → append to `PRESETS` using the same shape as the existing ones (`blurb`, `look`, `traits`, `interests`, `style`, `reactions`). It automatically appears in onboarding and **Her → Library**.

## 7. Adding UI options

Avatar parts live in `js/ui/avatar.js` (hairstyles, outfits, accessories, expressions); their picker lists live in `OPTIONS` in `js/data/presets.js`. Backgrounds are CSS variables `--bg-<name>` in `css/styles.css` plus an entry in the `BG` list in `js/ui/settings.js`.

## 8. Checklist before publishing changes

- `npm test` passes.
- Add new files to the `SHELL` list in `sw.js` and bump `VERSION` so the offline cache refreshes.
- Keep every setting wired: a control must change `persona`/`settings` **and** influence the engine or UI.
