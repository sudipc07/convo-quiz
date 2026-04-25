const RESEND_API_URL = "https://api.resend.com/emails";
const DEFAULT_FROM = "Better Managers Club <onboarding@resend.dev>";
const SECTION_HEADERS = new Set([
  "What this means in practice",
  "Your blind spot",
  "Your honest truth",
  "What to do next",
]);

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
    text: `Something needs to be said. You're just not sure what - or when.

You're not avoiding hard conversations because you don't care. You're avoiding them because you don't have a way in. You sense the problem - the tension, the underperformance, the thing everyone's working around - but when you try to imagine the actual conversation, it feels like standing at the edge of a cliff with no guardrail.

So you wait. And the longer you wait, the bigger it gets. And the bigger it gets, the less you want to start.

What this means in practice

Problems that could have been small conversations three weeks ago are now big conversations you dread. Your silence isn't neutral - the other person reads it as "everything is fine" and keeps doing what they're doing. The gap between what you see and what you say gets wider every week.

Your blind spot

It's not one gap. It's two. You hold back from starting (that's initiative), and when you do start, you're not sure what to say or how to say it without making things worse (that's craft). Most advice tells you to "just have the conversation" - which is useless when you don't have the words.

Your honest truth

You need both things at once: a reason to start, and the words to start with. One without the other doesn't work. Courage without craft damages. Craft without courage stays silent. You need both.

What to do next

Don't start with the hardest conversation. Start with the smallest one. And don't wing it - go in with the words already written down.

The Hard Conversation Playbook gives you the exact opening line, the follow-up questions, and the tone for 12 of the hardest conversations managers face. Plus an AI prompt for each one that adapts it to your actual person. $15. Start with script 1.

https://sudipc.gumroad.com/l/hardconversations

- Sudipto Chanda`,
  },
};

export function onRequestOptions({ env }) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(env),
  });
}

export async function onRequestPost({ request, env }) {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    return json({ error: "Resend is not configured" }, 500, env);
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return json({ error: "Invalid JSON payload" }, 400, env);
  }

  const { email, archetype, initiative_score, craft_score } = payload;
  const resultEmail = emails[archetype];

  if (!isValidEmail(email) || !resultEmail || !isValidScore(initiative_score) || !isValidScore(craft_score)) {
    return json({ error: "Invalid result payload" }, 400, env);
  }

  const resendResponse = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL || DEFAULT_FROM,
      to: [email],
      subject: resultEmail.subject,
      text: resultEmail.text,
      html: renderEmailHtml(resultEmail.text),
    }),
  });

  if (!resendResponse.ok) {
    const details = await resendResponse.text();
    console.error("Resend send failed", details);
    return json({ error: "Email failed to send" }, 502, env);
  }

  return json({ ok: true }, 200, env);
}

export function onRequest({ env }) {
  return json({ error: "Method not allowed" }, 405, env);
}

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidScore(score) {
  return Number.isInteger(score) && score >= 0 && score <= 5;
}

function json(payload, status, env) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders(env),
      "Content-Type": "application/json",
    },
  });
}

function corsHeaders(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function renderEmailHtml(text) {
  const blocks = text.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Hard Conversations Result</title>
  </head>
  <body style="margin:0;background:#FFF9F2;color:#1A1A1A;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;line-height:1.6;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your Hard Conversations result from Better Managers Club.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#FFF9F2;">
      <tr>
        <td align="center" style="padding:32px 18px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#FFFFFF;border:1px solid rgba(255,90,60,0.12);border-radius:18px;box-shadow:0 4px 24px rgba(255,120,50,0.06);">
            <tr>
              <td style="padding:34px 30px 16px;">
                <div style="font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#FF5A3C;margin-bottom:18px;">Better Managers Club</div>
                ${blocks.map(renderBlock).join("")}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderBlock(block, index) {
  if (SECTION_HEADERS.has(block)) {
    return `<h2 style="font-size:18px;line-height:1.25;margin:32px 0 10px;color:#1A1A1A;font-weight:700;">${escapeHtml(block)}</h2>`;
  }

  if (block === "- Sudipto Chanda") {
    return `<p style="font-size:15px;line-height:1.7;margin:28px 0 0;color:#5A5A5A;">${escapeHtml(block)}</p>`;
  }

  if (block.startsWith("https://")) {
    const url = escapeHtml(block);
    return `<p style="margin:24px 0 0;"><a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#FF5A3C,#FF8C2E);color:#FFFFFF;text-decoration:none;font-weight:700;border-radius:60px;padding:14px 24px;">Get the Playbook</a></p>`;
  }

  if (index === 0) {
    return `<p style="font-size:24px;line-height:1.25;margin:0 0 22px;color:#FF5A3C;font-weight:700;">${escapeHtml(block)}</p>`;
  }

  return `<p style="font-size:16px;line-height:1.7;margin:0 0 18px;color:#5A5A5A;">${escapeHtml(block)}</p>`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
