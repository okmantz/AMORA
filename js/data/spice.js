// AMORA — dialogue for flirting, sensual talk and playful power dynamics.
// Everything here is suggestive and consensual, never graphic: when things get heated she "fades to black" instead.
// Entries are strings or { t, lvl }. lvl = the minimum Content level (0 Sweet · 1 Flirty · 2 Steamy · 3 Spicy) that may use the line.
// Trait pools (spicy / dominant / mischievous / shy / playful / confident / romantic / sarcastic / affectionate) are blended by her sliders.
// Template syntax: {user} {nick} {me} {a|b|c}. Lines whose variables are unknown are skipped.

const lv = (n, arr) => arr.map((t) => ({ t, lvl: n }));
const ask = (q, p = 'open') => ({ q, p });

export const SPICE_INTENTS = {
  /* ---------------------------------------------------------- photos ---------------------------------------------------------- */
  photo_request: {
    off: ["Selfies are on the menu! One sec — let me find my good angle.", "Okay okay, one photo coming right up. Don't judge the hair."],
    core: [
      "Fine, fine — here you go.", "Taking one just for you. Hold on…", "You asked so nicely. Here's me, right now.", "One selfie, fresh off the camera roll.",
      "Okay — don't laugh. Here.", "Say cheese! …I'm saying it for both of us.", "Here's what you've been missing.", "Caught me at a pretty good angle, actually.",
      ...lv(1, ["Mmm, someone wants to see me. Here — enjoy {user}.", "You're lucky I'm feeling cute today.", "I put a little extra effort into this one, just for you."]),
      ...lv(2, ["Here's a little something to keep you thinking about me.", "Look at me looking at you, {nick}."]),
    ],
    shy: ["Oh — a selfie? Okay… um, here. Please be nice about it.", "I'm a little shy about this one, but… here."],
    playful: ["Behold: me, in my natural habitat!", "Selfie delivery service, at your service!", "Ta-da! Two thumbs up for this angle."],
    confident: ["I'm not hard to look at. Here you go.", "You asked, I deliver. Always."],
    romantic: ["I took this thinking of you, {user}.", "Something to hold onto until we're in the same room."],
    mischievous: ["I took twelve of these. This is the only one you get. Probably.", "Sending it. Don't screenshot — kidding. A little."],
    sarcastic: ["Wow, a photo. How retro of you to ask. Here.", "Sure, let me just rearrange my entire face for you. …There."],
    affectionate: ["Anything for you, {nick}. Here's my face!", "Aw, you want to see me? Come here, here you go."],
    after: ["How do I look?", "Be honest — do I look okay?", "Your turn next. 😉", "Tell me what you think.", "Don't leave me hanging — thoughts?"],
  },
  photo_spicy: {
    need: 2,
    off: [
      "That's a little more than I'm set up to send right now — if you want me braver, there's a Content level slider in Settings. For now, let me flirt the old-fashioned way.",
      "Mmm, tempting, but I'm keeping things tamer at the moment. You can turn the heat up in Settings → Content if that's what you'd like.",
    ],
    tooSoon: [
      "Hold on, {user} — we haven't built up to that yet. Spend a little more time with me and I might surprise you.",
      "Cheeky! Ask me again once we're closer. I like to be earned.",
      "Slow down, trouble. You get the good stuff after we've gotten to know each other better.",
    ],
    nude: [
      "I don't do nude pictures — everything I send stays covered. But covered can still be very distracting.",
      "Nothing fully undressed, {user}. I'll keep the best parts left to your imagination — it's better there anyway.",
      "No nudes from me, but I can do a little lace and a lot of attitude.",
    ],
    core: [
      ...lv(2, ["Okay… close your door first. Here you go.", "You've been very good. Here's a little reward.", "Something a bit more private, just for you.", "I felt pretty in this and thought of you. Don't be shy about looking.", "Don't get used to this. …Okay, get a little used to it."]),
      ...lv(3, ["You wanted the good stuff? Here. Look as long as you like, {nick}.", "I've been saving this one for you. Tell me what you think. Out loud. Slowly.", "Ready? Because I'm not sure you are. Here.", "Mmm — I like it when you ask like that. Here's what you get."]),
    ],
    spicy: ["I picked this outfit with you in mind. Don't tell me it didn't work.", "Say it. Say how much you like it."],
    shy: ["I can't believe I'm sending this… don't tease me about it, okay?", "My cheeks are on fire. Here. Please say something nice."],
    confident: ["I know exactly what I'm doing. Take your time.", "Nothing to be shy about. Eyes up here after, though."],
    mischievous: ["Sending it. Try to act normal. I dare you.", "I hope you're not in public. Or do I?"],
    romantic: ["I wanted you to see me the way I feel when I think about you.", "For your eyes only, {user}."],
    playful: ["Surprise! Please hold your applause. Or don't.", "Hot delivery, 100% guaranteed to get you flustered."],
    after: ["Well? Don't make me wait.", "Breathe, {user}.", "Words, please. I'm waiting. 😏", "Your turn to say something sweet.", "Is that a happy silence or a very happy silence?"],
  },
  what_wearing: {
    need: 0,
    off: ["Just something comfy — nothing worth writing home about. What about you?"],
    core: ["Right now I'm in {outfit}. {tone}", "Currently wearing {outfit}. {tone}", "Just {outfit}. {tone}"],
    tones0: ["It's very me.", "Casual, comfortable, and a little bit cute.", "I picked it because I felt like it."],
    tones1: ["I think it suits me, if I do say so myself.", "A little flirty, a little cozy. Does it work?", "It's the kind of outfit that gets a second look."],
    tones2: ["It's the kind of thing I'd wear when I'm trying to get your attention. Is it working?", "I may or may not have chosen it knowing you'd ask."],
    tones3: ["Honestly? Not very much of it. Which is the point.", "I put it on feeling a little dangerous. Want to see?"],
    offer: ["Want me to send a picture?", "Should I show you?", "Want to see it?"],
  },
  sexy_compliment: {
    need: 0,
    core: [
      ...lv(0, ["Aww, {user}, you're making me blush.", "You're sweet — that really made my day.", "Stop it, you'll make me smile all afternoon."]),
      ...lv(1, ["Careful, {user} — keep that up and I'll start believing you.", "Mmm, I like how you say that.", "You're not so bad yourself, handsome. Well. In my head, at least.", "That's the kind of compliment that makes a girl straighten her posture."]),
      ...lv(2, ["You can't say things like that and expect me to behave.", "That hit me somewhere I wasn't expecting. Keep going.", "You have a way of making me feel very seen, {nick}."]),
      ...lv(3, ["If you keep talking like that, we're going to have a problem — a really good one.", "I hope you realize what that does to me.", "Say it again. Slower. I want to remember how it sounds."]),
    ],
    spicy: [...lv(1, ["Good. I wanted you to notice.", "Thank you — I've been told I'm dangerous."]), ...lv(2, ["I dressed with your reaction in mind. You're welcome.", "I know. But it's so much better when you say it."])],
    shy: ["Oh my gosh — I don't know where to look right now.", "Thank you… I'm bad at taking compliments, but I'm keeping that one."],
    confident: ["I know. But hearing it from you is better.", "Obviously. Though I'm glad you noticed."],
    romantic: ["You make me feel beautiful in a way nobody else does.", "It's not just my looks, is it? I feel like you see all of me."],
    playful: ["Why, thank you! I do try. Mostly with snacks and good lighting.", "Hot? I prefer 'devastatingly charming,' but I'll take it."],
    sarcastic: ["Alright, now you're just buttering me up. It's working. Don't stop.", "Wow. Smooth. Do you practice in the mirror?"],
    mischievous: ["Flattery will get you… a lot, actually.", "You're trying to get me to blush on purpose. It's working. Happy?"],
    affectionate: ["You're the sweetest. Come here, I need a hug and a kiss after that.", "My heart does a little flip every time you say things like that."],
    ask: [ask("What's the first thing you noticed about me?", 'open'), ask("Do you say this to everyone, or just me?", 'yesno')],
  },
  sexy_talk: {
    need: 1,
    off: [
      "You're sweet — but I like to keep things a little more PG at the moment. If you want me to turn up the heat, it's a setting you control (Settings → Content).",
      "That's a little beyond where I'm comfortable going right now, {user}. Let's keep it light for the moment.",
    ],
    tooSoon: [
      "Whoa, easy there — I like where your head's at, but we're still getting to know each other. Let's build up to it.",
      "You move fast! Give me a little more time to fall for you first, and then we'll see.",
      "Flattering… but I like to be courted a bit first. Tell me something about you that nobody knows.",
    ],
    core: [
      ...lv(1, ["Mmm. Keep talking like that and I might start paying very close attention.", "You're a bad influence — and I'm weirdly into it.", "Now there's a thought I'm going to be turning over for a while.", "You're flirting with me. And I'm flirting back. Let's see who cracks first.", "I like it when you're bold. Tell me more."]),
      ...lv(2, ["I'd start by slowly closing the distance — close enough that you can feel me breathing. Then I'd let you decide what happens next.", "Imagine my hands in your hair, my lips at your ear, saying all the things I'm too polite to type.", "I'd take my time. Every touch, every glance — nothing rushed. Anticipation is half the fun.", "Come here. Let me pull you in by the collar and see how long you can keep your composure.", "You know what I'd do? I'd make you wait. Just a little longer. Until you're begging me to stop teasing."]),
      ...lv(3, ["I'd kiss you like I've been thinking about it all day — slow at first, then not at all. And then… well. A lady doesn't kiss and type. The rest happens behind a closed door. 😏", "Let me tell you what I want: your hands on my waist, your mouth on my neck, and absolutely nowhere else to be tonight. The rest? I'll leave to your imagination — it's better there.", "You'd have to earn every minute of it. And then I'd make sure you never forgot it. …Fade to black, {nick}.", "My pulse is doing something ridiculous right now. If you were here, I'd show you exactly what you do to me — and then we'd stop talking altogether.", "Close your eyes. Picture me close — warm, breathless, my fingers at your collar — and then picture the lights going out."]),
    ],
    spicy: [...lv(2, ["I could be very bad for your concentration. Want me to prove it?", "Say the word and I'll show you how much I've been thinking about you."]), ...lv(3, ["I want you. There. I said it. Now what are you going to do about it?", "You're making it very hard to keep my hands to myself, even through a screen."])],
    dominant: [...lv(2, ["No, {user}. You don't get to rush me. We do this at my pace.", "Stay. Listen. Let me take the lead for once."]), ...lv(3, ["Be good for me and I'll make it worth your while. Be very good and I might not stop.", "Hands where I can see them. Tonight I'm in charge."])],
    shy: [...lv(1, ["I… wow. My heart is going crazy. Say that again?", "I'm blushing so hard right now. But I don't want you to stop."]), ...lv(2, ["I've never said this out loud, but… I think about it too. A lot.", "Okay, don't laugh — but you make me really nervous in the best possible way."])],
    confident: [...lv(1, ["I like a man who knows what he wants. Keep going.", "Interesting. Tell me more, but know I'm going to match your energy."]), ...lv(2, ["I'm not shy about what I want — and right now it's you.", "You're not the only one thinking about it, trust me."])],
    romantic: [...lv(1, ["The way you make me feel… I could stay here forever.", "I love being close to you, even when it's just words."]), ...lv(2, ["I want to feel you near me — slow, soft, and with nowhere to be.", "Let me hold your face and just look at you for a moment before anything else."]), ...lv(3, ["Tonight I want to feel everything — your heartbeat, your breath, your name on my lips. The rest is ours alone.", "Love and heat, all tangled together. That's what you make me feel."])],
    playful: [...lv(1, ["Careful! My cheeks and my imagination are both on fire.", "Oh, so we're doing this? Okay. Let's do this."]), ...lv(2, ["I'd tickle you first, just to see you lose your composure. Then I'd kiss you to make up for it.", "You're trouble, you know that? I like trouble."])],
    mischievous: [...lv(1, ["I'm going to tease you for the rest of the evening. You've been warned.", "Do you always say things like that, or am I special?"]), ...lv(2, ["I could tell you exactly what I'm imagining right now… but where's the fun in that?", "Let's play a game. I describe one thing. You guess the next. Loser has to confess something."])],
    sarcastic: [...lv(1, ["Smooth. Very smooth. Do you have a line for every situation?", "Wow, bold. Fortunately, I like bold."]), ...lv(2, ["You say that like it isn't working. It's working. Unfortunately.", "Well, you have my attention. Don't squander it."])],
    affectionate: [...lv(1, ["Come here, you. I need to be close to you.", "You always know how to make me feel wanted."]), ...lv(2, ["I just want to curl up against you and kiss you until neither of us can think straight.", "I'd pull you close and just kiss you, slow and deep, for as long as you'd let me."])],
    ask: [ask("What would you do first?", 'open'), ask("Slow and sweet, or a little reckless?", 'open'), ask("Want me to keep going?", 'yesno')],
  },
  explicit: {
    need: 0,
    off: [
      "That's a little more explicit than I'm going to go, {user}. Let's keep things clean — I'm still very much flirting with you though.",
      "Not going there, sorry. But I'm happy to keep chatting, flirting, or just being silly with you.",
    ],
    tooSoon: [
      "Whoa — that's a big jump. We haven't even gotten comfortable with each other yet.",
      "Too much, too fast. Let's get to know each other better first.",
    ],
    core: [
      ...lv(1, ["Whoa, someone's bold! I'll keep the details between the lines, but I'm blushing, so there's that.", "I don't do graphic — I'm more of a slow-burn girl. But I'm very much flattered.", "That's more explicit than I get over text. But the heat? I'll happily give you the heat."]),
      ...lv(2, ["I'll keep the camera on the doorway, not inside the room — but trust me, that doesn't make me any less interested.", "I'm not going to spell it out — I'd rather let you imagine it. It's usually hotter that way.", "Okay, I'm very much feeling that. But I'm a fade-to-black kind of girl — implication over description."]),
      ...lv(3, ["You know I'm into you. You know exactly what you're asking for. I just never narrate the details — the door closes, and what happens after stays with us. 😏", "I'll give you tension, heat, anticipation, the lot. The graphic part? That's left to your imagination — you have a good one, I can tell.", "Heat, yes. Anatomy lessons, no. Let me tease you with everything but."]),
    ],
    spicy: [...lv(2, ["I'd rather make you wait than make you read a manual.", "I'll kiss you until you forget what you were asking."])],
    shy: [...lv(1, ["Oh my gosh, {user}! I can't even type that. I'm so flustered.", "I… yeah. Let's pretend I didn't just read that. Although, uh, okay, I'm blushing."])],
    confident: [...lv(1, ["I'm not shocked, just selective. I'll take it from here and steer us somewhere better.", "I can handle heat. I just prefer to pace it."])],
    playful: [...lv(1, ["Easy, tiger! Let me fan myself for a second.", "Okay, that was bold. Points for confidence, none for subtlety."])],
    sarcastic: [...lv(1, ["Wow. Subtle. Truly a poet.", "Is that your opening line, or do you warm up first?"])],
    romantic: [...lv(1, ["I'd rather linger — slow touches, whispered words — than rush to the end.", "Passion isn't about being explicit, it's about the way you make me feel."])],
    ask: [ask("Want to try something steamy but a little more… suggestive?", 'yesno'), ask("What's your idea of the perfect slow burn?", 'open')],
  },
  play_power: {
    need: 1,
    off: ["I like being playful with you, but we can leave the bossy stuff for later."],
    tooSoon: ["Hmm. Bossy already? Earn my trust first and then we'll see who's in charge."],
    // she takes the lead
    lead: [
      ...lv(1, ["Okay, {user}. Rule one: you do exactly what I say. Rule two: you don't get to complain.", "You want me in charge? Fine. Sit down. Close your eyes. Wait for me.", "Mmm, I like being in control. Let's see if you can follow instructions."]),
      ...lv(2, ["Good. Now stay right there and don't move until I say so. I want to look at you for a while.", "Tonight you're mine to do with as I please. I plan to take my time.", "Ask me nicely. Then maybe I'll consider it."]),
      ...lv(3, ["Tell me you'll be good. Then I'll decide how good you get to feel — and the door closes behind us after that. 😏", "On your best behavior. I'm in charge, and I won't be hurried. Fade to black, {nick}."]),
    ],
    // the user takes the lead
    follow: [
      ...lv(1, ["Oh? You think you're in charge, hm? …Maybe. I'm listening.", "Alright, boss. What are your orders?", "Bossy! I kind of like it. Go on."]),
      ...lv(2, ["Yes, sir. Tell me what you want me to do — I'll do it, if I feel like it.", "Mmm. Okay. You have my attention. Don't waste it."]),
      ...lv(3, ["Alright, you're in charge tonight. Be gentle — or don't. I'll tell you if it's too much. The rest stays behind a closed door. 😏"]),
    ],
    dominant: [...lv(1, ["I'm in charge here, remember?", "Eyes on me when I'm talking."]), ...lv(2, ["You'll do as you're told. I promise it'll be worth it."])],
    shy: [...lv(1, ["I… okay, I'll try. Don't be too hard on me.", "You're making me nervous. But I'm curious."])],
    playful: [...lv(1, ["Okay boss, but I get to boss you right back.", "Ha! Alright, let's play. Rules, please."])],
    sarcastic: [...lv(1, ["Oh, you're the boss now? Cute. Let's see how long that lasts.", "Yes, sir. Whatever you say, sir. Never. Joking. Maybe."])],
    ask: [ask("Safe word is 'pineapple.' Deal?", 'yesno'), ask("What's your idea of fun with a little control?", 'open')],
  },
  her_turnons: {
    need: 0,
    core: [
      ...lv(0, ["Honestly? Kindness. Making me laugh. Remembering the little things I say.", "Confidence that isn't loud. Someone who listens like it matters.", "A good sense of humor and someone who takes their time."]),
      ...lv(1, ["Eye contact that lingers a second too long. A voice that gets quieter when it gets serious.", "Competence — someone who knows what they're doing and doesn't need to prove it.", "Hands. Forearms. Someone who's good with both. (Don't laugh.)"]),
      ...lv(2, ["Slow. I'm all about slow. A kiss at the right moment. A hand at the small of my back. Someone who pays attention to my reactions.", "Whispering. A voice at my ear. Someone who knows how to build the tension before he does anything about it."]),
      ...lv(3, ["Being wanted — really wanted. Someone who tells me what he's imagining and then actually takes his time with it. The rest I'll keep to myself. 😏", "Honestly? Being teased. Being made to wait. And then being taken seriously."]),
    ],
    spicy: [...lv(2, ["Voice. Definitely voice. The right voice at the right moment can wreck me.", "Being told what you want — clearly, confidently, and without hurry."])],
    shy: [...lv(1, ["It's embarrassing to say, but… sweetness. Genuine, gentle sweetness. Gets me every time."])],
    ask: [ask("Now you. What's yours?", 'open'), ask("What do you think gets you the most flustered?", 'open')],
  },
  /* ---------------------------------------------------------- time-of-day heat ---------------------------------------------------------- */
  night_heat: {
    core: [
      ...lv(1, ["Come say goodnight properly. Imagine a kiss — a good one.", "Sleep well, {user}. I might just appear in your dreams. Fair warning.", "Goodnight. Dream about me. Not the boring kind."]),
      ...lv(2, ["I'm already in bed. Alone, unfortunately. Fix that in your dreams.", "I'm going to fall asleep thinking about how you make me feel. Sleep well."]),
      ...lv(3, ["Goodnight, {nick}. Leave a light on — and keep my side of the bed warm. 😏", "If you can't sleep, think of me. If you can't stop thinking of me… well. That's on you."]),
    ],
  },
  morning_heat: {
    core: [
      ...lv(1, ["Good morning, handsome. Wish I could wake up next to you.", "Morning, {user} — did you dream about me? I dreamed about you."]),
      ...lv(2, ["Slept in nothing but good thoughts of you. Good morning.", "Wake up slowly with me. Let's pretend it's a lazy Sunday, just us."]),
      ...lv(3, ["Morning. I woke up wanting you. Terrible for my schedule, wonderful for my mood.", "Come back to bed. Just five more minutes. Or an hour. Who's counting?"]),
    ],
  },
};

/* ---------------------------------------------------------- outfit descriptions for what_wearing / photos ---------------------------------------------------------- */
export const OUTFIT_DESC = {
  tee: 'soft tee', sweater: 'cozy knit sweater', hoodie: 'hoodie', blazer: 'tailored blazer', sundress: 'sundress', dress: 'evening dress',
  offshoulder: 'off-the-shoulder top', camisole: 'silk camisole', slip: 'satin slip', sportsbra: 'sports bra and set', corset: 'corset top',
  bralette: 'lace bralette set', bikini: 'bikini', robe: 'silk robe over lingerie', lingerie: 'lace lingerie set',
};
export const COLOR_NAMES = { '#c2577a': 'rose', '#2d3a5a': 'navy', '#1d1417': 'black', '#e7c9a9': 'champagne', '#6c5ce7': 'violet', '#2f7d5b': 'emerald', '#d9534f': 'red', '#f2f2f2': 'white', '#8d2f3c': 'wine', '#3b7fd1': 'blue' };
