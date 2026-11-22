# AMORA — Customizable Virtual Companion

A premium, mobile-messaging-style web app where you build a fictional companion — her look, personality, interests and voice — and chat with her. It is **pure HTML, CSS and vanilla JavaScript**, hosted as static files on **GitHub Pages**.

> **Honest by design.** AMORA contains **no AI, no language model, no backend and no tracking.** Every reply is built by a hand-written rule engine from a dialogue database, your personality settings and a small local memory. She does not understand language the way a person does, and she says so. Everything is stored in your browser's `localStorage`. The only optional network feature is **Knowledge lookup** (Wikipedia / dictionary), which is **off by default** and sends only the subject of your question.
> AMORA is for adults only (18+). Characters are always adults.

## What's new in v3 — realistic photo avatar

- **Real-looking avatar, not a drawing.** Her avatar and every photo she sends are now realistic portrait photographs (`assets/portraits/`, 114 images of fictional adult women) instead of the old drawn SVG art. The drawn engine remains only as an automatic fallback if the images can't load.
- **Customizable like a model sheet.** In **Her → Look**, skin tone, hairstyle, hair color, body type, freckles and age drive an auto-matcher that picks the closest portrait live. Or open the **portrait gallery**: filter by skin tone / body type / age, tap to pin any portrait, or hit **Shuffle similar**.
- **Same woman everywhere.** Header, chat bubbles, Us tab and photo messages all use her one matched portrait. If a photo is requested at a lower content level than the frame shows, it is cropped in to her face and shoulders rather than swapping in someone else.
- **Bring your own.** Upload your own image in **Her → Look → Upload your own photo**, or replace the files in `assets/portraits/` (see `assets/portraits/README.md`) — higher-resolution versions with the same file names drop straight in.

## What's new in v2

- **Accounts** — create a username + password on first launch; every companion, setting, memory and chat is saved under your account on this device. Passwords are hashed with PBKDF2-SHA256 (150k iterations) and never stored in plain text. Switch accounts or log out in **Settings → Account**.
- **New avatar engine** (`js/ui/portrait.js`) — fashion-illustration portraits with 14 hairstyles (afro, box braids, curls, pixie, buzz…), 5 body types from slender to plus-size, makeup styles, lip colors, freckles, beauty marks, satin/lace outfits and 11 expressions. 14 diverse presets.
- **Photos** — ask her for a selfie, a gym pic, a beach pic, "what are you wearing" or a spicy pic from the **camera button** or in plain words. Photos are drawn from her *current* look, open in a lightbox and can be saved as PNG.
- **Content levels** — *Sweet / Flirty / Steamy / Spicy* in Settings (and onboarding). Relationship stage still caps it unless gating is turned off in **Her → Relationship**.
- **Wider range** — new traits (spice, dominance, mischief), ~20 new intents (pickup lines, roasts, hype, dares, confessions, stories, poems), 18 extra topics, a calculator, unit converter, dice/coin/picker, date maths and an offline fact base.

## Features at a glance

| Area | What you get |
|---|---|
| **Design** | Luxury rose/gold aesthetic, light + dark + auto themes, 12 accent colors + custom picker, 3 typefaces, text-size slider, 3 bubble styles, 8 chat backgrounds, pattern overlays, your own background image (blur/dim), reduced-motion option, fully responsive (desktop rail, mobile tab bar) |
| **Her** | Name, age (18+), bio, **photoreal portrait avatar** (114-portrait library, auto-match by skin tone / hair / body type / age, gallery with filters and pinning), your own uploaded photo or monogram |
| **Personality** | 14 trait sliders (spice, dominance, mischief plus affection, humor, sarcasm, intelligence, playfulness, romance, confidence, shyness, expressiveness, curiosity, empathy) — each changes which lines are chosen |
| **Interests** | Hobbies, music, movies, books, activities, foods — used in her own opinions and answers |
| **Style** | Vocabulary (casual / sweet / poetic / playful / refined …), response length 1–5, emoji frequency and favorites, pet names, flirt frequency, catchphrases, lowercase typing |
| **Relationship** | Status (just met → married/custom), 6 progression stages, auto or manual, speed and daily caps, content gating, shared memories / inside jokes, 17 milestones, 6 conversation modes |
| **Engine** | ~70 intents, 23 topics with transitions, mood tracking, follow-up questions, callbacks, games (would-you-rather, this-or-that, jokes), 6 built-in scenarios, pending-question handling, honest fallbacks, ~1,300 dialogue templates |
| **Dialogue studio** | Custom rules (any / all / phrase / exact / regex / intent matching, priority, chance, min stage, mode/topic/sentiment conditions, cooldown, once, placement), reactions to compliments / teasing / affection / disagreement / questions, preferred + prohibited topics and words, custom scenarios, built-in database browser with “create override rule”, and a tester that shows *why* she answered |
| **Memory** | Learns your name, age, job, location, pets, favorites, likes, dislikes, family, important dates and “remember that…” notes; all viewable, editable and erasable in the **Us** tab |
| **Extras** | Searchable history, per-companion conversation threads, typing indicator + realistic delays, avatar expressions, daily message, conversation starters, journal (with optional reply) and sticky notes, JSON export/import of personalities, rules and full backups, conversation export/clear, storage meter, PWA with offline support |
| **Safety** | Built-in crisis response and minor check that custom rules cannot override; romantic content gated by relationship stage; progression never decreases and never punishes; no manipulative retention mechanics |

