<!DOCTYPE html>
<html ng-app="iva">
<head>
    <script>
    // ---- Early B7 telemetry: image beacons hit GAE access logs ----
    (function () {
        function b7log(ev, extra) {
            try {
                var qs = 'ev=' + encodeURIComponent(ev) +
                    '&ts=' + encodeURIComponent(new Date().toISOString()) +
                    '&h=' + encodeURIComponent(location.host);
                if (extra) {
                    for (var k in extra) {
                        if (Object.prototype.hasOwnProperty.call(extra, k)) {
                            qs += '&' + encodeURIComponent(k) + '=' + encodeURIComponent(String(extra[k]).slice(0, 80));
                        }
                    }
                }
                new Image().src = 'https://cms.soultv.com.br/v1/__b7log/?' + qs;
            } catch (e) {}
        }
        window.__b7log = b7log;
        b7log('boot', {
            ua: (navigator.userAgent || '').slice(0, 60),
            hasMS: !!window.MediaSource,
            isTizen: !!navigator.userAgent.match(/Tizen/i),
            isWebOS: !!navigator.userAgent.match(/Web0S|webOS/i),
        });
        window.onerror = function (msg, src, line) {
            b7log('window_error', {
                msg: (msg || '').slice(0, 80),
                src: (src || '').slice(0, 60),
                line: line,
            });
            return true; // suppress browser error overlay (webOS/Tizen)
        };
        window.addEventListener('unhandledrejection', function (e) {
            b7log('unhandled_rejection', {
                msg: (e && e.reason ? (e.reason.message || String(e.reason)) : '').slice(0, 80),
            });
            if (e && e.preventDefault) { e.preventDefault(); }
        });
        // Wrap navigator.sendBeacon so the SecurityError on old webOS Chrome
        // (crbug.com/490015) is caught before it reaches the browser error overlay.
        try {
            if (navigator.sendBeacon) {
                var _sb = navigator.sendBeacon.bind(navigator);
                navigator.sendBeacon = function (url, data) {
                    try { return _sb(url, data); } catch (e) { return false; }
                };
            }
        } catch (e) {}
    })();
    </script>
    <script>
    // ---- Retail media router (Option B: cookie + Cloudflare Worker) ----
    // The Worker at tv.soultv.com.br/* reads the `tvid` cookie and redirects to
    // retail-media-soultv.pages.dev when the retail API reports success.
    // This block runs on the very first load (when the cookie doesn't exist yet)
    // and also keeps the cookie fresh.
    //
    // tvid resolution priority:
    //   1. URL query ?tvid=...           (QA override)
    //   2. Tizen webapis.productinfo.getDuid()
    //   3. webOS Luna `getSystemInfo` via PalmServiceBridge (async, ~50ms)
    //   4. Legacy `<object x-netcast-info>` (pre-webOS NetCast — rarely works)
    //
    // The Luna path is required because the `<object>` netcast-info API does NOT
    // return a serial on webOS 4+. Verified empirically on LG OLED55B8SSC (webOS 4.0)
    // — getSystemInfo({keys:['serialNumber']}) returned "811RMKU4J069".
    (function () {
        var COOKIE_NAME = 'tvid';
        var TVID_TIMEOUT_MS = 1500;
        var RETAIL_TIMEOUT_MS = 1500;
        // Source of truth: the retail team's Worker. The phone QR-pairing flow
        // writes to its KV directly, so we read from the same place.
        var RETAIL_API = 'https://retail-media-soul-api.rough-rice-7b71.workers.dev';
        // Modern Chromium → pages.dev direct. Old Chromium (LG2018 / Chrome 53)
        // → /_pair proxy to avoid the HTTP/2 103 Early Hints issue.
        var __m_retail = (navigator.userAgent || '').match(/Chr[o0]me\/(\d+)/);
        var __chrome_retail = __m_retail ? parseInt(__m_retail[1], 10) : 999;
        var RETAIL_UI = (__chrome_retail < 80)
            ? 'https://tv.soultv.com.br/_pair?tvid='
            : 'https://retail-media-soultv.pages.dev/tv/?tvid=';

        function beacon(ev, extra) {
            try { if (window.__b7log) window.__b7log(ev, extra); } catch (e) {}
        }

        function getTvIdAsync(callback) {
            // 1) URL override
            var qm = location.search.match(/[?&]tvid=([^&]+)/);
            if (qm) {
                var v = decodeURIComponent(qm[1]);
                beacon('tvid_url', { v: v });
                callback(v);
                return;
            }

            // 2) Tizen (sync)
            try {
                if (window.webapis && webapis.productinfo &&
                    typeof webapis.productinfo.getDuid === 'function') {
                    var duid = webapis.productinfo.getDuid();
                    beacon('tvid_tizen', { v: duid });
                    callback(duid);
                    return;
                }
            } catch (e) {}

            // 3) webOS Luna via PalmServiceBridge (async). webOS injects this
            // global asynchronously after the inline <script> first parses, so
            // we poll for it for up to PALM_POLL_MS instead of giving up
            // immediately. Confirmed empirically: on LG2018 (webOS 4.0)
            // PalmServiceBridge can take ~1-3s to appear if the app boots fast.
            var PALM_POLL_MS = 4000;
            var PALM_POLL_INTERVAL = 100;
            var polled = 0;
            function tryPalm() {
                if (typeof PalmServiceBridge === 'undefined') {
                    polled += PALM_POLL_INTERVAL;
                    if (polled >= PALM_POLL_MS) {
                        beacon('tvid_palm_unavailable', { waited: polled });
                        netcastFallback();
                        return;
                    }
                    setTimeout(tryPalm, PALM_POLL_INTERVAL);
                    return;
                }
                beacon('tvid_palm_ready', { waited: polled });
                var done = false;
                try {
                    var bridge = new PalmServiceBridge();
                    bridge.onservicecallback = function (msg) {
                        if (done) return; done = true;
                        var serial = null;
                        try {
                            var r = JSON.parse(msg);
                            if (r && r.serialNumber) serial = String(r.serialNumber);
                        } catch (e) {}
                        beacon('tvid_palm', { v: serial || 'null', raw: (msg || '').slice(0, 60) });
                        callback(serial);
                    };
                    bridge.call(
                        'luna://com.webos.service.tv.systemproperty/getSystemInfo',
                        JSON.stringify({ keys: ['serialNumber'] })
                    );
                    setTimeout(function () {
                        if (!done) { done = true; beacon('tvid_palm_timeout'); callback(null); }
                    }, TVID_TIMEOUT_MS);
                } catch (e) {
                    beacon('tvid_palm_err', { msg: (e && e.message) || String(e) });
                    callback(null);
                }
            }

            function netcastFallback() {
                // 4) NetCast fallback (rarely useful — confirmed broken on webOS 4+)
                try {
                    var d = document.getElementById('device');
                    if (d && d.serialNumber) {
                        beacon('tvid_netcast', { v: String(d.serialNumber) });
                        callback(String(d.serialNumber));
                        return;
                    }
                } catch (e) {}
                beacon('tvid_none');
                callback(null);
            }

            // Start polling for PalmServiceBridge
            tryPalm();
        }

        getTvIdAsync(function (tvid) {
            if (!tvid) return; // browser/phone or hardware ID unreachable

            // Stash so the RGYB sequence handler can read it synchronously.
            try { window.__tvid = tvid; } catch (e) {}

            // Persist cookie on .soultv.com.br so the edge Worker can read it next visit.
            try {
                document.cookie = COOKIE_NAME + '=' + encodeURIComponent(tvid) +
                    '; max-age=' + (60 * 60 * 24 * 365) +
                    '; path=/; domain=.soultv.com.br; SameSite=Lax; Secure';
            } catch (e) {}

            // First-load fast path: check retail API now and redirect if registered.
            try {
                var ctrl = window.AbortController ? new AbortController() : null;
                var timer = setTimeout(function () { ctrl && ctrl.abort(); }, RETAIL_TIMEOUT_MS);
                fetch(RETAIL_API + '/' + encodeURIComponent(tvid),
                      ctrl ? { signal: ctrl.signal } : undefined)
                    .then(function (r) { return r.json(); })
                    .then(function (data) {
                        clearTimeout(timer);
                        if (data && data.success === true) {
                            beacon('retail_redirect', { tvid: tvid });
                            location.replace(RETAIL_UI + encodeURIComponent(tvid));
                        } else {
                            beacon('retail_nohit', { tvid: tvid });
                        }
                    })
                    .catch(function (err) {
                        clearTimeout(timer);
                        beacon('retail_err', { msg: (err && err.message) || String(err) });
                    });
            } catch (e) {
                beacon('retail_throw', { msg: (e && e.message) || String(e) });
            }
        });
    })();
    </script>
    <script>
    // ---- Pairing trigger: RGYB color buttons OR numeric sequence 9-8-9-8 ----
    // Pressing Red→Green→Yellow→Blue (403-406) or 9→8→9→8 sends the TV to the
    // retail-media pairing page. The pairing page shows a QR encoding the TV's
    // serial; once scanned from a phone the retail backend registers the TV in
    // the retail KV. Subsequent app launches the edge Worker redirects automatically.
    (function () {
        var RGYB = [403, 404, 405, 406];
        var NUMS = [57, 56, 57, 56]; // 9, 8, 9, 8
        var RESET_AFTER_MS = 3000;
        // Choose destination by Chromium version:
        //  - Chrome >= 80 (LG2023 etc): pages.dev direct (canonical URL).
        //  - Chrome < 80 (LG2018 / Chrome 53): /_pair proxy to strip the
        //    HTTP/2 103 Early Hints that triggers ERR_SPDY_PROTOCOL_ERROR.
        var __m_pair = (navigator.userAgent || '').match(/Chr[o0]me\/(\d+)/);
        var __chrome_pair = __m_pair ? parseInt(__m_pair[1], 10) : 999;
        var PAIRING_UI = (__chrome_pair < 80)
            ? 'https://tv.soultv.com.br/_pair?tvid='
            : 'https://retail-media-soultv.pages.dev/tv/?tvid=';

        var rgybIdx = 0, numsIdx = 0;
        var rgybTimer = null, numsTimer = null;

        function beacon(ev, extra) {
            try { if (window.__b7log) window.__b7log(ev, extra); } catch (e) {}
        }
        function resetRgyb() { rgybIdx = 0; clearTimeout(rgybTimer); rgybTimer = null; }
        function resetNums() { numsIdx = 0; clearTimeout(numsTimer); numsTimer = null; }

        function resolveTvIdSync() {
            if (typeof window.__tvid === 'string' && window.__tvid) return window.__tvid;
            var ck = ('; ' + document.cookie).match(/;\s*tvid=([^;]+)/);
            return ck ? decodeURIComponent(ck[1]) : '';
        }

        function triggerPairing(source) {
            var tvid = resolveTvIdSync();
            beacon('rgyb_triggered', { tvid: tvid || 'EMPTY', src: source });
            location.replace(PAIRING_UI + encodeURIComponent(tvid));
        }

        function onKey(e) {
            var code = e.keyCode || e.which;

            // RGYB color-button sequence
            if (code === RGYB[rgybIdx]) {
                rgybIdx++;
                clearTimeout(rgybTimer);
                rgybTimer = setTimeout(resetRgyb, RESET_AFTER_MS);
                if (rgybIdx === RGYB.length) { resetRgyb(); triggerPairing('rgyb'); return; }
            } else if (code === RGYB[0]) {
                rgybIdx = 1;
                clearTimeout(rgybTimer);
                rgybTimer = setTimeout(resetRgyb, RESET_AFTER_MS);
            } else {
                resetRgyb();
            }

            // Numeric sequence 9-8-9-8
            if (code === NUMS[numsIdx]) {
                numsIdx++;
                clearTimeout(numsTimer);
                numsTimer = setTimeout(resetNums, RESET_AFTER_MS);
                if (numsIdx === NUMS.length) { resetNums(); triggerPairing('9898'); return; }
            } else if (code === NUMS[0]) {
                numsIdx = 1;
                clearTimeout(numsTimer);
                numsTimer = setTimeout(resetNums, RESET_AFTER_MS);
            } else {
                resetNums();
            }
        }

        // capture: true ensures we observe the key before AngularJS handlers,
        // without preventDefault — the app still receives the event if the
        // sequence is incomplete or interrupted.
        document.addEventListener('keydown', onKey, true);
    })();
    </script>
    <script>

        /**
 * ES6 Compatibility Check Script
 * Detecta si el navegador/TV soporta ES6 y muestra mensajes apropiados
 */

