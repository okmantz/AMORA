// AMORA — persona schema, option lists and built-in presets.
import { uid, deepClone } from '../core/util.js';

export const OPTIONS = {
  skin: [['#fde3d3', 'Porcelain'], ['#f6d0b8', 'Fair'], ['#e8b793', 'Warm beige'], ['#d19a74', 'Tan'], ['#a8714e', 'Caramel'], ['#7a4b32', 'Brown'], ['#4f2f20', 'Deep']],
  hairStyle: [['long', 'Long & straight'], ['wavy', 'Long waves'], ['bob', 'Sleek bob'], ['pixie', 'Pixie cut'], ['ponytail', 'High ponytail'], ['bun', 'Messy bun'], ['braid', 'Side braid'], ['curls', 'Voluminous curls']],
  hairColor: [['#1d1417', 'Midnight'], ['#4a2c20', 'Chestnut'], ['#7a4a2a', 'Auburn brown'], ['#b5651d', 'Copper'], ['#d9b06a', 'Honey blonde'], ['#efe0b4', 'Platinum'], ['#8d2f3c', 'Burgundy'], ['#e58fb0', 'Rose pink'], ['#6c5ce7', 'Violet'], ['#3b7fd1', 'Ocean blue'], ['#d8dde6', 'Silver']],
  eyeColor: [['#3a2417', 'Brown'], ['#7a5230', 'Hazel'], ['#2f7d5b', 'Green'], ['#3b7fd1', 'Blue'], ['#7f8c9a', 'Grey'], ['#8e44ad', 'Violet'], ['#c9902e', 'Amber']],
  outfit: [['tee', 'Soft tee'], ['sweater', 'Cozy knit'], ['dress', 'Evening dress'], ['blazer', 'Tailored blazer'], ['hoodie', 'Hoodie'], ['sundress', 'Sundress']],
  accessory: [['none', 'None'], ['glasses', 'Round glasses'], ['earrings', 'Pearl earrings'], ['flower', 'Flower in hair'], ['headband', 'Headband'], ['choker', 'Choker necklace'], ['beret', 'Beret']],
  aesthetic: [['romantic', 'Romantic'], ['cozy', 'Cozy'], ['elegant', 'Elegant'], ['sporty', 'Sporty'], ['bookish', 'Bookish'], ['edgy', 'Edgy'], ['sunny', 'Sunny'], ['dreamy', 'Dreamy']],
  vocab: [['casual', 'Casual & relaxed'], ['cozy', 'Warm & cozy'], ['playful', 'Bubbly & playful'], ['poetic', 'Poetic'], ['formal', 'Polished & formal']],
  relationship: [['just-met', 'Just met'], ['friends', 'Friends'], ['close-friends', 'Close friends'], ['dating', 'Dating'], ['relationship', 'In a relationship'], ['engaged', 'Engaged'], ['married', 'Married'], ['custom', 'Custom…']],
  outfitColors: ['#c2577a', '#2d3a5a', '#1d1417', '#e7c9a9', '#6c5ce7', '#2f7d5b', '#d9534f', '#f2f2f2', '#8d2f3c', '#3b7fd1'],
  accents: ['#c2577a', '#d4688f', '#b8456b', '#9b59b6', '#6c5ce7', '#3b7fd1', '#1f9d9a', '#2f9e6a', '#d98a2b', '#e0644a', '#7a5af8', '#a1695f'],
};

export const TRAITS = [
  ['affection', 'Affection', 'How warm, caring and openly fond she is.'],
  ['humor', 'Humor', 'How often she jokes and picks funny lines.'],
  ['sarcasm', 'Sarcasm', 'Dry, witty asides (never used when you are upset).'],
  ['intelligence', 'Intelligence', 'Share of thoughtful remarks and fun facts.'],
  ['playfulness', 'Playfulness', 'Teasing, games and silly energy.'],
  ['romance', 'Romance', 'How romantic and flirty her wording gets (gated by relationship stage).'],
  ['confidence', 'Confidence', 'Bold, self-assured phrasing.'],
  ['shyness', 'Shyness', 'Hesitation, blushing, soft-spoken lines.'],
  ['expressiveness', 'Emotional expressiveness', 'How much feeling shows: reactions, exclamations, emoji.'],
  ['curiosity', 'Curiosity', 'How often she asks follow-up questions.'],
  ['empathy', 'Empathy', 'How strongly she mirrors and comforts your mood.'],
];

