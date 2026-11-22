// AMORA — optional, opt-in knowledge lookup (Wikipedia REST + a free dictionary). Off by default.
// Only the extracted subject (e.g. "black holes") is sent, never your name, memories or chat history.
const WIKI = 'https://en.wikipedia.org/api/rest_v1/page/summary/';
const WIKI_SEARCH = 'https://en.wikipedia.org/w/rest.php/v1/search/title?limit=1&q=';
const DICT = 'https://api.dictionaryapi.dev/v2/entries/en/';

async function getJSON(url, ms = 7000) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), ms);
  try { const r = await fetch(url, { signal: ctl.signal, headers: { Accept: 'application/json' } }); if (!r.ok) throw new Error(String(r.status)); return await r.json(); } finally { clearTimeout(t); }
}
const firstSentences = (t, n) => { const m = String(t).replace(/\s*\([^)]{0,80}\)/g, '').match(/[^.!?]+[.!?]+(\s|$)/g); return m ? m.slice(0, n).join('').trim() : String(t).slice(0, 280); };

/** Returns { kind:'dict'|'wiki', title, text, url } or null. */
export async function lookup({ subject, kind }) {
  const q = subject.replace(/\?+$/, '').trim().slice(0, 80);
  if (!q) return null;
  if (kind === 'define' && /^[a-z'-]{2,30}$/i.test(q)) {
    try {
      const d = await getJSON(DICT + encodeURIComponent(q.toLowerCase()));
      const m = d?.[0]?.meanings?.[0], def = m?.definitions?.[0]?.definition;
      if (def) return { kind: 'dict', title: d[0].word, text: `${d[0].word} (${m.partOfSpeech}): ${def}`, url: `https://en.wiktionary.org/wiki/${encodeURIComponent(q)}` };
    } catch { /* fall through to wiki */ }
  }
  try {
    let title = q.replace(/\s+/g, '_');
    let s;
    try { s = await getJSON(WIKI + encodeURIComponent(title)); if (s.type === 'disambiguation' || !s.extract) throw 0; }
    catch { const r = await getJSON(WIKI_SEARCH + encodeURIComponent(q)); const hit = r?.pages?.[0]; if (!hit) return null; s = await getJSON(WIKI + encodeURIComponent(hit.key)); }
    if (!s?.extract) return null;
    return { kind: 'wiki', title: s.title, text: firstSentences(s.extract, 3), url: s.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(s.title)}` };
  } catch { return null; }
}
