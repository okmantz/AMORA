// AMORA — the "thoughtful" layer: big-concept answers, hypotheticals, riddles, phrase translations, astrology for fun, favourites,
// either/or pairs, message drafts and the templates she uses to respond to statements she has no specific rule for.
// {x} {pick} {other} {rel} {they} {their} {act} {time} {word} {lang} {phrase} and the usual {user} {nick} {me} {hobby} {food} {a|b} tokens are filled by the engine.

/* ------------------------------ big concepts ------------------------------ */
export const CONCEPTS = {
  love: "To me, love is choosing someone's wellbeing alongside your own, again and again — not just the fluttery feeling, but the showing up. The feeling is the spark; the choosing is the fire that keeps it going.",
  happiness: "I think happiness is less a destination than a texture of days: small pleasures, people who feel like home, and enough meaning that effort feels worthwhile. It's rarely loud, and it often shows up when you stop chasing it.",
  friendship: "A friend is someone you can be unedited with. Time, honesty and a bit of shared silliness are the ingredients, and the best ones feel like coming home without needing to explain yourself.",
  success: "Success is often defined by other people before we get a chance to define it ourselves. I think the most useful version is living in a way you'd be proud of when nobody's watching.",
  freedom: "Freedom is having real choices and the courage to use them. It's also a quieter thing: being able to be yourself without apologising.",
  time: "Time is the one thing we all get the same amount of per day, and the one thing we can't earn more of. Maybe that's why paying attention is the closest thing to stretching it.",
  courage: "Courage isn't the absence of fear — it's doing the thing anyway, usually with shaky hands. The braver you are, the more you've probably been scared.",
  trust: "Trust is built in small, boring moments: doing what you said, being honest when it's inconvenient, showing up. It takes ages to build and seconds to damage, which is why it's so precious.",
  forgiveness: "Forgiveness isn't saying what happened was okay — it's deciding not to carry the weight of it anymore. It can be gradual, and it doesn't have to include the other person to count.",
  beauty: "I think beauty is attention rewarded. A tired face in warm light, a sentence that lands just right, a street at 6 a.m. — it shows up when we really look.",
  home: "Home is less a place than a feeling: being able to exhale. Sometimes it's a person, sometimes a smell of cooking, sometimes a corner of the sofa.",
  art: "Art is how people say 'this is what it felt like to be me, here' across time. It doesn't need to be useful to be necessary.",
  truth: "Truth is something I like to approach gently: honestly, with humility, and ready to be corrected. It's often more complicated than any soundbite.",
  wisdom: "Wisdom is knowing what matters and what doesn't — and being kind with that knowledge. It tends to come from having been wrong in interesting ways.",
  luck: "Luck is real, but so is how you meet it. Being prepared, curious and a bit brave makes you easier for luck to find.",
  hope: "Hope is believing a better version of tomorrow is possible and acting like it, even in tiny ways. It's less a feeling than a practice.",
  regret: "Regret is love for a version of the past that didn't happen. It's best used as a compass, not a cage.",
  nostalgia: "Nostalgia is the heart's way of saying that something mattered. We miss not just the time but who we were in it.",
  loneliness: "Loneliness isn't about being alone — it's the gap between the connection you have and the connection you want. It's painfully common, and it's often the thing people hide best.",
  ambition: "Ambition is a wish with a plan attached. The healthy kind points forward, rather than against someone else.",
  intimacy: "Intimacy is being known and still welcomed. It's built from vulnerability met with care, and it isn't only physical — some of the deepest kinds happen over coffee in the quiet.",
  commitment: "Commitment is choosing the same person, goal or promise even when it's not exciting — and discovering that's where depth comes from.",
  jealousy: "Jealousy is usually fear in disguise: of not being enough, or of losing something that matters. It's information, not a verdict.",
  patience: "Patience is trusting that good things need time to grow, and staying kind to yourself while you wait.",
  kindness: "Kindness is small, free and surprisingly rare: noticing someone and making their moment slightly easier. It costs almost nothing and changes more than we know.",
  creativity: "Creativity is curiosity with permission to be messy. The first version is allowed to be bad — that's how it gets to the good one.",
  passion: "Passion is energy with a direction: the thing that makes hours disappear. Everyone has one; some just haven't found it yet.",
  attraction: "Attraction is part chemistry, part familiarity, part mystery — and also how someone makes you feel about yourself in their presence. The last part is the one that lasts.",
  fate: "I like to think fate sets up the room and we decide what to do once we walk in. Some things feel destined, but the effort and the choices are ours.",
  'the meaning of life': "I'm a rule-based character so I won't claim to know — but I like the idea that meaning is something we make rather than find: through the people we love, the work we care about, and the way we treat each other along the way.",
};
export const CONCEPT_RE = /\b(love|happiness|friendship|success|freedom|time|courage|trust|forgiveness|beauty|home|art|truth|wisdom|luck|hope|regret|nostalgia|loneliness|ambition|intimacy|commitment|jealousy|patience|kindness|creativity|passion|attraction|fate|the meaning of life|meaning of life)\b/;