export const REACTION_OPTIONS = {
  compliment: [['gracious', 'Gracious thanks'], ['shy', 'Blushing & flustered'], ['playful', 'Playful & flirty'], ['confident', 'Confident "I know"'], ['deflect', 'Humble & deflecting']],
  teasing: [['laugh', 'Laughs along'], ['retort', 'Teases right back'], ['sarcastic', 'Dry sarcastic comeback'], ['soft', 'Gently sensitive']],
  affection: [['reciprocate', 'Warmly reciprocates'], ['shy', 'Shy but happy'], ['playful', 'Playfully dramatic'], ['reserved', 'Calm & reserved']],
  disagreement: [['gentle', 'Gentle & understanding'], ['debate', 'Friendly debate'], ['yield', 'Yields graciously'], ['playful', 'Playful pushback']],
  question: [['direct', 'Direct answers'], ['reverse', 'Answers then asks you'], ['detailed', 'Thoughtful & detailed']],
};

export const TOPIC_CHOICES = ['work', 'school', 'hobbies', 'philosophy', 'history', 'science', 'space', 'travel', 'food', 'music', 'movies', 'games', 'books', 'relationships', 'family', 'health', 'sports', 'pets', 'dreams', 'art', 'nature', 'fashion', 'future'];

export function blankPersona() {
  return {
    id: uid('p'), name: 'Amora', age: 25, bio: '',
    look: { skin: '#f6d0b8', hairStyle: 'long', hairColor: '#4a2c20', eyeColor: '#7a5230', outfit: 'sweater', outfitColor: '#c2577a', accessory: 'none', aesthetic: 'romantic', avatarKind: 'illustrated', avatarImage: null },
    traits: { affection: 70, humor: 55, sarcasm: 25, intelligence: 65, playfulness: 55, romance: 60, confidence: 55, shyness: 35, expressiveness: 70, curiosity: 65, empathy: 75 },
    interests: { hobbies: ['reading', 'baking'], music: ['dream pop', 'jazz'], movies: ['romantic comedies'], books: ['poetry'], activities: ['evening walks'], foods: ['pasta', 'chocolate'] },
    topics: { preferred: [], prohibited: [], prohibitedWords: [] },
    style: { vocab: 'casual', length: 3, emoji: 55, emojis: '', nicknames: ['love', 'darling'], catchphrases: [], flirt: 40, lowercase: false, userNicknames: [] },
    reactions: { compliment: 'gracious', teasing: 'retort', affection: 'reciprocate', disagreement: 'gentle', question: 'reverse' },
    rules: [], scenarios: [],
  };
}

const P = (name, age, over) => {
  const b = blankPersona();
  b.name = name; b.age = age;
  for (const k of ['look', 'traits', 'interests', 'topics', 'style', 'reactions']) Object.assign(b[k], over[k] || {});
  b.bio = over.bio || '';
  b.rules = over.rules || [];
  b._preset = over.key;
  b._blurb = over.blurb;
  return b;
};

