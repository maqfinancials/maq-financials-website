/*
 * MAQ Financials funnel — the ONLY file you need to edit to go live.
 * Leave a value as '' to switch that feature off; the site still works.
 */
window.FUNNEL_CONFIG = {
  // Meta (Facebook) Pixel ID, e.g. '123456789012345'. Tracks PageView, ViewContent, Lead, Schedule.
  metaPixelId: '',

  // Where qualifier answers are sent (POST, JSON). Works with a GoHighLevel inbound webhook,
  // a Make.com / Zapier / n8n webhook, or Formspree (https://formspree.io/f/xxxx).
  leadWebhookUrl: '',

  // Calendly event link, e.g. 'https://calendly.com/maqfinancials/books-review'.
  // In Calendly, set the event's confirmation page to redirect to /booked.html
  // and tick "Pass event details to your redirected page".
  calendlyUrl: '',

  // Alternative to Calendly: any booking iframe URL (e.g. a GoHighLevel calendar widget link).
  bookingEmbedUrl: '',

  // Optional 60–90 second intro video shown after booking (YouTube or Vimeo embed URL).
  introVideoUrl: '',

  // Revenue answers that are a weak fit — they still see the booking page but get a heads-up.
  softDisqualify: ['Under $250K'],

  contact: {
    phone: '+1 (929) 760-7060',
    phoneHref: 'tel:+19297607060',
    email: 'consulting@talhaqayyum.com'
  }
};
