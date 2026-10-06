/* Booking step: Calendly inline widget (prefilled) or any booking iframe. Fires Schedule, then goes to booked.html. */
(function () {
  'use strict';
  var C = window.FUNNEL_CONFIG || {};
  var panel = document.getElementById('calendar');
  var fallback = document.getElementById('calendar-fallback');
  var data = window.Funnel.get();
  var contact = data.contact || {};
  var answers = data.answers || {};
  var attr = data.attribution || {};

  if (contact.first_name) {
    document.getElementById('greeting').textContent = (contact.first_name + ", you're a fit for a free review").toUpperCase();
  }

  function goBooked(extra) {
    var q = new URLSearchParams(extra || {});
    location.href = 'booked.html' + (q.toString() ? '?' + q.toString() : '');
  }

  if (C.calendlyUrl) {
    fallback.remove();
    var holder = document.createElement('div');
    holder.style.minHeight = '700px';
    panel.appendChild(holder);
    var s = document.createElement('script');
    s.src = 'https://assets.calendly.com/assets/external/widget.js';
    s.async = true;
    s.onload = function () {
      window.Calendly.initInlineWidget({
        url: C.calendlyUrl + (C.calendlyUrl.indexOf('?') === -1 ? '?' : '&') + 'hide_gdpr_banner=1',
        parentElement: holder,
        prefill: {
          name: contact.first_name || '',
          email: contact.email || '',
          customAnswers: {
            a1: [contact.company, answers.trade, answers.revenue, answers.books_status, answers.biggest_problem].filter(Boolean).join(' · ')
          }
        },
        utm: {
          utmSource: attr.utm_source, utmMedium: attr.utm_medium, utmCampaign: attr.utm_campaign,
          utmContent: attr.utm_content, utmTerm: attr.utm_term
        }
      });
    };
    document.head.appendChild(s);

    window.addEventListener('message', function (e) {
      if (e.origin !== 'https://calendly.com' || !e.data || e.data.event !== 'calendly.event_scheduled') return;
      window.track('Schedule', { content_name: 'Books Review call' });
      window.Funnel.set({ booked: true });
      // If Calendly's own redirect is configured it will pass event details; otherwise go there now.
      setTimeout(function () { goBooked({ invitee_first_name: contact.first_name || '' }); }, 600);
    });
  } else if (C.bookingEmbedUrl) {
    fallback.remove();
    var frame = document.createElement('iframe');
    frame.src = C.bookingEmbedUrl;
    frame.title = 'Book your Books Review call';
    frame.loading = 'lazy';
    panel.appendChild(frame);
    var note = document.createElement('p');
    note.className = 'small';
    note.style.padding = '12px 20px';
    note.textContent = 'After booking you will get a confirmation email with the call link.';
    panel.appendChild(note);
  }
})();