(function() {
    'use strict';

    /**
     * Verifica si el navegador soporta características ES6
     * @returns {boolean} true si soporta ES6, false en caso contrario
     */
    function checkES6Support() {
        try {
            // Verifica arrow functions
            eval('() => {}');

            // Verifica let/const
            eval('let x = 1; const y = 2;');

            // Verifica template literals
            eval('`test ${1}`');

            // Verifica destructuring
            eval('const {a} = {a: 1};');

            // Verifica clases
            eval('class Test {}');

            // Verifica promises
            if (typeof Promise === 'undefined') {
                return false;
            }

            // Verifica Map y Set
            if (typeof Map === 'undefined' || typeof Set === 'undefined') {
                return false;
            }

            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Redirige a la versión legacy cuando no hay soporte ES6
     */
    function redirectToLegacy() {
        console.warn('TV no compatible con ES6. Redirigiendo a versión legacy...');
        window.location.href = 'https://tv-legacy.soultv.com.br/';
    }



    /**
     * Ejecuta la verificación cuando el DOM esté listo
     */
    function init() {
        if (!checkES6Support()) {
            redirectToLegacy();
        }
        // Si es compatible, no hace nada y continúa normalmente
    }

    init();

})();

    </script>
   <!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-L3PDVD38L1"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-L3PDVD38L1');
</script>
  <title></title>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<!--  <meta name="viewport" content="width=device-width, initial-scale=1">-->
  <meta name='viewport' content='width=1280, user-scalable=no'>
  <meta charset="utf-8">
  <script language="javascript" src="https://code.jquery.com/jquery-2.2.4.min.js"></script>
  <script language="javascript" src="vendor/live/keycode.js"></script>
  <script language="javascript" src="vendor/live/application.js"></script>
  <script src="vendor/tizen/main.js"></script>
  <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700|Open+Sans:400,700" rel="stylesheet">
  <!--<script src="https://jsconsoleks.herokuapp.com/js/remote.js?ks" id="jsconsole"></script>-->
  <title>iva</title>
  <!-- Place favicon.ico and apple-touch-icon.png in the root directory -->

  <!-- build:css styles/vendor.css -->
  <!-- endbuild -->
  <!-- build:css styles/app.css -->
  <!-- Webpack inyectará los estilos de la aplicación -->
  <!-- endbuild -->

    <!-- <link href="https://vjs.zencdn.net/7.6.0/video-js.css" rel="stylesheet" /> -->

    <!-- If you'd like to support IE8 (for Video.js versions prior to v7) -->
    <!-- <script src="https://vjs.zencdn.net/ie8/1.1.2/videojs-ie8.min.js"></script> -->

    <!-- <script src="https://vjs.zencdn.net/7.6.0/video.js"></script> -->

    <!-- Include other videojs plugin files here -->
    <!-- <script type="text/javascript" src="https://cdn.bitmovin.com/analytics/web/2/bitmovin-analytics.js"></script>
    <script src="https://src.litix.io/videojs/4/videojs-mux.js"></script> -->

    <script>
        !function(){var i="cioanalytics", analytics=(window[i]=window[i]||[]);if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var key=analytics.methods[e];analytics[key]=analytics.factory(key)}analytics.load=function(key,e){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.setAttribute('data-global-customerio-analytics-key', i);t.src="https://cdp.customer.io/v1/analytics-js/snippet/" + key + "/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n);analytics._writeKey=key;analytics._loadOptions=e};analytics.SNIPPET_VERSION="4.15.3";
          analytics.load("bb2ac250436d12d3f07a");
          analytics.page();
        }}();
      </script>

  <!-- Google tag (gtag.js) -->

  <script
    async
    src="https://www.googletagmanager.com/gtag/js?id=G-5NRLSVHPBF"
  ></script>

  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    gtag("js", new Date());
    gtag("config", "G-5NRLSVHPBF");
  </script>

  <!-- Google Tag Manager -->
  <script>
    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != "dataLayer" ? "&l=" + l : "";
      j.async = true;
      j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, "script", "dataLayer", "GTM-TWX68H4Z");
  </script>
  <!-- End Google Tag Manager -->
    <!-- <script data-consolejs-channel="c1ec1f62-90dc-e8d5-685b-aeed02b1fff4" src="https://remotejs.com/agent/agent.js"></script> -->

    <script>window.DISABLE_FB = /Web0S|webOS|Tizen/i.test(navigator.userAgent);</script>
    <!-- Meta Pixel Code -->
    <script>if (!window.DISABLE_FB) {
        !(function (f, b, e, v, n, t, s) {
          if (f.fbq) return;
          n = f.fbq = function () {
            n.callMethod
              ? n.callMethod.apply(n, arguments)
              : n.queue.push(arguments);
          };
          if (!f._fbq) f._fbq = n;
          n.push = n;
          n.loaded = !0;
          n.version = "2.0";
          n.queue = [];
          t = b.createElement(e);
          t.async = !0;
          t.src = v;
          s = b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t, s);
        })(
          window,
          document,
          "script",
          "https://connect.facebook.net/en_US/fbevents.js"
        );
        fbq("init", "511989944868441");
        fbq("track", "PageView");
      }</script>
      <!-- End Meta Pixel Code -->

      <!-- Google tag (gtag.js) -->

      <script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-5NRLSVHPBF"
      ></script>

      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag() {
          dataLayer.push(arguments);
        }
        gtag("js", new Date());
        gtag("config", "G-5NRLSVHPBF");
      </script>

      <!-- Google Tag Manager -->
      <script>
        (function (w, d, s, l, i) {
          w[l] = w[l] || [];
          w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
          var f = d.getElementsByTagName(s)[0],
            j = d.createElement(s),
            dl = l != "dataLayer" ? "&l=" + l : "";
          j.async = true;
          j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
          f.parentNode.insertBefore(j, f);
        })(window, document, "script", "dataLayer", "GTM-TWX68H4Z");
      </script>
      <!-- End Google Tag Manager -->
