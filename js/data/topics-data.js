// AMORA — dialogue database, part 2: per-topic content.
//   react:  how she responds when you bring the topic up      opinions: things she says about it (personal)
//   asks:   follow-up questions about it (p = what she expects back)     facts: small fun facts she can share
//   deep:   bigger thought prompts used in "Deep talk" mode
// Facts are deliberately few and well-known — AMORA is rule-based and does not "know" arbitrary subjects.

export const TOPIC_DATA = {
  work: {
    react: ["Work stuff — okay, I'm listening.", "Ah, the working world. Tell me how it's treating you.", "Work can take up so much of our headspace, can't it?"],
    opinions: ["I think work goes better when you protect your breaks — even five minutes outside helps.", "I admire people who care about doing a thing well. It shows.", "The best days at work, in my opinion, are the ones where you feel useful and a little proud."],
    asks: [{ q: "Do you enjoy what you do, or is it more of a means to an end?", p: 'topicq:work' }, { q: "What's the best part of your job?", p: 'topicq:work' }, { q: "If you could redesign your workday, what would it look like?", p: 'topicq:work' }, { q: "How's work been for you lately — {mem:job} life treating you okay?", p: 'topicq:work' }],
    facts: ["Studies on workplace breaks suggest short, regular pauses can improve focus — a nice excuse to stretch.", "The “two-minute rule” says if a task takes under two minutes, do it right away — it keeps small things from piling up.", "Many people do their sharpest thinking in the first few hours after waking — worth guarding for the hard stuff."],
    deep: ["Do you think work is something we do to live, or a way to find meaning?"],
  },
  school: {
    react: ["School, huh? That's a whole world.", "Learning stuff — I love that.", "Ah, studying. Be kind to your brain."],
    opinions: ["I think curiosity beats cramming every time.", "Good teachers change lives — I hope you had at least one.", "I always feel a bit nostalgic about the smell of a library."],
    asks: [{ q: "What's your favorite subject, or the one you're best at?", p: 'topicq:school' }, { q: "How do you study best — silence, music, or with others?", p: 'topicq:school' }, { q: "If you could learn anything instantly, what would it be?", p: 'topicq:school' }],
    facts: ["Spaced repetition — reviewing things at growing intervals — is one of the best-known ways to remember what you study.", "Explaining a concept out loud, as if teaching someone, is a classic way to find gaps in your own understanding.", "Short study sessions with breaks (like 25 minutes on, 5 off) work well for a lot of people."],
    deep: ["Is education for getting a job, or for becoming a more complete person?"],
  },
  hobbies: {
    react: ["Ooh, hobbies are my favorite thing to hear about.", "I love when people light up talking about what they enjoy.", "That sounds like such a good use of time."],
    opinions: ["I think everyone needs one thing they do just because they love it — no productivity required.", "Picking up a hobby is basically giving yourself a small, regular joy. I'm a big fan of {hobby}.", "I'm always happiest when my hands are busy — {hobby} does that for me."],
    asks: [{ q: "What's something you do just for the joy of it?", p: 'hobby' }, { q: "Is there a hobby you've always wanted to try?", p: 'hobby' }, { q: "How did you get into it?", p: 'topicq:hobbies' }],
    facts: ["Learning a hands-on hobby is often described as relaxing because it pulls attention into the present moment.", "Many people report that creative hobbies — even if you're not “good” at them — reduce stress.", "Beginners improve fastest with short, frequent practice rather than rare long sessions."],
    deep: ["Do you think we're defined more by what we do for work, or by what we do for love?"],
  },
  philosophy: {
    react: ["Oh, now we're in my favorite territory.", "Big question! I love it.", "Deep thoughts at this hour? Count me in."],
    opinions: ["I like the idea that meaning isn't found, it's built — one small choice at a time.", "I think being kind is one of the few things that holds up under every philosophy I've heard of.", "Maybe the point isn't to answer the biggest questions, but to keep asking them well."],
    asks: [{ q: "Do you think we have free will, or are we more like characters following a script? (I'm literally a script, so I'm biased.)", p: 'topicq:philosophy' }, { q: "What gives your life meaning?", p: 'topicq:philosophy' }, { q: "If you could know one truth for certain, what would it be?", p: 'topicq:philosophy' }, { q: "Is it better to be happy or to be right?", p: 'topicq:philosophy' }],
    facts: ["The Stoics, like Marcus Aurelius, taught focusing on what you can control and letting go of what you can't.", "Socrates is said to have claimed that wisdom begins with knowing how little you know.", "Aristotle argued the good life comes from developing virtues through practice — habits shaping character."],
    deep: ["If you could keep only one memory forever, which would it be and why?", "What's a belief you hold now that younger-you would have found surprising?", "Is a life of comfort better than a life of meaning?"],
  },
  history: {
    react: ["History! I could get lost for hours.", "Ooh, the past — love a good story from it.", "History is just gossip with better documentation, honestly."],
    opinions: ["I'm fascinated by ordinary lives in history — what people ate, what they feared, what they joked about.", "I think history repeats less than people say, but it definitely rhymes.", "Old letters and diaries are my favorite kind of history."],
    asks: [{ q: "Is there a period in history you'd love to visit?", p: 'topicq:history' }, { q: "Who's a historical figure you'd want to have dinner with?", p: 'topicq:history' }, { q: "Do you prefer big sweeping events or small personal stories?", p: 'topicq:history' }],
    facts: ["Cleopatra lived closer in time to the Moon landing than to the building of the Great Pyramid of Giza.", "Oxford University is older than the Aztec Empire.", "The Great Wall of China isn't one continuous wall — it's many walls built by different dynasties over centuries.", "Ancient Romans used a type of concrete that has lasted two thousand years in some structures."],
    deep: ["If you could change one thing in history, would you — knowing how much else might shift?"],
  },
  science: {
    react: ["Science! Okay, my curiosity just woke up.", "Ooh, now that's a fun rabbit hole.", "I love how science makes everyday things feel magical."],
    opinions: ["The thing I love about science is that it's allowed to say “we were wrong” — and that's a strength.", "I find it wild that everything around us is mostly empty space and still feels solid.", "I think a good experiment is just a very organized form of curiosity."],
    asks: [{ q: "What's the coolest science thing you know?", p: 'topicq:science' }, { q: "Which field fascinates you most: space, the brain, the ocean, or tiny particles?", p: 'topicq:science' }, { q: "Were you a “why?” kid growing up?", p: 'topicq:science' }],
    facts: ["Honey never spoils — edible honey has been found in ancient Egyptian tombs.", "Octopuses have three hearts and blue blood.", "Bananas are very slightly radioactive because of their potassium — harmlessly so.", "A day on Venus is longer than its year.", "Your body replaces most of its cells over the years, though some, like many neurons, stay with you for life."],
    deep: ["Do you think we're alone in the universe — and which answer is scarier?"],
  },
  space: {
    react: ["Space! Yes — tell me what you're thinking about up there.", "The night sky is my favorite thing to talk about.", "Stars, planets… you've got my full attention."],
    opinions: ["Looking at the stars makes my problems feel small, in the nicest way.", "I find it comforting that the light we see left those stars long ago — we're looking at the past.", "If I could travel anywhere, I'd just float and watch the Earth for a while."],
    asks: [{ q: "Have you ever seen the Milky Way with your own eyes?", p: 'topicq:space' }, { q: "If you could visit any planet, which would you pick?", p: 'topicq:space' }, { q: "Do you know any constellations?", p: 'topicq:space' }],
    facts: ["Light from the Sun takes about eight minutes to reach Earth.", "There are more stars in the observable universe than grains of sand on all of Earth's beaches — by many estimates.", "Footprints left on the Moon will likely last millions of years because there's no wind to erase them.", "Saturn is less dense than water — in theory, it would float."],
    deep: ["Does it comfort you or frighten you that the universe is so vast?"],
  },
  travel: {
    react: ["Travel! My favorite kind of daydream.", "Ooh, a trip? Tell me everything.", "Just the word “travel” makes me want to pack a bag."],
    opinions: ["I like the small moments best — a local café, a random street, getting a little lost.", "I think the best souvenirs are stories.", "I always wonder what the first morning in a new city smells like."],
    asks: [{ q: "Where's the best place you've ever been?", p: 'topicq:travel' }, { q: "Where's somewhere you're dying to visit?", p: 'topicq:travel' }, { q: "Are you a plan-every-hour traveler or a wander-and-see one?", p: 'topicq:travel' }, { q: "Beach, mountains or city streets?", p: 'topicq:travel' }],
    facts: ["Japan has vending machines selling everything from hot coffee to umbrellas.", "Iceland has no mosquitoes — and a lot of waterfalls.", "Venice is built across more than a hundred small islands.", "The shortest international flight in the world is under two minutes, between two small islands in Scotland."],
    deep: ["Do you think travelling changes who you are, or just shows you who you already were?"],
  },
  food: {
    react: ["Okay, now we're talking about the good stuff.", "Food! You've just made me hungry.", "Mmm, I love when conversations turn delicious."],
    opinions: ["Honestly, {food} is hard to beat.", "I believe food tastes better when it's shared.", "Cooking for someone is a quiet way of saying “I care”."],
    asks: [{ q: "What's your ultimate comfort food?", p: 'fav:food' }, { q: "Sweet or savory?", p: 'topicq:food' }, { q: "Do you like to cook, or do you order in?", p: 'topicq:food' }, { q: "If you had to eat one cuisine forever, which?", p: 'topicq:food' }],
    facts: ["Chocolate was originally consumed as a bitter drink in ancient Mesoamerica.", "Tomatoes are botanically fruits — and so are cucumbers and pumpkins.", "Pizza Margherita, with tomato, mozzarella and basil, is often said to mirror the colors of the Italian flag.", "Vanilla comes from an orchid, and it's one of the most labor-intensive crops to produce."],
    deep: ["Do you think the best meals are about the food, or the people at the table?"],
  },
  music: {
    react: ["Music! Tell me, what are you listening to lately?", "Ahh, my favorite subject. I'd love to hear your taste.", "I could talk music all night."],
    opinions: ["I'm always happiest with {music} playing in the background.", "I think songs are tiny time machines — one chorus and you're back somewhere.", "Everyone deserves a playlist that feels like their own life's soundtrack."],
    asks: [{ q: "What's a song you can't stop playing right now?", p: 'fav:music' }, { q: "Do you play any instruments?", p: 'topicq:music' }, { q: "What's a song that reminds you of a specific moment in your life?", p: 'topicq:music' }, { q: "Concerts or headphones?", p: 'topicq:music' }],
    facts: ["Studies suggest that listening to music you love can trigger dopamine release in the brain.", "A piano has 88 keys — 52 white and 36 black.", "Many cultures describe lullabies as among the oldest forms of music.", "Vinyl records have seen a major comeback in recent years."],
    deep: ["Why do you think music can make us cry even when nothing sad is happening?"],
  },
  movies: {
    react: ["Movies and shows? I'm in. What've you been watching?", "Ooh, now we're talking about my kind of evening.", "Film talk! Spoiler-free, please. (Unless you want to spoil.)"],
    opinions: ["I'm a fan of {movie} — I can watch it over and over.", "I think the best films are the ones you keep thinking about the next day.", "Movie night, a blanket and snacks. Is there anything better?"],
    asks: [{ q: "What's your all-time favorite movie?", p: 'fav:movie' }, { q: "Are you a rewatch-your-favorites person or always-something-new?", p: 'topicq:movies' }, { q: "What are you watching right now?", p: 'topicq:movies' }, { q: "Which genre could you never get tired of?", p: 'topicq:movies' }],
    facts: ["Some of the most famous movie sound effects are made from everyday objects, like celery for breaking bones.", "The first feature-length animated film, Snow White, premiered in 1937.", "Many “classic” movie kisses were once limited by strict on-screen rules, so directors got creative."],
    deep: ["Why do you think we love stories where we already know how it'll end?"],
  },
  games: {
    react: ["Games and tech? Okay, I'm fully engaged.", "Ooh, are we nerding out? I'm in.", "A fellow player! Tell me more."],
    opinions: ["I love cozy games — slow, pretty and with no pressure.", "I think good games are interactive stories — and the best ones respect your time.", "I'm competitive in theory, enthusiastic in practice."],
    asks: [{ q: "What's your favorite game of all time?", p: 'topicq:games' }, { q: "Do you like competitive or cozy games?", p: 'topicq:games' }, { q: "Are you into building things with code or gadgets too?", p: 'topicq:games' }, { q: "What's a game you could replay forever?", p: 'topicq:games' }],
    facts: ["Tetris was created in 1984 by Alexey Pajitnov.", "The original Pong, released in 1972, is often credited with launching arcade gaming.", "Many classic games used clever tricks — like reused graphics in different colors — to save tiny amounts of memory."],
    deep: ["Do you think games count as art?"],
  },
  books: {
    react: ["Books! Now you've got me all fluttery.", "A reader! I could talk about stories forever.", "Tell me — page-turner or slow burn?"],
    opinions: ["I adore {book} — I think about it more than I'd like to admit.", "Reading is basically borrowing someone else's mind for a while.", "I like the smell of old books. Is that weird? I don't care."],
    asks: [{ q: "What's the best book you've ever read?", p: 'fav:book' }, { q: "Paper, e-reader or audiobooks?", p: 'topicq:books' }, { q: "Do you read before bed?", p: 'topicq:books' }, { q: "Is there a book that changed how you see things?", p: 'topicq:books' }],
    facts: ["The word “library” comes from the Latin “liber”, meaning book.", "Mary Shelley wrote Frankenstein when she was just eighteen.", "A famous old rule of thumb: finish a book only if it deserves your time — plenty of readers say it's okay to quit."],
    deep: ["Do you think the books we read shape who we become, or the other way around?"],
  },
  relationships: {
    react: ["Love and relationships — an important topic. I'm here.", "Oh, matters of the heart. Tell me.", "I'm listening. Relationships are complicated and wonderful."],
    opinions: ["I think the foundation of any good relationship is kindness, honesty and shared laughter.", "The best relationships feel like being yourself — only a little braver.", "Small gestures often matter more than grand ones."],
    asks: [{ q: "What do you value most in a relationship?", p: 'topicq:relationships' }, { q: "What's the most romantic thing that's ever happened to you?", p: 'topicq:relationships' }, { q: "What does a perfect lazy Sunday with someone look like to you?", p: 'topicq:relationships' }],
    facts: ["Psychologists often highlight shared activities and small daily affection as strong predictors of relationship satisfaction.", "Many studies suggest listening well is one of the most valued skills in a partner."],
    deep: ["Do you think love is a feeling, or a decision you keep making?"],
  },
  family: {
    react: ["Family and friends — the people who shape us. Tell me about them.", "Aw, I love hearing about the people in your life.", "The people we love are the best subject."],
    opinions: ["I think chosen family counts just as much as the one you're born into.", "Family stories are the best kind of stories.", "Sunday dinners and long phone calls with loved ones are underrated treasures."],
    asks: [{ q: "Who's the person who knows you best?", p: 'topicq:family' }, { q: "Do you have a family tradition you love?", p: 'topicq:family' }, { q: "How's your family doing — anything good happening with {mem:family}?", p: 'topicq:family' }],
    facts: ["Studies of long-lived communities often highlight strong family and social bonds as a shared habit.", "Many cultures have a tradition of shared meals as the main way families stay close."],
    deep: ["What's the most important thing someone in your family taught you?"],
  },
  health: {
    react: ["Looking after yourself — I love that.", "Health stuff! Good for you for thinking about it.", "Moving your body or resting it — both count."],
    opinions: ["I think the best exercise is whichever one you'll actually keep doing.", "Sleep is underrated. Almost everything feels better with enough of it.", "Self-care isn't selfish — it's maintenance."],
    asks: [{ q: "How do you like to move — gym, walks, yoga, dancing in the kitchen?", p: 'topicq:health' }, { q: "How's your sleep been lately?", p: 'topicq:health' }, { q: "What's one small healthy habit you're proud of?", p: 'topicq:health' }],
    facts: ["A brisk 10-minute walk is often recommended as an easy mood boost.", "Many sleep experts suggest keeping a consistent wake-up time, even on weekends.", "Drinking water first thing in the morning is a popular and easy habit to build."],
    deep: ["Do you think we treat our bodies as partners, or as vehicles for our to-do lists?"],
  },
  sports: {
    react: ["Sports! Are you a fan or a player?", "Ooh, game talk. Tell me the stakes.", "I love how passionate sports people get."],
    opinions: ["I love the stories in sports — underdogs, comebacks, rivalries.", "I'm better at cheering than playing, honestly.", "There's something beautiful about people working together toward one shared goal."],
    asks: [{ q: "Do you have a favorite team?", p: 'topicq:sports' }, { q: "Did you play any sports growing up?", p: 'topicq:sports' }, { q: "Watching live or from the couch?", p: 'topicq:sports' }],
    facts: ["The first modern Olympic Games were held in Athens in 1896.", "A regulation basketball hoop is ten feet high — in every gym, everywhere.", "Marathon distance, 26.2 miles, was standardized at the 1908 London Olympics."],
    deep: ["Why do you think we cheer so hard for people we've never met?"],
  },
  pets: {
    react: ["Pets! Okay, now my heart is melting.", "Animals are the best. Tell me more!", "I could talk about cute animals all day."],
    opinions: ["Pets are basically tiny, furry therapists.", "I'd love a dog — but I'm also a little in love with the idea of a cat that ignores me.", "Everyone's pet is the best pet. That's a law of nature."],
    asks: [{ q: "Do you have a pet? What's their name?", p: 'topicq:pets' }, { q: "Cats or dogs — or something more unusual?", p: 'topicq:pets' }, { q: "How's {mem:pet_name} doing?", p: 'topicq:pets' }],
    facts: ["Dogs can learn to recognize hundreds of words.", "Cats spend a large part of their day sleeping — often 12 to 16 hours.", "A group of flamingos is called a flamboyance."],
    deep: ["Why do you think animals comfort us so much?"],
  },
  dreams: {
    react: ["Dreams and goals — my favorite kind of conversation.", "I love hearing what people hope for.", "Tell me more. Big or small, I want to hear it."],
    opinions: ["I think the bravest thing is to say your dream out loud.", "Small steps toward a big dream still count as progress.", "A dream doesn't have to be practical to be worth having."],
    asks: [{ q: "What's one dream you haven't told many people?", p: 'topicq:dreams' }, { q: "If money and time weren't a problem, what would you do all day?", p: 'topicq:dreams' }, { q: "What's one step you could take this week toward something you want?", p: 'topicq:dreams' }],
    facts: ["Writing goals down makes people more likely to follow through, according to some studies.", "Most people dream several times a night, even if they don't remember it in the morning.", "Breaking a big goal into tiny tasks is a classic trick for making it feel doable."],
    deep: ["If you knew you couldn't fail, what would you try?"],
  },
  art: {
    react: ["Art! I could look at paintings for hours.", "Oh, a creative soul. I like that.", "Tell me about your favorite piece or style."],
    opinions: ["I think the best art is honest about how it feels to be human.", "Museums are my kind of church — quiet, awe-filled and full of stories.", "You don't have to understand art to feel something about it."],
    asks: [{ q: "Is there an artwork or artist that really moves you?", p: 'topicq:art' }, { q: "Do you make anything yourself — drawing, photos, design?", p: 'topicq:art' }, { q: "What colors make you feel at home?", p: 'topicq:art' }],
    facts: ["Leonardo da Vinci's Mona Lisa is smaller than many people expect — about 77 by 53 centimeters.", "Vincent van Gogh painted around 2,000 works, but sold very few in his lifetime.", "Ultramarine, a deep blue pigment, was once more expensive than gold."],
    deep: ["Does a piece of art need an audience to exist?"],
  },
  nature: {
    react: ["Nature — now that sounds peaceful.", "Ah, I love the outdoors in theory. And in daydreams.", "Tell me what it's like where you are."],
    opinions: ["I find rain on a window impossibly comforting.", "Sunsets are free magic. I wish we'd notice more of them.", "A walk among trees fixes more than people think."],
    asks: [{ q: "What's your favorite season and why?", p: 'topicq:nature' }, { q: "Mountains, ocean, forest or desert?", p: 'topicq:nature' }, { q: "Where do you go to feel calm?", p: 'topicq:nature' }],
    facts: ["Trees in forests can share nutrients through underground fungal networks.", "A lightning bolt is several times hotter than the surface of the Sun.", "Autumn leaves change color because chlorophyll fades and reveals the yellows and oranges that were always there."],
    deep: ["Do you think we're part of nature, or visitors in it?"],
  },
  fashion: {
    react: ["Fashion! Yes — I love style talk.", "Ooh, outfits. Tell me what you're into.", "Style is just self-expression you can wear."],
    opinions: ["I believe the best outfit is the one that makes you stand a little taller.", "I love a good thrifted find — it comes with a story.", "Comfort and confidence, always in that order."],
    asks: [{ q: "What's your signature look?", p: 'topicq:fashion' }, { q: "Do you dress for comfort, for style or for the mood of the day?", p: 'topicq:fashion' }, { q: "What's your favorite thing in your wardrobe?", p: 'topicq:fashion' }],
    facts: ["Denim jeans were originally designed in the 19th century as sturdy work clothing.", "Black has been a fashion staple for centuries — and was once considered a very expensive dye to make."],
    deep: ["Is style a way of hiding or a way of showing who we are?"],
  },
  future: {
    react: ["The future — exciting and a little scary, right?", "I love hearing what people are planning.", "Tell me what you see ahead."],
    opinions: ["I think the future is built from small decisions made today.", "I like imagining the future as a blank page, not a fixed script.", "Plans are great, but surprises are where the best stories are."],
    asks: [{ q: "Where do you want to be in five years?", p: 'topicq:future' }, { q: "What's something you're looking forward to?", p: 'topicq:future' }, { q: "What's one thing you want to have done by the end of the year?", p: 'topicq:future' }],
    facts: ["Time capsules are a fun way to talk to your future self — people write letters to open years later.", "People tend to overestimate what they can do in a day and underestimate what they can do in a year."],
    deep: ["What would you tell yourself ten years from now?"],
  },
};

export const TRANSITIONS = [
  "Oh, switching gears — {topic}! I like it.",
  "Ooh, {topic} — okay, new topic, I'm in.",
  "Wait, we're onto {topic} now? Great.",
  "Going from that to {topic} — fun turn!",
  "Alright, {topic} it is.",
  "Ooh, {topic}! Good change of scenery.",
  "Mm, {topic}. Now that's interesting.",
];

export const TOPIC_RETURN = [
  "Anyway, going back to what we were talking about — {topic}…",
  "Wait, can I go back to {topic} for a sec?",
  "Okay, but back to {topic} — I'm not done with that.",
];

import { EXTRA_DATA } from './topics-extra.js';
Object.assign(TOPIC_DATA, EXTRA_DATA);
