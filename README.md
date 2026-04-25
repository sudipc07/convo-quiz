# Hard Conversations Assessment

A static MVP for the 10-question behavioural assessment in `PRD.md`.

## Run locally

```sh
python3 -m http.server 8000
```

Then open `http://127.0.0.1:8000/`.

This serves the static app only. To test email sending locally, run it with a platform that supports `/api/send-result`, such as Vercel:

```sh
RESEND_API_KEY=your_key RESEND_FROM_EMAIL="Hard Conversations <results@bettermanagers.club>" vercel dev
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

The API route sends the matching result email through Resend. Configure these environment variables in production:

```sh
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL="Hard Conversations <results@bettermanagers.club>"
ALLOWED_ORIGIN=https://bettermanagers.club
```
