# Hard Conversations Assessment

A static MVP for the 10-question behavioural assessment in `PRD.md`.

## Run locally

```sh
python3 -m http.server 8000
```

Then open `http://127.0.0.1:8000/`.

This serves the static app only. To test email sending locally with Cloudflare Pages Functions, use Wrangler:

```sh
npx wrangler pages dev . --compatibility-date=2026-04-26
```

Put local secrets in `.dev.vars`:

```sh
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL="Better Managers Club <results@bettermanagers.club>"
ALLOWED_ORIGIN=http://127.0.0.1:8788
```

## Email handler

The browser posts to `/api/send-result`:

```json
{
  "email": "person@company.com",
  "archetype": "The Coach",
  "initiative_score": 4,
  "craft_score": 5
}
```

The API route is a Cloudflare Pages Function at `functions/api/send-result.js`, which maps to `/api/send-result`. It sends the matching result email through Resend.

Configure these environment variables in Cloudflare Pages under Settings > Variables and Secrets:

```sh
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL="Better Managers Club <results@bettermanagers.club>"
ALLOWED_ORIGIN=https://bettermanagers.club
```

Use a verified sender/domain in Resend for `RESEND_FROM_EMAIL` before production.
