// AMORA — a small offline knowledge base so she can answer common factual questions without any network.
// For anything outside this, she either admits she isn't sure or (if you enable Lookup in Settings) checks Wikipedia.

const CAP = 'France:Paris|Germany:Berlin|Italy:Rome|Spain:Madrid|Portugal:Lisbon|United Kingdom:London|UK:London|England:London|Ireland:Dublin|Netherlands:Amsterdam|Belgium:Brussels|Switzerland:Bern|Austria:Vienna|Sweden:Stockholm|Norway:Oslo|Denmark:Copenhagen|Finland:Helsinki|Iceland:Reykjavik|Poland:Warsaw|Czech Republic:Prague|Hungary:Budapest|Greece:Athens|Turkey:Ankara|Russia:Moscow|Ukraine:Kyiv|Romania:Bucharest|Croatia:Zagreb|Egypt:Cairo|Morocco:Rabat|Nigeria:Abuja|Kenya:Nairobi|Ethiopia:Addis Ababa|Ghana:Accra|South Africa:Pretoria (executive), Cape Town (legislative) and Bloemfontein (judicial)|Algeria:Algiers|Tunisia:Tunis|Saudi Arabia:Riyadh|United Arab Emirates:Abu Dhabi|UAE:Abu Dhabi|Israel:Jerusalem|Iran:Tehran|Iraq:Baghdad|India:New Delhi|Pakistan:Islamabad|Bangladesh:Dhaka|Sri Lanka:Sri Jayawardenepura Kotte|Nepal:Kathmandu|China:Beijing|Japan:Tokyo|South Korea:Seoul|North Korea:Pyongyang|Thailand:Bangkok|Vietnam:Hanoi|Philippines:Manila|Indonesia:Jakarta|Malaysia:Kuala Lumpur|Singapore:Singapore|Australia:Canberra|New Zealand:Wellington|Canada:Ottawa|United States:Washington, D.C.|USA:Washington, D.C.|America:Washington, D.C.|Mexico:Mexico City|Cuba:Havana|Jamaica:Kingston|Brazil:Brasília|Argentina:Buenos Aires|Chile:Santiago|Peru:Lima|Colombia:Bogotá|Venezuela:Caracas|Ecuador:Quito|Uruguay:Montevideo|Bolivia:Sucre|Mongolia:Ulaanbaatar|Kazakhstan:Astana|Afghanistan:Kabul|Jordan:Amman|Lebanon:Beirut|Qatar:Doha|Scotland:Edinburgh|Wales:Cardiff|Estonia:Tallinn|Latvia:Riga|Lithuania:Vilnius|Serbia:Belgrade|Bulgaria:Sofia|Slovakia:Bratislava|Slovenia:Ljubljana|Luxembourg:Luxembourg City|Malta:Valletta|Cyprus:Nicosia|Tanzania:Dodoma|Uganda:Kampala|Senegal:Dakar|Zimbabwe:Harare|Zambia:Lusaka|Angola:Luanda|Costa Rica:San José|Panama:Panama City|Puerto Rico:San Juan|Dominican Republic:Santo Domingo|Haiti:Port-au-Prince|Guatemala:Guatemala City';
export const CAPITALS = Object.fromEntries(CAP.split('|').map((p) => { const i = p.indexOf(':'); return [p.slice(0, i).toLowerCase(), p.slice(i + 1)]; }));