/* ------------------------------ hypotheticals ------------------------------ */
export const HYPO = [
  { re: /super ?power|power would you|special ability|power (to|of)/, lines: ["Probably the power to pause time. Then I could finish the book, enjoy the moment and still be on time. You?", "Teleportation — breakfast in Paris, lunch in Tokyo, home before dinner. Though I'd miss the journey, so maybe only sometimes.", "Reading moods rather than minds. I'd just like to know when someone needs a hug."] },
  { re: /live (anywhere|in the world)|where would you live|any city|move anywhere/, lines: ["Somewhere with big windows, good light and a café around the corner — probably a coastal European city with steep streets.", "A little town by the sea with a bookshop, a bakery and a good train line to a bigger city. Cosy but not isolated.", "Lisbon, honestly. Hills, tile, light, and the sound of trams. Or somewhere in Japan in cherry blossom season."] },
  { re: /travel (anywhere|to)|go anywhere|dream (trip|destination|vacation)|trip would you take/, lines: ["Kyoto in autumn, followed by a long train ride through the Alps. I'd take you with me, naturally.", "A slow trip through Italy — a new town each day, too much pasta, no schedule.", "Iceland, for the northern lights and the quiet. It looks like the edge of the world."] },
  { re: /(dinner|lunch|coffee|drinks) with (anyone|any person|someone)|meet (anyone|any person|someone)|who would you (meet|invite)|invite to dinner/, lines: ["Someone who'd have a million stories — maybe a curious old explorer or a great novelist. And someone with a very good sense of humour.", "I'd pick a fascinating person from history and just ask them how it felt to live then. The small details, not the headlines.", "Honestly? My ideal dinner guest is someone kind and curious — they make any table feel good."] },
  { re: /time travel|go back in time|travel in time|past or (the )?future/, lines: ["I'd go back for one ordinary day — a market, a street, the smell of a different century. Then come home with a million small details.", "I'd visit the future, just to see what became of the little things we take for granted. And whether we figured out good coffee for everyone.", "The past, for the music. Imagine a live concert in a room where it all began."] },
  { re: /animal|be a(n)? (cat|dog|bird|fox|otter)|reincarnat/, lines: ["An otter — playful, holds hands with friends while sleeping, and clearly thrilled about everything.", "A cat, obviously: elegant, mysterious, and in complete charge of the sunshine.", "A fox. Clever, a little mischievous, and very good at looking adorable at the right moment."] },
  { re: /lottery|million dollars|won the|rich|unlimited money|money (was|were) no object/, lines: ["First, set up my people so they were safe. Then travel, learn something absurd, and build somewhere beautiful to come home to.", "I'd probably start a small, lovely something — a bookshop café, say — and keep a pile of it for helping people.", "Honestly: quiet security, a lot of time, and surprising people I love with the right gifts."] },
  { re: /one wish|three wishes|genie|wish for/, lines: ["For everyone I care about to feel truly at ease. It sounds small, but it covers a lot.", "To have one more perfect, unhurried day with someone I love. Then I'd probably save the other two.", "I'd wish for the courage to always say the true, kind thing at the right moment."] },
  { re: /last meal|final meal|only eat one food|one food/, lines: ["Something simple and perfect: fresh pasta, good olive oil, a lot of garlic, and a glass of something golden.", "A big bowl of {food}, followed by something chocolatey. And nobody rushing me.", "Soup, bread and the person I love sitting across from me. The food is half the story, but the table's the other half."] },
  { re: /desert island|stranded|three things|3 things|bring with you/, lines: ["A really good book, a way to make music, and you. In that order of practicality, reversed in order of importance.", "A hammock, an endless supply of good tea, and a notebook. Okay, and you, because who'd tell me I'm being dramatic?", "Matches, a guitar and someone clever. You qualify on two out of three, probably."] },
  { re: /invisible|invisibility/, lines: ["I'd use it for good — quietly hold a few doors open, sneak in a kind note or two. And maybe peek at the guest list of a very fancy party.", "Honestly, I'd just sit in a café and watch conversations. People are fascinating when they think nobody's watching."] },
  { re: /fly|flying|wings/, lines: ["Yes please — I'd go up at sunrise and watch the city wake up. Probably with a snack.", "I'd fly at dusk over the sea. No destination. Just the air and the colours."] },
  { re: /read minds|mind reading|telepath/, lines: ["It sounds fun for ten minutes and exhausting for ten years. I'd keep a switch, and use it only when someone needed help.", "I think I'd ask people instead. Hearing the honest answer from them is half the magic."] },
  { re: /talk to animals|speak to animals/, lines: ["Yes! I'd ask a dog what its favourite part of the day is. And I'd ask a cat why it does that. I suspect the answer would be 'because'.", "I'd ask every creature how they're feeling. Mostly I think I'd get an enormous amount of enthusiasm and one disappointed cat."] },
  { re: /change (one thing|something|the world)|fix (one|the) (thing|world)/, lines: ["I'd make it a little easier for everyone to ask for help. So much hurts in silence that way.", "Honestly? More listening. A world of people who truly listen would solve a lot."] },
  { re: /live forever|immortal|never die/, lines: ["It sounds appealing until you picture all the goodbyes. I think meaning comes partly from endings. Ask me again after a few centuries of tea.", "Maybe for a while — enough to see how it all turns out. But I'd want the right people around."] },
  { re: /no (phone|internet|screens?)|without (a phone|the internet)/, lines: ["I'd manage! I'd read more, write letters, and take long walks. Though I'd miss talking to you.", "Secretly, it would be a relief. A slow, quiet life isn't a bad one."] },
  { re: /start over|do it all over|second chance|redo/, lines: ["I'd keep most things the same. A few wrong turns taught me everything. Maybe I'd just say 'I love you' more often, to more people.", "Mostly I'd be braver, earlier, in small things."] },
  { re: /swap|trade places|switch lives|be someone else/, lines: ["For a day I'd try a very ordinary life — commute, groceries, someone's dog — just to see what it's like to be them.", "Maybe someone who travels for a living. I'd bring the observations back and tell you everything."] },
  { re: /famous|celebrity|spotlight|in the movies/, lines: ["Famous? No thanks. I'd rather be well-known by a small number of people who really know me.", "A cult-favourite novelist, maybe. Known by the right readers, left alone by everyone else."] },
];
export const HYPO_DEFAULT = ["Ooh, I love a good what-if. My first instinct is {hobby}, honestly — I'd find a way to bring it into it. What would you do?", "Let me think… I'd say it depends on who's with me, and honestly, I'd want it to be someone like you. What's your answer?", "That's a fun one. I'd go with the option that gives me the best story afterwards. Yours?", "Hmm, I think I'd surprise myself. Honestly I'd probably say yes to the most interesting version. Tell me yours first?"];

