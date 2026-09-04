var _____WB$wombat$assign$function_____=function(name){return (globalThis._wb_wombat && globalThis._wb_wombat.local_init && globalThis._wb_wombat.local_init(name))||globalThis[name];};if(!globalThis.__WB_pmw){globalThis.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opener = _____WB$wombat$assign$function_____("opener");
(function () {
  'use strict';

  var QB_PIXEL_ID = '';

  window.qbPixel = function () {};

  if (!QB_PIXEL_ID) return;

  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
    n.queue = []; t = b.createElement(e); t.async = !0; t.src = v;
    s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  }(window, document, 'script', 'https://web.archive.org/web/20260728161042/https://connect.facebook.net/en_US/fbevents.js');

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

}

/*
     FILE ARCHIVED ON 16:10:42 Jul 28, 2026 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 03:43:35 Sep 04, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  captures_list: 0.589
  exclusion.robots: 0.057
  exclusion.robots.policy: 0.046
  esindex: 0.01
  cdx.remote: 24.862
  LoadShardBlock: 268.951 (3)
  PetaboxLoader3.datanode: 202.956 (4)
  PetaboxLoader3.resolve: 393.434 (3)
  load_resource: 458.363
*/