const D = {
  'photosynthesis': 'the process plants, algae and some bacteria use to turn sunlight, water and carbon dioxide into sugar and oxygen.',
  'gravity': 'the force that pulls objects with mass toward each other — it keeps us on the ground and planets in orbit.',
  'dna': 'the molecule that carries genetic instructions for life — a double helix made of four chemical “letters”.',
  'a black hole': 'a region of space where gravity is so strong that nothing, not even light, can escape once it crosses the event horizon.',
  'black hole': 'a region of space where gravity is so strong that nothing, not even light, can escape once it crosses the event horizon.',
  'black holes': 'regions of space where gravity is so strong that nothing, not even light, can escape once it crosses the event horizon.',
  'inflation': 'a general rise in prices over time, which means each unit of money buys a bit less than before.',
  'democracy': 'a system of government where power rests with the people, usually through voting and elected representatives.',
  'blockchain': 'a shared digital ledger where records are grouped into linked, tamper-resistant blocks — it\'s the tech behind most cryptocurrencies.',
  'bitcoin': 'the first and best-known cryptocurrency, created in 2009 — a digital currency that runs on a blockchain with no central bank.',
  'artificial intelligence': 'software that performs tasks that normally need human intelligence, like recognising images, translating or writing. (I, on the other hand, am just rules and templates!)',
  'ai': 'short for artificial intelligence — software that performs tasks that normally need human intelligence. I\'m not one, by the way; I\'m rule-based.',
  'climate change': 'long-term shifts in global temperatures and weather patterns, mostly driven in recent history by burning fossil fuels.',
  'the big bang': 'the widely supported theory that the universe began as an extremely hot, dense state about 13.8 billion years ago and has been expanding ever since.',
  'big bang': 'the widely supported theory that the universe began as an extremely hot, dense state about 13.8 billion years ago and has been expanding ever since.',
  'evolution': 'the change in the traits of living things over generations through natural selection and other processes.',
  'an atom': 'the basic unit of a chemical element, made of a nucleus of protons and neutrons surrounded by electrons.',
  'atom': 'the basic unit of a chemical element, made of a nucleus of protons and neutrons surrounded by electrons.',
  'a galaxy': 'a huge system of stars, gas, dust and dark matter held together by gravity. Ours is the Milky Way.',
  'galaxy': 'a huge system of stars, gas, dust and dark matter held together by gravity. Ours is the Milky Way.',
  'the internet': 'a global network of connected computers that lets them share information using common protocols.',
  'internet': 'a global network of connected computers that lets them share information using common protocols.',
  'a cryptocurrency': 'a digital currency secured by cryptography and usually run on a decentralised network instead of a central bank.',
  'an introvert': 'someone who tends to feel energised by quiet time alone rather than by large social gatherings.',
  'introvert': 'someone who tends to feel energised by quiet time alone rather than by large social gatherings.',
  'an extrovert': 'someone who tends to feel energised by being around other people.',
  'extrovert': 'someone who tends to feel energised by being around other people.',
  'stoicism': 'an ancient Greek philosophy that teaches focusing on what you can control, and meeting everything else with calm.',
  'mindfulness': 'paying deliberate, non-judgmental attention to the present moment.',
  'serendipity': 'a happy accident — finding something wonderful by chance when you weren\'t looking for it.',
  'nostalgia': 'a sentimental longing for the past.',
  'ephemeral': 'lasting only a very short time.',
  'petrichor': 'the pleasant earthy smell of rain on dry ground.',
  'wanderlust': 'a strong desire to travel and explore the world.',
  'mitochondria': 'the parts of a cell that make most of its energy — “the powerhouse of the cell”, as the meme goes.',
  'the moon': 'Earth\'s only natural satellite, about 384,000 km away, which causes our tides.',
  'moon': 'Earth\'s only natural satellite, about 384,000 km away, which causes our tides.',
  'the sun': 'the star at the centre of our solar system — a ball of hot plasma about 150 million km from Earth.',
  'sun': 'the star at the centre of our solar system — a ball of hot plasma about 150 million km from Earth.',
  'a prime number': 'a whole number greater than 1 whose only divisors are 1 and itself, like 2, 3, 5, 7 and 11.',
  'prime number': 'a whole number greater than 1 whose only divisors are 1 and itself, like 2, 3, 5, 7 and 11.',
  'pi': 'the ratio of a circle\'s circumference to its diameter — about 3.14159, and it never ends or repeats.',
  'the speed of light': 'about 299,792 kilometres per second (roughly 186,000 miles per second) in a vacuum.',
  'speed of light': 'about 299,792 kilometres per second (roughly 186,000 miles per second) in a vacuum.',
  'a love language': 'the idea (from Gary Chapman) that people prefer to give and receive love in different ways: words, quality time, gifts, acts of service or touch.',
  'love languages': 'the idea (from Gary Chapman) that people prefer to give and receive love in different ways: words, quality time, gifts, acts of service or touch.',
  'attachment style': 'a pattern in how you bond with others, usually described as secure, anxious, avoidant or a mix.',
  'the renaissance': 'a period of European art, science and ideas from roughly the 14th to 17th centuries, following the Middle Ages.',
  'renaissance': 'a period of European art, science and ideas from roughly the 14th to 17th centuries, following the Middle Ages.',
  'jazz': 'a music genre born in New Orleans in the early 20th century, known for improvisation and swing.',
  'impressionism': 'a 19th-century art movement known for capturing light and everyday scenes with loose, visible brushwork — think Monet.',
  'sourdough': 'bread made with a fermented starter of wild yeast and bacteria, giving it a tangy flavor.',
  'espresso': 'a small, concentrated coffee made by forcing hot water through finely ground beans under pressure.',
  'yoga': 'a practice from ancient India combining posture, breathing and meditation.',
  'stock market': 'a marketplace where shares of companies are bought and sold.',
  'a mortgage': 'a loan used to buy property, with the property itself as security.',
  'compound interest': 'interest calculated on both your original amount and the interest it has already earned.',
  'a vpn': 'a service that encrypts your internet connection and routes it through another server, hiding your IP address from sites you visit.',
  'vpn': 'a service that encrypts your internet connection and routes it through another server, hiding your IP address from sites you visit.',
  'a haiku': 'a short Japanese poem form, traditionally three lines of five, seven and five syllables.',
  'haiku': 'a short Japanese poem form, traditionally three lines of five, seven and five syllables.',
};
export const DEFINITIONS = D;

