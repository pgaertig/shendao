/* =========================================================================
   ShenDao — Rybbit tracking for the Calendesk booking page
   =========================================================================
   Loads Rybbit and observes the Calendesk booking flow
   (https://shendao.calendesk.net). Rybbit is injected here via JS (not a data-*
   <script> tag) so Calendesk can't strip its config attributes, which means the
   pasted Calendesk snippet is a single attribute-free <script src> to this file.
   Loaded cross-origin from that page via the snippet in
   scripts/calendesk-tracking.html; served UNHASHED from
   https://shendao.poznan.pl/js/calendesk-rybbit.js (see the asset_hash `ignore`
   list in config.rb — asset_hash can't rewrite the absolute URL on Calendesk).

   NOT used by shendao.poznan.pl itself; it only rides along in the build so it
   has a stable public URL. Edit behaviour here, not in the HTML snippet.

   Events emitted (funnel, Rybbit tag = "calendesk"), and mirrored to the
   browser console with a "[cd-tracking]" prefix:
     click_service_<N>     click on a service tile (#id_service_1, #id_service_2, ...)
     slot_selected         click on an available time slot
     booking_form_opened   the booking dialog appears
     booking_submit_click  click on the "Rezerwuj" button (intent; may fail validation)
     booking_created       POST user/bookings/create/* returned 2xx (a booking was made)
     booking_failed        that POST returned a non-2xx status
   ========================================================================= */
(function () {
  'use strict';
  if (window.__cdTrackingInit) return;   // guard against double injection
  window.__cdTrackingInit = true;

  /* --- load Rybbit itself, injected via JS so Calendesk can't strip the
         data-* config attributes off a pasted <script> tag (Rybbit docs'
         recommended workaround for platforms that mangle data-*) --- */
  if (!document.querySelector('script[src^="https://app.rybbit.io/api/script.js"]')) {
    var rb = document.createElement('script');
    rb.src = 'https://app.rybbit.io/api/script.js';
    rb.defer = true;
    rb.setAttribute('data-site-id', '1c0b2b1f5d3e');
    rb.setAttribute('data-tag', 'calendesk');
    document.head.appendChild(rb);
  }

  try { console.log('%c[cd-tracking]', 'color:#0a7;font-weight:bold', 'observer installed'); } catch (e) {}

  /* --- event emitter, buffered until Rybbit (defer) is ready --- */
  var queue = [];
  function emit(name, props) {
    props = props || {};
    var ready = !!(window.rybbit && typeof window.rybbit.event === 'function');
    try { console.log('%c[cd-tracking]', 'color:#0a7;font-weight:bold', name, props, ready ? '→ rybbit' : '(queued)'); } catch (e) {}
    try {
      if (ready) {
        window.rybbit.event(name, props);
      } else {
        queue.push([name, props]);
      }
    } catch (e) { /* never break the page */ }
  }
  var flush = setInterval(function () {
    if (window.rybbit && typeof window.rybbit.event === 'function') {
      clearInterval(flush);
      try { console.log('%c[cd-tracking]', 'color:#0a7;font-weight:bold', 'rybbit ready, flushing', queue.length); } catch (e) {}
      while (queue.length) {
        var q = queue.shift();
        try { window.rybbit.event(q[0], q[1]); } catch (e) {}
      }
    }
  }, 300);

  /* --- delegated clicks (capture phase; survives Vue re-renders) --- */
  document.addEventListener('click', function (ev) {
    var t = ev.target;
    if (!t || !t.closest) return;

    // service tiles: #id_service_1, #id_service_2, ...
    var svc = t.closest('[id^="id_service_"]');
    if (svc) {
      var n = svc.id.replace('id_service_', '');
      emit('click_service_' + n, { service_id: n });
      return;
    }

    var btn = t.closest('button');
    if (!btn) return;
    var label = (btn.textContent || '').trim();

    // available time slot, e.g. "15:00"
    if (/^\d{1,2}:\d{2}$/.test(label)) {
      emit('slot_selected', { time: label });
      return;
    }

    // final submit button
    if (label.toLowerCase() === 'rezerwuj') {
      emit('booking_submit_click', {});
    }
  }, true);

  /* --- booking form dialog opened (fires once per open) ---
     document.body may not exist yet if this script runs before parsing finishes
     (e.g. loaded in <head> without defer), so gate the observer on DOM readiness. */
  function watchDialog() {
    var dialogOpen = false;
    new MutationObserver(function () {
      var dlg = document.querySelector('[role="dialog"]');
      var isOpen = !!(dlg && /rezerwuj/i.test(dlg.textContent || ''));
      if (isOpen && !dialogOpen) emit('booking_form_opened', {});
      dialogOpen = isOpen;
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.body) watchDialog();
  else document.addEventListener('DOMContentLoaded', watchDialog);

  /* --- booking submitted: intercept the create XHR (Calendesk uses axios/XHR) --- */
  var CREATE = /user\/bookings\/create\/(no-)?auth/;
  var open = XMLHttpRequest.prototype.open;
  var send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url) {
    this.__cdUrl = url;
    return open.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function () {
    var xhr = this;
    if (xhr.__cdUrl && CREATE.test(xhr.__cdUrl)) {
      xhr.addEventListener('loadend', function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          emit('booking_created', { status: xhr.status });
        } else {
          emit('booking_failed', { status: xhr.status });
        }
      });
    }
    return send.apply(this, arguments);
  };
})();