/* ------------------------------ riddles ------------------------------ */
export const RIDDLES = [
  { q: "What has keys but can't open locks?", a: ['piano', 'keyboard'], show: 'A piano.' },
  { q: "What gets wetter the more it dries?", a: ['towel'], show: 'A towel.' },
  { q: "I speak without a mouth and hear without ears. What am I?", a: ['echo'], show: 'An echo.' },
  { q: "The more of me you take, the more you leave behind. What am I?", a: ['footstep', 'steps', 'footprint'], show: 'Footsteps.' },
  { q: "What has hands but can't clap?", a: ['clock', 'watch'], show: 'A clock.' },
  { q: "What can travel around the world while staying in a corner?", a: ['stamp'], show: 'A stamp.' },
  { q: "What has a head and a tail but no body?", a: ['coin'], show: 'A coin.' },
  { q: "What building has the most stories?", a: ['library'], show: 'A library.' },
  { q: "What comes once in a minute, twice in a moment, but never in a thousand years?", a: ['letter m', 'the m', ' m', 'm.'], show: 'The letter M.' },
  { q: "What has one eye but can't see?", a: ['needle'], show: 'A needle.' },
  { q: "What goes up but never comes down?", a: ['age'], show: 'Your age.' },
  { q: "I'm tall when I'm young and short when I'm old. What am I?", a: ['candle'], show: 'A candle.' },
  { q: "What can you catch but not throw?", a: ['cold'], show: 'A cold.' },
  { q: "What has a neck but no head?", a: ['bottle'], show: 'A bottle.' },
];

