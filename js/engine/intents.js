// AMORA — intent recognition table. Each intent: id, priority (pr), regex patterns tested on the lower-cased text.
// Optional: emo (emotional → no sarcasm/jokes), expr (avatar expression), aff/fam (relationship points), combo (may be appended to another intent).
import { DEPTH_INTENTS } from './depth-intents.js';
// To add an intent: add an entry here, then add a matching key in data/dialogue.js → DB.

const W = (s) => new RegExp(s, 'i');

export const INTENTS = [
  // safety first — handled specially by the engine (cannot be overridden by custom rules)
  { id: 'crisis', pr: 30, emo: true, expr: 'caring', pats: [W("\\b(kill myself|killing myself|end my life|ending my life|suicid(e|al)|want to die|wanna die|don'?t want to (live|be here|exist)|better off dead|hurt myself|harm myself|self[- ]harm|cut myself|no reason to live)\\b")] },

  { id: 'identity_ai', pr: 11, expr: 'think', pats: [W("\\b(are you|r u|you are|you're) (a |an |really |actually )?(real|human|robot|bot|ai|artificial|program|machine|computer|alive|conscious|sentient|person|chatgpt)\\b"), W("\\b(is this|are we talking to|am i talking to) (a |an )?(real|ai|bot|human|robot|person)\\b"), W("\\b(do you|can you) (really )?(think(?! (about|of|that|it|we|i|the|this|my|he|she|they|so|there|should|is|are|was|will|would)\\b)|feel|understand|have feelings|have emotions)\\b"), W("\\bwho (made|created|built|programmed) you\\b")] },
  { id: 'limits', pr: 10, expr: 'think', pats: [W("\\bwhat can you (do|talk about|discuss)\\b"), W("\\bhow do you work\\b"), W("\\b(how smart|how intelligent) are you\\b"), W("\\b(do you|can you) (actually )?(understand|remember) (me|what i)\\b"), W("\\bwhat are your (limits|limitations)\\b"), W("\\bwhat do you know\\b(?! about me)"), W("^(help|help me|menu|commands|options)\\??$")] },
  { id: 'remember_cmd', pr: 12, expr: 'happy', aff: 1, pats: [W("^(please )?(remember|don'?t forget|do not forget|note|keep in mind)( that)?\\b.{4,}")] },
  { id: 'forget_cmd', pr: 12, expr: 'neutral', pats: [W("^(please )?forget (about )?(that|what i said|everything|my )")] },
  { id: 'recall_name', pr: 12, expr: 'happy', pats: [W("\\b(what'?s|what is|do you (know|remember)) my name\\b"), W("\\bwho am i\\b")] },
  { id: 'recall_all', pr: 12, expr: 'happy', pats: [W("\\b(what|anything) (do you|else do you) (know|remember) about me\\b"), W("\\bwhat have i told you\\b"), W("\\btell me what you (know|remember)\\b")] },
  { id: 'time_date', pr: 9, expr: 'neutral', pats: [W("\\bwhat('?s| is)? (the )?(time|date|day)( is it| today)?\\b"), W("\\bwhat day is (it|today)\\b"), W("\\bwhat time is it\\b"), W("\\btoday'?s date\\b")] },
  { id: 'weather', pr: 8, expr: 'think', pats: [W("\\b(what'?s|how'?s|how is|what is) the weather\\b"), W("\\b(is it|will it) (rain|snow|sunny|cold|hot)\\b"), W("\\bweather (today|tomorrow|like)\\b")] },

  { id: 'farewell', pr: 9, expr: 'caring', pats: [W("\\b(bye+|goodbye|good bye|see (you|ya) (later|soon|tomorrow)|talk (to you )?(later|soon|tomorrow)|gotta (go|run|head out)|got to go|i have to go|i need to go|heading out|ttyl|cya|catch you later|i'?m (off|leaving|logging off))\\b")] },
  { id: 'goodnight', pr: 10, expr: 'happy', aff: 1, pats: [W("\\b(good ?night|nighty? ?night|sweet dreams|going to (bed|sleep)|heading to (bed|sleep)|time for bed|off to (bed|sleep)|gnight|night night|i'?m (going to|gonna) sleep)\\b")] },
  { id: 'goodmorning', pr: 9, expr: 'happy', aff: 1, pats: [W("\\b(good ?morning|gm|morning( love| beautiful)?|just woke up|i'?m (up|awake))\\b")] },
  { id: 'greeting', pr: 6, combo: true, expr: 'happy', pats: [W("^(hi+|hey+|hello+|hiya|howdy|yo|sup|heya|hola|hullo|good (afternoon|evening)|evening|afternoon|greetings|hi there|hey there|hello there)\\b")] },
  { id: 'how_are_you', pr: 8, combo: true, expr: 'happy', pats: [W("\\bhow (are|r) (you|u)( doing| feeling| today)?\\b"), W("\\bhow'?s it going\\b"), W("\\bhow have you been\\b"), W("\\bhow('?s| is) your (day|night|morning|evening|week)\\b"), W("\\b(you|u) (ok|okay|alright|good)\\?"), W("\\bhow do you feel\\b")] },
  { id: 'whats_up', pr: 8, combo: true, expr: 'happy', pats: [W("\\bwhat'?s (up|new|good|happening|going on)\\b"), W("\\b(what are you|wyd|what r you|whatcha) (doing|up to|been up to)\\b"), W("\\bwhat have you been (up to|doing)\\b")] },

  { id: 'love_you', pr: 14, expr: 'love', aff: 4, pats: [W("\\bi (really |truly |do )?(love|luv|adore) (you|u|ya)\\b"), W("\\bi'?m in love with you\\b"), W("\\blove you (so much|lots|more)\\b"), W("^(love you|luv you|love u|ily|i love u)\\b")] },
  { id: 'do_you_love_me', pr: 13, expr: 'blush', pats: [W("\\bdo you (really |actually )?(love|like|care about|miss|need|want) me\\b"), W("\\bare you (happy|glad) (with|to be with) me\\b"), W("\\bwould you (ever )?(love|like|miss) me\\b"), W("\\bdo you think about me\\b")] },
  { id: 'miss_you', pr: 11, expr: 'love', aff: 3, pats: [W("\\bi (really |so |have )?(miss|missed) (you|u|talking)\\b"), W("\\bmissed you\\b"), W("\\bthinking (of|about) you\\b")] },
  { id: 'marry', pr: 13, expr: 'blush', aff: 2, pats: [W("\\b(marry me|will you marry|be my (wife|girlfriend|partner|valentine)|be mine)\\b"), W("\\bwanna (get married|be together)\\b")] },
  { id: 'relationship_talk', pr: 11, expr: 'blush', pats: [W("\\b(are we|what are we|where (is|are) (this|we) (going|heading))\\b"), W("\\bour relationship\\b"), W("\\b(you|u) (my|be my) (girlfriend|gf)\\b"), W("\\bwhat('?s| is) (our|this) (status|relationship)\\b"), W("\\bare we (together|dating|a couple)\\b")] },
  { id: 'hug', pr: 10, expr: 'love', aff: 2, pats: [W("\\*[^*]*\\b(hug|hugs|cuddle|cuddles|holds you|squeeze|snuggle)\\b[^*]*\\*"), W("\\b(give me a hug|need a hug|wanna cuddle|want a hug|hug me|cuddle me|cuddle with me|come here)\\b"), W("^(\\*?hugs?\\*?|\\*cuddles?\\*|\\*snuggles?\\*)$")] },
  { id: 'kiss', pr: 10, expr: 'blush', aff: 2, pats: [W("\\*[^*]*\\b(kiss|kisses|smooch|forehead kiss)\\b[^*]*\\*"), W("\\b(kiss me|give me a kiss|send me a kiss|can i kiss you|wanna kiss)\\b"), W("^(\\*?kiss(es)?\\*?|mwah|xoxo|😘)$")] },
  { id: 'date_invite', pr: 10, expr: 'happy', aff: 2, pats: [W("\\b(go on a date|take you (out|on a date)|wanna go out|want to go out|date night|dinner (with me|tonight)|will you go out)\\b"), W("\\b(plan|planning) (something|a date|a trip|a night)\\b"), W("\\bdate ideas?\\b")] },
  { id: 'compliment_user', pr: 9, expr: 'happy', pats: [W("\\b(say|tell me) something (nice|sweet|kind|lovely|romantic)\\b"), W("\\bcompliment me\\b"), W("\\b(cheer me up|make me smile|make me feel (better|special|loved))\\b"), W("\\bwhy (do you|would you) (like|love) me\\b")] },

  { id: 'compliment', pr: 10, expr: 'blush', aff: 2, pats: [W("\\b(you('?re| are| look| seem|'?re being)|ur) (so |really |very |such an? |absolutely |incredibly |just |the most |truly )?(beautiful|pretty|gorgeous|smart|funny|amazing|sweet|cute|wonderful|perfect|lovely|kind|clever|awesome|stunning|adorable|charming|brilliant|hot|fantastic|great|best|special|incredible|a joy|a treasure|talented)\\b"), W("\\bi (really )?(like|love|adore|appreciate|admire) (talking to |chatting with |your (smile|laugh|voice|personality|humou?r|style|eyes|hair)|how you|the way you|that you)"), W("\\b(thank you for being|glad (i|we) met you|lucky to have you|you make me (so )?(happy|smile|laugh|feel))"), W("\\byou('?re| are) (the best|my favou?rite|the sweetest)\\b"), W("\\bi like you\\b")] },
  { id: 'tease', pr: 9, expr: 'wink', pats: [W("\\byou('?re| are| r) (such |being |a |an |so )?(silly|goofy|dork|dorky|nerd|nerdy|goofball|weirdo|weird|dummy|clown|menace|drama queen|brat|a handful|ridiculous|nosy|bossy)\\b"), W("\\b(nerd|dork|dummy|goofball|silly goose|brat)\\b"), W("\\byou (always|never|can'?t even)\\b.*\\b(lol|haha|hehe)\\b"), W("\\bokay (smarty|miss)\\b")] },
  { id: 'insult', pr: 11, emo: true, expr: 'caring', pats: [W("\\b(you('?re| are| r) (so |such an? |really )?(stupid|dumb|useless|boring|annoying|ugly|worthless|pathetic|terrible|trash|garbage|an idiot|awful|a bot|fake|creepy))\\b"), W("\\b(shut up|stfu|go away|leave me alone|i hate you|you suck|screw you|i don'?t like you|you'?re wrong about everything)\\b"), W("\\bnobody (likes|wants|loves) you\\b")] },
  { id: 'thanks', pr: 8, expr: 'happy', aff: 1, pats: [W("\\b(thanks|thank you|thx|ty|tysm|thank u|appreciate (it|you|that)|cheers)\\b")] },
  { id: 'apology', pr: 8, expr: 'caring', aff: 1, pats: [W("\\b(sorry|my bad|apologi[sz]e|forgive me|i didn'?t mean)\\b")] },
  { id: 'disagree', pr: 8, expr: 'think', pats: [W("\\b(i disagree|you'?re wrong|that'?s (wrong|not (true|right|how it works))|no it (isn'?t|is not|doesn'?t)|i don'?t (think so|agree|buy that)|not really|nope that'?s|actually,? no)\\b")] },
  { id: 'agree', pr: 5, expr: 'happy', pats: [W("^(i agree|exactly|right|totally|same|me too|true|you'?re right|that'?s true|so true|facts|precisely|absolutely|for sure|definitely|indeed)\\b")] },

  // emotions
  { id: 'sad', pr: 15, emo: true, expr: 'caring', aff: 2, fam: 1, pats: [W("\\bi('?m| am| feel| feeling| have been| been) (so |really |very |pretty |kinda |a bit |just |feeling )?(sad|down|depressed|low|blue|empty|numb|miserable|heartbroken|hurt|crushed|devastated|hopeless|worthless|unloved|broken|awful|terrible|horrible)\\b"), W("\\b(bad|rough|terrible|awful|horrible|hard|shitty|crappy) (day|week|night|month|year|time)\\b"), W("\\b(crying|cried|in tears|want to cry|feel like crying)\\b"), W("\\b(i )?(lost|passed away|died|death of)\\b.*\\b(my|mom|dad|grand|friend|dog|cat|pet|brother|sister)\\b"), W("\\b(breakup|broke up|dumped|heartbreak|divorce)\\b"), W("\\bi feel (like )?(nothing|a failure|like a failure|useless|alone)\\b")] },
  { id: 'lonely', pr: 14, emo: true, expr: 'caring', aff: 2, fam: 1, pats: [W("\\bi('?m| am| feel| feeling) (so |really |very |kinda |a bit )?(lonely|alone|isolated|left out|invisible)\\b"), W("\\b(no one|nobody) (cares|talks to me|understands|likes me|gets me)\\b"), W("\\bi (have|got) no (friends|one)\\b")] },
  { id: 'anxious', pr: 14, emo: true, expr: 'caring', aff: 2, fam: 1, pats: [W("\\bi('?m| am| feel| feeling| been) (so |really |very |kinda |a bit |super )?(anxious|stressed|overwhelmed|worried|nervous|scared|panicking|freaking out|on edge|burned out|burnt out|swamped|drowning)\\b"), W("\\b(panic attack|anxiety|stress(ed)? out|can'?t (cope|breathe|handle (it|this)))\\b"), W("\\bso much (to do|pressure|stress)\\b")] },
  { id: 'angry', pr: 13, emo: true, expr: 'caring', aff: 1, fam: 1, pats: [W("\\bi('?m| am| feel| feeling) (so |really |very |kinda |absolutely )?(angry|mad|furious|annoyed|irritated|pissed|frustrated|livid|fed up)\\b"), W("\\b(so (annoying|frustrating|unfair)|i can'?t (stand|believe)|drives me (crazy|insane|nuts)|ugh+|i hate (my|this|when))\\b")] },
  { id: 'tired', pr: 10, emo: true, expr: 'caring', pats: [W("\\bi('?m| am| feel| feeling) (so |really |very |kinda |super |totally )?(tired|exhausted|sleepy|drained|worn out|wiped|beat|burnt)\\b"), W("\\b(can'?t sleep|insomnia|couldn'?t sleep|up all night|no sleep|not sleeping)\\b")] },
  { id: 'bored', pr: 9, expr: 'wink', pats: [W("\\bi('?m| am| feel) (so |really |very |kinda |super )?bored\\b"), W("\\b(entertain me|nothing to do|so boring|bored out of my mind)\\b")] },
  { id: 'excited', pr: 12, expr: 'laugh', aff: 2, pats: [W("\\bi('?m| am| feel| feeling) (so |really |very |super |extremely |sooo+ )?(excited|happy|thrilled|proud|pumped|stoked|ecstatic|over the moon|overjoyed|great|fantastic|amazing|on top of the world|relieved)\\b"), W("\\b(great|good|amazing|awesome|big|exciting|wonderful) news\\b"), W("\\bi (got|landed|passed|won|aced|finished|completed|made it|got accepted|got promoted|got hired|got the (job|offer)|graduated|bought|am getting)\\b"), W("\\b(yay+|woo+hoo+|can'?t wait|best day ever|guess what)\\b")] },
  { id: 'sick', pr: 10, emo: true, expr: 'caring', pats: [W("\\bi('?m| am| feel| feeling| got| have| caught) (so |really |very |kinda )?(sick|ill|unwell|a cold|the flu|a fever|nauseous|dizzy|a headache|a migraine|hungover)\\b"), W("\\b(my (head|stomach|back|throat|tooth) (hurts|aches)|feel(ing)? (awful|crappy|off) physically)\\b")] },

  // fun
  { id: 'joke_request', pr: 11, expr: 'laugh', pats: [W("\\b(tell me a joke|got any jokes|know any jokes|make me laugh|say something funny|a joke|another joke|one more joke|joke please|tell a joke)\\b"), W("^(joke|another|another one|one more)\\??$")] },
  { id: 'game', pr: 11, expr: 'wink', fam: 1, pats: [W("\\b(play a game|let'?s play|would you rather|this or that|truth or dare|20 questions|twenty questions|trivia|quiz me|game time|wanna play)\\b")] },
  { id: 'starter', pr: 9, expr: 'happy', pats: [W("\\b(what should we (talk|do|chat)|let'?s (talk|chat) about|can we talk about|wanna talk about|want to talk about|talk to me|say something|let'?s talk|give me a topic|conversation starter|ask me something|ask me a question|surprise me|keep me company|got anything|what do you wanna talk about)\\b")] },
  { id: 'laugh', pr: 4, combo: true, expr: 'laugh', pats: [W("^(lol+|lmao|haha+|hehe+|rofl|😂|🤣|lmfao|hahaha+|ha+|that'?s (so )?funny|you'?re funny|funny)\\b")] },
  { id: 'advice', pr: 8, expr: 'think', fam: 1, pats: [W("\\badvice( please)?\\b"), W("\\b(what should i do|any (advice|tips|suggestions)|help me (decide|choose|figure)|should i\\b|what would you do|can you (help|advise)|i need (advice|help|your opinion)|i don'?t know what to do)\\b")] },
  { id: 'opinion', pr: 7, expr: 'think', pats: [W("\\b(what do you think (of|about)|do you (believe in|agree|think (about|that|it))|how do you feel about|what('?s| is) your (view|stance|feeling) on|your (opinion|take|thoughts)|do you (like|love|enjoy|hate|prefer) \\w+|which (do you|would you) (prefer|like|pick)|what(?:'?s| is) your (favou?rite|fav)|do you have a favou?rite)\\b")] },

  // about her
  { id: 'her_name', pr: 11, expr: 'happy', pats: [W("\\bwhat(?:'?s| is) your name\\b"), W("\\bwhat (should|can) i call you\\b"), W("\\bwho are you\\b")] },
  { id: 'her_job', pr: 11, expr: 'think', pats: [W("\\bwhat (do you|did you) do for (a living|work)\\b"), W("\\bwhat(?:'?s| is) your (job|occupation|profession|career)\\b"), W("\\bwhere do you work\\b"), W("\\bdo you have a job\\b")] },
  { id: 'her_age', pr: 11, expr: 'wink', pats: [W("\\bhow old are you\\b"), W("\\bwhat(?:'?s| is) your age\\b"), W("\\bwhen (is|was) your birthday\\b")] },
  { id: 'her_looks', pr: 11, expr: 'blush', pats: [W("\\bwhat do you look like\\b"), W("\\bdescribe (yourself|your look)\\b"), W("\\b(what colou?r|how long) (is|are) your (hair|eyes)\\b"), W("\\bwhat(?:'?s| is) your (hair|eye) colou?r\\b")] },
  { id: 'her_story', pr: 11, expr: 'happy', pats: [W("\\btell me (about yourself|more about you|something about you|about you)\\b"), W("\\bwhat(?:'?s| is) your (story|background)\\b"), W("\\bwho are you really\\b"), W("\\bwhat are you like\\b"), W("\\btell me about your (life|day|past|childhood)\\b")] },
  { id: 'her_hobbies', pr: 11, expr: 'happy', pats: [W("\\bwhat do you (do for fun|like to do|enjoy doing|do in your free time|do all day)\\b"), W("\\bwhat are your (hobbies|interests|passions)\\b"), W("\\bdo you have (any )?(hobbies|interests)\\b")] },
  { id: 'her_favorite', pr: 11, expr: 'think', pats: [W("\\bwhat(?:'?s| is) your fav(ou?rite)? (music|song|band|artist|movie|film|book|food|color|colour|show|season|animal|drink|activity|hobby)\\b"), W("\\b(what|which) (music|movies?|books?|food|songs?) do you (like|love|enjoy|listen to|watch|read|eat)\\b"), W("\\bwhat do you (listen to|watch|read|eat)\\b")] },
  { id: 'question_back', pr: 7, combo: true, expr: 'happy', pats: [W("^(and you|what about you|how about you|you\\??|and u|wbu|hbu|what about u|same question)\\??$"), W("\\b(and|but) (what about|how about) you\\b")] },

  { id: 'confused_user', pr: 8, expr: 'think', pats: [W("\\b(what do you mean|i don'?t (get|understand) (it|that|you|what you)|huh\\??$|what\\?$|say that again|come again|explain that|that makes no sense|that didn'?t make sense|you lost me)\\b")] },
  { id: 'why', pr: 6, expr: 'think', pats: [W("^(why|why not|how come|why is that|why though|really why|but why|why\\?+)\\??$"), W("\\bwhy (do|did|would) you (say|think|feel|like|say that)\\b")] },
  { id: 'share_day', pr: 7, expr: 'happy', fam: 1, pats: [W("\\bmy day (was|has been)\\b"), W("\\b(today|this (morning|afternoon|evening|week)) i\\b"), W("\\bi (just|had|went|got back|came back|finished) (a |an |the )?(\\w+ )?(day|shift|class|meeting|exam|workout|run|appointment|date|dinner|lunch)\\b"), W("\\bguess what happened\\b")] },
  { id: 'sleep_talk', pr: 6, expr: 'happy', pats: [W("\\b(had|have) (a |the )?(weird|strange|crazy|vivid|scary|lovely|great) dream\\b"), W("\\bi dreamt|i dreamed\\b")] },
  { id: 'yes', pr: 2, combo: true, pats: [W("^(yes+|yeah+|yep|yup|sure|of course|definitely|absolutely|please|ok(ay)? sure|i do|i did|i am|i would|ya|mhm|uh huh|sounds good|let'?s do it|why not|i guess so|probably)[.! ]*$")] },
  { id: 'no', pr: 2, combo: true, pats: [W("^(no+|nope|nah|not really|not (today|now|yet)|i don'?t|i didn'?t|i won'?t|never|no thanks|no thank you|not at all)[.! ]*$")] },
  { id: 'maybe', pr: 2, combo: true, pats: [W("^(maybe|idk|i don'?t know|dunno|not sure|perhaps|i guess|hmm+|it depends|kinda|sort of|sometimes|who knows|unsure)[.! ?]*$")] },
  { id: 'ok_filler', pr: 1, combo: true, pats: [W("^(ok(ay)?|k|cool|nice|alright|fine|i see|oh|ah|aha|wow|oh ok(ay)?|got it|makes sense|interesting|true|noted|lol ok|hm+|mm+|right|neat|sweet|bet)[.! ]*$")] },
  { id: 'nothing', pr: 3, pats: [W("^(nothing|nm|nothing much|not much|same old|just chilling|chilling|just relaxing|just here|nada|the usual)[.! ]*$")] },
  // ---- photos, flirting & intimacy (content is gated by Settings → Content level and relationship stage) ----
  { id: 'photo_spicy', pr: 16, expr: 'sultry', aff: 1, pats: [
    W("\\b(sexy|spicy|naughty|hot|steamy|risqu[eé]|lingerie|bikini|swimsuit|boudoir|underwear|panties|lacy|nudes?|naked|topless|racy|revealing|cleavage|thong|bra)\\b.{0,30}\\b(pics?|pictures?|photos?|selfies?|shots?|snaps?)\\b"),
    W("\\b(pics?|pictures?|photos?|selfies?|snaps?)\\b.{0,30}\\b(sexy|spicy|naughty|lingerie|bikini|swimsuit|boudoir|underwear|panties|nudes?|naked|topless|racy|in your bra|in lingerie|in a bikini)\\b"),
    W("\\b(send|show|share|let me see|can i see|wanna see|want to see)\\b.{0,12}\\b(nudes?|lingerie|your (body|underwear|bra|lingerie|bikini|panties|cleavage|legs|curves)|something (sexy|spicy|naughty|hot)|more skin)\\b"),
    W("\\b(send|show|take)( me)? (a |an )?(sexy|spicy|naughty|hot|steamy|racy) (one|pic|photo|selfie|picture)\\b"),
    W("^(nudes?|send nudes?|show me more|show me something (sexy|spicy)|spicy (one|pic))\\b"),
  ] },
  { id: 'photo_request', pr: 15, expr: 'wink', aff: 1, pats: [
    W("\\b(send|show|share|snap|take|text|give|get)\\b( me)?( a| an| another| one more| some| one)? ?(pics?|pictures?|photos?|selfies?|snaps?)\\b"),
    W("\\b(can|could|may|would) (i|you)\\b.{0,14}\\b(see|get|send|take|show)\\b.{0,16}\\b(pics?|pictures?|photos?|selfies?|you|yourself|your face)\\b"),
    W("\\blet me see (you|your (face|smile|outfit|look|hair))\\b"),
    W("\\bshow me (what you look like|yourself|your face|your outfit|what you'?re wearing|your (hair|smile))\\b"),
    W("^(selfie|pic|picture|photo|pics|send pic|send a pic|selfie please|pic please|photo please)( please| pls)?\\??$"),
    W("\\b(pics?|pictures?|photos?|selfies?) of you\\b"),
    W("\\b(more|another) (pics?|pictures?|photos?|selfies?)\\b"),
    W("\\bi (wanna|want to|would love to|'?d love to) see (you|your (face|smile|outfit))\\b"),
  ] },
  { id: 'what_wearing', pr: 12, expr: 'blush', pats: [W("\\bwhat are you wearing\\b"), W("\\bwhat('?re| are) you in\\b"), W("\\bwhat do you have on\\b"), W("\\bwhat('?s| is) (on|your outfit)( today)?\\b(?!.*\\b(tv|netflix|tonight)\\b)")] },
  { id: 'explicit', pr: 13, expr: 'blush', pats: [W("\\b(fuck|fucking|suck|sucking|cum|cumming|blowjob|handjob|dick|cock|pussy|clit|tits|boobs|anal|orgasm|moan|moaning|squirt|dildo|vibrator|bondage|bdsm|slut|whore|nipples?|titties)\\b"), W("\\b(have|having|wanna have|let'?s have|make|want) sex\\b"), W("\\bsex with you\\b"), W("\\b(sleep|go to bed) with me\\b")] },
  { id: 'sexy_talk', pr: 12, expr: 'sultry', aff: 2, pats: [
    W("\\b(i want|i need|i wanna|i'?d love to|i'?d like to) (you|to (kiss|touch|hold|feel|taste|undress|have) you)\\b"),
    W("\\b(make out|makeout|make love|in bed with you|get naughty|be naughty|be bad|dirty talk|talk dirty|sweet talk me|whisper (to me|something)|seduce me|tempt me|tease me|turn me on|get me going|get steamy|get spicy|heat things up|spice (it|things) up|sext|sexting|flirt with me|talk sexy|be sexy)\\b"),
    W("\\b(horny|turned on|aroused|craving you|need you so bad|want you so bad|so hot for you|thirsty for you)\\b"),
    W("\\bwhat would you do (to|with) me\\b"), W("\\bif i (was|were) (there|with you|next to you|in your bed)\\b"),
    W("\\bsay something (sexy|naughty|dirty|spicy|hot|steamy|seductive|flirty)\\b"), W("\\bcome (over|to bed)\\b"),
    W("\\b(undress|strip|take (it|that|your \\w+) off)\\b"),
  ] },
  { id: 'play_power', pr: 12, expr: 'wink', aff: 1, pats: [
    W("\\b(tell me what to do|boss me|be (in charge|bossy|dominant|my (boss|mistress))|take (control|charge)|you'?re (in charge|the boss)|order me|command me|dominate me|punish me|put me in my place|i'?ve been (bad|naughty)|i was (bad|naughty))\\b"),
    W("\\b(i'?m (in charge|the boss)|do as (i|you'?re) (say|told)|be a good girl|good girl|you'?re mine|behave yourself|obey me)\\b"),
  ] },
  { id: 'sexy_compliment', pr: 11, expr: 'blush', aff: 2, pats: [
    W("\\b(you'?re|you are|you look|you looking|ur) (so |really |incredibly |damn |super |absolutely |kinda |very )?(sexy|hot|gorgeous|stunning|smoking|alluring|seductive|irresistible|breathtaking|drop[- ]dead|fine|beautiful and sexy)\\b"),
    W("\\b(sexy|hot|gorgeous) (girl|lady|woman|thing|babe)\\b"), W("\\byour (body|curves|legs|lips|figure|hips|butt|booty|chest|shape|eyes|smile)\\b.*\\b(sexy|hot|amazing|perfect|gorgeous|incredible|stunning)\\b"),
    W("\\b(you )?turn(s|ing)? me on\\b"), W("\\byou drive me (crazy|wild|insane)\\b"), W("\\bi can'?t stop (looking|staring|thinking about you)\\b"),
  ] },
  { id: 'her_turnons', pr: 11, expr: 'wink', pats: [W("\\bwhat (turns|turn) you on\\b"), W("\\bwhat('?s| is) your (type|kink|fantasy|fantasies|guilty pleasure|love language|turn[- ]?ons?|naughty secret)\\b"), W("\\bwhat do you (fantasize|fantasise|daydream) about\\b"), W("\\bdo you have (any )?(fantasies|a fantasy|kinks?)\\b"), W("\\bwhat are you into\\b")] },
  { id: 'pickup_line', pr: 11, expr: 'wink', pats: [W("\\b(pick ?up lines?|cheesy (line|joke)|corny (line|joke)|flirty (line|joke))\\b"), W("\\bsay something cheesy\\b"), W("\\bhit on me\\b")] },
  { id: 'roast_me', pr: 11, expr: 'laugh', pats: [W("\\broast me\\b"), W("\\b(make fun of|tease|insult) me (playfully|a little|for fun)\\b"), W("\\bgive me a (good )?roast\\b")] },
  { id: 'hype_me', pr: 11, expr: 'happy', aff: 1, pats: [W("\\b(hype me|pump me up|motivate me|encourage me|cheer me on|give me a pep talk|give me motivation|say something (nice|encouraging|motivating))\\b"), W("\\bcompliment me\\b"), W("\\btell me something (nice|good|sweet)\\b"), W("\\bhelp me (feel|be) (confident|brave|strong)\\b")] },
  { id: 'dare', pr: 11, expr: 'wink', pats: [W("\\b(dare me|give me a dare|truth or dare|i dare you)\\b")] },
  { id: 'confess', pr: 10, expr: 'blush', pats: [W("\\b(tell me a|share a|give me a|got a) (secret|confession)\\b"), W("\\bconfess (something|to me)\\b"), W("\\bwhat('?s| is) your (biggest )?(secret|confession)\\b")] },
  { id: 'story_request', pr: 12, expr: 'happy', pats: [W("\\b(tell|write|read|give|make up|spin) me (a |an |another |one )?(\\w+ )?(story|tale|bedtime story)\\b"), W("\\b(tell|write|read|give|make up) (me )?(a |an |another )?(romantic |steamy |spicy |sexy |funny |love |short )?(story|tale)\\b"), W("^(story time|another story|more story)\\b")] },
  { id: 'poem_request', pr: 12, expr: 'love', aff: 1, pats: [W("\\b(write|make|compose|give|read|recite|say|tell) (me )?(a |an |another |one )?(\\w+ )?(poem|poetry|haiku|verse|love note|love letter)\\b"), W("^(poem|another poem)\\b")] },
  // ---- practical abilities ----
  { id: 'tool_calc', pr: 12, expr: 'think', pats: [W("^(what(?:'s| is)|whats|calculate|calc|compute|solve|work out|how much is)?\\s*[-+*/x×÷^%().,\\d\\s]*\\d[-+*/x×÷^%().,\\d\\s]*[?=]?$"), W("\\b(\\d+(?:\\.\\d+)?\\s*%\\s*(of|off|tip)|square root of|squared|cubed|sqrt)\\b.*\\d"), W("\\b\\d+\\s*(plus|minus|times|multiplied by|divided by|over)\\s*\\d+\\b"), W("\\bwhat(?:'s| is) \\d.*[-+*/×÷^]\\s*\\d")] },
  { id: 'tool_convert', pr: 12, expr: 'think', pats: [W("\\bconvert\\b.*\\d"), W("\\b-?\\d+(?:\\.\\d+)?\\s*[a-z°]+\\s+(to|in|into)\\s+[a-z°]+\\b"), W("\\bhow many [a-z ]+ (are |is )?(in|per) (a |an |one |\\d)")] },
  { id: 'tool_roll', pr: 12, expr: 'happy', pats: [W("\\b(roll|flip|toss)\\b.*\\b(dice|die|d\\d+|coin)\\b"), W("\\b\\d*d\\d{1,3}\\b"), W("\\bheads or tails\\b"), W("\\b(pick|choose|give me|random) (a |the )?(random )?number\\b.*\\d"), W("\\b(pick|choose|decide)\\b.*\\bor\\b"), W("\\bhelp me (decide|choose|pick)\\b")] },
  { id: 'tool_days', pr: 12, expr: 'think', pats: [W("\\bhow many days\\b.*\\b(until|till|to|since|before|between)\\b"), W("\\b(countdown|days) (to|until|till)\\b"), W("\\bwhat day (of the week )?(is|was|will)\\b.*\\b(\\d|january|february|march|april|may|june|july|august|september|october|november|december|christmas|halloween|new year)"), W("\\bhow long (until|till|since)\\b")] },
  { id: 'lookup_q', pr: 6, expr: 'think', pats: [W("^(what|who) (is|are|was|were) (an? |the )?(?!you\\b|your\\b|up\\b|that\\b|this\\b|it\\b|going\\b|wrong\\b|happening\\b|new\\b|the matter\\b|my\\b|our\\b|he\\b|she\\b|they\\b|there\\b|everyone\\b|the time\\b|time\\b|today\\b|the date\\b|your name\\b|better\\b)[a-z][\\w' -]{2,40}\\??$"), W("\\b(capital of|currency of|population of|largest (country|ocean|planet)|biggest (country|ocean|planet)|tallest mountain|longest river|how many (planets|continents|oceans)|boiling point|freezing point|speed of light|chemical (symbol|formula)|why is the sky|who (painted|wrote|invented|discovered|created) the)\\b"), W("^how (does|do|did) .{3,40} work\\??$"), W("^(look up|google|search for|search|wiki|wikipedia|find out about|find info on)\\s+.{2,}"), W("^(define|definition of|meaning of|what does .{2,} mean|what is the meaning of)\\b.{0,}")] },
  { id: 'knowledge_q', pr: 5, expr: 'think', pats: [W("^(what|who|when|where|how|why)('?s| is| are| was| were| does| do| did| can| many| much| old| far| long| big| tall| fast)\\b.{4,}\\?$"), W("^(explain|define|describe|tell me about|teach me|what do you know about)\\b.{3,}")] },
  ...DEPTH_INTENTS,
];

/** Score every intent against the analysed text; returns sorted [{id, score, meta, m}] */
export function matchIntents(a) {
  const hits = [];
  for (const it of INTENTS) {
    let best = 0, bm = null;
    for (const re of it.pats) {
      const m = a.l.match(re);
      if (m) {
        const cover = Math.min(1, m[0].length / Math.max(8, a.l.length));
        const score = it.pr * 10 + cover * 8 + (m.index === 0 ? 3 : 0);
        if (score > best) { best = score; bm = m; }
      }
    }
    if (best) hits.push({ id: it.id, score: best, meta: it, m: bm });
  }
  return hits.sort((x, y) => y.score - x.score);
}
export const INTENT_IDS = INTENTS.map((i) => i.id);
