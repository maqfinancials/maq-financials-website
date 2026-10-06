/* Shared: Meta Pixel, UTM capture, lead storage. Loaded with `defer` on every page. */
(function () {
  'use strict';
  var C = window.FUNNEL_CONFIG || {};
  var STORE_KEY = 'maq_funnel';

  // ---- Safe storage (works when storage is blocked) ----
  function read(store) {
    try { return JSON.parse(store.getItem(STORE_KEY) || '{}'); } catch (e) { return {}; }
  }
  function write(store, data) {
    try { store.setItem(STORE_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
  }
  var Funnel = window.Funnel = {
    get: function () {
      var s = read(window.sessionStorage);
      return Object.keys(s).length ? s : read(window.localStorage);
    },
    set: function (patch) {
      var next = Object.assign({}, Funnel.get(), patch);
      write(window.sessionStorage, next);
      write(window.localStorage, next);
      return next;
    }
  };

  // ---- UTM + click IDs: captured on first landing, kept for the lead ----
  var params = new URLSearchParams(window.location.search);
  var keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];
  var found = {};
  keys.forEach(function (k) { if (params.get(k)) found[k] = params.get(k); });
  if (Object.keys(found).length) {
    Funnel.set({ attribution: Object.assign({}, Funnel.get().attribution, found, { landing_page: location.pathname, first_seen: new Date().toISOString() }) });
  }
  // Keep the query string on internal funnel links so attribution survives page hops.
  var keep = window.location.search;
  if (keep) {
    document.querySelectorAll('a[data-keep-utm]').forEach(function (a) {
      var url = new URL(a.getAttribute('href'), window.location.href);
      params.forEach(function (v, k) { if (!url.searchParams.has(k)) url.searchParams.set(k, v); });
      a.setAttribute('href', url.pathname.split('/').pop() + url.search + url.hash);
    });
  }

  // ---- Meta Pixel ----
  window.track = function (event, data) {
    if (typeof window.fbq === 'function') {
      window.fbq('track', event, data || {});
    }
  };
  if (C.metaPixelId) {
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', C.metaPixelId);
    window.fbq('track', 'PageView');
  }

  // ---- Contact details from config ----
  if (C.contact) {
    document.querySelectorAll('[data-phone]').forEach(function (el) {
      el.textContent = C.contact.phone;
      if (el.tagName === 'A') el.href = C.contact.phoneHref;
    });
    document.querySelectorAll('[data-email]').forEach(function (el) {
      el.textContent = C.contact.email;
      if (el.tagName === 'A') el.href = 'mailto:' + C.contact.email;
    });
  }

  // ---- CTA clicks on the landing page count as ViewContent intent ----
  document.querySelectorAll('[data-cta]').forEach(function (el) {
    el.addEventListener('click', function () { window.track('ViewContent', { content_name: el.getAttribute('data-cta') }); });
  });

  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