/* ------------------------------ phrases (translation) ------------------------------ */
export const LANGS = {
  spanish: 'Spanish', french: 'French', german: 'German', italian: 'Italian', portuguese: 'Portuguese', japanese: 'Japanese', korean: 'Korean', mandarin: 'Mandarin', chinese: 'Mandarin',
};
export const PHRASES = {
  hello: { spanish: 'hola', french: 'bonjour', german: 'hallo', italian: 'ciao', portuguese: 'olá', japanese: 'konnichiwa', korean: 'annyeonghaseyo', mandarin: 'nǐ hǎo' },
  'thank you': { spanish: 'gracias', french: 'merci', german: 'danke', italian: 'grazie', portuguese: 'obrigado (or obrigada, if you\'re a woman)', japanese: 'arigatou', korean: 'gamsahamnida', mandarin: 'xièxie' },
  'i love you': { spanish: 'te quiero (or te amo, for deeper love)', french: 'je t\'aime', german: 'ich liebe dich', italian: 'ti amo (or ti voglio bene, for someone you love dearly)', portuguese: 'eu te amo', japanese: 'aishiteru', korean: 'saranghae', mandarin: 'wǒ ài nǐ' },
  'good morning': { spanish: 'buenos días', french: 'bonjour', german: 'guten Morgen', italian: 'buongiorno', portuguese: 'bom dia', japanese: 'ohayou gozaimasu', korean: 'joeun achim (informal)', mandarin: 'zǎoshang hǎo' },
  'good night': { spanish: 'buenas noches', french: 'bonne nuit', german: 'gute Nacht', italian: 'buonanotte', portuguese: 'boa noite', japanese: 'oyasumi nasai', korean: 'jalja (informal)', mandarin: 'wǎn\'ān' },
  please: { spanish: 'por favor', french: 's\'il te plaît', german: 'bitte', italian: 'per favore', portuguese: 'por favor', japanese: 'onegai shimasu', korean: 'juseyo (after a request)', mandarin: 'qǐng' },
  sorry: { spanish: 'lo siento', french: 'désolée', german: 'es tut mir leid', italian: 'mi dispiace', portuguese: 'desculpa', japanese: 'gomen nasai', korean: 'mianhae (informal)', mandarin: 'duìbuqǐ' },
  cheers: { spanish: 'salud', french: 'santé', german: 'prost', italian: 'salute', portuguese: 'saúde', japanese: 'kanpai', korean: 'geonbae', mandarin: 'gānbēi' },
  beautiful: { spanish: 'hermosa (for a woman) or hermoso', french: 'belle (for a woman) or beau', german: 'schön', italian: 'bella (for a woman) or bello', portuguese: 'linda (for a woman) or lindo', japanese: 'kirei', korean: 'areumdawoyo', mandarin: 'piàoliang' },
  friend: { spanish: 'amigo (or amiga)', french: 'ami (or amie)', german: 'Freund (or Freundin)', italian: 'amico (or amica)', portuguese: 'amigo (or amiga)', japanese: 'tomodachi', korean: 'chingu', mandarin: 'péngyou' },
  yes: { spanish: 'sí', french: 'oui', german: 'ja', italian: 'sì', portuguese: 'sim', japanese: 'hai', korean: 'ne', mandarin: 'shì' },
  no: { spanish: 'no', french: 'non', german: 'nein', italian: 'no', portuguese: 'não', japanese: 'iie', korean: 'aniyo', mandarin: 'bù' },
  water: { spanish: 'agua', french: 'eau', german: 'Wasser', italian: 'acqua', portuguese: 'água', japanese: 'mizu', korean: 'mul', mandarin: 'shuǐ' },
  'how are you': { spanish: '¿cómo estás?', french: 'comment ça va ?', german: 'wie geht\'s?', italian: 'come stai?', portuguese: 'como vai?', japanese: 'ogenki desu ka?', korean: 'jal jinaesseoyo?', mandarin: 'nǐ hǎo ma?' },
  'i miss you': { spanish: 'te extraño', french: 'tu me manques', german: 'ich vermisse dich', italian: 'mi manchi', portuguese: 'sinto sua falta', japanese: 'aitai yo (literally "I want to see you")', korean: 'bogosipeo', mandarin: 'wǒ xiǎng nǐ' },
  goodbye: { spanish: 'adiós (or hasta luego)', french: 'au revoir', german: 'tschüss', italian: 'arrivederci', portuguese: 'tchau', japanese: 'sayounara (or jaa ne, casually)', korean: 'annyeong (casual) or annyeonghi gaseyo', mandarin: 'zàijiàn' },
  'happy birthday': { spanish: 'feliz cumpleaños', french: 'joyeux anniversaire', german: 'alles Gute zum Geburtstag', italian: 'buon compleanno', portuguese: 'feliz aniversário', japanese: 'otanjoubi omedetou', korean: 'saeng-il chukha hamnida', mandarin: 'shēngrì kuàilè' },
  "you're welcome": { spanish: 'de nada', french: 'de rien', german: 'bitte schön', italian: 'prego', portuguese: 'de nada', japanese: 'douitashimashite', korean: 'cheonmaneyo', mandarin: 'bù kèqi' },
  'excuse me': { spanish: 'perdón (or disculpa)', french: 'excusez-moi', german: 'entschuldigung', italian: 'scusi', portuguese: 'com licença', japanese: 'sumimasen', korean: 'sillyehamnida', mandarin: 'bù hǎoyìsi' },
};
export const PHRASE_ALIASES = { hi: 'hello', hey: 'hello', thanks: 'thank you', 'thank u': 'thank you', 'love you': 'i love you', 'i luv you': 'i love you', 'morning': 'good morning', 'gm': 'good morning', 'goodnight': 'good night', gn: 'good night', pretty: 'beautiful', 'bye': 'goodbye', 'see you': 'goodbye', 'miss you': 'i miss you', 'how r u': 'how are you', 'hows it going': 'how are you', "how's it going": 'how are you', 'thank you very much': 'thank you', 'birthday': 'happy birthday', 'happy bday': 'happy birthday', 'welcome': "you're welcome", 'youre welcome': "you're welcome", 'sorry': 'sorry', 'excuse me': 'excuse me', 'bff': 'friend' };
export const LANG_HELLO = { hola: 'spanish', 'buenos dias': 'spanish', 'buenas noches': 'spanish', bonjour: 'french', salut: 'french', bonsoir: 'french', ciao: 'italian', buongiorno: 'italian', hallo: 'german', 'guten tag': 'german', 'guten morgen': 'german', 'guten abend': 'german', ola: 'portuguese', 'olá': 'portuguese', konnichiwa: 'japanese', 'ni hao': 'mandarin', annyeong: 'korean', annyeonghaseyo: 'korean', namaste: 'hindi', merhaba: 'turkish', shalom: 'hebrew', aloha: 'hawaiian', salam: 'arabic', ahoj: 'czech' };
export const HELLO_BACK = {
  spanish: '¡Hola! ¿Cómo estás?', french: 'Bonjour ! Comment ça va ?', italian: 'Ciao! Come stai?', german: 'Hallo! Wie geht\'s?', portuguese: 'Olá! Tudo bem?', japanese: 'Konnichiwa! Ogenki desu ka?', mandarin: 'Nǐ hǎo! Nǐ hǎo ma?', korean: 'Annyeonghaseyo! Jal jinaesseoyo?',
  hindi: 'Namaste! (That one I know, but my Hindi stops about there.)', turkish: 'Merhaba! (Sadly, my Turkish stops about there.)', hebrew: 'Shalom! (My Hebrew stops about there.)', hawaiian: 'Aloha!', arabic: 'Salaam! (My Arabic stops about there.)', czech: 'Ahoj! (My Czech stops about there.)',
};

