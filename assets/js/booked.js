/* Confirmation page: show booked time (from Calendly redirect params), calendar links, prep checklist, intro video. */
(function () {
  'use strict';
  var C = window.FUNNEL_CONFIG || {};
  var q = new URLSearchParams(location.search);
  var start = q.get('event_start_time');
  var end = q.get('event_end_time');

  if (start) {
    var s = new Date(start);
    var e = end ? new Date(end) : new Date(s.getTime() + 20 * 60000);
    if (!isNaN(s)) {
      document.getElementById('when').textContent = s.toLocaleString(undefined, {
        weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short'
      });
      var fmt = function (d) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); };
      var title = 'Free Books Review — MAQ Financials';
      var details = 'Your 20-minute Books Review with Talha Qayyum. The call link is in your confirmation email.';
      document.getElementById('gcal').href = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' +
        encodeURIComponent(title) + '&dates=' + fmt(s) + '/' + fmt(e) + '&details=' + encodeURIComponent(details);
      var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//MAQ Financials//Funnel//EN', 'BEGIN:VEVENT',
        'UID:' + fmt(s) + '@maqfinancials', 'DTSTAMP:' + fmt(new Date()), 'DTSTART:' + fmt(s), 'DTEND:' + fmt(e),
        'SUMMARY:' + title, 'DESCRIPTION:' + details, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
      document.getElementById('ics').href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
      document.getElementById('cal-links').hidden = false;
    }
  }

  // Prep checklist — remembered on this device only
  var KEY = 'maq_prep';
  var state = {};
  try { state = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (err) { state = {}; }
  var boxes = document.querySelectorAll('[data-task]');
  var count = document.getElementById('task-count');
  function update() {
    var n = 0;
    boxes.forEach(function (b) { if (b.checked) n++; });
    count.textContent = n + ' of ' + boxes.length + ' done' + (n === boxes.length ? ' — you are all set.' : '');
  }
  boxes.forEach(function (b) {
    b.checked = !!state[b.dataset.task];
    b.addEventListener('change', function () {
      state[b.dataset.task] = b.checked;
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (err) { /* ignore */ }
      update();
    });
  });
  update();

  // Intro video (optional)
  if (C.introVideoUrl) {
    var f = document.createElement('iframe');
    f.src = C.introVideoUrl;
    f.title = 'Intro video from Talha Qayyum';
    f.loading = 'lazy';
    f.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen';
    document.getElementById('video-frame').appendChild(f);
    document.getElementById('video').hidden = false;
  }
})();
