const RESEND_API_URL = "https://api.resend.com/emails";
const DEFAULT_FROM = "Hard Conversations <onboarding@resend.dev>";

const emails = {
  "The Coach": {
    subject: "Your result: The Coach",
    text: `You know when to push and when to hold back.

Most managers develop one or the other. They either have the courage to start hard conversations, or they've learned to navigate them well once they're in one. You've built both.

That's rarer than it sounds. The Coaches on a team are the people others go to when something needs to be said. Not because they're the most senior. Because they can be trusted to say the hard thing without making it harder.

What this means in practice

You initiate early - before problems calcify. And when you're in the room, you read the other person. You notice when they've checked out, when they're getting defensive, when they need space. You adjust.

Your blind spot

Coaches sometimes underestimate how much the conversation mattered to the other person. You move on. They're still processing. Build in the follow-up - not to check on progress, but to check on them.

What to do next

The conversations worth having never stop. Even Coaches benefit from having the words ready before they need them.

The Hard Conversation Playbook is 12 word-for-word scripts for the moments that matter most - plus an AI prompt for each one to adapt to your specific person and situation. $15. Most Coaches buy it to share with their team.

https://sudipc.gumroad.com/l/hardconversations

- Sudipto Chanda`,
  },
  "The Bulldozer": {
    subject: "Your result: The Bulldozer",
    text: `You start conversations most managers never would. That's the hard part, and you've already got it.

The courage to walk into a difficult room is not teachable in a weekend workshop. Some people spend entire careers avoiding what you do instinctively. When something needs to be said, you say it. That matters.

What this means in practice

You don't let things fester. You'd rather have an imperfect conversation than no conversation. Your team knows where they stand with you - and that clarity is a gift, even when it doesn't feel like one in the moment.

Your blind spot

The conversation starts before you speak. The other person's nervous system is reading you before you've said a word. When you come in direct and fast, some people hear the message. Others just feel the force of it and shut down - and then you've had the conversation but nothing changes.

The fix isn't to go softer. It's to go slower. Start with a question, not a statement. Let them get there alongside you rather than arriving to find you already there.

What to do next

You have the initiative. Adding craft doesn't make you less direct - it makes your directness actually stick.

The Hard Conversation Playbook gives you the opening lines, the diagnostic questions, and the follow-up moves for 12 of the hardest conversations managers face. $15. The scripts won't slow you down. They'll make the impact last.

https://sudipc.gumroad.com/l/hardconversations

- Sudipto Chanda`,
  },
  "The Thinker": {
    subject: "Your result: The Thinker",
    text: `You know exactly what good looks like. You're just not always the one saying it.

When you do have a hard conversation, you're good at it. You read the room. You think about how the other person will receive what you're saying before you say it. You follow up. You notice when something didn't go the way you meant it to.

The gap isn't skill. It's timing.

What this means in practice

You wait for the right moment. The right words. The right conditions. And sometimes those things align and the conversation happens and it goes well. But more often, the moment passes, the problem compounds, and by the time you do speak it's bigger and harder than it needed to be.

Your blind spot

The right moment is usually two weeks ago. The conversation you've been turning over in your head right now - rehearsing, waiting on - it's ready. You're ready. The other person is waiting, even if they don't know it yet.

What to do next

You don't need to get better at conversations. You need a reason to start them sooner. Having the words ready before you need them removes the last excuse to wait.

The Hard Conversation Playbook is 12 word-for-word scripts - the opening line, the questions, the follow-up. Ready when you are. $15.

https://sudipc.gumroad.com/l/hardconversations

- Sudipto Chanda`,
  },
  "The Ghost": {
    subject: "Your result: The Ghost",
    text: `The conversations you're avoiding are having themselves - just without you.

Your team is talking. The person you haven't addressed is drawing their own conclusions. The tension you've been hoping will resolve is quietly becoming the new normal. None of this is because you don't care. Most Ghosts care deeply. That's actually part of the problem.

What this means in practice

Caring about the outcome makes the conversation feel higher stakes. So you wait until you're sure. Until you have all the facts. Until the moment is right. Until it's so undeniable you have no choice. By then it's harder than it ever needed to be.

Your blind spot

Silence reads as acceptance. Every week you don't say something, the other person files it under "this is fine." Your avoidance isn't neutral - it's a signal. Just not the one you mean to send.

Your honest truth

The first conversation is the hardest. Not because the words are hard to find - they're not, once you're in it. But because starting feels like the point of no return. It isn't. Most hard conversations, when they happen early, are just conversations. It's the delayed ones that become confrontations.

What to do next

Start with one. Pick the lowest-stakes hard conversation you've been avoiding - not the big one, the small one - and have it this week.

The Hard Conversation Playbook gives you the exact opening line so you don't have to find the words yourself. $15. Start with script 1. You'll know which one it is.

https://sudipc.gumroad.com/l/hardconversations

- Sudipto Chanda`,
  },
};

module.exports = async function sendResult(req, res) {
  if (req.method === "OPTIONS") {
    setCorsHeaders(res);
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  setCorsHeaders(res);

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Resend is not configured" });
    return;
  }

  const { email, archetype, initiative_score, craft_score } = req.body || {};
  const resultEmail = emails[archetype];

  if (!isValidEmail(email) || !resultEmail || !isValidScore(initiative_score) || !isValidScore(craft_score)) {
    res.status(400).json({ error: "Invalid result payload" });
    return;
  }

  const resendResponse = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM,
      to: [email],
      subject: resultEmail.subject,
      text: withScoreSummary(resultEmail.text, initiative_score, craft_score),
    }),
  });

  if (!resendResponse.ok) {
    const details = await resendResponse.text();
    console.error("Resend send failed", details);
    res.status(502).json({ error: "Email failed to send" });
    return;
  }

  res.status(200).json({ ok: true });
};

function withScoreSummary(text, initiativeScore, craftScore) {
  return `${text}

---
Assessment scores
Initiative: ${initiativeScore}/5
Craft: ${craftScore}/5`;
}

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidScore(score) {
  return Number.isInteger(score) && score >= 0 && score <= 5;
}

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}
