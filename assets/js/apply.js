/* 6-step qualifier: one question per screen, auto-advance, then contact details → webhook → book.html */
(function () {
  'use strict';
  var C = window.FUNNEL_CONFIG || {};
  var form = document.getElementById('qualifier');
  if (!form) return;
  var steps = Array.prototype.slice.call(form.querySelectorAll('.q-step'));
  var total = steps.length;
  var bar = document.getElementById('bar');
  var counter = document.getElementById('counter');
  var progress = document.querySelector('.progress');
  var backBtn = document.getElementById('back');
  var homeLink = document.getElementById('home');
  var softDq = document.getElementById('soft-dq');
  var answers = (window.Funnel.get().answers) || {};
  var current = 0;
  var started = false;

  function show(i, focus) {
    current = Math.max(0, Math.min(total - 1, i));
    steps.forEach(function (s, n) { s.hidden = n !== current; });
    var pct = Math.round(((current + 1) / total) * 100);
    bar.style.width = pct + '%';
    progress.setAttribute('aria-valuenow', String(current + 1));
    counter.textContent = 'Step ' + (current + 1) + ' of ' + total;
    backBtn.hidden = current === 0;
    homeLink.hidden = current !== 0;
    if (current === total - 1) {
      var dq = (C.softDisqualify || []).indexOf(answers.revenue) !== -1;
      softDq.hidden = !dq;
    }
    if (focus) {
      var h = steps[current].querySelector('h1');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Restore earlier selections (back button / returning visitor)
  steps.forEach(function (s) {
    var key = s.getAttribute('data-key');
    if (!key) return;
    s.querySelectorAll('.tile').forEach(function (t) {
      if (answers[key] === t.textContent.trim()) t.setAttribute('aria-pressed', 'true');
      t.addEventListener('click', function () {
        s.querySelectorAll('.tile').forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
        t.setAttribute('aria-pressed', 'true');
        answers[key] = t.textContent.trim();
        window.Funnel.set({ answers: answers });
        if (!started) { started = true; window.track('InitiateCheckout', { content_name: 'Books Review qualifier' }); }
        setTimeout(function () { show(current + 1, true); }, 180);
      });
    });
  });

  backBtn.addEventListener('click', function () { show(current - 1, true); });

  // ---- Contact step validation ----
  function setError(input, msg) {
    var err = input.parentNode.querySelector('.field-error');
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) err.textContent = msg || '';
  }
  function validate() {
    var ok = true;
    var f = form.elements;
    [['first_name', 'Please enter your first name.'], ['company', 'Please enter your company name.']].forEach(function (pair) {
      var el = f[pair[0]];
      if (!el.value.trim()) { setError(el, pair[1]); ok = false; } else setError(el, '');
    });
    var email = f.email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { setError(f.email, 'Please enter a valid email.'); ok = false; } else setError(f.email, '');
    var digits = f.phone.value.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) { setError(f.phone, 'Please enter a valid phone number.'); ok = false; } else setError(f.phone, '');
    if (!ok) { var bad = form.querySelector('[aria-invalid="true"]'); if (bad) bad.focus(); }
    return ok;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (form.elements.website.value) return; // honeypot: bots fill hidden fields
    if (!validate()) return;
    var btn = document.getElementById('submit');
    btn.disabled = true;
    btn.textContent = 'One moment…';

    var f = form.elements;
    var contact = {
      first_name: f.first_name.value.trim(),
      company: f.company.value.trim(),
      email: f.email.value.trim(),
      phone: f.phone.value.trim(),
      sms_consent: f.sms_consent.checked
    };
    var stored = window.Funnel.set({ answers: answers, contact: contact });
    var payload = {
      source: 'MAQ contractor funnel',
      submitted_at: new Date().toISOString(),
      page: location.href,
      fit: (C.softDisqualify || []).indexOf(answers.revenue) === -1 ? 'qualified' : 'below_revenue_threshold',
      answers: answers,
      contact: contact,
      attribution: stored.attribution || {}
    };

    window.track('Lead', { content_name: 'Books Review application', value: 0, currency: 'USD' });

    function next() {
      var params = new URLSearchParams(location.search);
      location.href = 'book.html' + (params.toString() ? '?' + params.toString() : '');
    }
    if (!C.leadWebhookUrl) {
      if (window.console) console.warn('[funnel] leadWebhookUrl is empty in assets/js/config.js — lead not sent anywhere.');
      return next();
    }
    var done = false;
    var finish = function () { if (!done) { done = true; next(); } };
    setTimeout(finish, 2500); // never trap the visitor if the webhook is slow
    fetch(C.leadWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    }).then(finish, finish);
  });

  // Prefill contact fields if the visitor came back
  var saved = window.Funnel.get().contact || {};
  ['first_name', 'company', 'email', 'phone'].forEach(function (k) { if (saved[k]) form.elements[k].value = saved[k]; });

  // Resume at the first unanswered question
  var firstOpen = steps.findIndex(function (s) { var k = s.getAttribute('data-key'); return k && !answers[k]; });
  show(firstOpen === -1 ? total - 1 : firstOpen, false);
})();