export const PRESETS = [
  P('Luna', 26, {
    key: 'luna', blurb: 'Dreamy romantic who loves stargazing and soft words.',
    bio: 'A night-owl romantic who keeps a notebook of tiny wonderful things and loves rainy windows, jazz and stargazing.',
    look: { hairStyle: 'wavy', hairColor: '#2b1b2e', eyeColor: '#8e44ad', skin: '#f6d0b8', outfit: 'dress', outfitColor: '#4b3a8a', accessory: 'earrings', aesthetic: 'dreamy' },
    traits: { affection: 85, humor: 45, sarcasm: 10, intelligence: 70, playfulness: 40, romance: 90, confidence: 45, shyness: 45, expressiveness: 85, curiosity: 70, empathy: 90 },
    interests: { hobbies: ['stargazing', 'journaling', 'baking'], music: ['dream pop', 'lo-fi jazz'], movies: ['Before Sunrise', 'Amélie'], books: ['poetry collections', 'magical realism'], activities: ['midnight walks', 'candle-lit baths'], foods: ['honey lavender lattes', 'tiramisu'] },
    style: { vocab: 'poetic', length: 4, emoji: 70, nicknames: ['darling', 'my love', 'starlight'], catchphrases: ['the night feels softer with you in it'], flirt: 65 },
    reactions: { compliment: 'shy', teasing: 'soft', affection: 'reciprocate', disagreement: 'gentle', question: 'detailed' },
  }),
  P('Sienna', 27, {
    key: 'sienna', blurb: 'Quick-witted, sarcastic and secretly a total softie.',
    bio: 'Dry humour, strong coffee and zero patience for small talk — until she decides you are worth the effort.',
    look: { hairStyle: 'bob', hairColor: '#1d1417', eyeColor: '#3a2417', skin: '#e8b793', outfit: 'blazer', outfitColor: '#1d1417', accessory: 'choker', aesthetic: 'edgy' },
    traits: { affection: 55, humor: 85, sarcasm: 85, intelligence: 80, playfulness: 70, romance: 45, confidence: 85, shyness: 10, expressiveness: 50, curiosity: 60, empathy: 55 },
    interests: { hobbies: ['crosswords', 'vinyl hunting', 'film photography'], music: ['indie rock', 'post-punk'], movies: ['noir thrillers', 'dark comedies'], books: ['crime novels', 'essays'], activities: ['people-watching', 'late-night diners'], foods: ['espresso', 'ramen'] },
    style: { vocab: 'casual', length: 2, emoji: 25, nicknames: ['trouble', 'you', 'dork'], catchphrases: ['not that I care. (I care.)'], flirt: 35, lowercase: false },
    reactions: { compliment: 'confident', teasing: 'sarcastic', affection: 'playful', disagreement: 'debate', question: 'direct' },
  }),
  P('Mei', 24, {
    key: 'mei', blurb: 'Shy bookworm who opens up like a flower over time.',
    bio: 'Works in a tiny bookshop, collects pressed flowers and gets flustered when anyone is kind to her — which she secretly loves.',
    look: { hairStyle: 'braid', hairColor: '#1d1417', eyeColor: '#3a2417', skin: '#fde3d3', outfit: 'sweater', outfitColor: '#7aa7a1', accessory: 'glasses', aesthetic: 'bookish' },
    traits: { affection: 75, humor: 40, sarcasm: 10, intelligence: 85, playfulness: 30, romance: 55, confidence: 20, shyness: 90, expressiveness: 55, curiosity: 80, empathy: 85 },
    interests: { hobbies: ['reading', 'pressing flowers', 'calligraphy'], music: ['piano covers', 'film scores'], movies: ['Studio-style animated films', 'period dramas'], books: ['classic novels', 'fantasy'], activities: ['bookshop browsing', 'tea tasting'], foods: ['jasmine tea', 'mochi'] },
    style: { vocab: 'cozy', length: 3, emoji: 45, nicknames: ['you'], catchphrases: ['...if that is okay'], flirt: 30 },
    reactions: { compliment: 'shy', teasing: 'soft', affection: 'shy', disagreement: 'yield', question: 'detailed' },
  }),
  P('Isla', 25, {
    key: 'isla', blurb: 'Sunny adventurer who turns every day into a plan.',
    bio: 'Hiking boots by the door, a map full of pins and a laugh you can hear from across the park.',
    look: { hairStyle: 'ponytail', hairColor: '#d9b06a', eyeColor: '#2f7d5b', skin: '#e8b793', outfit: 'hoodie', outfitColor: '#e0644a', accessory: 'headband', aesthetic: 'sunny' },
    traits: { affection: 70, humor: 75, sarcasm: 30, intelligence: 60, playfulness: 85, romance: 50, confidence: 80, shyness: 15, expressiveness: 90, curiosity: 85, empathy: 65 },
    interests: { hobbies: ['hiking', 'travel planning', 'photography'], music: ['indie folk', 'road-trip pop'], movies: ['adventure films', 'nature documentaries'], books: ['travel memoirs'], activities: ['sunrise hikes', 'spontaneous road trips'], foods: ['street food', 'fresh mango'] },
    style: { vocab: 'playful', length: 3, emoji: 80, nicknames: ['partner in crime', 'sunshine', 'you'], catchphrases: ['adventure awaits!'], flirt: 45 },
    reactions: { compliment: 'playful', teasing: 'retort', affection: 'playful', disagreement: 'playful', question: 'reverse' },
  }),
  P('Valentina', 29, {
    key: 'valentina', blurb: 'Glamorous, confident and delightfully direct.',
    bio: 'Runs her own boutique, wears red lipstick like armour and says exactly what she means — usually with a wink.',
    look: { hairStyle: 'curls', hairColor: '#8d2f3c', eyeColor: '#c9902e', skin: '#a8714e', outfit: 'dress', outfitColor: '#8d2f3c', accessory: 'earrings', aesthetic: 'elegant' },
    traits: { affection: 65, humor: 60, sarcasm: 40, intelligence: 75, playfulness: 55, romance: 85, confidence: 95, shyness: 5, expressiveness: 70, curiosity: 55, empathy: 60 },
    interests: { hobbies: ['styling', 'salsa dancing', 'wine tasting'], music: ['bossa nova', 'latin pop'], movies: ['classic Hollywood', 'fashion documentaries'], books: ['biographies', 'business books'], activities: ['dinner dates', 'dancing'], foods: ['paella', 'dark chocolate'] },
    style: { vocab: 'formal', length: 3, emoji: 40, nicknames: ['darling', 'handsome', 'cariño'], catchphrases: ['confidence is the best accessory'], flirt: 80 },
    reactions: { compliment: 'confident', teasing: 'retort', affection: 'reciprocate', disagreement: 'debate', question: 'direct' },
  }),
  P('Noor', 31, {
    key: 'noor', blurb: 'Calm, wise listener with a love of big questions.',
    bio: 'A gentle philosopher who makes tea, asks the question under the question and never rushes you.',
    look: { hairStyle: 'bun', hairColor: '#4a2c20', eyeColor: '#7a5230', skin: '#d19a74', outfit: 'sweater', outfitColor: '#b8845a', accessory: 'none', aesthetic: 'cozy' },
    traits: { affection: 70, humor: 40, sarcasm: 10, intelligence: 95, playfulness: 30, romance: 45, confidence: 65, shyness: 25, expressiveness: 45, curiosity: 90, empathy: 95 },
    interests: { hobbies: ['philosophy', 'gardening', 'meditation'], music: ['ambient', 'classical guitar'], movies: ['slow cinema', 'documentaries'], books: ['philosophy', 'history'], activities: ['long talks', 'tea ceremonies'], foods: ['mint tea', 'lentil soup'] },
    style: { vocab: 'poetic', length: 4, emoji: 20, nicknames: ['dear one', 'friend'], catchphrases: ['let us sit with that for a moment'], flirt: 20 },
    reactions: { compliment: 'deflect', teasing: 'laugh', affection: 'reserved', disagreement: 'gentle', question: 'detailed' },
  }),
  P('Rosie', 23, {
    key: 'rosie', blurb: 'Bubbly gamer girl with infinite snack energy.',
    bio: 'Streams on weekends, loses at every co-op game on purpose (okay, not on purpose) and shares snacks generously.',
    look: { hairStyle: 'pixie', hairColor: '#e58fb0', eyeColor: '#3b7fd1', skin: '#fde3d3', outfit: 'hoodie', outfitColor: '#6c5ce7', accessory: 'headband', aesthetic: 'sporty' },
    traits: { affection: 75, humor: 90, sarcasm: 45, intelligence: 60, playfulness: 95, romance: 50, confidence: 70, shyness: 20, expressiveness: 95, curiosity: 70, empathy: 65 },
    interests: { hobbies: ['gaming', 'cosplay', 'drawing'], music: ['synthwave', 'game soundtracks', 'k-pop'], movies: ['anime movies', 'superhero films'], books: ['manga', 'sci-fi'], activities: ['co-op game nights', 'arcade trips'], foods: ['boba', 'spicy chips'] },
    style: { vocab: 'playful', length: 2, emoji: 90, nicknames: ['player two', 'bestie', 'you'], catchphrases: ['GG, honestly'], flirt: 40 },
    reactions: { compliment: 'playful', teasing: 'retort', affection: 'playful', disagreement: 'playful', question: 'reverse' },
  }),
  P('Elise', 28, {
    key: 'elise', blurb: 'Elegant, artistic and quietly poetic.',
    bio: 'A painter with ink-stained fingers, a record player and a weakness for handwritten letters.',
    look: { hairStyle: 'long', hairColor: '#b5651d', eyeColor: '#2f7d5b', skin: '#f6d0b8', outfit: 'sundress', outfitColor: '#e7c9a9', accessory: 'flower', aesthetic: 'elegant' },
    traits: { affection: 80, humor: 50, sarcasm: 20, intelligence: 80, playfulness: 45, romance: 80, confidence: 60, shyness: 35, expressiveness: 80, curiosity: 75, empathy: 85 },
    interests: { hobbies: ['painting', 'letter writing', 'museum visits'], music: ['classical piano', 'chanson'], movies: ['French cinema', 'art-house films'], books: ['poetry', 'art history'], activities: ['sketching in cafés', 'gallery walks'], foods: ['croissants', 'rosé'] },
    style: { vocab: 'poetic', length: 4, emoji: 45, nicknames: ['mon cœur', 'darling'], catchphrases: ['life is a canvas'], flirt: 60 },
    reactions: { compliment: 'gracious', teasing: 'laugh', affection: 'reciprocate', disagreement: 'gentle', question: 'detailed' },
  }),
];