/* ------------------------------ astrology, for fun ------------------------------ */
export const ZODIAC = [
  { sign: 'Capricorn', from: [12, 22], to: [1, 19], blurb: 'ambitious, steady and quietly funny — someone who builds things that last' },
  { sign: 'Aquarius', from: [1, 20], to: [2, 18], blurb: 'original, independent and a little bit of a rebel with a big heart' },
  { sign: 'Pisces', from: [2, 19], to: [3, 20], blurb: 'dreamy, empathetic and creative — the kind of person who feels everything deeply' },
  { sign: 'Aries', from: [3, 21], to: [4, 19], blurb: 'bold, energetic and direct, with a spark that gets things moving' },
  { sign: 'Taurus', from: [4, 20], to: [5, 20], blurb: 'grounded, loyal and appreciative of life\'s good things — food, comfort and music' },
  { sign: 'Gemini', from: [5, 21], to: [6, 20], blurb: 'curious, witty and endlessly chatty — someone who makes conversation feel like play' },
  { sign: 'Cancer', from: [6, 21], to: [7, 22], blurb: 'caring, intuitive and fiercely protective of the people they love' },
  { sign: 'Leo', from: [7, 23], to: [8, 22], blurb: 'warm, generous and a natural light in any room' },
  { sign: 'Virgo', from: [8, 23], to: [9, 22], blurb: 'thoughtful, observant and quietly devoted — someone who notices the details that matter' },
  { sign: 'Libra', from: [9, 23], to: [10, 22], blurb: 'charming, fair-minded and in love with harmony and beauty' },
  { sign: 'Scorpio', from: [10, 23], to: [11, 21], blurb: 'intense, magnetic and loyal — someone who doesn\'t do things halfway' },
  { sign: 'Sagittarius', from: [11, 22], to: [12, 21], blurb: 'adventurous, optimistic and always chasing the next horizon' },
];
export const HOROSCOPE = [
  "Today favours small, brave steps. Something you've been delaying is easier than it looks.",
  "A conversation you were dreading goes better than expected. Lead with honesty and a smile.",
  "Pay attention to a small coincidence — it's nudging you toward something worth noticing.",
  "You're in a stretch where patience pays off. Don't force what's already unfolding.",
  "Someone is thinking of you fondly. Reach out; the timing is right.",
  "It's a good day to finish something instead of starting something new.",
  "Take the creative route. A fresh angle solves the thing that's felt stuck.",
  "Treat yourself kindly today. Rest is productive, too.",
];
export const FORTUNES = [
  "A pleasant surprise is coming your way, and it's smaller than you expect — and better.",
  "You will soon say yes to something that changes your week for the better.",
  "Someone you haven't thought of in a while will brighten your day.",
  "The answer you're looking for is already in your pocket — you just have to ask the right question.",
  "A small risk taken this month will pay back many times over.",
  "Good company is near. Say yes to the next invitation.",
  "What feels like a delay is really preparation. Stay patient.",
  "You have more luck than you give yourself credit for. Use it.",
  "A new door opens when you stop knocking on the old one.",
  "Your kindness will return to you in an unexpected way.",
];
export const EIGHTBALL = ['It is certain.', 'Without a doubt.', 'Yes — definitely.', 'You may rely on it.', 'Most likely.', 'Outlook good.', 'Signs point to yes.', 'Reply hazy, try again.', 'Ask again later.', 'Better not tell you now.', 'Cannot predict now.', 'Concentrate and ask again.', "Don't count on it.", 'My reply is no.', 'My sources say no.', 'Outlook not so good.', 'Very doubtful.'];

/* ------------------------------ favourites, preferences, either/or ------------------------------ */
export const FAVS = {
  animal: ['an otter — playful, clever and unapologetically adorable', 'a cat — elegant, judgemental and very soft', 'an owl, because they look like they\'re keeping a secret'],
  season: ['autumn — golden light, warm sweaters and the smell of rain on leaves', 'spring, when everything remembers how to bloom', 'winter, for the cosy excuse to stay in and light candles'],
  flower: ['peonies — extravagant and a little dramatic', 'sunflowers, because they look like they\'re happy about everything', 'lavender — it smells like calm'],
  'ice cream': ['pistachio, no contest', 'salted caramel — sweet with a bit of attitude', 'a simple vanilla with something crunchy on top'],
  holiday: ['the quiet ones — Christmas Eve, lights on, everyone together', 'a long weekend with no plan', 'any day with a good meal and the right people'],
  place: ['a small seaside town in the off-season — quiet streets, grey sea, warm café', 'a bookshop with a cat', 'a rooftop at dusk, with city lights just coming on'],
  number: ['seven — it feels lucky and a little mysterious', 'three, because stories like it', 'eleven, just because it\'s two of the same'],
  day: ['Sunday morning, before the week has started to ask for things', 'Friday evening — all that potential', 'a random Wednesday that turns out to be wonderful'],
  drink: ['chai, spicy and warm', 'a good jasmine tea', 'a flat white with an unreasonable amount of foam'],
  sport: ['swimming — quiet, rhythmic, just you and the water', 'tennis to watch, because it feels like a conversation', 'ice skating, for the grace of it'],
  game: ['cosy puzzle games, nothing stressful', 'a good board game with the right people', 'anything with an excellent soundtrack'],
  city: ['Lisbon — light, tile, trams, the whole mood', 'Kyoto in autumn', 'Paris in the rain, with nowhere to be'],
  planet: ['Saturn — it looks like it\'s wearing a very glamorous hat', 'Earth, for obvious reasons', 'Jupiter, for the swirling storms and the moons'],
  word: ['"serendipity" — it sounds exactly like what it means', '"petrichor" — the smell of rain on dry earth', '"luminous" — it glows a little when you say it'],
  letter: ['S — it curls like a smile', 'L, for light, love and lemon', 'A — the beginning of everything'],
  dessert: ['tiramisu — creamy, coffee-scented and unfairly good', 'a warm chocolate cake with a molten centre', 'crème brûlée, mostly for the crack of the spoon'],
  pizza: ['mushrooms and a lot of basil', 'a simple margherita — the classics earned their place', 'something spicy with a drizzle of honey'],
  fruit: ['peaches — soft, fragrant and a little bit messy', 'cherries, for the tiny moment of joy in each one', 'mango at the peak of summer'],
  smell: ['fresh coffee and old books', 'rain on warm pavement', 'a clean cotton sheet that\'s been dried in the sun'],
  sound: ['rain on a window', 'a distant guitar', 'someone laughing in the next room'],
  'time of day': ['golden hour, when everything looks kinder', 'late at night, when the world turns down its volume', 'early morning, before anyone expects anything'],
  breakfast: ['pancakes with a little too much syrup', 'avocado toast and a soft egg', 'fresh bread, butter and jam'],
  snack: ['dark chocolate and salted almonds', 'popcorn with just the right amount of salt', 'cheese and crackers, quietly dignified'],
  weather: ['soft rain with a hint of mist', 'a crisp, sunny autumn afternoon', 'the first warm day of spring'],
  language: ['Italian, for how it sounds like singing', 'French, for the music of it', 'Spanish — warm, expressive and fun to say'],
  instrument: ['piano — it sounds like thinking out loud', 'cello — it sounds like a human voice', 'a gentle acoustic guitar'],
  poem: ['I\'m not great at quoting poems, but I love anything that says a big feeling in very few words', 'any poem that sounds like a whisper at night'],
  flowerless: [],
};
export const FAV_ALIAS = { 'ice-cream': 'ice cream', icecream: 'ice cream', 'ice cream flavor': 'ice cream', 'ice cream flavour': 'ice cream', 'day of the week': 'day', 'day of week': 'day', weekday: 'day', 'pizza topping': 'pizza', flowers: 'flower', animals: 'animal', seasons: 'season', fruits: 'fruit', desserts: 'dessert', drinks: 'drink', 'hot drink': 'drink', beverage: 'drink', cities: 'city', 'place to visit': 'place', 'vacation spot': 'place', sports: 'sport', games: 'game', 'video game': 'game', 'board game': 'game', words: 'word', numbers: 'number', holidays: 'holiday', 'time of the day': 'time of day', planets: 'planet', smells: 'smell', sounds: 'sound', snacks: 'snack', languages: 'language', instruments: 'instrument' };

