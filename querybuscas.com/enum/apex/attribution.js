(function () {
  'use strict';

  var COOKIE_NAME = '_qb_track';
  var COOKIE_MAX_AGE_S = 30 * 24 * 60 * 60; // 30 dias

  function cookieExists(name) {
    return new RegExp('(?:^|; )' + name + '=').test(document.cookie);
  }

  function setCookie(name, value, maxAgeSeconds) {
    document.cookie = name + '=' + encodeURIComponent(value)
      + '; max-age=' + maxAgeSeconds
      + '; path=/; SameSite=Lax';
  }

  try {
    if (cookieExists(COOKIE_NAME)) return; // first-touch: já capturado, não sobrescreve

    var params = new URLSearchParams(window.location.search);
    var utmSource = params.get('utm_source') || '';
    var utmCampaign = params.get('utm_campaign') || '';
    var utmContent = params.get('utm_content') || '';
    var utmMedium = params.get('utm_medium') || '';
    var utmTerm = params.get('utm_term') || '';
    var fbclid = params.get('fbclid') || '';
    var adId = params.get('ad_id') || '';

    // Sem nenhum parâmetro relevante = tráfego direto/orgânico. Não grava cookie
    // (a ausência do cookie já é o sinal de "orgânico" no backend).
    if (!utmSource && !utmCampaign && !fbclid) return;

    var track = {
      utm_source: utmSource,
      utm_campaign: utmCampaign,
      utm_content: utmContent,
      utm_medium: utmMedium,
      utm_term: utmTerm,
      fbclid: fbclid,
      ad_id: adId,
      landing_url: window.location.pathname + window.location.search,
      first_touch_at: Date.now(),
    };

    setCookie(COOKIE_NAME, JSON.stringify(track), COOKIE_MAX_AGE_S);
  } catch (e) {}
})();
