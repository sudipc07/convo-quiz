# Hard Conversations Assessment

A static MVP for the 10-question behavioural assessment in `PRD.md`.

## Run locally

```sh
python3 -m http.server 8000
```

Then open `http://127.0.0.1:8000/`.

## Form handler

Set `FORM_ENDPOINT` in `script.js` to the Formspree, Buttondown, or equivalent endpoint before launch. The form posts:

```json
{
  "email": "person@company.com",
  "archetype": "The Coach",
  "initiative_score": 4,
  "craft_score": 5
}
```

With `FORM_ENDPOINT` empty, the page still advances to the thank-you screen and logs the payload for local testing.
