# Hard Conversations Assessment
## PRD for Claude Code

---

## What to build

A 10-question behavioural assessment that plots managers on a 2x2 matrix. Two hidden axes: **Initiative** (do you start hard conversations or avoid them) and **Craft** (when you're in one, do you navigate it well). Results in one of four archetypes. After the result reveal, a single email capture screen. No Playbook pitch anywhere on screen — that lives in the email.

**Deploy at:** `bettermanagers.club/hardconversations`

---

## User Flow

```
Landing screen
    ↓
Question 1 of 10 (one at a time, auto-advance on selection)
    ↓
Question 2 ... Question 10
    ↓
Archetype reveal (name + one line only)
    ↓
Email capture screen
    ↓
Thank you screen
```

No progress bar. No back button. No skipping. One question fills the screen. Tapping an answer auto-advances after 300ms — no submit button needed.

---

## Design Tokens

```
Background:   #0F1115
Gold:         #C8A951
White:        #F6F6F4
Muted:        #AAAAB0
Font:         System sans-serif stack
```

- Mobile-first, single column
- Each question: large type, two answer blocks below it
- Answer blocks: full-width tap targets, generous padding
- Selected state: gold left border + very slight background lift (#C8A95115)
- Transitions: slide left on advance, clean and fast

---

## The 10 Questions

Display question text large. Answer options below as two tappable blocks. No labels, no letters, no hint of which axis is being measured.

---

**Q1**
Your 1:1 is in 5 minutes. You've been meaning to bring something up for two weeks. You:

- Open with it. That's why you're here.
- Start with their update. See how the conversation goes.

---

**Q2**
Someone on your team got the outcome right but the way they did it created friction with two other people. You:

- Focus on the outcome. It worked. Don't fix what isn't broken.
- Talk to them about the friction. The how matters as much as the what.

---

**Q3**
Mid-conversation, the other person's eyes go flat. They're still nodding but they've checked out. You:

- Keep going. You've got ground to cover.
- Stop. Ask them what they're thinking.

---

**Q4**
You've just delivered difficult feedback. They say "yeah, fair enough" and move on quickly. You:

- Good. Clean and done.
- Not sure they actually heard it. You follow up later.

---

**Q5**
A team member who usually delivers has been off for three weeks. Not bad enough to escalate. Just… different. You:

- It'll pass. Everyone has patches.
- Something's going on. You find a moment to ask.

---

**Q6**
You're about to tell someone their work isn't good enough. Before you speak, you think about:

- What you need to say.
- How they're likely to receive it.

---

**Q7**
The conversation gets emotional. They're not crying but they're close. You:

- Acknowledge it briefly and keep going. Dwelling makes it worse.
- Pause completely. Let them get there and back before you continue.

---

**Q8**
Two weeks after a difficult conversation, the behaviour hasn't changed. You:

- Go back in. This time with more clarity on consequences.
- Wonder if you were clear enough the first time.

---

**Q9**
You've just realised mid-conversation that you've got the facts wrong. One of your examples isn't accurate. You:

- Adjust quietly and keep the overall point alive.
- Acknowledge it directly. "Actually, I need to correct that."

---

**Q10**
Your best performer says something dismissive in a team meeting. Small, but the room noticed. You:

- Let it go. They're your best performer. Pick your battles.
- Mention it to them later. Privately, briefly, directly.

---

## Scoring Logic

### Axis mapping

| Question | Axis | Option 1 | Option 2 |
|----------|------|----------|----------|
| Q1 | Initiative | High | Low |
| Q2 | Initiative | Low | High |
| Q3 | Craft | Low | High |
| Q4 | Craft | Low | High |
| Q5 | Initiative | Low | High |
| Q6 | Craft | Low | High |
| Q7 | Craft | Low | High |
| Q8 | Initiative | High | Low |
| Q9 | Craft | Low | High |
| Q10 | Initiative | Low | High |

### Axis scoring

**Initiative:** Q1, Q2, Q5, Q8, Q10 (5 questions)
- 3 or more High = High Initiative
- 2 or fewer High = Low Initiative

**Craft:** Q3, Q4, Q6, Q7, Q9 (5 questions)
- 3 or more High = High Craft
- 2 or fewer High = Low Craft

Tiebreaks go Low on both axes.

### Quadrant assignment

| Initiative | Craft | Archetype |
|-----------|-------|-----------|
| High | High | The Coach |
| High | Low | The Bulldozer |
| Low | High | The Thinker |
| Low | Low | The Ghost |

---

## Archetype Reveal Screen

Full screen. Archetype name centred, large, in gold. One line below in white. Then the email capture section below — no gap, no extra copy, no product mention.

### The Coach
**You know when to push and when to hold back.**

### The Bulldozer
**You start things most managers never would. The question is what happens next.**

### The Thinker
**You know exactly what good looks like. You're just not always the one saying it.**

### The Ghost
**The conversations you're avoiding are having themselves — just without you.**

---

## Email Capture Screen

Immediately after reveal. Simple. No explanation of what they'll receive beyond the one line.

```
Want the full picture?

We'll send your complete result — what your archetype 
means, where your blind spots are, and what to focus on next.

[ your work email              ]

[ Send my result → ]
```

- Email field only. No name.
- Button text: "Send my result →"
- On submit: POST to form handler with { email, archetype }
- Use Formspree or similar — CC to decide

### Thank you screen

```
Done. Check your inbox.

Your full Hard Conversations result is on its way to
[email address they entered].
```

No further CTA on screen. The email does the work.

---

## The Four Result Emails

Send immediately on submission. Include archetype in subject line.
No HTML needed — plain text or simple single-column layout.

---

### The Coach

**Subject:** Your result: The Coach

You know when to push and when to hold back.

Most managers develop one or the other. They either have the courage to start hard conversations, or they've learned to navigate them well once they're in one. You've built both.

That's rarer than it sounds. The Coaches on a team are the people others go to when something needs to be said. Not because they're the most senior. Because they can be trusted to say the hard thing without making it harder.

**What this means in practice**

You initiate early — before problems calcify. And when you're in the room, you read the other person. You notice when they've checked out, when they're getting defensive, when they need space. You adjust.

**Your blind spot**

Coaches sometimes underestimate how much the conversation mattered to the other person. You move on. They're still processing. Build in the follow-up — not to check on progress, but to check on them.

**What to do next**

The conversations worth having never stop. Even Coaches benefit from having the words ready before they need them.

The Hard Conversation Playbook is 12 word-for-word scripts for the moments that matter most — plus an AI prompt for each one to adapt to your specific person and situation. $15. Most Coaches buy it to share with their team.

→ https://sudipc.gumroad.com/l/hardconversations

— Sudipto Chanda

---

### The Bulldozer

**Subject:** Your result: The Bulldozer

You start conversations most managers never would. That's the hard part, and you've already got it.

The courage to walk into a difficult room is not teachable in a weekend workshop. Some people spend entire careers avoiding what you do instinctively. When something needs to be said, you say it. That matters.

**What this means in practice**

You don't let things fester. You'd rather have an imperfect conversation than no conversation. Your team knows where they stand with you — and that clarity is a gift, even when it doesn't feel like one in the moment.

**Your blind spot**

The conversation starts before you speak. The other person's nervous system is reading you before you've said a word. When you come in direct and fast, some people hear the message. Others just feel the force of it and shut down — and then you've had the conversation but nothing changes.

The fix isn't to go softer. It's to go slower. Start with a question, not a statement. Let them get there alongside you rather than arriving to find you already there.

**What to do next**

You have the initiative. Adding craft doesn't make you less direct — it makes your directness actually stick.

The Hard Conversation Playbook gives you the opening lines, the diagnostic questions, and the follow-up moves for 12 of the hardest conversations managers face. $15. The scripts won't slow you down. They'll make the impact last.

→ https://sudipc.gumroad.com/l/hardconversations

— Sudipto Chanda

---

### The Thinker

**Subject:** Your result: The Thinker

You know exactly what good looks like. You're just not always the one saying it.

When you do have a hard conversation, you're good at it. You read the room. You think about how the other person will receive what you're saying before you say it. You follow up. You notice when something didn't go the way you meant it to.

The gap isn't skill. It's timing.

**What this means in practice**

You wait for the right moment. The right words. The right conditions. And sometimes those things align and the conversation happens and it goes well. But more often, the moment passes, the problem compounds, and by the time you do speak it's bigger and harder than it needed to be.

**Your blind spot**

The right moment is usually two weeks ago. The conversation you've been turning over in your head right now — rehearsing, waiting on — it's ready. You're ready. The other person is waiting, even if they don't know it yet.

**What to do next**

You don't need to get better at conversations. You need a reason to start them sooner. Having the words ready before you need them removes the last excuse to wait.

The Hard Conversation Playbook is 12 word-for-word scripts — the opening line, the questions, the follow-up. Ready when you are. $15.

→ https://sudipc.gumroad.com/l/hardconversations

— Sudipto Chanda

---

### The Ghost

**Subject:** Your result: The Ghost

The conversations you're avoiding are having themselves — just without you.

Your team is talking. The person you haven't addressed is drawing their own conclusions. The tension you've been hoping will resolve is quietly becoming the new normal. None of this is because you don't care. Most Ghosts care deeply. That's actually part of the problem.

**What this means in practice**

Caring about the outcome makes the conversation feel higher stakes. So you wait until you're sure. Until you have all the facts. Until the moment is right. Until it's so undeniable you have no choice. By then it's harder than it ever needed to be.

**Your blind spot**

Silence reads as acceptance. Every week you don't say something, the other person files it under "this is fine." Your avoidance isn't neutral — it's a signal. Just not the one you mean to send.

**Your honest truth**

The first conversation is the hardest. Not because the words are hard to find — they're not, once you're in it. But because starting feels like the point of no return. It isn't. Most hard conversations, when they happen early, are just conversations. It's the delayed ones that become confrontations.

**What to do next**

Start with one. Pick the lowest-stakes hard conversation you've been avoiding — not the big one, the small one — and have it this week.

The Hard Conversation Playbook gives you the exact opening line so you don't have to find the words yourself. $15. Start with script 1. You'll know which one it is.

→ https://sudipc.gumroad.com/l/hardconversations

— Sudipto Chanda

---

## Notes for Claude Code

- No backend required beyond a form POST handler (Formspree, Buttondown, or similar)
- Pass { email, archetype } in the form payload so the email handler knows which result to send
- If using Formspree: set up four separate forms (one per archetype) or use a single form with archetype as a hidden field and handle routing in the email service
- Archetype is computed in client-side JS — no server scoring needed
- No login, no account, no cookies banner
- No analytics required for MVP
- Routing: single page app or plain HTML at /hardconversations path — CC to confirm with Sudipto how bettermanagers.club handles subdirectory routing
