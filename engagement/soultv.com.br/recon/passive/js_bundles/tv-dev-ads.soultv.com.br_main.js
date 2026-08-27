<!DOCTYPE html>
<html ng-app="iva">
<head>
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
  <script type="text/javascript" src="$WEBAPIS/webapis/webapis.js"></script>
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
          analytics.load(
            "bb2ac250436d12d3f07a",
            // Optional: Set other config here
            // {
            //   "integrations": {
            //     "Customer.io In-App Plugin": {
            //       siteId: "YOUR_SITE_ID"
            //     }
            //   }
            // }
          );
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

    <!-- Meta Pixel Code -->
    <script>
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
      </script>
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
<link href="/css/app.465e4cbf941ef1b15fe5.css" rel="stylesheet"></head>
<!-- start Mixpanel -->
<script type="text/javascript">
    (function(e,a){if(!a.__SV){var b=window;try{var c,l,i,j=b.location,g=j.hash;c=function(a,b){return(l=a.match(RegExp(b+"=([^&]*)")))?l[1]:null};g&&c(g,"state")&&(i=JSON.parse(decodeURIComponent(c(g,"state"))),"mpeditor"===i.action&&(b.sessionStorage.setItem("_mpcehash",g),history.replaceState(i.desiredHash||"",e.title,j.pathname+j.search)))}catch(m){}var k,h;window.mixpanel=a;a._i=[];a.init=function(b,c,f){function e(b,a){var c=a.split(".");2==c.length&&(b=b[c[0]],a=c[1]);b[a]=function(){b.push([a].concat(Array.prototype.slice.call(arguments,
    0)))}}var d=a;"undefined"!==typeof f?d=a[f]=[]:f="mixpanel";d.people=d.people||[];d.toString=function(b){var a="mixpanel";"mixpanel"!==f&&(a+="."+f);b||(a+=" (stub)");return a};d.people.toString=function(){return d.toString(1)+".people (stub)"};k="disable time_event track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config reset people.set people.set_once people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");
    for(h=0;h<k.length;h++)e(d,k[h]);a._i.push([b,c,f])};a.__SV=1.2;b=e.createElement("script");b.type="text/javascript";b.async=!0;b.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===e.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";c=e.getElementsByTagName("script")[0];c.parentNode.insertBefore(b,c)}})(document,window.mixpanel||[]);
    // produccion
    mixpanel.init("179ca16a7f9e41d344a53cae84af000b");
    // test
    // mixpanel.init("75511a53e2541faddbb857cda40a85f4");

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
                        broadcast.channelUp();
                        break;

                    case VK_PAGE_DOWN:
                    case VK_CHANNEL_DOWN:

                        broadcast = document.getElementById(element);
                        broadcast.channelDown();
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


    // ============================================
    // IFRAME COMMUNICATION - Soporte para embedding
    // ============================================
    (function() {
        var isInIframe = false;
        var parentOrigin = '*'; // Se actualizará con el origen real del padre

        // Detectar si estamos dentro de un iframe
        try {
            isInIframe = window.self !== window.top;
        } catch (e) {
            isInIframe = true;
        }

        if (isInIframe) {
            console.log('[IFRAME] Aplicación cargada dentro de un iframe');

            // Notificar al padre que la aplicación se cargó
            window.addEventListener('load', function() {
                try {
                    window.parent.postMessage({
                        type: 'APP_LOADED',
                        timestamp: new Date().toISOString(),
                        source: 'TivaTV',
                        url: window.location.href
                    }, '*');
                    console.log('[IFRAME] Mensaje APP_LOADED enviado al padre');
                } catch (e) {
                    console.error('[IFRAME] Error al enviar mensaje al padre:', e);
                }
            });

            // Listener para recibir mensajes del padre
            window.addEventListener('message', function(event) {
                // Guardar el origen del padre para futuras comunicaciones
                if (parentOrigin === '*' && event.origin) {
                    parentOrigin = event.origin;
                    console.log('[IFRAME] Origen del padre detectado:', parentOrigin);
                }

                console.log('[IFRAME] Mensaje recibido del padre:', event.data);

                // Manejar diferentes tipos de mensajes
                if (event.data && event.data.type) {
                    switch (event.data.type) {
                        case 'PING':
                            // Responder al ping del padre
                            window.parent.postMessage({
                                type: 'PONG',
                                timestamp: new Date().toISOString(),
                                source: 'TivaTV'
                            }, event.origin);
                            break;

                        case 'REQUEST_STATUS':
                            // Enviar estado de la aplicación
                            window.parent.postMessage({
                                type: 'STATUS',
                                status: 'running',
                                timestamp: new Date().toISOString(),
                                source: 'TivaTV',
                                user: window.currentUser ? 'logged' : 'guest',
                                brand: window.currentBrand ? window.currentBrand.name : 'none',
                                video: window.video ? 'playing' : 'idle'
                            }, event.origin);
                            break;

                        case 'RELOAD':
                            // Recargar la aplicación
                            console.log('[IFRAME] Recargando aplicación por solicitud del padre');
                            window.location.reload();
                            break;

                        case 'CHANGE_CHANNEL':
                            // Cambiar canal (si aplica)
                            if (event.data.data && event.data.data.channelId) {
                                console.log('[IFRAME] Solicitud de cambio de canal:', event.data.data.channelId);
                                // Aquí se puede integrar con la lógica de cambio de canal
                            }
                            break;

                        default:
                            console.log('[IFRAME] Tipo de mensaje no reconocido:', event.data.type);
                    }
                }
            }, false);

            // Notificar eventos importantes al padre
            window.sendEventToParent = function(eventType, data) {
                try {
                    window.parent.postMessage({
                        type: eventType,
                        data: data,
                        timestamp: new Date().toISOString(),
                        source: 'TivaTV'
                    }, parentOrigin);
                    console.log('[IFRAME] Evento enviado al padre:', eventType, data);
                } catch (e) {
                    console.error('[IFRAME] Error al enviar evento al padre:', e);
                }
            };

            // Notificar errores al padre
            window.addEventListener('error', function(event) {
                window.sendEventToParent('APP_ERROR', {
                    message: event.message,
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno
                });
            });

            // Observar cambios en variables globales importantes

            // Monitorear currentUser
            var originalCurrentUser = window.currentUser;
            Object.defineProperty(window, 'currentUser', {
                get: function() {
                    return originalCurrentUser;
                },
                set: function(value) {
                    originalCurrentUser = value;
                    window.sendEventToParent('USER_CHANGED', {
                        user: value ? 'logged' : 'guest',
                        userId: value ? (value.id || value.uid) : null
                    });
                },
                configurable: true
            });

            // Monitorear currentBrand
            var originalCurrentBrand = window.currentBrand;
            Object.defineProperty(window, 'currentBrand', {
                get: function() {
                    return originalCurrentBrand;
                },
                set: function(value) {
                    originalCurrentBrand = value;
                    window.sendEventToParent('BRAND_CHANGED', {
                        brand: value ? value.name : 'none',
                        brandId: value ? value.id : null
                    });
                },
                configurable: true
            });

            // Monitorear video
            var originalVideo = window.video;
            Object.defineProperty(window, 'video', {
                get: function() {
                    return originalVideo;
                },
                set: function(value) {
                    originalVideo = value;
                    if (value) {
                        window.sendEventToParent('VIDEO_PLAYED', {
                            videoId: value.id || value.uid,
                            videoTitle: value.name || value.title,
                            status: 'playing'
                        });
                    } else {
                        window.sendEventToParent('VIDEO_STOPPED', {
                            status: 'stopped'
                        });
                    }
                },
                configurable: true
            });

            // Wrapper para sendEvent (Mixpanel) para enviar también al padre
            var originalSendEvent = window.sendEvent;
            window.sendEvent = function(event, data) {
                // Llamar a la función original
                if (originalSendEvent) {
                    originalSendEvent(event, data);
                }
                // Enviar al padre también
                window.sendEventToParent('MIXPANEL_EVENT', {
                    event: event,
                    data: data
                });
            };

            console.log('[IFRAME] Sistema de comunicación con iframe padre inicializado');
        } else {
            console.log('[IFRAME] Aplicación NO está dentro de un iframe');
        }

        // Función global para enviar mensajes al padre (disponible siempre)
        window.postToParent = function(type, data) {
            if (isInIframe) {
                try {
                    window.parent.postMessage({
                        type: type,
                        data: data,
                        timestamp: new Date().toISOString(),
                        source: 'TivaTV'
                    }, parentOrigin);
                } catch (e) {
                    console.error('[IFRAME] Error al enviar mensaje:', e);
                }
            }
        };

        // Exponer el estado del iframe globalmente
        window.iframeState = {
            isInIframe: isInIframe,
            parentOrigin: parentOrigin
        };

        // ============================================
        // DETECTAR BOTÓN BACK Y NOTIFICAR AL PADRE
        // ============================================
        if (isInIframe) {
            // Detectar tecla ESC (común para exit fullscreen)
            document.addEventListener('keydown', function(event) {
                if (event.keyCode === 27) { // ESC key
                    console.log('[IFRAME] Tecla ESC presionada');
                    window.sendEventToParent('BACK_PRESSED', {
                        action: 'exit_fullscreen',
                        timestamp: new Date().toISOString()
                    });
                }
            }, false);

            // Detectar clicks en botones back si existen
            document.addEventListener('click', function(event) {
                var target = event.target;
                // Buscar elementos con clase o id que contengan 'back'
                if (target && (target.classList.contains('btn-back') ||
                               target.classList.contains('back-button') ||
                               target.id.indexOf('back') !== -1 ||
                               (target.parentElement && target.parentElement.classList.contains('btn-back')))) {
                    console.log('[IFRAME] Botón back presionado');
                    window.sendEventToParent('BACK_PRESSED', {
                        action: 'back_button',
                        timestamp: new Date().toISOString()
                    });
                }
            }, true); // Usar captura para detectar antes que otros listeners
        }
    })();
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
              <menu ng-show="currentUser" ng-style="{'position':video?'static':'relative'}"></menu>
              <select-brand ng-if="!currentUser && !video"></select-brand>
          </div>
        </div>
  </div>

      <script src="//imasdk.googleapis.com/js/sdkloader/ima3.js"></script>

   <script src="https://www.gstatic.com/firebasejs/4.6.0/firebase.js"></script>
  <script src="https://www.gstatic.com/firebasejs/4.6.0/firebase-firestore.js"></script>

  <!--<link type="text/css" rel="Stylesheet" href="vendor/jsLgVKeyboard/LgVKeyboard.css"/>-->
  <!--<script id="mainVKScript" type="text/javascript" src="vendor/jsLgVKeyboard/LgVKeyboard.js"></script>-->
    <!-- test a hls.js release -->
  <script defer src="//cdnjs.cloudflare.com/ajax/libs/hls.js/0.8.4/hls.min.js"></script>


  <!-- build:js scripts/vendor.js -->
  <!-- endbuild -->
  <!-- build:js scripts/app.js -->
  <!-- Scripts de la app generados por Webpack se inyectan automáticamente -->
  <!-- endbuild -->


<script defer src="/js/vendor.4bce13ccf1f215a1f198.js"></script><script defer src="/js/app.3ec4870277829b6fad18.js"></script></body>
</html>
