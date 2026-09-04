// common.js — utilitários compartilhados pelas páginas do painel

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function maskTokenJS(token) {
  if (typeof token !== 'string' || token.length < 12) return '***';
  return token.slice(0, 6) + '...' + token.slice(-4);
}

function toast(msg, type = 'success', timeout = 3500) {
  let el = document.getElementById('app-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'app-toast';
    el.className = 'toast-message';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = 'toast-message ' + type + ' show';
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), timeout);
}

async function fetchJSON(url, opts = {}) {
  const res = await fetch(url, Object.assign({ credentials: 'include' }, opts, {
    headers: Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {}),
  }));
  let data = null;
  try { data = await res.json(); } catch (_) { data = null; }
  return { ok: res.ok, status: res.status, data };
}

async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    return true;
  } catch (e) { return false; }
}

async function logout() {
  try { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }); } catch (_) {}
  location.href = '/';
}

function formatNumber(n) {
  return new Intl.NumberFormat('pt-BR').format(Number(n || 0));
}

function formatDateTimeBR(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    return d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', hour12: false });
  } catch { return String(iso); }
}
