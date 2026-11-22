# Portrait library

Every avatar and photo in AMORA comes from this folder. `manifest.json` lists each portrait and its attributes; `js/ui/photoreal.js` matches them to the look chosen in **Her → Look**.

All images depict fictional adult characters (AI-generated imagery) — not real people.

## Upgrading to higher resolution

The shipped files were cut from contact sheets, so most are ~500 px. For crisper results at large sizes:

1. Generate or export a larger version of a portrait (aim for 1024×1280, or at least 768 px wide).
2. Save it over the existing file **using the same file name** (e.g. `p012.jpg`). Update `w` and `h` in `manifest.json` if the size changed. Nothing else is needed.
3. Bump `VERSION` in `sw.js` so installed copies refetch.

`PROMPTS.md` lists a ready-to-paste description for each portrait to help you regenerate it consistently.

## Adding portraits

Add the image and a manifest entry:

```json
{ "id": "p115", "file": "p115.jpg", "w": 1024, "h": 1280, "crop": "bust",
  "skin": 2, "hairColor": "#d9b06a", "hairStyle": "wavy", "body": "curvy", "age": "young",
  "wear": 1, "freckles": false, "label": "Golden waves" }
```

| field | values |
|---|---|
| `skin` | 0 porcelain · 1 fair · 2 warm beige · 3 tan · 4 caramel · 5 brown · 6 deep |
| `hairColor` | one of the hex values in `OPTIONS.hairColor` (`js/data/presets.js`) |
| `hairStyle` | `long straight wavy bob lob pixie ponytail bun braid curls afro boxbraids buzz` |
| `body` | `slender athletic average curvy plus` |
| `age` | `young` (18–29) · `mid` (30–44) · `mature` (45–59) · `senior` (60+) — adults only |
| `wear` | 0 covered · 1 straps / camisole · 2 lace / bralette. Controls how tightly the photo is cropped at lower content levels |
| `crop` | `face` (wide head-and-shoulders) or `bust` (taller frame) |

Optional per-portrait `scenes` (e.g. `{ "beach": "p012_beach.jpg" }`) are reserved for future scene-specific photos.
