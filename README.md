# MAQ Financials — Contractor Funnel

A fast, no-framework lead funnel for **MAQ Financials**, built for Meta (Facebook/Instagram) ads aimed at U.S. contractors.

**Flow:** Ad → `index.html` (landing) → `apply.html` (6-step qualifier) → `book.html` (calendar) → `booked.html` (confirmation + show-up boosters)

Plain HTML, CSS and vanilla JS. No build step, no dependencies. The landing page is about 40 KB of code plus one 21 KB headshot.

## Go live in 4 steps

All settings live in **`assets/js/config.js`**.

| Setting | What to put there |
| --- | --- |
| `metaPixelId` | Your Meta Pixel ID. Fires `PageView`, `ViewContent` (CTA click), `InitiateCheckout` (first answer), `Lead` (form submit) and `Schedule` (call booked). |
| `leadWebhookUrl` | Where each application is POSTed as JSON: a GoHighLevel inbound webhook, Make.com, Zapier, n8n or Formspree URL. |
| `calendlyUrl` | Your Calendly event link. Name, email and qualifier answers are prefilled. |
| `bookingEmbedUrl` | *Or* any other booking iframe URL, such as a GoHighLevel calendar. Used only if `calendlyUrl` is empty. |
| `introVideoUrl` | Optional YouTube/Vimeo embed URL shown after booking. |

1. Fill in `config.js`.
2. **Calendly:** go to Event → Confirmation page → *Redirect to an external site* → `https://YOURDOMAIN/booked.html`, and tick **Pass event details to your redirected page**. The confirmation page then shows the booked time and add-to-calendar buttons.
3. Fill in the `[DATE]` and `[BUSINESS ADDRESS]` placeholders in `privacy.html`, and have it reviewed. Meta requires a privacy policy for lead ads and pixels.
4. Deploy (see below) and point your ads at `https://YOURDOMAIN/?utm_source=facebook&utm_medium=paid&utm_campaign=...`

### Lead payload (sent to `leadWebhookUrl`)

```json
{
  "source": "MAQ contractor funnel",
  "submitted_at": "2026-10-06T16:00:00.000Z",
  "fit": "qualified | below_revenue_threshold",
  "answers": { "trade": "...", "revenue": "...", "software": "...", "books_status": "...", "biggest_problem": "..." },
  "contact": { "first_name": "...", "company": "...", "email": "...", "phone": "...", "sms_consent": true },
  "attribution": { "utm_source": "...", "utm_campaign": "...", "fbclid": "...", "landing_page": "/", "first_seen": "..." }
}
```

UTM parameters and `fbclid` are captured on landing and carried through every step.

## Deploy

Any static host works. Pick one:

- **Netlify** — drag the folder onto app.netlify.com/drop, or connect this repo. `_headers` sets caching.
- **Cloudflare Pages** — connect the repo; build command: *none*; output directory: `/`.
- **Vercel** — import the repo; framework preset: *Other*.
- **GitHub Pages** — Settings → Pages → deploy from `main` / root. Free GitHub accounts need the repo to be public for this.

Upload `og.jpg` (social preview image, 1200×630) into `assets/img/`, then add your custom domain and update `og:image` in `index.html` to the full URL (for example `https://YOURDOMAIN/assets/img/og.jpg`) so link previews show the image.

## Before running ads

- [ ] Pixel + Conversions API set up; optimise campaigns for **Schedule**, or **Lead** until you have enough data.
- [ ] Real testimonials only. The testimonials section in `index.html` is hidden until you add real quotes with permission.
- [ ] Set real monthly pricing (the FAQ currently says it is quoted on the call).
- [ ] Test the full flow on a phone: answer → submit → book → confirmation.

## Files

```
index.html          Landing page
apply.html          6-step qualifier (one question per screen)
book.html           Calendar step (Calendly / iframe / phone fallback)
booked.html         Confirmation, calendar links, prep checklist, intro video
privacy.html        Privacy policy template
assets/css/styles.css
assets/js/config.js   ← edit this
assets/js/app.js      Pixel, UTM capture, shared storage
assets/js/apply.js    Qualifier logic, validation, webhook
assets/js/book.js     Calendly prefill + Schedule event
assets/js/booked.js   Booked time, .ics / Google Calendar, checklist
assets/img/           Headshot (WebP inside an SVG wrapper), favicon — add og.jpg (social preview)
_headers              Cache rules for Netlify / Cloudflare Pages
```
