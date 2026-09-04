(function () {
  'use strict';

  var QB_PIXEL_ID = '1014974574623928';

  window.qbPixel = function () {};

  if (!QB_PIXEL_ID) return;

  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
    n.queue = []; t = b.createElement(e); t.async = !0; t.src = v;
    s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  window.fbq('init', QB_PIXEL_ID);
  window.fbq('track', 'PageView');

  window.qbPixel = function (event, params, eventId) {
    try {
      if (!window.fbq) return;
      if (eventId) window.fbq('track', event, params || {}, { eventID: String(eventId) });
      else window.fbq('track', event, params || {});
    } catch (e) {}
  };
})();