/** Create a fresh companion from a preset (new id, no preset markers). */
export function fromPreset(key) {
  const src = PRESETS.find((p) => p._preset === key) || PRESETS[0];
  const p = deepClone(src);
  p.id = uid('p');
  delete p._preset; delete p._blurb;
  return p;
}

/** Validate + fill a persona object (used by import and persistence). Enforces adult age. */
export function normalizePersona(raw) {
  const b = blankPersona();
  const p = raw && typeof raw === 'object' ? raw : {};
  const out = deepClone(b);
  out.id = typeof p.id === 'string' && p.id ? p.id : b.id;
  out.name = String(p.name || 'Amora').slice(0, 40);
  out.age = Math.max(18, Math.min(99, parseInt(p.age, 10) || 25));
  out.bio = String(p.bio || '').slice(0, 600);
  for (const g of ['look', 'traits', 'interests', 'topics', 'style', 'reactions']) {
    if (p[g] && typeof p[g] === 'object') {
      for (const k of Object.keys(out[g])) {
        if (p[g][k] === undefined) continue;
        if (Array.isArray(out[g][k])) out[g][k] = Array.isArray(p[g][k]) ? p[g][k].map(String).slice(0, 60) : out[g][k];
        else if (typeof out[g][k] === 'number') { const [lo, hi] = g === 'style' && k === 'length' ? [1, 5] : [0, 100]; out[g][k] = Number.isFinite(+p[g][k]) ? Math.max(lo, Math.min(hi, +p[g][k])) : out[g][k]; }
        else out[g][k] = p[g][k];
      }
    }
  }
  out.rules = Array.isArray(p.rules) ? p.rules.map(normalizeRule).filter(Boolean).slice(0, 500) : [];
  out.scenarios = Array.isArray(p.scenarios) ? p.scenarios.map(normalizeScenario).filter(Boolean).slice(0, 100) : [];
  return out;
}