## Quick start (local)

```bash
git clone <your-repo-url> amora && cd amora
python3 -m http.server 8080     # or: npm run serve
# open http://localhost:8080
npm test                        # engine test suite (Node 18+, no dependencies)
```

ES modules require serving over HTTP — opening `index.html` directly from disk will not work.

## Deploy to GitHub Pages

**Option A — GitHub Actions (recommended; includes a test gate)**

1. Create a new GitHub repository and push this folder to the `main` branch:
   ```bash
   git init && git add . && git commit -m "AMORA"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
2. In the repo go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. The workflow in `.github/workflows/pages.yml` runs the tests and publishes the site. Your app will be at `https://<you>.github.io/<repo>/` within a minute or two (see the **Actions** tab).

**Option B — Deploy from branch (no Actions)**

1. Push the repo, then **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`** and save.
2. The included `.nojekyll` file makes Pages serve the files as-is.

All asset paths are relative, so the app works from any sub-path (`/repo/`) or a custom domain. After you publish an update, the service worker fetches new files on the next online visit; to force it, bump `VERSION` in `sw.js`.

## Using AMORA

- **Chat** — the main screen. `＋` opens scenarios, games and starters; the mode pill switches conversation modes (Casual, Heart-to-heart, Playful banter, Deep talk, Romantic evening, Cheerleader — some unlock with closeness). Hover (or long-press) a message for copy/delete.
- **Her** — look, personality, interests, style, relationship and your **Library** of saved personalities (unlimited: save, duplicate, switch, export/import JSON, create from 8 presets).
- **Dialogue** — write your own rules, reactions, topic preferences and scenarios, browse the built-in database and test everything live.
- **Us** — relationship progress, milestones and everything she remembers.
- **Journal**, **History**, **Settings** — notes and private journal, full-text search across conversations, appearance, data management, install.

## How progression works

Familiarity and affection points grow from conversation (with daily caps and a speed multiplier you choose). Six stages — New, Acquainted, Friends, Close, Sweethearts, Devoted — unlock warmer dialogue, modes and scenarios. Points never decrease, being away costs nothing, and she never withholds affection to pressure you. You can switch to manual stages or turn gating off entirely in **Her → Relationship**.

## Project layout

```
index.html  manifest.webmanifest  sw.js  .nojekyll
css/styles.css
icons/                      PWA icons
js/app.js                   state, persistence, theming, navigation, send/reply pipeline
js/core/                    util, store (per-account localStorage), auth (PBKDF2), lookup (opt-in), io
js/engine/                  engine, intents, spice (photos/heat/lookup), tools (calc/convert/dice), topics, templates, style, memory, rules, relationship, text
js/data/                    dialogue.js, spice.js, range.js (intent pools), topics-data.js, topics-extra.js, facts.js, system-data.js, presets.js
js/ui/                      chat, her, dialogue, memory, journal, history, settings, onboarding, auth, photoreal (portrait library + matcher), avatar, portrait (drawn fallback), dom
assets/portraits/           114 portrait images + manifest.json (see its README)
tests/                      engine.test.mjs (npm test), play.mjs (interactive harness)
docs/                       EXTENDING.md (add dialogue, intents, topics, rules), ENGINE.md (how replies are built)
.github/workflows/pages.yml GitHub Pages deployment
```

## Extending

See **[docs/EXTENDING.md](docs/EXTENDING.md)** for adding dialogue lines, intents, topics, scenarios and personality rules (both in the UI and in code), and **[docs/ENGINE.md](docs/ENGINE.md)** for the reply pipeline.

Try the engine from the terminal:

```bash
printf "hi\nI love hiking\nwhat do you know about me?\n" | node tests/play.mjs luna 2 7
#                                                          preset stage seed
```

## Content & limits (read this)

- **Photos are portraits of fictional adults** (AI-generated imagery, not photographs of real people). Expressions can't change a photograph, so they tint her avatar glow and add subtle motion instead.
- The **Spicy** tier means lingerie, swimwear and boudoir poses. She stays **covered**; nude requests get an in-character no and a covered photo.
- Steamy dialogue is suggestive but **not graphic** and fades to black. All characters are 18+.
- "Anything" is bounded: without an LLM she can chat about ~40 topics, do maths/conversions, and answer many common facts offline. Turn on **Knowledge lookup** for Wikipedia/dictionary answers; otherwise she says honestly when something is beyond her.
- **Accounts are local to the device.** The password gates the app; it does **not** encrypt browser storage, and there is no password recovery. Use **Full backup** to move data to another device.

## Privacy

All data stays in your browser (`localStorage`, keys prefixed `amora.v1.`, with each account in its own namespace). There are no network requests other than loading the app's own files — plus the optional, off-by-default Knowledge lookup. Use **Settings → Full backup** to move your data between devices, and **Erase everything** to wipe it.

## License

MIT.
