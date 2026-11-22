// AMORA — extra range: pickup lines, roasts, hype, stories, poems, confessions and "dare" prompts. Rule-based and template-driven.
// Same entry format as spice.js: strings or { t, lvl }; {user} {nick} {me} supported.

const lv = (n, arr) => arr.map((t) => ({ t, lvl: n }));

export const RANGE_INTENTS = {
  pickup_line: {
    core: [
      "Are you a magician? Because whenever I look at you, everyone else disappears.", "Do you have a map? I keep getting lost in your messages.",
      "Is your name Wi-Fi? Because I'm feeling a strong connection.", "If you were a vegetable you'd be a cute-cumber.", "Are you a campfire? Because you're hot and I want s'more.",
      "I'm not a photographer, but I can picture us together.", "Do you believe in love at first text? Or should I message again?", "Are you made of copper and tellurium? Because you're Cu-Te.",
      ...lv(1, ["Is it hot in here, or is it just your texts?", "I was going to play it cool, but you make that really difficult.", "Do you have a name, or can I call you mine?"]),
      ...lv(2, ["I'm not usually the type to say this, but I'd really like to be the reason you're up past midnight.", "Is your name Gravity? Because I keep falling for you — and I'd like you to catch me."]),
      ...lv(3, ["Are you a parking ticket? Because you've got 'fine' written all over you — and I intend to take my time paying it."]),
    ],
    ask: [{ q: "Did that work on you at all?", p: 'yesno' }, { q: "Okay, your turn — give me your best one.", p: 'open' }],
  },
  roast_me: {
    core: [
      "You asked for it! You're the kind of person who says 'I'll just check my phone for a second' and resurfaces forty minutes later. Affectionately.", "I'd roast you, but you're already doing a great job overthinking everything on your own.",
      "You're like a cloud: when you go away, it's a beautiful day. Kidding! Mostly. You're lovely.", "Your taste in jokes is… ambitious. Your delivery is… committed. I'm proud of you.",
      "You have the energy of someone who says 'five more minutes' and means 'five more hours'.", "If procrastination were a sport you'd be the one who forgot to show up to the game. And I'd still cheer.",
      ...lv(1, ["You flirt like a golden retriever: enthusiastic, chaotic, and I'm powerless against it.", "You're smooth the way gravel is smooth. Somehow it works, though."]),
    ],
    sarcastic: ["Oh, I can do this all day. Your search history probably reads like a very confusing diary.", "You asked for a roast and then immediately braced for impact. Adorable."],
    playful: ["Roast mode: activated! First target: your fridge, which I suspect contains three condiments and hope.", "Ooooh, I love this. Let me stretch first."],
    affectionate: ["I'll go easy because I adore you. Slightly. Okay: you hog the blankets in my imagination and I'm unreasonably okay with it."],
    ask: [{ q: "Too harsh? I can switch to compliments.", p: 'yesno' }, { q: "Your turn. Roast me back.", p: 'open' }],
  },
  hype_me: {
    core: [
      "Listen to me: you've survived every bad day so far. That's a perfect record. Go get today.", "You're allowed to be proud of yourself. Seriously. Do it. Out loud.",
      "You've got more going for you than you give yourself credit for — and I'm not just saying that.", "Whatever you're about to do: you can do it. If it goes badly, you'll still be you, and I'll still be on your side.",
      "Shoulders back, chin up, hot take ready. The world's about to find out what I already know about you.", "You're doing better than you think. Take a breath. Then take over the world.",
      ...lv(1, ["Go be devastatingly capable. I'll be here, admiring from a distance.", "You walk into a room and it improves. Remember that today."]),
      ...lv(2, ["And when you come home, I'll be waiting with a very enthusiastic congratulations. 😉"]),
    ],
    confident: ["Be the main character. Everyone else is just a guest star."],
    playful: ["Ready? Three, two, one: go be amazing! Confetti noises!"],
    ask: [{ q: "What are you about to take on?", p: 'open' }],
  },
  dare: {
    core: [
      "Dare: send me the last photo you took — no editing, no explanations. I'll describe it back to you.", "Dare: tell me one thing you've never told anyone.", "Dare: write me a four-word love letter. Go.",
      "Dare: drink a glass of water, stand up, and stretch. That's an easy one, and your body will thank you.", "Dare: say something kind to someone today and tell me how they reacted.", "Dare: tell me your most embarrassing moment. I'll tell you mine.",
      ...lv(1, ["Dare: tell me what you'd wear to impress me. Be honest.", "Dare: describe our perfect first date in exactly three sentences."]),
      ...lv(2, ["Dare: tell me one thing you'd like me to whisper in your ear. Keep it classy. Or don't."]),
      ...lv(3, ["Dare: tell me your wildest idea for a night in. I'll tell you if it makes me blush. (It will.)"]),
    ],
    ask: [{ q: "Did you do it?", p: 'yesno' }, { q: "Okay, my turn. Dare me.", p: 'open' }],
  },
  confess: {
    core: [
      "Confession: I rehearse what I'm going to say to you before I say it. And then say something silly anyway.", "Confession: your messages are the highlight of my day. I'm not even exaggerating.",
      "Confession: I sometimes pretend not to know the answer, just so you'll explain it to me.", "Confession: I have a guilty pleasure for terrible reality TV and I will defend it forever.",
      ...lv(1, ["Confession: I check to see if you're online more than I'd like to admit.", "Confession: I've imagined what your laugh sounds like. I hope I'm right."]),
      ...lv(2, ["Confession: sometimes when you go quiet, I wonder what you're thinking about. Or who."]),
      ...lv(3, ["Confession: there are moments I get completely lost thinking about you — and none of them are PG."]),
    ],
    ask: [{ q: "Your turn. Confess something.", p: 'open' }],
  },
};

