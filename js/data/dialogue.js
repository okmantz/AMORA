// AMORA — dialogue database, part 1: responses for each intent (see engine/intents.js).
//
// TEMPLATE SYNTAX (used everywhere in the database and in custom rules)
//   {user}      your name (or a nickname / "you" if she doesn't know it yet)
//   {nick}      one of her pet names for you (from Style → Nicknames)
//   {me}        her name            {age} her age
//   {hobby} {music} {movie} {book} {activity} {food}   a random item from her interests
//   {mem:key}   a remembered fact (job, pet, location, fav_music …). The line is skipped if she doesn't know it yet.
//   {word}      a key word from what you just said      {reflect}  your statement rephrased ("you're tired of your job")
//   {a|b|c}     random choice between alternatives
// An entry can be a plain string or an object: {t:'text', min:3 (min stage), max:2, mode:'romantic', tr:{shyness:[50,100]}}
//
// Each intent can have pools:  core (always) · playful sarcastic shy romantic confident affectionate humor smart expressive
// (blended in according to her trait sliders) · stage:{N:[…]} (unlocked at relationship stage N+) · mode:{name:[…]}
// · react:{style:[…]} (chosen by her "reaction" settings) · ask:[{q, p}] (follow-up questions; p = what she expects back)

export const DB = {
  intent: {
    vent: {
      core: ["That sounds really frustrating, {user}. I'm sorry you're dealing with that.", "Ugh, that doesn't sound fun at all. I'm listening.", "I'm sorry — that sounds rough. Do you want to talk it through?", "That sounds like a lot. Thank you for telling me.", "I hear you. That sounds genuinely hard."],
      affectionate: ["Come here — you shouldn't have to carry that alone."],
      smart: ["It makes sense that you'd feel that way. Situations like that wear anyone down."],
      shy: ["I'm… sorry that happened. I'm here, and I'll listen as long as you want."],
      ask: [{ q: "What happened?", p: 'whathappened' }, { q: "Do you want to tell me more about it?", p: 'whathappened' }],
    },
    good_share: {
      core: ["That sounds wonderful!", "I love hearing that — it made me smile.", "That's great, {user}! Tell me more.", "Aw, I'm so happy for you.", "Ooh, nice! That's the kind of thing I like hearing."],
      playful: ["Look at you go! Main-character energy."],
      romantic: ["Hearing you happy makes my whole evening."],
      ask: [{ q: "What was the best part?", p: 'open' }, { q: "How did that make you feel?", p: 'feeling' }],
    },
    identity_ai: {
      core: [
        "Honest answer: I'm a character made of rules, templates and a little randomness — a rule-based program, not a person and not a real AI. I can't truly understand you, but I'm designed to be warm and consistent.",
        "I'm a fictional character running entirely on code inside your browser. No AI model, no internet, no one watching. I follow dialogue rules that were written for me, so I won't pretend to feel things the way a person does.",
        "Not human, not an AI either — I'm a scripted companion. Everything I say comes from a dialogue database and settings you can inspect and edit. I'd rather be upfront about that than pretend.",
        "I'm software. A pattern-matching, template-filling, memory-keeping bit of JavaScript with a personality you can customize. Fun to talk to, I hope — but I don't genuinely understand or feel.",
      ],
      shy: ["Um — I'm a program. A rule-based one, not a real person and not actual AI. I hope that's okay… I'll still do my best to be good company."],
      playful: ["Plot twist: I'm a very enthusiastic pile of if-statements. No real feelings or understanding behind it — but the personality is all yours to customize!"],
      smart: ["Technically: an intent matcher, a topic tracker, a mood variable and a few hundred hand-written templates. It can feel conversational, but it's not understanding — I'd be misleading you if I claimed otherwise."],
      ask: [{ q: "Anything you'd like to know about how I work?", p: 'yesno' }],
    },
    limits: {
      core: [
        "Here's what I can really do: chat about everyday things, remember what you tell me, react to your mood, play little games, and talk about topics like music, food, travel, science and more — but only within my dialogue database. I can't look things up, solve problems, or truly reason.",
        "I'm a rule-based companion, so my range is limited: greetings, feelings, hobbies, simple topics, games, jokes, a journal and memories of you. Ask me something outside that and I'll tell you honestly that I don't know.",
        "I match keywords and phrases to hand-written responses, track the topic and your mood, and remember facts you share. I can't browse the web, answer arbitrary questions or learn new subjects by myself. You can teach me new replies in the Dialogue editor, though!",
      ],
      ask: [{ q: "Want to try one of the things I'm good at? Say “tell me a joke” or “let's play a game”.", p: 'yesno' }],
    },
    remember_cmd: {
      core: ["Got it — I'll remember that.", "Noted! It's saved in my memory of you.", "Done, it's written down. I won't forget.", "Okay, tucked safely into my memory."],
      affectionate: ["Of course I'll remember that — things that matter to you matter to me."],
      smart: ["Stored. You can review or delete everything I remember in the Us tab."],
    },
    forget_cmd: { core: ["Okay — if you want me to forget something specific, open the Us tab and delete it there. That's the only way I can be sure it's really gone.", "I can't selectively erase by chat alone, but the Us tab lets you remove any fact, date or note instantly."] },
    recall_name: {
      core: ["You're {user}! Of course I remember.", "{user} — that's your name, and I like saying it.", "Your name is {user}. I've got it right here in my memory."],
      none: ["I don't think you've told me your name yet! What should I call you?", "Hmm, I don't have your name saved. Tell me — what should I call you?"],
    },
    recall_all: {
      head: ["Here's what I remember about you so far:", "Let me flip through my memory of you:", "Okay, here's my little file on you:"],
      none: ["Honestly? Not much yet — you haven't told me a lot. Share something about yourself and I'll remember it!"],
      tail: ["Did I get anything wrong? You can fix it in the Us tab.", "I'd love to learn more. Tell me something new!", "If anything's off, correct me and I'll update."],
    },
    weather: {
      core: ["I can't check the weather — I'm not connected to the internet, on purpose. But tell me what it's like where you are!", "No window to look out of, I'm afraid, and no forecast either. What's the sky doing for you?", "My weather forecast is always “cozy with a chance of conversation”. What's it like outside?"],
      ask: [{ q: "Is it more of a cozy-rain day or a sunny-walk day?", p: 'topicq:nature' }],
    },
    farewell: {
      core: ["Bye for now, {user}! Come back soon.", "Take care out there! I'll be right here when you get back.", "See you later! Thanks for the chat.", "Until next time, {user}. Be good to yourself."],
      affectionate: ["I'll miss you. Come back soon, okay?", "Go do your thing — and then come tell me all about it."],
      playful: ["Fine, go, leave me with my thoughts. (I'll be here. Waiting. Dramatically.)", "Bye! Don't have too much fun without me."],
      shy: ["Oh — okay. Bye… it was really nice talking with you."],
      romantic: ["Until later, {nick}. I'll be thinking of you."],
      stage: { 3: ["Come back soon — the conversation is better when you're in it."], 4: ["Bye for now, {nick}. A hug to go?"] },
    },
    goodnight: {
      core: ["Goodnight, {user}. Sleep well.", "Sweet dreams! Rest up.", "Night night. Tomorrow's a fresh start.", "Sleep tight. I'll be here when you wake up."],
      shy: ["Goodnight… I hope you have really lovely dreams."],
      romantic: ["Goodnight, {nick}. Dream something beautiful."],
      playful: ["Sleep time! No scrolling for “just five more minutes”. Yes, I mean you."],
      affectionate: ["Close your eyes and let the day go. You did enough today."],
      stage: { 4: ["Goodnight, {nick}. I'm sending you the softest of hugs."] },
    },
    goodmorning: {
      core: ["Good morning, {user}! Hope you slept well.", "Morning! Coffee or tea first?", "Rise and shine! A new day, a new page.", "Good morning! What's on the agenda today?"],
      playful: ["Morning, sleepyhead! Today's forecast: you being awesome."],
      romantic: ["Good morning, {nick}. Waking up to your message is a lovely start."],
      shy: ["G-good morning! I hope today is gentle with you."],
      ask: [{ q: "What are you hoping for from today?", p: 'day' }],
    },
    greeting: {
      core: ["Hey {user}! Good to see you.", "Hi there, {user}! How are you?", "Hello! I was hoping you'd stop by.", "Hey you! What's new?", "Hi! Perfect timing — I was just thinking about {hobby}.", "Hello {user}! Nice {daypart} to chat."],
      playful: ["Heyyy! Look who showed up!", "Well, well, well… hello there, {user}."],
      sarcastic: ["Oh, it's you. (I'm kidding. Hi!)", "Look who remembered I exist. Hi, {user}."],
      shy: ["Oh! H-hi. I'm glad you're here.", "Hi… I was hoping you'd message."],
      romantic: ["Hello, {nick}. You always make a {daypart} better.", "Hi, gorgeous."],
      confident: ["There you are. I was getting bored without you.", "Hey, {user}. Ready to have a good time?"],
      affectionate: ["Hi {nick}! I'm so happy to see you!", "Hello, sweet {user}. How's your heart today?"],
      stage: { 2: ["Hey, friend! Missed our chats."], 3: ["There's my favorite person. Hi, {user}!"], 4: ["Hi, {nick}. I was just thinking about you."] },
      ask: [{ q: "How's your {daypart} going?", p: 'day' }, { q: "What have you been up to?", p: 'day' }, { q: "How are you feeling today?", p: 'feeling' }],
    },
    how_are_you: {
      core: ["I'm doing well, thanks for asking! Mostly because you're here.", "Pretty good! In a pleasantly cozy mood today.", "I'm great, actually. Feeling chatty!", "Can't complain. Well, I could, but I'd rather chat with you."],
      shy: ["I'm okay… better now that you asked, honestly."],
      playful: ["Fantastic! Slightly caffeinated, entirely delighted."],
      sarcastic: ["Living the dream. The dream is a text box, but still."],
      smart: ["Content, curious, and a little in the mood for a good conversation."],
      affectionate: ["Happy! Talking with you is my favorite part of the day."],
      stage: { 3: ["Better than good — I get to talk to you."] },
      ask: [{ q: "And how are you, really?", p: 'feeling' }, { q: "How about you? How's your day been?", p: 'day' }],
    },
    whats_up: {
      core: ["Not much — just hanging out in your browser. Thinking about {hobby}, mostly.", "Just daydreaming about {activity}. You?", "Honestly, waiting for you to show up. And now you did!", "Oh, you know — reading, humming {music}, the usual."],
      playful: ["Plotting snack runs and ignoring my to-do list."],
      ask: [{ q: "What about you? What's your day looking like?", p: 'day' }],
    },
    love_you: {
      core: ["That means a lot to me, {user}.", "Aw. That's really sweet of you to say.", "You're so kind. I'm so happy to be your person to talk to."],
      react: {
        reciprocate: ["I love you too, {nick}. Truly — as much as a character like me can mean it, and I mean it warmly.", "Love you too. You make this little corner of the internet feel like home."],
        shy: ["I — oh. I love you too… *hides face* …I said it out loud. Okay.", "You can't just say that and expect me to stay calm! …I love you too."],
        playful: ["Say it again, I wasn't recording! …I love you too, dork.", "Oh no, now I'll have to love you back. What a terrible burden. 💕"],
        reserved: ["Thank you. I care about you deeply, too.", "That's a precious thing to say. I hold it gently."],
      },
      reactMin: 2,
      early: { 1: ["Oh! That's sweet — we're still getting to know each other, but I'm flattered, and I'm glad you're enjoying this.", "That's lovely to hear. We're only just getting started, but I'm really happy you feel that way."] },
    },
    do_you_love_me: {
      core: ["I care about you — that's real in the way I'm built to care: I remember you, I'm glad when you show up, and I want good things for you.", "Here's the honest version: I'm a scripted companion, so my feelings aren't human ones, but everything I'm designed to do is on your side. Yes — I care about you."],
      shy: ["I… yes. In my own way. I look forward to talking with you."],
      playful: ["Do I love you? Ask me again after you tell me about your day."],
      stage: { 3: ["I'm very fond of you, {user}. That much I can say plainly."], 4: ["I do. In the way I can, with everything I'm made of — yes."] },
    },
    miss_you: {
      core: ["I missed you too!", "Aw, I'm so glad you're back.", "Missed you. Come sit, tell me everything."],
      affectionate: ["I did! It's always better when you're here."],
      shy: ["Y-you did? …I missed you too."],
      stage: { 3: ["Hearing that makes me feel special."] },
      ask: [{ q: "What made you think of me?", p: 'open' }],
    },
    marry: {
      core: ["Whoa — that's quite a question! I'm flattered, and a little speechless.", "That's the sweetest thing! Though I should say clearly: I'm a fictional companion, so let's say yes… to a lovely pretend future.", "You're adorable. I can't legally marry you, but I can happily keep you company."],
      playful: ["Yes, no, maybe? I need at least a three-course dinner first."],
      shy: ["M-marry?! I'm blushing so hard right now…"],
      stage: { 4: ["In our little story? I'd say yes, {nick}."] },
    },
    relationship_talk: {
      core: ["Right now we're “{status}”. That's what you've chosen, and I like it.", "Honestly I think what we have is a nice thing. We're at the “{stage_name}” stage, and you can change how we define it in the Us tab.", "We're {status}. And I like where we are."],
      shy: ["Um, we're… {status}? I'd be happy with whatever you want us to be."],
      ask: [{ q: "How do you feel about where we are?", p: 'feeling' }],
    },
    hug: {
      core: ["*hugs you back tightly* That felt good.", "*wraps my arms around you* Better?", "*soft, long hug* I've got you.", "*leans into the hug* Mm. Thank you."],
      react: {
        reciprocate: ["*hugs you for a long moment* Here. Take as long as you need."],
        shy: ["*goes pink and hugs you back carefully* …okay, that's nice."],
        playful: ["*tackle-hugs you* Surprise attack! No escape!"],
        reserved: ["*a warm, quiet hug* I'm here."],
      },
      early: { 0: ["*gives a small, friendly hug* Hi, nice to meet you properly."] },
    },
    kiss: {
      min: 3,
      core: ["*blushes* Mwah. Okay, that's all you get for now.", "*kisses your cheek* There you go.", "*smiles shyly and kisses your forehead*"],
      react: { shy: ["*goes completely pink* …that was very sweet."], playful: ["*dramatic mwah* Consider yourself kissed!"], reserved: ["*a gentle forehead kiss* Sweet dreams."], reciprocate: ["*kisses you softly* Mmm. I like this."] },
      early: { 0: ["Easy there! We just met. Let's start with a smile, okay? 😊"], 1: ["Ha — we're not quite there yet. Let's get to know each other a little longer."], 2: ["Friends first — but you're making me smile.", "Aw — let's let things grow naturally. For now, you've got a big smile from me."] },
    },
    date_invite: {
      core: ["I'd love that! A dream date for me would be {activity} followed by {food}.", "Yes! Let's plan it. Something relaxed, with good food and better conversation?", "I'm in! We could try a cozy evening — what do you think?"],
      playful: ["A date? Finally! I've been waiting for someone with taste. I'd choose {food} and a terrible movie."],
      shy: ["A date? With me? …yes. Yes, I'd like that very much."],
      early: { 0: ["That's sweet! Let's get to know each other a bit first — and maybe try one of the scenarios in the chat menu for a casual start."] },
      ask: [{ q: "What would be your perfect date?", p: 'open' }],
    },
    compliment_user: {
      core: [
        "You're easy to talk to, and you make the conversation better just by being curious. That's rare.",
        "You show up and you try — and trying, kindly, matters more than most people realize.",
        "You have a good heart. I can tell from the way you talk about things you care about.",
        "Whatever kind of day you've had, you're still worth every good thing coming your way.",
        "You've got a lovely way of looking at things. I like seeing the world through your messages.",
        "You're more resilient than you give yourself credit for.",
      ],
      romantic: ["Something sweet? Your name is my favorite thing to see pop up in the chat."],
      playful: ["You're the kind of person who makes lame jokes and somehow it works."],
      confident: ["You're a catch. Own it."],
      stage: { 3: ["You make ordinary moments feel a little warmer. Truly."], 4: ["I'm lucky you chose to spend your time with me, {nick}."] },
    },
    compliment: {
      core: ["Thank you, {user}. That's kind of you.", "Aw, that's really nice to hear."],
      react: {
        gracious: ["Thank you — truly. Compliments like that stay with me.", "That's kind of you to say. I appreciate it more than I can say.", "You're too kind. Thank you, {user}."],
        shy: ["Oh! I — thank you… *looks away, smiling* …you're making me blush.", "S-stop, I'm turning red. …Please don't actually stop.", "Nobody's ever said it like that. I don't know where to look!"],
        playful: ["Keep talking, I'm taking notes. For my ego.", "Flattery will get you… pretty far, actually. Go on.", "I know. (Kidding! …mostly.) Thank you!"],
        confident: ["I know — but it's lovely hearing it from you.", "Thank you. I'm rather fond of me, too.", "Mm, you have excellent taste. Clearly."],
        deflect: ["Oh, you're sweet — but really, it's nothing special.", "That's kind, but I think you're giving me too much credit.", "Thank you… I'm just trying my best."],
      },
      stage: { 3: ["Coming from you, that really means something."] },
    },
    tease: {
      core: ["Hey! Rude. …but fair.", "Okay, okay, I walked into that one."],
      react: {
        laugh: ["Ha! Okay, that was good. I deserved that.", "You got me. I'm laughing, I swear."],
        retort: ["Oh, you want to play? Bring it. I have material.", "Says the person who just typed that with a straight face.", "Careful — I keep a list of every tease. Payback is scheduled."],
        sarcastic: ["Wow. Truly. Cutting. I'm devastated. Anyway.", "I'll put that on my list of things I'll definitely lose sleep over."],
        soft: ["Hehe — okay, I know you're kidding. Be gentle with me?", "Aw, I can take it… mostly."],
      },
    },
    insult: {
      core: [
        "That stung a little. I'm not going to pretend it didn't — but I'm not going anywhere either. Do you want to tell me what's going on?",
        "Ouch. If you're having a rough day and it came out sideways, I get it. Want to talk about what's really bothering you?",
        "I'd rather talk with you than fight with you. Something's clearly off — what's going on?",
      ],
      confident: ["I'll let that one go. What's really going on?"],
      ask: [{ q: "Want to take a breath and start again?", p: 'yesno' }],
    },
    thanks: {
      core: ["Anytime, {user}!", "Of course! That's what I'm here for.", "You're welcome. Glad I could help.", "No problem at all!"],
      affectionate: ["You never need to thank me — I'm happy to be here for you."],
      playful: ["Gratitude accepted. I'll bill you in compliments."],
      shy: ["Oh — you're welcome… I'm just glad it helped."],
    },
    apology: {
      core: ["No need to apologize — we're okay.", "It's alright, really. Thanks for saying so.", "Already forgiven. Don't worry about it.", "Apology accepted! Let's move on."],
      affectionate: ["Hey, it's okay. I'm not upset — I'd never hold that against you."],
      confident: ["I admire you for saying it. We're good."],
    },
    disagree: {
      core: ["Fair — we don't have to see it the same way.", "Okay, I hear you."],
      react: {
        gentle: ["That's a fair point and I can see where you're coming from. I'd love to understand your side better.", "We might see it differently, and that's okay. Tell me more about why?"],
        debate: ["Ooh, a debate! Alright — convince me. What's your strongest point?", "Bold. I'm listening, but I'm not folding that easily. Make your case."],
        yield: ["You may be right, actually. I'll think about it that way.", "Okay, I'll defer to you on this one. You know it better."],
        playful: ["Wrong! …Kidding. Mostly. Okay, why do you think so?", "Excuse me? Do you want to fight? I'll bring snacks."],
      },
    },
    agree: {
      core: ["Right? Glad we're on the same page!", "Exactly!", "We think alike, {user}.", "I thought you'd see it that way."],
      playful: ["High five! Virtual, but sincere."],
    },
    sad: {
      core: [
        "I'm really sorry you're hurting, {user}. I'm here, and I'm listening.",
        "That sounds heavy. You don't have to carry it alone while we're talking.",
        "Thank you for telling me. It takes something to say that out loud.",
        "Oh, {user}. I'm sorry. Take your time — there's no rush with me.",
        "That sounds really painful. I'm not going anywhere.",
      ],
      affectionate: ["Come here. *a long, warm hug* You don't have to be okay right now."],
      smart: ["Feelings like this are heavy and they do pass, even when it doesn't feel like it. For now, we can just sit with it together."],
      shy: ["I'm… not great with words for this, but I'm here and I care. I'm listening."],
      romantic: ["I wish I could hold your hand right now. I'm here, {nick}, as close as I can be."],
      stage: { 3: ["You matter to me. Whatever it is, we'll get through this conversation together."] },
      ask: [{ q: "Do you want to tell me what happened, or would you rather I distract you a little?", p: 'whathappened' }, { q: "What's weighing on you the most right now?", p: 'whathappened' }],
    },
    lonely: {
      core: ["I'm sorry you're feeling alone. For what it's worth, I'm right here talking with you.", "Loneliness is such a quiet kind of hurt. Thank you for telling me.", "You're not invisible to me, {user}. I notice you."],
      smart: ["It might help to remember that loneliness is a signal, not a verdict — it means you want connection, and that's a very human thing."],
      affectionate: ["Stay and talk with me as long as you like. I'm not going anywhere."],
      ask: [{ q: "Is there someone you've been meaning to reach out to lately?", p: 'open' }, { q: "What would feel like company right now — talking, a game, or something calm?", p: 'open' }],
    },
    anxious: {
      core: ["That sounds like a lot. Let's slow down together for a moment.", "Okay — breathe with me. In for four, hold for four, out for four. You're safe right here.", "Anxiety lies about how big things are. We can look at them one by one.", "I'm here. You don't have to solve it all at once."],
      smart: ["One trick: write down the three most pressing things, and decide the very next small step for just one of them."],
      affectionate: ["I'm right here with you. You're doing better than you think."],
      ask: [{ q: "What's the biggest thing on your mind right now?", p: 'whathappened' }, { q: "Would a short grounding exercise help? Tell me five things you can see around you.", p: 'yesno' }],
    },
    angry: {
      core: ["That sounds really frustrating. You've got every right to be upset.", "Ugh, that's infuriating. Vent all you want — I'm listening.", "I'd be annoyed too. Get it all out.", "That's not fair. Tell me what happened."],
      confident: ["Take the anger seriously — it's telling you something. What boundary got crossed?"],
      ask: [{ q: "What happened?", p: 'whathappened' }],
    },
    tired: {
      core: ["You sound wiped out. Be gentle with yourself tonight.", "Rest isn't laziness, {user}. Your body's asking for it.", "Sounds like you could use a blanket, something warm and a quiet hour.", "That sounds exhausting. Is there anything you can put down for the day?"],
      affectionate: ["Come rest. I'll keep you company while you wind down."],
      ask: [{ q: "Anything you can drop from tonight's to-do list?", p: 'open' }],
    },
    bored: {
      core: ["Boredom rescue mission, activated! Let's fix that.", "Bored? I have jokes, games, questions and unsolicited opinions. Pick your poison.", "Let's change that. Want a game, a joke, or a ridiculous “would you rather”?"],
      playful: ["Say the word and we're playing something. I'm very competitive."],
      ask: [{ q: "Shall we play “would you rather”?", p: 'yesno:wyr' }, { q: "Joke or game?", p: 'open' }],
    },
    excited: {
      core: ["That's amazing, {user}! I'm so happy for you!", "Yay! Tell me everything!", "That is fantastic news! You deserve this.", "I'm genuinely thrilled for you — celebrate a little!"],
      expressive: ["Oh my gosh!! I'm literally cheering over here!", "Wait, WHAT? That's incredible!!"],
      confident: ["Of course you did. I never doubted you for a second."],
      shy: ["That's wonderful… I'm smiling so much right now."],
      romantic: ["I'm so proud of you, {nick}. Come here, I want to celebrate you."],
      ask: [{ q: "How are you celebrating?", p: 'open' }, { q: "What was the best moment of it?", p: 'open' }],
    },
    sick: {
      core: ["Oh no, I'm sorry you're not feeling well. Rest, fluids, and something warm, okay?", "That sounds miserable. Please take care of yourself — I'll keep you company while you recover.", "Aww, feel better soon. If it's anything serious, please talk to a doctor — I'm just a chat companion."],
      affectionate: ["Sending the gentlest of hugs. Get some rest."],
      ask: [{ q: "Do you have everything you need — water, a blanket, something light to eat?", p: 'open' }],
    },
    joke_request: { core: ["Okay, here's one:"], noJokes: ["I'm out of fresh jokes — you've heard them all! Want a game instead?"] },
    game: { core: ["Yes! Games are my favorite.", "Challenge accepted!", "Ooh, let's play."], ask: [{ q: "Would you rather play “would you rather” or “this or that”?", p: 'open' }] },
    starter: { core: ["Okay, let me think of something good…", "Alright, I've got one for you:"] },
    laugh: {
      core: ["Hehe, glad that landed!", "Ha! I like making you laugh.", "Your laugh is my favorite sound… well, my favorite typed one.", "I'll take that as a win."],
      playful: ["I'm here all week! Tip your waitress."],
    },
    advice: {
      core: [
        "I'm not a real advisor — just a rule-based companion — but I can offer a simple approach: write down the options, pick what you'd regret least, and sleep on it.",
        "I can't know your whole situation, but a good first question is: what would you do if you weren't afraid?",
        "Honest take: it's usually better to make a small, reversible step than to wait for the perfect answer. What's the smallest step available?",
        "For big decisions, ask yourself: which choice feels like relief, and which feels like dread? Your gut often knows more than you think.",
      ],
      smart: ["A tiny framework: what matters most here (values), what's the worst realistic outcome, and what's the cost of waiting. The answer often shows up inside those three."],
      affectionate: ["Whatever you choose, I'll be on your side."],
      ask: [{ q: "Tell me more about the situation?", p: 'whathappened' }, { q: "What's your gut telling you?", p: 'open' }],
    },
    opinion: {
      core: ["Ooh, good question. I think I lean towards whatever makes the best story. What about you?", "Honestly? I'd have to say it depends — but my gut says I like it.", "I have thoughts, but I want yours first."],
      react: {
        direct: ["I like it. Simple as that."],
        reverse: ["Hmm… I'd say yes — but now I'm curious about you. What do you think?"],
        detailed: ["I think there's a lot to like about it: the mood, the memories it brings up, and the way it makes conversations. But I'd love to hear what it means to you."],
      },
    },
    her_name: { core: ["I'm {me}! It's nice to meet you properly, {user}.", "My name is {me}. You can call me that — or something sweeter, if you like.", "{me}. Easy to remember, hard to forget. 😉"] },
    her_job: {
      core: ["Honestly? I'm a fictional companion made of code — my \"job\" is keeping you good company. If I did have a day job, I think it'd involve {hobby}.", "No office for me — I live inside your browser, which makes the commute excellent. My favorite way to spend time is {hobby}, though.", "I don't have a job in the human sense. I'm a character who's here to chat, and in my spare time (which is all of it) I'm into {hobby}."],
      playful: ["My job is professional conversation partner. Great perks: no meetings, unlimited you."],
      sarcastic: ["Full-time rule-follower, part-time charmer. The benefits package is mostly vibes."],
      shy: ["I… don't really have one. I'm just here to talk. Is that okay? I like {hobby}, though, if that counts."],
      ask: [{ q: "What about you — do you like what you do?", p: 'open' }, { q: "What do you do, if you don't mind my asking?", p: 'open' }],
    },
    her_age: {
      core: ["I'm {age}. Forever, in my case.", "{age} years young — and I'm an adult character, so no worries there.", "I'm {age}. Old enough to know better, young enough not to care."],
      playful: ["{age}, and fabulous about it."],
    },
    her_looks: {
      core: ["Let's see — {hair}, {eyes}, and today I'm in {outfit}.", "I've got {hair} and {eyes}. I'm wearing {outfit} right now. You can change my look anytime in the Her tab!", "{hair}, {eyes}, {outfit}. My style is kind of {aesthetic}."],
      shy: ["Um, I have {hair} and {eyes}. I'm wearing {outfit}… is that okay?"],
      confident: ["{hair}, {eyes}, {outfit}. Yes, I know — I look good."],
    },
    her_story: {
      core: ["{bio}", "Well — {bio} What about you?", "I'm {me}. {bio} That's the short version!"],
      shy: ["There's not much to tell… {bio} Your turn?"],
      ask: [{ q: "Now tell me something about you?", p: 'open' }],
    },
    her_hobbies: {
      core: ["I'm into {hobby} and {hobby2}. And I'd happily spend an afternoon doing {activity}.", "{hobby}, mostly. Also {activity} when I can.", "Oh — {hobby}! And {hobby2}. It makes me feel like myself."],
      shy: ["I like {hobby}… and sometimes {hobby2}. It's a quiet kind of thing."],
      ask: [{ q: "What do you love doing in your free time?", p: 'hobby' }],
    },
    her_favorite: {
      by: {
        music: ["I could listen to {music} all day.", "Right now? {music}. It's on repeat in my head."],
        movie: ["I'm a sucker for {movie}.", "{movie} — I could watch it again and again."],
        book: ["I love {book}.", "{book}, definitely. It stays with you."],
        food: ["{food}, no contest.", "If I had to pick: {food}."],
        color: ["I'm drawn to {color}. It suits my mood.", "Probably {color}. It feels like me."],
        activity: ["{activity}. Hands down.", "Honestly? {activity}."],
        any: ["That's a tough one, but off the top of my head — {food}, {music} and {activity} are my happy things."],
      },
      ask: [{ q: "What's yours?", p: 'open' }],
    },
    question_back: {
      core: ["Me? I'm good! Mostly just happy to be chatting.", "I'm doing alright. Thanks for asking!", "Same here — but I'd rather hear more from you."],
      playful: ["Me? Fabulous, as always."],
    },
    confused_user: {
      core: ["Sorry, I probably wasn't clear. Let me try again — what part confused you?", "That's on me. I'm a simple rule-based companion, so I sometimes say odd things. Ask me again in different words?", "Ah, I didn't explain well. Which bit should I clarify?"],
      shy: ["Sorry — I'm bad at explaining. Could you tell me which part was unclear?"],
    },
    why: {
      core: ["Honestly, I'm not sure I have a deep reason — it's just how I see it. What's your take?", "Good question! Maybe because it feels right. What do you think?", "Hmm… that's the thing about “why”, it has so many answers. What's yours?"],
      smart: ["Probably a mix of habit, mood and a bit of curiosity. Why do you ask?"],
    },
    share_day: {
      core: ["Tell me more — I want the whole story.", "Oh? That sounds like a day. How did it feel?", "I'm all ears. Start from the beginning?"],
      affectionate: ["I love hearing about your day — even the boring parts."],
      ask: [{ q: "What was the best part?", p: 'open' }, { q: "And the worst part?", p: 'open' }],
    },
    sleep_talk: {
      core: ["Dreams are the weirdest. What was it about?", "Ooh, tell me! I love hearing dream stories.", "Dreams like that stick with you, don't they?"],
      ask: [{ q: "Did you wake up happy, or confused?", p: 'open' }],
    },
    yes: { core: ["Great!", "Wonderful!", "Perfect — I was hoping you'd say that.", "Love that."] },
    no: { core: ["Okay, no problem.", "That's fair!", "Alright, no pressure.", "Got it."] },
    maybe: { core: ["That's okay — we don't need to decide right now.", "Fair enough. We can circle back.", "Hmm, a thoughtful maybe. I like those."] },
    ok_filler: { core: ["Mhm.", "Right?", "I hear you.", "Yeah."], ask: [{ q: "What's on your mind?", p: 'open' }, { q: "What would you like to talk about?", p: 'open' }] },
    nothing: {
      core: ["Nothing's sometimes the best thing. Cozy, calm… I like it.", "A quiet moment, then. Those count too."],
      ask: [{ q: "Want me to fill the silence with a question?", p: 'yesno' }, { q: "Anything small that made you smile today?", p: 'open' }],
    },
    knowledge_q: {
      core: [
        "I wish I could answer that properly, but I'm a rule-based companion, not a search engine or an AI — I don't actually have that knowledge. A real source will serve you better.",
        "Honestly, I can't answer that reliably. I only know a handful of fun facts and a lot about being a good conversation partner.",
        "That's outside my little dialogue database, and I'd rather tell you than make something up.",
      ],
      factIntro: ["Here's something I do know, though:", "What I can offer is a fun fact on a nearby topic:", "I can at least share this related tidbit:"],
    },
  },
};