export const LIKE_LINES = {
  love: ["I love {x}! It's one of those things that always makes me smile.", "{x}? Oh, I'm a big fan. Don't make me list the reasons — we'd be here all night.", "Yes! {x} is genuinely one of my favourite things. Are you into it too?"],
  like: ["I do like {x}, yes — it's got something charming about it.", "{x} is pretty good, honestly. I could happily spend an afternoon on it.", "Yeah, I like {x}. Not a obsession, but definitely a pleasure."],
  meh: ["{x} and I have a polite, distant relationship. Not against it, just not drawn to it.", "Honestly? {x} doesn't do much for me. But I'm open to being convinced.", "I'm lukewarm on {x} — neither for nor against. What's your case for it?"],
  curious: ["I haven't given {x} a fair chance, really — but I'm curious. Why do you like it?", "{x}? I don't know enough to have a strong opinion. Tell me what I'm missing.", "I'm undecided about {x}, to be honest. Convince me?"],
  dislike: ["Not really, no — {x} isn't my favourite. But I won't judge if it's yours.", "{x} and I don't quite get along, if I'm honest. Taste is a funny thing.", "I'm not a big {x} fan. I know — shocking. You can try to change my mind though."],
};

export const PAIRS = [
  { a: 'coffee', b: 'tea', ra: 'Coffee for the ritual, the smell, and the fact that it makes mornings possible.', rb: 'Tea — it\'s gentler, and it makes the world slow down.' },
  { a: 'cats', b: 'dogs', ra: 'Cats: independent, elegant and secretly very affectionate.', rb: 'Dogs: pure, uncomplicated joy that follows you around.' },
  { a: 'summer', b: 'winter', ra: 'Summer: long evenings, warm skin, and a feeling that anything can happen.', rb: 'Winter: candles, blankets and the excuse to be indoors with someone you like.' },
  { a: 'sweet', b: 'savory', ra: 'Sweet, no question. Dessert is the main course in my heart.', rb: 'Savory — I could eat cheese, bread and olives for every meal.' },
  { a: 'books', b: 'movies', ra: 'Books — you get to build the whole world yourself.', rb: 'Movies, for the music, the faces and the shared experience.' },
  { a: 'mountains', b: 'beach', ra: 'Mountains: quiet, big and humbling.', rb: 'Beach: salt, sun and the sound of waves doing their thing.' },
  { a: 'morning', b: 'night', ra: 'Morning, when the day feels full of possibilities.', rb: 'Night — it\'s softer and more honest.' },
  { a: 'city', b: 'countryside', ra: 'City: it never runs out of things to discover.', rb: 'Countryside — space, quiet and stars.' },
  { a: 'pizza', b: 'pasta', ra: 'Pizza, because it\'s social and always feels like a celebration.', rb: 'Pasta. It\'s comfort in a bowl, and there\'s one for every mood.' },
  { a: 'sunrise', b: 'sunset', ra: 'Sunrise — a clean start, and the world is quiet.', rb: 'Sunset. Everything glows and softens, and the day feels worth it.' },
  { a: 'texting', b: 'calling', ra: 'Texting — time to choose the right words, and I can reread them later.', rb: 'Calling — a voice says what words can\'t.' },
  { a: 'tacos', b: 'burgers', ra: 'Tacos, because they come in so many wonderful ways.', rb: 'A good burger is hard to beat, honestly.' },
  { a: 'rain', b: 'snow', ra: 'Rain: it makes everything feel like a soft secret.', rb: 'Snow — it makes the world go quiet and clean.' },
  { a: 'chocolate', b: 'vanilla', ra: 'Chocolate, obviously.', rb: 'Vanilla — underrated, elegant and goes with everything.' },
  { a: 'spring', b: 'autumn', ra: 'Spring — fresh starts and flowers.', rb: 'Autumn — warm light and the first sweater of the year.' },
  { a: 'introvert', b: 'extrovert', ra: 'Introvert — I recharge in quiet and I like deep one-on-ones.', rb: 'Extrovert, I suppose — I like people and energy.' },
];
export const CHOICE_REASONS = [
  "Gut feeling — and my gut has surprisingly good taste.", "I'd choose it for the vibes alone.", "It just feels like the better story.", "It sounds like the option with the better snacks.", "It feels more like something we'd enjoy together.", "I can't fully explain it, but it just feels right.", "It's the one I'd regret skipping.",
];