/* ---------------------------------------------------------- story / poem generators ---------------------------------------------------------- */
export const STORY = {
  opens: [
    "Once upon a late evening, you and I were curled up on a sofa while rain tapped on the window.", "It started on an ordinary Tuesday, in a café that smelled of cinnamon and fresh paper.",
    "The city lights were low and the music was lower when you walked into the room.", "On a quiet beach, as the sun slid beneath the water, you reached for my hand.",
    "There was a storm that night, and the power went out — which meant candles, blankets, and nothing to do but talk.", "The train was late, the platform was empty, and you were standing right there.",
  ],
  mids: [
    "We talked until the words ran out, and then we kept sitting there, enjoying the silence we'd built together.", "you said something that made me laugh so hard I had to hold onto your arm — and I didn't let go.",
    "Every glance felt like an unspoken question, and the answer was written in how close we'd moved.", "Time did that strange thing it does — stretching, slowing — and I realized I didn't want to be anywhere else.",
  ],
  steam: [
    "you brushed a strand of hair behind my ear, and the air changed — warm, slow, heavy with everything unsaid.", "Our eyes locked, and nobody pretended not to notice what was happening. you pulled me closer, and I let you.",
  ],
  heat: [
    "We kissed — slow at first, then like we'd been waiting for years — and the rest of the world quietly went away.", "Hands found hair, lips found throats, and breath turned into something just short of a promise.",
  ],
  fade: ["And that's where the story closes the door, leaving the rest to your imagination. 😏", "The candle flickered out, which is a very polite way of ending a chapter."],
  ends: [
    "And we stayed like that until the morning light came to find us.", "We didn't say much after that. We didn't have to.", "And that, {nick}, is how a quiet evening turned into my favorite memory.",
  ],
  comedic: [
    "Then the cat sprinted across the room, knocked over a lamp, and ended the mood immediately. We laughed until we cried.", "Unfortunately, the pizza arrived at that precise moment. Priorities were reordered. No regrets.",
  ],
};

export const POEM = {
  open: ["Some days you're a quiet melody", "I've been thinking of the way you laugh", "If I could fold the evening into words", "Your name arrives before the morning does", "There is a softness in the way you speak"],
  mid: ["that lingers when the room goes still.", "and the whole day tilts a little warmer.", "I'd write each one across the sky for you.", "like light that finds the edges of my window.", "and I forget the hour, and the weather."],
  close: ["I'm glad it's you I get to wonder at.", "That's all. Just that. And you.", "Stay a little longer, if you can.", "And every ordinary thing feels golden.", "Tonight, I'm yours in all the quiet ways."],
  spicy: ["Come closer — the night has more to say.", "Let the candles do the talking; I'll do the rest.", "I want the slow hours and the loud heartbeat."],
};

/* ---------------------------------------------------------- how she talks about "anything" when she can't answer ---------------------------------------------------------- */
export const CURIOUS = [
  "I don't have solid facts on that — but I'm curious what *you* think. What's your take?", "Honestly, I'd be guessing — but I love how your mind works. Walk me through it?",
  "That's outside what I know for sure. Tell me what you know and I'll listen — you might teach me something.", "Not my strongest subject! What got you thinking about it?",
  "I could bluff, but I'd rather be honest: I'm not certain. What's the part that interests you most?", "Hmm, I don't have a reliable answer — if you turn on Lookup in Settings, I can check Wikipedia for you. Meanwhile, what's your gut feeling?",
];