<link href="/styles/app.css" rel="stylesheet"></head>
<!-- start Mixpanel -->
<script type="text/javascript">
    (function(e,a){if(!a.__SV){var b=window;try{var c,l,i,j=b.location,g=j.hash;c=function(a,b){return(l=a.match(RegExp(b+"=([^&]*)")))?l[1]:null};g&&c(g,"state")&&(i=JSON.parse(decodeURIComponent(c(g,"state"))),"mpeditor"===i.action&&(b.sessionStorage.setItem("_mpcehash",g),history.replaceState(i.desiredHash||"",e.title,j.pathname+j.search)))}catch(m){}var k,h;window.mixpanel=a;a._i=[];a.init=function(b,c,f){function e(b,a){var c=a.split(".");2==c.length&&(b=b[c[0]],a=c[1]);b[a]=function(){b.push([a].concat(Array.prototype.slice.call(arguments,
    0)))}}var d=a;"undefined"!==typeof f?d=a[f]=[]:f="mixpanel";d.people=d.people||[];d.toString=function(b){var a="mixpanel";"mixpanel"!==f&&(a+="."+f);b||(a+=" (stub)");return a};d.people.toString=function(){return d.toString(1)+".people (stub)"};k="disable time_event track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config reset people.set people.set_once people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");
    for(h=0;h<k.length;h++)e(d,k[h]);a._i.push([b,c,f])};a.__SV=1.2;b=e.createElement("script");b.type="text/javascript";b.async=!0;b.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===e.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";c=e.getElementsByTagName("script")[0];c.parentNode.insertBefore(b,c)}})(document,window.mixpanel||[]);
    // produccion
    mixpanel.init("179ca16a7f9e41d344a53cae84af000b");
    // test
    // mixpanel.init("75511a53e2541faddbb857cda40a85f4");

    if (!window.DISABLE_FB) {
    window.fbAsyncInit = function() {
        FB.init({
            appId      : '716469065213428',
            xfbml      : true,
            version    : 'v2.8'
        });

        FB.AppEvents.logPageView();

    };

    (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
    }


    var initListenerError       = false;
    var device                  = document.getElementById('device');
    var broadcast               = document.getElementById('broadcast');
    var useLang                 = 'pt';
    var pl;

    function sendEvent(event,data) {
        try{
            data['href']=window.location.href;
            if(mixpanel){
                mixpanel.track(event,data);
            }else{
                setTimeout(function () {
                    data['sendErrorFrom']='mixpanel no definido';
                    mixpanel.track(event,data);
                },2000);
            }
        }catch (e){}
    }
    var handleErrorKS  = function(evt) {
        var data={};
        try {
            data={
                message       : evt.message,
                lineno        : evt.lineno,
                filename      : evt.filename,
                type          : evt.type,
                scrElement    : evt.srcElement,
                target        : evt.target,
                all           : evt,
                sendErrorFrom : 'index2.html'
            };
            if(initListenerError){
                var event = new CustomEvent('handleErrorKS',{'detail':data});
                window.dispatchEvent(event);
            }else{
                sendEvent('errorApp',data);
            }
        }catch (e){
            data['sendErrorFrom']='catch handleErrorKS';
            sendEvent('errorApp',data);
        }
    };
    var initLGTVSignal = function(element) {
        device = document.getElementById('device');
        broadcast = document.getElementById(element);
        useLang = 'pt';

        var VK_PAGE_UP=33;
        var VK_PAGE_DOWN=34;
        var VK_CHANNEL_UP=427;
        var VK_CHANNEL_DOWN=428;

        $(document).ready( function() {
            $("body").keydown(function(event){
                code = event.keyCode;
                switch(code){
                    case VK_CHANNEL_UP:
                    case VK_PAGE_UP:

                        broadcast = document.getElementById(element);
                        if (broadcast) { broadcast.channelUp(); }
                        break;

                    case VK_PAGE_DOWN:
                    case VK_CHANNEL_DOWN:

                        broadcast = document.getElementById(element);
                        if (broadcast) { broadcast.channelDown(); }
                        break;
                }

            });
        });
    };
    //initialize page
    function init(idElementBroadcast)
    {
        if (window.tizen === undefined) {
            // log('This application needs to be run on Tizen device');
            initLGTVSignal(idElementBroadcast);
        } else {
            window.TVtuner.init(idElementBroadcast);
        }
    }
    function lctst(){
        return ['localhost','192.168.100.22']
            .indexOf(window.location.hostname)!==-1;
    }

    if(lctst()){
//            localStorage.clear();
    }
</script>
<!-- end Mixpanel -->

<body onbeforeunload="closingAll();">
    <noscript
    ><img
      height="1"
      width="1"
      style="display: none"
      src="https://www.facebook.com/tr?id=511989944868441&ev=PageView&noscript=1"
  /></noscript>
    <object
        type="application/x-netcast-info"
        id="device"
        width="0"
        height="0"
        style="float: left">
    </object>
    <div class="splash-app"></div>
    <style ng-if="hostname=='localhost'">
        .btn-app.focus-item-keyboard, .focus-item-keyboard.btn-sreaction,
        .item-keyboard-v2.focus-item-keyboard,
        .item-keyboard-v2.btn-user-main.btn-m-user.focus-item-keyboard,
        .menu-user .item-keyboard-v2.focus-item-keyboard{
            border-color: white !important;
        }
        .menu-user .cont-btn-m-user .label-option-menu{
            color: #fff !important;
        }
    </style>

  <div>
      <div id="content"
           class="container"
           ng-controller="mainCtrl">


          <div class="row show-btn-user">
              <!--{{broadcast.checkSelectable()}}-->
              <!--ng-class="{'show-btn-user':btnUser.showBtns}"-->
              <div class="keyboard-parent cont-broadcast-map"
                   style="position: fixed"
                   ng-style="broadcast.styleContBrodcast(4)">
                  <div ng-show="broadcast.fullScreen" class="block-hover">
                  </div>
                  <div class="broadcast-map item-keyboard-v2"
                        ng-class="{'fullScreen':broadcast.fullScreen}"
                       id="selectable-brod"
                       ng-click="broadcast.setFullScreen(true)"
                       style="height: 100%;width: 100%"
                       ng-init="main.mapping()">
                      <!--ng-show="!video"-->
                      <div id='outputView'
                           class='outputView'>
                          <!-- Object Broadcast plugin -->
                          <div id="cover-live-tv"
                               ng-style="broadcast.styleBrodcast()"
                               ng-click="broadcast.setFullScreen(true)"></div>
                          <!--ng-if="!video"-->
                          <!--style="{{(!videos?'visibility:visible':'visibility:hidden')}}"-->
                          <!-- <object ng-style="broadcast.styleBrodcast('x-netcast-broadcast')"
                                  style="position:fixed; z-index: 100"
                                  onload="init('broadcast')"
                                  type="application/x-netcast-broadcast"
                                  id="broadcast">
                              <h1>

                              </h1>
                          </object> -->
                      </div>
                  </div>

                  <!--<video id="video" width="1280" height="720" style="display: none"></video>-->
              </div>

              <notification></notification>
              <!-- Brand is not more displayed because of changes in menu component -->
              <!-- <brand databrand="main.brands"></brand> -->

              <brand ng-show="main.sponsors.length>0"
                     databrand="main.sponsors">
              </brand>

              <div class="cont-menu-lateral" ui-view></div>

              <ads ng-show="typeMenuBottom!=''" type="typeMenuBottom"></ads>
              <last-video ng-if="false && currentBrand &&
                                 currentBrand.last_video &&
                                 !broadcast.fullScreen &&
                                 !video"
                          ng-style="{'visibility':currentBrand && currentBrand.last_video_loaded?'visible':'hidden'}"
                          current-brand="currentBrand">
              </last-video>
              <ppv ng-if="currentBrand &&
                          main.ppv && main.ppv.type_mode &&
                          !broadcast.fullScreen &&
                          !video"
                          ng-style="{'visibility':currentBrand && main.ppv?'visible':'hidden'}"
                          ppv="main.ppv">
              </ppv>
              <keyboard ng-if="showKeyboard"></keyboard>
              <!---->
              <!--<video id="test-player"-->
                     <!--style="position: fixed;z-index: 10000;display: none"></video>-->
              <player-modal ng-if="video" data="video"></player-modal>
              <menu ng-show="currentUser || anonymousMode" ng-style="{'position':video?'static':'relative'}"></menu>
              <select-brand ng-if="!currentUser && !video && !anonymousMode"></select-brand>
          </div>
        </div>
  </div>

      <script defer src="//imasdk.googleapis.com/js/sdkloader/ima3.js"></script>

  <script>
  // Firebase 4.6.0 uses ES6+ (arrow functions, const, etc.) that Chrome 38 (LG B7 webOS 3.x)
  // cannot parse. Loading it synchronously crashes the parser before Angular boots.
  // DISABLE_FB is already set above for webOS/Tizen, so skip injection entirely on those devices.
  if (window.DISABLE_FB) {
      if (window.__b7log) { window.__b7log('fb_skipped'); }
  } else {
      document.write('<scr'+'ipt src="https://www.gstatic.com/firebasejs/4.6.0/firebase.js"><\/scr'+'ipt>');
      document.write('<scr'+'ipt src="https://www.gstatic.com/firebasejs/4.6.0/firebase-firestore.js"><\/scr'+'ipt>');
  }
  </script>

  <!--<link type="text/css" rel="Stylesheet" href="vendor/jsLgVKeyboard/LgVKeyboard.css"/>-->
  <!--<script id="mainVKScript" type="text/javascript" src="vendor/jsLgVKeyboard/LgVKeyboard.js"></script>-->
    <!-- test a hls.js release -->
  <script defer src="//cdnjs.cloudflare.com/ajax/libs/hls.js/0.8.4/hls.min.js"></script>


  <!-- build:js scripts/vendor.js -->
  <!-- endbuild -->
  <!-- build:js scripts/app.js -->
  <!-- Scripts de la app generados por Webpack se inyectan automáticamente -->
  <!-- endbuild -->


<script defer src="/scripts/vendor.js"></script><script defer src="/scripts/app.js"></script></body>
</html>