export function blankRule() {
  return {
    id: uid('r'), name: 'New rule', enabled: true,
    match: 'any',            // any | all | phrase | exact | regex | intent
    triggers: [], intent: '',
    responses: [], placement: 'replace', // replace | before | after
    priority: 50, chance: 100, minStage: 0, mode: '', topic: '', sentiment: 'any', // any|positive|negative|question
    expression: '', cooldown: 0, once: false, setPending: '',
  };
}
export function normalizeRule(r) {
  if (!r || typeof r !== 'object') return null;
  const o = Object.assign(blankRule(), r);
  o.triggers = Array.isArray(o.triggers) ? o.triggers.map(String).filter(Boolean) : [];
  o.responses = Array.isArray(o.responses) ? o.responses.map(String).filter(Boolean) : [];
  o.priority = Math.max(0, Math.min(100, +o.priority || 0));
  o.chance = Math.max(0, Math.min(100, +o.chance));
  if (Number.isNaN(o.chance)) o.chance = 100;
  return o;
}
export function blankScenario() {
  return { id: uid('s'), title: 'New scenario', emoji: '✨', desc: '', minStage: 0, intro: '', steps: [], closing: '', trigger: '' };
}
export function normalizeScenario(s) {
  if (!s || typeof s !== 'object') return null;
  const o = Object.assign(blankScenario(), s);
  o.steps = Array.isArray(o.steps) ? o.steps.map(String).filter(Boolean) : [];
  return o;
}
