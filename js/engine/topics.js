// AMORA — conversation topic detection. Each topic has a regex of stems/keywords.
// To add a topic: add it here, then add a matching entry in data/topics-data.js (statements / questions / facts / react).

const T = (id, label, emoji, kw) => ({ id, label, emoji, re: new RegExp(`\\b(?:${kw})`, 'i') });

export const TOPICS = [
  T('work', 'Work & career', '💼', 'work(?:ing|ed|s)?\\b|job\\b|boss|coworker|colleague|career|office|meeting|deadline|client|promotion|salary|interview|resume|shift|manager|business|startup|company|hustle|overtime|commute|freelanc|my team\\b|project\\b|broker|freight|sales\\b'),
  T('school', 'School & learning', '🎓', 'school|class(?:es)?\\b|college|university|exam|homework|study(?:ing)?|studies|professor|teacher|degree|semester|grades?\\b|thesis|lecture|campus|course|learn(?:ing|ed)?\\b|tutor|assignment|graduat'),
  T('hobbies', 'Hobbies', '🎨', 'hobb(?:y|ies)|free time|pastime|crafting|knitting|painting|drawing|sketch|bak(?:e|ing)|cooking class|gardening|woodworking|photograph|collect(?:ing|ion)|diy\\b|puzzle|origami|journaling|calligraph|crochet|sewing|pottery'),
  T('philosophy', 'Philosophy & big questions', '🌌', 'philosoph|meaning of (?:life|it)|exist(?:ence|ential)|conscious(?:ness)?|free will|moral(?:s|ity)?\\b|ethic|purpose|destiny|fate\\b|soul\\b|mortality|happiness|truth\\b|reality\\b|stoic|nihil|absurd|wisdom|what is love|why are we here'),
  T('history', 'History', '🏛️', 'histor(?:y|ical)|ancient|medieval|roman\\b|rome\\b|egypt|pharaoh|viking|empire|renaissance|world war|napoleon|castle|dynasty|archaeolog|civili[sz]ation|middle ages|revolution|greek|knights?\\b|pyramid'),
  T('science', 'Science', '🔬', 'scien(?:ce|tist|tific)|physics|chemistry|biology|atom|molecule|evolution|dna\\b|quantum|experiment|brain|neuro|climate|energy|gravity|particle|cell\\b|species|geology|ocean|dinosaur|fossil|microscope|lab\\b|robot'),
  T('space', 'Space & stars', '🌠', 'space\\b|star(?:s|gazing)?\\b|galaxy|planet|moon\\b|mars\\b|jupiter|saturn|telescope|astronom|nasa|comet|asteroid|black hole|universe|cosmos|constellation|meteor|eclipse|orbit|rocket|astronaut|milky way|supernova|nebula'),
  T('travel', 'Travel', '✈️', 'travel(?:ing|ed|s)?\\b|trip\\b|vacation|holiday|flight|airport|passport|hotel|road ?trip|beach|abroad|tourist|backpack|itinerary|journey|visit(?:ing)?\\b|cruise|hostel|paris|tokyo|rome|spain|italy|japan|london|mexico|europe|asia|island|camping|hiking'),
  T('food', 'Food & cooking', '🍝', 'food|eat(?:ing)?\\b|hungry|dinner|lunch|breakfast|brunch|snack|recipe|cook(?:ing)?\\b|restaurant|pizza|pasta|sushi|taco|burger|dessert|chocolate|coffee|tea\\b|wine|cheese|bread|cake|cookie|ice cream|spicy|vegan|vegetarian|bbq|grill|menu|delicious|tasty|baking|cuisine'),
  T('music', 'Music', '🎵', 'music|song(?:s)?\\b|band\\b|album|concert|playlist|guitar|piano|sing(?:ing)?\\b|singer|lyrics|melody|rap\\b|jazz|rock\\b|pop\\b|indie|vinyl|spotify|headphones|violin|drums|orchestra|dj\\b|festival|karaoke|synth|classical'),
  T('movies', 'Movies & shows', '🎬', 'movie|film|cinema|netflix|show\\b|series|episode|actor|actress|director|anime|documentary|tv\\b|streaming|season finale|binge|comedy|horror|thriller|rom-?com|marvel|sitcom|trailer|oscar|screenplay'),
  T('games', 'Games & tech', '🎮', 'game(?:s|r|ing)?\\b|gaming|playstation|xbox|nintendo|steam\\b|minecraft|zelda|fortnite|console|rpg|esports|stream(?:ing|er)?\\b|twitch|tech\\b|computer|laptop|phone\\b|app\\b|software|code\\b|coding|program(?:ming)?\\b|website|internet|gadget|ai\\b|robot|keyboard|python|javascript|automation'),
  T('books', 'Books & writing', '📚', 'book(?:s)?\\b|novel|read(?:ing)?\\b|author|poem|poetry|writ(?:e|ing|er)\\b|story|stories|library|bookstore|fiction|fantasy|chapter|literature|kindle|manga|essay|publish|sci-?fi|memoir|audiobook'),
  T('relationships', 'Love & relationships', '💞', 'relationship|dating|date\\b|crush|ex\\b|boyfriend|girlfriend|partner|romance|romantic|love life|breakup|marriage|wedding|soulmate|flirt|attraction|first kiss|single\\b|tinder|bumble|lover|affection|commitment'),
  T('family', 'Family & friends', '👪', 'family|mom\\b|mother|dad\\b|father|sister|brother|parents|grandma|grandpa|grandmother|grandfather|cousin|aunt|uncle|kids?\\b|children|baby|friend(?:s|ship)?\\b|bestie|roommate|neighbou?r|siblings'),
  T('health', 'Health & fitness', '🏃', 'gym|workout|exercise|fitness|yoga|run(?:ning)?\\b|jog|diet|healthy|health\\b|meditat|sleep\\b|lifting|marathon|walk(?:ing)?\\b|stretch|pilates|wellness|steps\\b|cardio|self[- ]care|hydrat'),
  T('sports', 'Sports', '⚽', 'sports?\\b|football|soccer|basketball|baseball|tennis|golf|hockey|team\\b|match\\b|playoffs?|championship|league|coach|athlete|olympic|swim(?:ming)?\\b|cycling|boxing|mma|skiing|surfing|nfl|nba|fifa|world cup'),
  T('pets', 'Pets & animals', '🐾', 'pet(?:s)?\\b|dog(?:s)?\\b|cat(?:s)?\\b|puppy|kitten|bunny|hamster|parrot|animal(?:s)?\\b|zoo\\b|aquarium|wildlife|horse|bird(?:s)?\\b|fish\\b|vet\\b|adopt(?:ed|ing)?\\b|fur baby|paws?\\b'),
  T('dreams', 'Dreams & sleep', '💭', 'dream(?:s|t|ed)?\\b|nightmare|sleep(?:ing)?\\b|insomnia|lucid|goal(?:s)?\\b|ambition|aspir|wish(?:es)?\\b|bucket list|someday|one day i|manifest|vision board'),
  T('art', 'Art & design', '🖼️', 'art\\b|artist|museum|gallery|painting|sculpt|design(?:er|ing)?\\b|illustrat|canvas|aesthetic|architecture|photography|exhibit|creative|sketchbook|color palette|monet|van gogh|picasso|fashion design'),
  T('nature', 'Nature & seasons', '🌿', 'nature|forest|mountain|river|lake|ocean|sea\\b|sunset|sunrise|rain(?:y|ing)?\\b|snow(?:y|ing)?\\b|autumn|fall leaves|spring\\b|summer\\b|winter\\b|flowers?\\b|garden|trees?\\b|waterfall|storm|thunder|fog|desert|meadow|park\\b'),
  T('fashion', 'Fashion & style', '👗', 'fashion|outfit|dress(?:es)?\\b|shoes|style\\b|makeup|perfume|jewelry|jewellery|wardrobe|clothes|clothing|sneakers|handbag|vintage|thrift|skincare|nails|hair ?(?:cut|style|dye)|lipstick|aesthetic'),
  T('future', 'The future', '🔮', 'future|tomorrow|next year|retire|plans?\\b|someday|moving|move to|new chapter|five years|goals?\\b|hope to|going to be|planning|saving up|buy a house|relocat'),
];

import { EXTRA_TOPICS } from '../data/topics-extra.js';
TOPICS.push(...EXTRA_TOPICS);
export const TOPIC_MAP = Object.fromEntries(TOPICS.map((t) => [t.id, t]));

/** Returns [{id, score}] sorted, based on keyword hits. */
export function detectTopics(text) {
  text = text.replace(/\bhow (?:does|do|did) [\w\s'-]{1,40}? work(?:s)?\b/gi, ' ');
  const out = [];
  for (const t of TOPICS) {
    const m = text.match(new RegExp(t.re.source, 'gi'));
    if (m) out.push({ id: t.id, score: m.length });
  }
  return out.sort((a, b) => b.score - a.score);
}