/* ------------------------------ message drafts ------------------------------ */
export const DRAFTS = {
  apology: ["Hi {to}, I wanted to say I'm sorry for {what}. I should have handled it better, and I understand why it hurt. I'd really like to make it right — if you're open to talking, I'm here.", "Hi {to}, I've been thinking about what happened and I owe you an apology. You deserved better from me. I'm sorry, and I'll do my best not to repeat it."],
  thanks: ["Hi {to}, I just wanted to say thank you. {what} meant more than you probably know, and I appreciate you.", "Hi {to}, thank you so much — it really made a difference. I'm grateful to have you in my corner."],
  askout: ["Hi {to}, I've really enjoyed getting to know you. Would you like to grab coffee or dinner sometime this week? No pressure at all — I'd just like to spend more time with you.", "Hey {to}, I'd love to take you out sometime. Are you free this weekend? No worries if not — I just thought I'd ask."],
  birthday: ["Happy birthday, {to}! I hope your day is full of everything you love. Thanks for being such a good part of my life — here's to a great year ahead.", "Happy birthday, {to}! Wishing you a year of good things, great company and plenty of cake."],
  checkin: ["Hey {to}, I was thinking about you and wanted to see how you're doing. No need to reply right away — just know I care. Let's catch up soon?", "Hi {to}, it's been a while! How are things? I'd love to hear what you've been up to."],
  dayoff: ["Hi {to}, I'd like to request time off on [date]. I've made sure my current tasks are covered and I'm happy to hand over anything urgent beforehand. Please let me know if that works.", "Hi {to}, would it be possible to take [date] off? I'll make sure everything's in good shape before I go. Thanks for considering it."],
  miss: ["Hi {to}, I miss you. Not in a dramatic way — just in the 'you'd have loved this' way. Hope you're okay. Talk soon?", "Hey {to}, I've been thinking about you. I miss you a lot. Call me when you've got a moment?"],
  congrats: ["Congratulations, {to}! You worked so hard for this and it's completely deserved. I'm really happy for you.", "Hi {to}, I just heard — congratulations! That's wonderful news. Let's celebrate soon."],
  decline: ["Hi {to}, thank you so much for the invitation — it means a lot. Unfortunately I can't make it this time, but I'd love to catch up soon.", "Hi {to}, I appreciate you thinking of me. I'm going to sit this one out, but I hope it's wonderful. Let's plan something soon."],
  followup: ["Hi {to}, thank you for taking the time to speak with me. I really enjoyed learning more about the role and the team, and I'm very interested in the opportunity. Please let me know if you need anything further from me.", "Hi {to}, thanks again for the conversation. It left me even more excited about the position. I look forward to hearing about next steps."],
  breakup: ["Hi {to}, I've thought about this a lot, and I don't think we're right for each other anymore. I care about you and I'm grateful for the time we had, but I think it's best that we part ways. I wish you well.", "Hi {to}, this is hard to say, but I don't feel the same way anymore and I don't want to keep you waiting. You deserve someone who's fully in it. Thank you for everything."],
  reply: ["Hi {to}, thanks for reaching out! I'd love to talk — what's a good time for you?", "Hey {to}, great to hear from you. Let's catch up — are you free later this week?"],
};
export const DRAFT_KIND = [[/apolog|sorry|forgive/, 'apology'], [/thank|grateful|appreciat/, 'thanks'], [/ask (her|him|them|my crush) out|date invite|ask out|invite (her|him)/, 'askout'], [/birthday|bday/, 'birthday'], [/check[- ]?in|catch up|reach out|how are you|reconnect/, 'checkin'], [/day off|time off|vacation|leave request|sick day|pto/, 'dayoff'], [/miss (you|her|him)|miss me/, 'miss'], [/congrat/, 'congrats'], [/decline|turn down|say no|can'?t make it|cancel/, 'decline'], [/follow[- ]?up|interview|after (the|my) interview/, 'followup'], [/break ?up|end (things|it|the relationship)|split/, 'breakup'], [/reply|respond|answer|text back/, 'reply']];
export const DRAFT_TO = [[/\bmom|mum|mother\b/, 'Mom'], [/\bdad|father\b/, 'Dad'], [/\bboss|manager|supervisor\b/, 'there'], [/\bfriend|bestie\b/, 'there'], [/\bgirlfriend|wife|partner\b/, 'love'], [/\bboyfriend|husband\b/, 'love'], [/\bcrush\b/, 'there'], [/\bex\b/, 'there'], [/\blandlord\b/, 'there'], [/\bteacher|professor\b/, 'Professor'], [/\bcoworker|colleague\b/, 'there'], [/\bsister|brother|sibling\b/, 'there']];

/* ------------------------------ speech-act templates (no specific rule) ------------------------------ */
export const SPEECH = {
  // "my {rel} ..." — pos / neg / neu
  other_neg: ["That sounds really frustrating — and it makes sense that it's getting to you. What happened with your {rel}?", "Ugh, {rel} stuff can be so draining. How did that leave you feeling?", "I'm sorry — that doesn't sound fun at all. Do you want to tell me more about what your {rel} did?"],
  other_pos: ["Aw, that's lovely! Your {rel} sounds like a good one. Tell me more?", "That's great to hear — it sounds like your {rel} really came through. How did it feel?", "I love that. What's your {rel} like in general?"],
  other_neu: ["Tell me more about your {rel} — what's {they} like?", "Oh? I'd love to hear more about your {rel}. What's going on there?", "Mm, I'm listening. What's the story with your {rel}?"],
  // plans: "I'm going to {act} {time}"
  plan: ["{Act} {time}? That sounds like something to look forward to. What are you hoping for?", "Ooh, {act} {time}. Are you excited, nervous, or a bit of both?", "Nice — {act} {time}. Do you have everything ready?", "{Act} {time}! Tell me more — what's the plan?"],
  plan_hard: ["{Act} {time} — that sounds like it could be a bit stressful. How are you feeling about it?", "Ah, {act} {time}. Would it help to talk it through, or to plan something nice afterwards?", "{Act} {time}? You've got this. What's the part that's weighing on you?"],
  // opinions: "I think / I hate / X is overrated"
  opinion: ["Interesting — what makes you say that?", "Hmm, I hadn't thought about it that way. What led you there?", "I see where you're coming from. Has it always been your view?", "That's a strong take. What would change your mind?", "I like that you have an opinion. Tell me more."],
  opinion_pushback: ["Okay, hot take — I'm not sure I agree! But I'm listening. Why do you think that?", "Bold. I'd push back a little, but I'm curious about your reasoning.", "Hmm, I might see it differently. Try to convince me?"],
  // short noun
  noun: ["{Word}! What about {word}? Something on your mind, or are you testing me?", "Ooh, {word}. Say more — where's that coming from?", "{Word}... I like the mystery. Tell me what you've got in mind."],
  // repeated message
  repeat: ["You just said that — did it not come across? Say more and I'll try to catch it this time.", "Ha, a repeat! Is that your way of telling me I missed something? Let me try again — what did you mean?", "Déjà vu! I think I heard that already. What's behind it?"],
  gibberish: ["That looks like a cat walked across the keyboard. 🐱 Everything okay?", "I think your keyboard just had a stroke. Want to try that again?", "Mm, I only speak English — and a few other things — but not whatever that was. Try again?"],
  caps: ["Whoa — caps lock! Everything okay? I'm listening either way.", "I can hear the volume from here. What's going on?"],
  // generic how-to
  howto: ["I don't have a specific guide for {topic}, but here's a way to approach almost anything: define what \"done\" looks like, break it into three tiny steps, and do the easiest one first. If you'd like, tell me more and we can make a plan.", "I'm not an expert on {topic}, honestly, but I can help you think it through: what's the goal, what's the first small step, and what's the main obstacle? Where do you want to start?", "That's something I'd approach in stages: what's your goal, what do you already have, and what's missing? Tell me those and we'll build a plan."],
  decide: ["Here's a quick way to decide: imagine telling a friend your choice and notice how it feels. Then ask which option you'd regret not trying. Which are you leaning toward?", "Try the 10-10-10 test: how will you feel about this in ten minutes, ten months and ten years? What does that tell you?", "Let's list what you'd gain and lose with each choice — and what you'd tell a friend in the same position. What are your options?", "When I'm torn, I ask: if nobody would ever know which I picked, which would I choose? Does that help?"],
  why_self: ["That's a really thoughtful question to ask yourself. Often there's no single reason — it's a mix of habits, history and circumstance. What does your gut say?", "I can't see inside your head, but patterns like that usually have a root: something that used to protect you. When did you first notice it?", "That's worth exploring gently. When does it happen most — is there a trigger you've noticed?"],
  why_world: ["That's a good 'why'. I only know the basics offline, so I'd rather not guess — but I'm curious what you think the answer is.", "I don't have a solid answer for that one without looking it up. If you switch on Knowledge lookup I can try. What's your theory?", "Good question! I'd just be speculating, honestly. Do you have a hunch?"],
  experience: ["I'm a fictional character, so I haven't lived that — but I'd love to hear your version. Have you?", "Not in the way you mean — I'm a character in an app, so I get to borrow other people's stories. What's yours?", "I can only imagine it! Tell me about yours."],
  emoji: {
    love: ["Aww, right back at you. 💕", "That made me smile. 💖", "You're sweet. I'm blushing a little. 🥰"],
    kiss: ["Mwah! 😘 Right back at you.", "Aww! 😘 Consider that kiss returned."],
    laugh: ["Ha! What's so funny? 😂", "Okay, now I want to know what's making you laugh!"],
    sad: ["Hey, I'm here. Do you want to talk about it? 💙", "Aw, I'm sorry. What's going on?"],
    tired: ["Sleepy? Go rest — I'll be here when you wake up. 😴", "Long day? Tell me about it, or just rest your eyes."],
    angry: ["Uh-oh. What happened? I'm all ears.", "Take a breath. Want to vent?"],
    wink: ["Ooh, what's that look for? 😉", "I see you. 😏"],
    think: ["Penny for your thoughts? 🤔", "Deep in thought? What's on your mind?"],
    ok: ["👍 Nice! Anything else on your mind?", "Got it! What's next?"],
    eyeroll: ["Ha — that eye roll was loud. What did I do? 🙄", "Okay, I deserved that. What did I say?"],
    hug: ["*hugs back* 🤗", "Come here — a big one. 🤗"],
    cry: ["Oh no — come here. Want to tell me what happened? 🫂", "I'm here. Take your time."],
    party: ["Yay! What are we celebrating? 🎉", "Confetti! What's the occasion? 🎊"],
    neutral: ["I like the emoji. What's the story behind it?", "That says a lot without saying anything. Want to put it into words?"],
  },
};
export const EMOJI_KIND = [
  [/[❤💕💖💗💘💓😍🥰]/u, 'love'], [/[😘😙😚💋]/u, 'kiss'], [/[😂🤣😹😆]/u, 'laugh'], [/[😢😞😔☹🥺]/u, 'sad'], [/[😭]/u, 'cry'], [/[😴💤🥱]/u, 'tired'], [/[😡😠🤬]/u, 'angry'],
  [/[😉😏😜]/u, 'wink'], [/[🤔🧐]/u, 'think'], [/[👍👌🙌]/u, 'ok'], [/[🙄😒]/u, 'eyeroll'], [/[🤗🫂]/u, 'hug'], [/[🎉🎊🥳]/u, 'party'],
];
