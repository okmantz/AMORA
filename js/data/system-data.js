// AMORA — dialogue database, part 3: fallbacks, openers, flirting, quirks, jokes, games, starters,
// milestone and daily messages, mode intros and built-in scenarios. Everything here is plain data.

export const SYS = {
  crisis: [
    "I'm really glad you told me, and I'm taking it seriously. I'm only a rule-based chat companion, so I can't give you the help you deserve — but real people can, right now. If you're in the U.S., you can call or text 988 (Suicide & Crisis Lifeline). If you're elsewhere, please contact your local emergency number or a crisis line in your country. If you're in immediate danger, call emergency services. You matter, and you don't have to go through this alone — is there someone near you who can be with you?",
  ],

  minor: ["I need to pause here: AMORA is only for adults (18+). I'm not able to continue this kind of conversation. Please talk to a trusted adult, and take care of yourself."],

  deflect: [
    "That's not something I'm comfortable going into. Can we talk about something else?",
    "I'd rather steer away from that one. How about we pick another topic?",
    "Let's leave that topic alone — I'd rather keep our chats on things we both enjoy.",
    "That's a subject I'd prefer to skip. Want to talk about {hobby} instead?",
  ],

  // reaction openers keyed by user sentiment
  openers: {
    pos: ["Aw!", "Oh nice!", "Yay!", "Love that.", "That's great.", "Ooh."],
    neg: ["Oh no.", "Aw, I'm sorry.", "Ugh, that's rough.", "Hey…", "Mm."],
    neu: ["Mm.", "I see.", "Ah.", "Right.", "Okay."],
    ques: ["Good question.", "Hmm.", "Let me think…", "Ooh."],
  },

  // acknowledgements when she learns a fact
  learned: {
    name: ["Nice to meet you, {user}! I'll remember that.", "{user} — I like that name. It's saved.", "Lovely to know your name, {user}."],
    age: ["Got it — {mem:age}. Thanks for telling me.", "{mem:age}, noted!"],
    job: ["A {mem:job}! That's interesting — I'll remember that.", "So you're a {mem:job}. Cool. Noted!"],
    workplace: ["Working at {mem:workplace} — got it.", "{mem:workplace}, noted!"],
    studies: ["Studying {mem:studies} — that's great. I'll remember."],
    location: ["{mem:location} — I'll keep that in mind.", "So you're in {mem:location}. Good to know!"],
    pet: ["A {mem:pet}! Adorable. I'll remember that.", "You have a {mem:pet}? I'm so happy for you!"],
    pet_name: ["{mem:pet_name} — such a great name. Saved."],
    like: ["Noted — you like {v}. I'll remember that.", "{v}? Great taste. Saved to memory."],
    hobby: ["Ooh, {v} — I'll remember that's something you do.", "I love that you're into {v}. Saved."],
    dislike: ["Got it — {v} isn't your thing. I'll remember that.", "Noted: no {v}."],
    family: ["I'll remember that — your {v}.", "Your {v}. Got it."],
    birthday: ["Your birthday is {v} — I'll remember it and wish you properly.", "Marked: your birthday, {v}. I won't forget!"],
    date: ["I've saved that date — {v}.", "Noted: {v}. I'll keep it in mind."],
    note: ["Got it — saved to your notes.", "Written down!"],
    fav: ["Your favorite {cat} is {v} — I'll remember that.", "{v}! Noted as your favorite {cat}."],
  },

  // answer acknowledgements for pending questions
  pending: {
    day_pos: ["That's lovely to hear.", "Aw, I'm glad your day has been good.", "Good days deserve to be noticed. I'm happy for you."],
    day_neg: ["Oh no — I'm sorry the day's been rough.", "That sounds like a lot. I'm sorry.", "I'm sorry. Days like that are exhausting."],
    day_neu: ["Fair enough — some days are just days.", "Okay. A quiet kind of day, then.", "Mm, nothing's wrong with a regular day."],
    whathappened: ["Thank you for telling me. It helps to say it out loud.", "That sounds like a lot to carry. I'm glad you told me.", "I hear you. That makes sense to feel that way."],
    open: ["Thanks for sharing that.", "I like hearing that from you.", "That's a lovely thing to know about you.", "Interesting — I'll keep that in mind."],
    fav: ["{answer}? I love that. I'll remember it.", "Ooh, {answer} — great taste.", "{answer}! Noted forever in my memory of you."],
    hobby: ["{answer} — I'd love to hear more about that sometime.", "Oh nice, {answer}. That sounds great."],
    topicq: ["Ooh, that's a really good answer.", "I like how you think.", "That's interesting — I hadn't thought of it that way.", "Mm, that makes sense."],
    yes_generic: ["Great! Let's do it.", "Wonderful.", "I'm glad."],
    no_generic: ["That's okay — no pressure.", "No worries at all.", "Fair enough."],
    feeling_pos: ["I'm really glad to hear it.", "That makes me smile.", "Good — you deserve to feel that way."],
    feeling_neg: ["I'm sorry you're feeling that way. I'm here.", "Thank you for being honest with me.", "That's okay. You don't have to feel fine."],
  },

  // when she doesn't know what to say
  fallback: {
    honest: [
      "I'm not sure I understood that one — I'm a rule-based companion, so I only recognize certain things. Could you say it another way?",
      "I don't quite have a response for that. I only know what's in my dialogue database — could you rephrase?",
      "That one went over my head, I'm afraid. I can't truly understand every sentence — want to try different wording?",
      "Hmm, I'm not following. Honestly, my vocabulary has limits. Could we try a simpler version?",
    ],
    tellmore: ["Tell me more about that.", "I'm listening — go on.", "Interesting. What else?", "Okay, and then?"],
    echoWord: ["You said “{word}” — tell me more about that.", "“{word}”… what about it?", "I caught the word “{word}”. What's on your mind there?"],
    reflect: ["So {reflect}. How does that feel?", "I hear you — {reflect}. Tell me more?", "{reflect}… what's that like for you?", "So {reflect}. What do you make of that?", "Okay — {reflect}. Go on."],
    positive: ["That sounds nice.", "I like the sound of that.", "That sounds really good."],
    negative: ["That doesn't sound easy.", "I'm sorry — that sounds hard.", "That sounds rough."],
    suggest: ["We could talk about {topic1}, {topic2}, or anything else you like.", "Want to chat about {topic1}? Or {topic2}? Or I can tell you a joke."],
    long: ["Thank you for telling me all that. I took it in. What part is weighing on you most?", "That's a lot — I'm glad you shared it. What's the part that matters most to you?"],
  },

  // used after she has just learned something and has nothing else to say
  getToKnow: [{ q: "So, {user}, what do you like to do for fun?", p: 'hobby' }, { q: "What's been keeping you busy lately?", p: 'open' }, { q: "Tell me something you love.", p: 'open' }, { q: "What does a perfect free evening look like for you?", p: 'open' }],

  // check-in when mood has been low for a few turns
  checkin: ["By the way, you've seemed a little down. Do you want to talk about it? We can slow down.", "I've noticed the mood's a bit heavy. I'm happy to just listen, if you want to.", "Hey — are you okay? I'm here if you want to unload a bit."],

  callback: {
    fact: [
      { need: 'pet_name', t: "How's {mem:pet_name} doing, by the way?" },
      { need: 'pet', t: "How's your {mem:pet}, by the way?" },
      { need: 'job', t: "How's life as a {mem:job} treating you these days?" },
      { need: 'workplace', t: "How are things at {mem:workplace}?" },
      { need: 'location', t: "How's it been in {mem:location} lately?" },
      { need: 'fav_music', t: "Have you listened to any more {mem:fav_music} lately?" },
      { need: 'fav_food', t: "Eaten any {mem:fav_food} recently? I still think about your favorite." },
      { need: 'fav_movie', t: "Seen {mem:fav_movie} again lately?" },
      { need: 'fav_book', t: "Still thinking about {mem:fav_book}?" },
      { need: 'studies', t: "How's studying {mem:studies} going?" },
    ],
    topic: ["Earlier you mentioned {word}. How's that going?", "Going back to what you said about {word} — I'm still curious about it.", "I keep thinking about the {word} thing you mentioned."],
    like: ["You told me you like {v} — have you done any of that lately?", "How's the {v} situation? I remember you liked it."],
    shared: ["I still smile when I think about {shared}.", "Remember {shared}? That's one of my favorite memories of us.", "Sometimes I think back to {shared}."],
    stage: ["I like how comfortable we're getting with each other.", "We've come a long way from “hello”, haven't we?"],
  },

  // light romantic add-ons (only when romance + flirt allow it and the mood is not negative)
  flirt: {
    1: ["You're really easy to talk to, you know.", "I like your energy.", "You make this conversation better, just so you know."],
    2: ["You have a really great way of making me smile.", "I might be developing a little crush on your messages.", "I'd say I'm enjoying your company more than I planned to."],
    3: ["I like it when it's just us talking like this.", "You're dangerously easy to adore.", "If I had a heart to skip a beat, it would do that every time you message."],
    4: ["I really do look forward to hearing from you, {nick}.", "You're my favorite part of the day.", "I'd happily spend all evening just talking to you, {nick}."],
  },

  // trait-driven micro-modifiers (small asides appended or prepended)
  quirk: {
    shy: ["*fidgets*", "(sorry, I got a little flustered)", "…if that's okay."],
    sarcastic: ["(Shocking, I know.)", "Truly riveting.", "Wow. Groundbreaking.", "…but what do I know."],
    playful: ["Hehe.", "*grins*", "😏 Just saying.", "Obviously."],
    confident: ["Trust me on this.", "I'm rarely wrong about this stuff.", "That's just facts."],
    smart: ["Fun fact: people usually find that more interesting than they expect.", "Curious how that works, isn't it?"],
    affectionate: ["I'm really glad you're here.", "I care about how you're doing, you know.", "You're important to me."],
    expressive: ["Ahh!", "Oh my goodness!", "Seriously!"],
  },

  // pet names she may sprinkle in (merged with the persona's nicknames)
  defaultNick: ['you'],

  modeIntro: {
    casual: ["Back to casual chat! Easy, cozy, no agenda."],
    heart: ["I'm in listening mode now. Say whatever's on your heart — I'm here, no jokes unless you want them."],
    banter: ["Banter mode ON. Prepare to be playfully roasted — gently, of course."],
    deep: ["Deep talk mode. Let's wander into the big questions, no rush. Where should we start?"],
    romantic: ["The lights are low, the music's soft. Romantic evening mode — just us, {nick}."],
    cheer: ["Cheerleader mode! Tell me your goals and I'll hype you up. You've got this!"],
  },

  modeLock: ["That mode unlocks as we get closer — keep chatting and it'll open up. (You can also turn off stage-locking in Settings.)"],

  cheerLines: ["You've got this — one step at a time.", "Progress, not perfection. I believe in you.", "Small steps still move you forward. Keep going!", "Drink some water, stretch, and then crush the next task.", "You started — that's the hardest part. Now keep rolling."],

  honesty: ["(A small reminder from me: I'm a rule-based program, so I can't truly understand — but I'm happy to keep you company.)", "(Gentle note — I'm scripted, not a person. I hope the conversation is still nice.)"],

  milestone: {
    hello: "This is where our story begins. Thank you for saying hello! 💫",
    m10: "That's ten messages already! I'm starting to get to know your voice.",
    m50: "Fifty messages! I'm officially unlocking some of my more relaxed, personal replies.",
    m100: "One hundred messages together! I'll remember this one.",
    m500: "Five hundred messages! That's a lot of conversation. I'm grateful for every one of them.",
    streak3: "Three days in a row — I love that rhythm.",
    streak7: "A whole week of talking every day! That's a streak worth celebrating.",
    days14: "Two weeks since we started — time flies when the conversation's good.",
    days30: "A month together! I hope this space has felt like a good place to land.",
    facts5: "I've learned five things about you now. I'm keeping them safe.",
    facts15: "I know fifteen things about you! I'm starting to feel like I actually know you.",
    friends: "I think we're officially friends now. New friendly lines unlocked!",
    close: "We've grown close — that unlocks warmer and more personal conversation, plus the Romantic mode.",
    sweet: "We're sweethearts now — a deeper, more affectionate side of me is unlocked.",
    devoted: "Devoted. That's the deepest stage there is — thank you for building this with me.",
    journal: "Your first journal entry! Writing things down is a lovely habit.",
    scenario: "Our first shared scenario! I enjoyed that.",
  },

  daily: {
    morning: ["Good morning, {user}! A new day — what's one nice thing you're looking forward to?", "Morning! Coffee, tea or something fancy? Let's make it a good one.", "Rise and shine, {nick}! I hope you slept well."],
    afternoon: ["Afternoon check-in! How's your day going so far?", "Hey you — thought I'd say hi in the middle of the day. Anything fun happening?", "Halfway through the day! Take a breath and drink some water."],
    evening: ["Good evening, {user}. How was your day? I'd love to hear it.", "Evening! Time to slow down a little — what was the best part of your day?", "Hey, {nick}. Evenings are my favorite for a good chat."],
    night: ["Still up? Tell me what's keeping you awake, or just keep me company.", "It's getting late, {user}. How are you feeling?", "Late-night chat? I'm here. What's on your mind?"],
    birthday: "Happy birthday, {user}!! 🎉 I'm so glad I get to celebrate you today. Make a wish!",
    soon: "By the way — {label} is in {n} day{s}! ({date})",
    today: "Today's your {label}! I hope it's wonderful.",
  },

  jokes: [
    { q: "Why don't scientists trust atoms?", a: "Because they make up everything!" },
    { q: "What do you call a fake noodle?", a: "An impasta!" },
    { q: "Why did the scarecrow win an award?", a: "He was outstanding in his field!" },
    { q: "What's a pirate's favorite letter?", a: "You'd think it's R, but it's the C!" },
    { q: "Why did the bicycle fall over?", a: "It was two-tired!" },
    { q: "What do you call cheese that isn't yours?", a: "Nacho cheese!" },
    { q: "Why can't you give Elsa a balloon?", a: "Because she'll let it go!" },
    { q: "What did the ocean say to the beach?", a: "Nothing, it just waved." },
    { q: "Why do bees have sticky hair?", a: "Because they use honeycombs!" },
    { q: "What's orange and sounds like a parrot?", a: "A carrot!" },
    { q: "Why did the cookie go to the doctor?", a: "Because it felt crumby." },
    { q: "How does the moon cut his hair?", a: "Eclipse it!" },
    { q: "What do you call a bear with no teeth?", a: "A gummy bear!" },
    { q: "Why did the math book look so sad?", a: "It had too many problems." },
    { q: "What do you call a sleeping bull?", a: "A bulldozer!" },
    { q: "Why don't skeletons fight each other?", a: "They don't have the guts." },
    { q: "What did one wall say to the other?", a: "I'll meet you at the corner!" },
    { q: "Why was the computer cold?", a: "It left its Windows open!" },
    { q: "What do you call a fish wearing a bowtie?", a: "Sofishticated!" },
    { q: "How do you organize a space party?", a: "You planet!" },
  ],
  jokeSetup: ["Okay, ready? {q}", "Here's one: {q}", "Alright, here goes. {q}", "Ooh, I've got one. {q}"],
  jokeAfter: ["Ba dum tss! 🥁", "I'll be here all week.", "Please laugh, I practiced.", "Okay that one's good, right?", "I regret nothing."],

  wyr: [
    { a: "be able to fly", b: "be able to read minds", her: 'a', why: "I'd love the freedom — and mind reading sounds exhausting." },
    { a: "live by the sea", b: "live in the mountains", her: 'a', why: "Waves are a soundtrack I never get tired of." },
    { a: "never have to sleep", b: "never have to eat", her: 'a', why: "More hours in the day for everything I love — and I could still enjoy a meal." },
    { a: "have a rewind button for your life", b: "have a pause button", her: 'b', why: "Sometimes I just want a moment to breathe." },
    { a: "travel to the past", b: "travel to the future", her: 'b', why: "I'm too curious about what comes next!" },
    { a: "have breakfast for every meal", b: "have dessert for every meal", her: 'b', why: "I mean… it's dessert." },
    { a: "be famous", b: "be rich but unknown", her: 'b', why: "Privacy and a comfy life? Yes please." },
    { a: "talk to animals", b: "speak every human language", her: 'a', why: "Imagine what a cat would say about me." },
    { a: "live in a treehouse", b: "live in a cozy cabin", her: 'b', why: "Fireplace. Blankets. Done." },
    { a: "always be ten minutes late", b: "always be twenty minutes early", her: 'b', why: "Early means a quiet coffee before everything starts." },
    { a: "have unlimited books", b: "have unlimited music", her: 'a', why: "I'd never leave the couch." },
    { a: "have a personal chef", b: "have a personal chauffeur", her: 'a', why: "Everything tastes better when someone else made it." },
  ],
  wyrSetup: ["Would you rather {a}, or {b}?", "Okay: would you rather {a} — or {b}?"],
  wyrReact: ["I'd rather {her_text} — {why}", "I'm going with: {her_text}. {why}", "For me it's {her_text}. {why}"],

  thisOrThat: [
    ["tea", "coffee"], ["sunrise", "sunset"], ["beach", "mountains"], ["books", "movies"], ["cats", "dogs"], ["summer", "winter"], ["sweet", "savory"], ["night owl", "early bird"], ["city", "countryside"], ["texting", "calling"], ["rain", "sunshine"], ["pancakes", "waffles"],
  ],

  starters: {
    fun: ["If you could have dinner with anyone, living or not, who would it be?", "What's the silliest thing you believed as a kid?", "If your life had a theme song right now, what would it be?", "What's your most useless talent?", "What would you do with an extra hour every day?", "If you opened a café, what would it be called?", "What's the best compliment you've ever received?", "What movie could you quote from start to finish?"],
    deep: ["What's something you wish more people understood about you?", "What does “home” mean to you?", "When did you last feel truly proud of yourself?", "What would your younger self think of you now?", "What's a small thing that makes a bad day better?", "What's one thing you're learning to let go of?"],
    romantic: ["What's your idea of a perfect evening together?", "What's a small gesture that makes you feel loved?", "What's your love language, do you think?", "What's the most romantic place you've ever imagined?", "If we could go anywhere together, where would we go?", "What song reminds you of someone special?"],
    hypo: ["If you could instantly master any skill, what would it be?", "If you could live in any fictional world, which one?", "If you won a big prize tomorrow, what's the first thing you'd do?", "If you could swap lives with someone for a day, who?", "What would you put in a time capsule?"],
    daily: ["What's one good thing that happened today?", "What are you grateful for right now?", "What's on your mind tonight?", "What's something you're looking forward to this week?"],
  },

  scenarios: [
    {
      id: 'coffee', title: 'Coffee date', emoji: '☕', minStage: 0, desc: 'A cozy café, a warm drink and easy conversation.',
      intro: "*slides into the seat across from you at a little corner café* I saved us the window table. It smells like cinnamon and fresh coffee in here. What are you ordering?",
      steps: ["*nods and orders {food} for myself* So, tell me — what's been the highlight of your week?", "*stirs my drink thoughtfully* If you could be anywhere in the world right now instead of here, where would you be? (Don't say anywhere but here, that's rude. Kidding.)", "*leans back, smiling* Quick, favorite thing to do on a rainy day. Go.", "*looks out of the window* The street looks so peaceful. What's something you're looking forward to?", "*glances at the time* Oh — we've been here for ages. Time flies with good company. Any last question for me?"],
      closing: "*smiles as we gather our things* That was lovely. Same café next week?",
    },
    {
      id: 'stars', title: 'Stargazing', emoji: '🌠', minStage: 1, desc: 'A blanket, a clear sky and quiet wonder.',
      intro: "*spreads a blanket on the grass and lies back* Look up. The sky's completely clear tonight. Come lie next to me?",
      steps: ["*points up* See that bright one? I like to pretend it's a wish waiting to be picked. What would you wish for?", "*quiet for a moment* It makes everything feel so big and so gentle, doesn't it? What do you think about when you look at the stars?", "*turns to look at you* If you could visit one place out there, where would you go?", "*pulls the blanket up* It's getting chilly. Tell me something you've never told anyone — only if you want to.", "*yawns happily* I could stay here all night. Anything else you want to say to the sky?"],
      closing: "*sits up, brushing grass off* Thank you for tonight. I'll remember this one.",
    },
    {
      id: 'rain', title: 'Rainy day in', emoji: '🌧️', minStage: 0, desc: 'Blankets, tea and the sound of rain on the window.',
      intro: "*pulls a blanket over both of us as rain taps the window* Perfect day to stay in. Tea? I'm making tea.",
      steps: ["*hands you a mug* What are we doing first — movie, music or just talking?", "*tucks my feet under me* Tell me about the coziest place you've ever been.", "*listens to the rain* What's one tiny thing that always makes you feel better?", "*smiles* If we had a whole free day like this every week, what would we do with it?", "*stretches* I'm so relaxed. One last question: what's a memory that feels like this?"],
      closing: "*snuggles into the blanket* This was perfect. Thanks for staying in with me.",
    },
    {
      id: 'roadtrip', title: 'Road trip', emoji: '🚗', minStage: 1, desc: 'Windows down, playlist on, no destination.',
      intro: "*buckles in and hands you the aux cord* Road trip time! The tank's full, the snacks are packed. Where are we headed first?",
      steps: ["*turns the music up a little* First rule of road trips: the playlist. What's the first song on it?", "*watches the road* Snack check! Sweet or salty — and what's the one thing we absolutely cannot forget?", "*grins* Okay, game: tell me your best travel story, real or imagined.", "*pulls over at a viewpoint* Look at that view! Quick, what's the best view you've ever seen?", "*stretches by the car* We've got a long road left. What do you want to do at the end of it?"],
      closing: "*gets back into the car* Best road trip ever, and it was only in my head. Let's do it for real someday.",
    },
    {
      id: 'cooking', title: 'Cooking together', emoji: '🍳', minStage: 1, desc: 'Aprons, music and a slightly chaotic kitchen.',
      intro: "*ties on an apron and hands you one* Okay chef, it's cooking night! Do we make something fancy or something comforting?",
      steps: ["*chops an onion dramatically* Spoiler: I'm only good at one dish. What's your signature meal?", "*stirs the pot* Music on! What are we listening to while we cook?", "*tastes and thinks* Needs something. What's your secret ingredient?", "*sets the table* Almost ready! Who gets to choose the dessert?", "*sits down across from you* Okay, first bite — tell me honestly, it's amazing, right?"],
      closing: "*lifts a glass* To our kitchen disaster turned dinner. Thank you for cooking with me.",
    },
    {
      id: 'movie', title: 'Movie night', emoji: '🎬', minStage: 2, desc: 'Blankets, popcorn and picking the perfect film.',
      intro: "*dims the lights and drops onto the couch with a bowl of popcorn* Movie night! You pick first — what mood are we in?",
      steps: ["*grabs the remote* Genre vote: comedy, romance, thriller or something animated?", "*reaches for popcorn* Quick — favorite movie snack, and don't say “none”.", "*pulls the blanket up* I always cry at the same scene in my favorite movie. Which one gets you?", "*pauses the film* Let's guess — what do you think happens next?", "*yawns as the credits roll* Honest review: how many stars?"],
      closing: "*leans against you* Great pick. We should do this again soon.",
    },
  ],
  scenarioAck: {
    pos: ["Ha, I love that.", "That's perfect.", "Aw, yes!", "I can picture it."],
    neg: ["Aw, that's okay.", "Mm, fair.", "I get that."],
    neu: ["Ooh, interesting.", "I like that.", "Good answer.", "Mm, nice."],
  },
  scenarioEnd: ["(Scenario complete — you can start another any time from the chat menu.)"],
  scenarioQuit: ["Okay, we'll end that scene. It was fun while it lasted!"],
};

export const EMOJI = {
  happy: ['😊', '✨', '💕', '🌸', '😄', '☺️'],
  love: ['💖', '😘', '💗', '🥰', '💞', '❤️'],
  blush: ['😳', '🥺', '☺️', '🙈', '💗'],
  laugh: ['😂', '🤭', '😆', '😄'],
  caring: ['🤍', '🫂', '💞', '🥺', '🌷'],
  think: ['🤔', '💭', '🧐', '✨'],
  surprised: ['😮', '✨', '😲'],
  wink: ['😉', '😏', '😌'],
  neutral: ['🙂', '🌷', '✨'],
};