const PLANETS = { mercury: 'the smallest planet and the closest to the Sun — a year there lasts just 88 Earth days.', venus: 'the hottest planet, with a thick atmosphere of carbon dioxide; it spins backwards compared with most planets.', earth: 'our home — the only planet known to support life, and about 71% water-covered.', mars: 'the “red planet”, home to Olympus Mons, the tallest volcano in the solar system.', jupiter: 'the largest planet — a gas giant with a storm, the Great Red Spot, bigger than Earth.', saturn: 'famous for its bright rings; it\'s so light for its size that it would float in a big enough bathtub.', uranus: 'an ice giant that rotates on its side.', neptune: 'the farthest known major planet, with the fastest winds in the solar system.' };

const OTHER = [
  [/\bhow many (planets) .*solar system\b|\bhow many planets\b/, 'Eight: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus and Neptune.'],
  [/\bhow many continents\b/, 'Seven: Africa, Antarctica, Asia, Australia/Oceania, Europe, North America and South America.'],
  [/\bhow many oceans\b/, 'Five: the Pacific, Atlantic, Indian, Southern and Arctic.'],
  [/\bhow many days (are )?in a year\b/, '365 — or 366 in a leap year.'],
  [/\bhow many (hours|minutes|seconds) (are )?in a day\b/, '24 hours, which is 1,440 minutes or 86,400 seconds.'],
  [/\b(largest|biggest) (planet)\b/, 'Jupiter — it could fit more than 1,300 Earths inside it.'],
  [/\b(largest|biggest) ocean\b/, 'The Pacific Ocean — it covers about a third of the planet.'],
  [/\b(largest|biggest) country\b/, 'Russia, by area. By population it\'s India or China, depending on the year.'],
  [/\b(tallest|highest) mountain\b/, 'Mount Everest, at about 8,849 metres (29,032 ft) above sea level.'],
  [/\blongest river\b/, 'It\'s usually said to be the Nile or the Amazon — it depends on how you measure.'],
  [/\b(smallest|tiniest) country\b/, 'Vatican City, at roughly 0.44 square kilometres.'],
  [/\b(closest|nearest) star\b/, 'Besides the Sun, Proxima Centauri, about 4.2 light-years away.'],
  [/\bwho (painted|made) the mona lisa\b/, 'Leonardo da Vinci, in the early 1500s.'],
  [/\bwho wrote (romeo and juliet|hamlet|macbeth)\b/, 'William Shakespeare.'],
  [/\bwho (invented|created) the (telephone)\b/, 'Alexander Graham Bell is usually credited, patenting it in 1876.'],
  [/\bwho (discovered|came up with) (gravity|the law of gravity)\b/, 'Isaac Newton described universal gravitation in the 1600s — the apple story is probably embellished.'],
  [/\bwho (discovered|invented) (penicillin)\b/, 'Alexander Fleming noticed it in 1928.'],
  [/\bwho was the first (person|man) on the moon\b/, 'Neil Armstrong, on 20 July 1969, during Apollo 11.'],
  [/\bboiling point of water\b/, '100 °C (212 °F) at sea level.'],
  [/\bfreezing point of water\b/, '0 °C (32 °F).'],
  [/\bwhat (color|colour) is the sky\b|\bwhy is the sky blue\b/, 'It looks blue because the atmosphere scatters short blue wavelengths of sunlight more than red ones — it\'s called Rayleigh scattering.'],
  [/\bwhat is the (chemical )?(formula|symbol) (for|of) water\b|\bformula for water\b/, 'H₂O — two hydrogen atoms bonded to one oxygen atom.'],
  [/\bwhat is the (chemical )?symbol (for|of) (gold|silver|iron|sodium|oxygen|helium|carbon)\b/, null],
];
const SYM = { gold: 'Au', silver: 'Ag', iron: 'Fe', sodium: 'Na', oxygen: 'O', helium: 'He', carbon: 'C' };

/** Offline answer for a subject / whole question, or null. */
export function localAnswer(raw, subject) {
  const l = raw.toLowerCase().replace(/[?!.]+$/, '');
  let m = l.match(/\bcapital (?:city )?of (?:the )?([a-z .'-]+)$/);
  if (m) { const c = m[1].trim().replace(/^the /, ''); if (CAPITALS[c]) return `The capital of ${c.replace(/\b\w/g, (x) => x.toUpperCase())} is ${CAPITALS[c]}.`; }
  for (const [re, ans] of OTHER) if (re.test(l)) {
    if (ans) return ans;
    const s = l.match(/\b(gold|silver|iron|sodium|oxygen|helium|carbon)\b/); return s ? `The chemical symbol for ${s[1]} is ${SYM[s[1]]}.` : null;
  }
  const subj = (subject || '').toLowerCase().replace(/^(?:an?|the)\s+/, '').replace(/[?!.]+$/, '').trim();
  if (PLANETS[subj]) return `${subj[0].toUpperCase()}${subj.slice(1)} is ${PLANETS[subj]}`;
  for (const k of [subject?.toLowerCase().trim(), subj, `the ${subj}`, `a ${subj}`]) if (k && D[k]) { const nm = (subj || k).replace(/^\w/, (x) => x.toUpperCase()); const plural = /s$/.test(k) && !/(ss|us|is)$/.test(k); return `${nm} ${plural ? 'are' : 'is'} ${D[k]}`; }
  return null;
}
