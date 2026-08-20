/* Secret Hunter v2 — Dashboard Script */

const state = {
  page: 1, limit: 50, total: 0,
  typeFilter: '', statusFilter: '', search: '',
  chart: null, chartType: 'doughnut',
  sortBy: 'scan_date', sortDesc: true,
  period: 0,  // 0 = total, 7 = 7d, 30 = 30d
  currentModalId: null,
};

const debounce = (fn, d = 400) => {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), d); };
};
const debounceSearch = debounce(() => {
  state.search = document.getElementById('searchInput').value;
  state.page = 1;
  loadSecrets();
});

// ── Stats ──
async function loadStats() {
  try {
    const r = await fetch('/api/stats');
    const d = await r.json();
    const s = d.stats || {};
    document.getElementById('totalSecrets').textContent = s.total_secrets || 0;
    document.getElementById('validSecrets').textContent = s.valid || 0;
    document.getElementById('invalidSecrets').textContent = s.invalid || 0;
    document.getElementById('pendingSecrets').textContent = s.pending || 0;
    document.getElementById('uniqueTypes').textContent = s.unique_types || 0;
    document.getElementById('uniqueRepos').textContent = s.unique_repos || 0;

    // Trend
    const t24 = s.recent_24h || 0;
    document.getElementById('trendTotal').textContent = `+${t24} nas últimas 24h`;

    renderChart(d.by_type || []);
    loadTypeFilter(d.by_type || []);
    renderScans(d.recent_scans || []);

    // Token pool
    const ps = d.token_pool || {};
    if (ps.harvested_count > 0) {
      document.getElementById('poolPanel').style.display = 'block';
      document.getElementById('poolCount').textContent = `${ps.seed_count || 0} seed + ${ps.harvested_count} colhidos`;
      renderPool(ps.harvested || []);
    }
  } catch (e) {
    console.error('Stats error:', e);
  }
}

function renderChart(types) {
  const ctx = document.getElementById('typeChart');
  if (!ctx) return;
  const colors = ['#58a6ff','#3fb950','#f85149','#d29922','#bc8cff','#ff7b24','#79c0ff','#56d4dd','#f778ba','#db6d28','#7ee787','#e3b341','#ffa657','#a5d6ff','#d2a8ff','#ff9b9b','#9bff9b','#9bbfff'];

  // Filtra por período
  let filtered = types;
  if (state.period > 0) {
    // Server-side filtering not supported for by_type,
    // we just display what we have
  }

  const labels = filtered.map(t => t.key_type || '?');
  const values = filtered.map(t => t.total || 0);

  if (state.chart) state.chart.destroy();
  state.chartType = document.getElementById('chartType').value;

  state.chart = new Chart(ctx, {
    type: state.chartType,
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: 'rgba(10,10,15,0.8)',
        borderWidth: 2,
        hoverOffset: 12,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#8b949e', font: { size: 10 },
            padding: 10, boxWidth: 14, usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: 'rgba(22,27,34,0.95)',
          titleColor: '#f0f6fc',
          bodyColor: '#8b949e',
          borderColor: 'rgba(48,54,61,0.5)',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: (c) => {
              const t = c.dataset.data.reduce((a, b) => a + b, 0) || 1;
              return ` ${c.label}: ${c.parsed} (${((c.parsed / t) * 100).toFixed(1)}%)`;
            },
          },
        },
      },
      scales: {
        r: {
          grid: { color: 'rgba(48,54,61,0.3)' },
          ticks: { color: '#6e7681', backdropColor: 'transparent', font: { size: 9 } },
        },
      },
    },
  });
}

// ── Type Filter ──
function loadTypeFilter(types) {
  const sel = document.getElementById('typeFilter');
  const cur = sel.value;
  sel.innerHTML = '<option value="">Todos tipos</option>';
  types.forEach(t => {
    const o = document.createElement('option');
    o.value = t.key_type;
    o.textContent = `${t.key_type} (${t.total})`;
    sel.appendChild(o);
  });
  sel.value = cur;
}

function applyFilters() {
  state.typeFilter = document.getElementById('typeFilter').value;
  state.statusFilter = document.getElementById('statusFilter').value;
  state.page = 1;
  loadSecrets();
}

function setPeriod(days) {
  state.period = days;
  document.querySelectorAll('.period-btn').forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.days) === days);
  });
  loadStats(); // re-render chart
}

// ── Secrets Table ──
async function loadSecrets() {
  const tbody = document.getElementById('keysBody');
  tbody.innerHTML = '<tr><td colspan="7" class="center"><div class="loading-spinner"></div> Carregando...</td></tr>';
  try {
    const p = new URLSearchParams({
      limit: state.limit, offset: (state.page - 1) * state.limit,
      order_by: state.sortBy, order_desc: state.sortDesc,
    });
    if (state.typeFilter) p.append('key_type', state.typeFilter);
    if (state.search) p.append('search', state.search);
    if (state.statusFilter === 'valid') { p.append('validated', 'true'); p.append('is_valid', 'true'); }
    else if (state.statusFilter === 'invalid') { p.append('validated', 'true'); p.append('is_valid', 'false'); }
    else if (state.statusFilter === 'pending') p.append('validated', 'false');

    const r = await fetch(`/api/secrets?${p}`);
    const d = await r.json();
    const secrets = d.secrets || [];
    state.total = d.total || 0;
    document.getElementById('resultCount').textContent = state.total;

    if (!secrets.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="center">Nenhum secret encontrado</td></tr>';
    } else {
      tbody.innerHTML = secrets.map(renderRow).join('');
    }
    updatePager();
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="7" class="center" style="color:var(--red)">Erro ao carregar dados</td></tr>';
  }
}

function renderRow(s) {
  const pct = (s.confidence || 5) * 10;
  const col = pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--yellow)' : 'var(--red)';
  let sc = 'unknown', sl = '⏳ Pendente';
  if (s.validated) {
    if (s.is_valid === 1) { sc = 'valid'; sl = '✅ Válida'; }
    else if (s.is_valid === 0) { sc = 'invalid'; sl = '❌ Inválida'; }
    else { sc = 'unknown'; sl = '❓ Indeterminado'; }
  }
  const dt = s.date_found ? s.date_found.slice(0, 10) : '-';
  const repo = s.repo_name || (s.source || '').slice(0, 40) || '-';

  return `<tr onclick="showDetail(${s.id})" style="cursor:pointer">
    <td><span class="type-badge">${esc(s.key_type || '?')}</span></td>
    <td style="font-family:monospace;font-size:0.78rem;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(s.masked_value || s.key_value || '')}">${esc(s.masked_value || '****')}</td>
    <td><div class="conf-bar"><div class="conf-fill"><div class="conf-fill-inner" style="width:${pct}%;background:${col}"></div></div><span class="conf-text">${s.confidence}/10</span></div></td>
    <td><span class="status ${sc}">${sl}</span></td>
    <td><a href="${s.source || '#'}" target="_blank" class="repo-link" onclick="event.stopPropagation()" title="${esc(repo)}">${esc(repo.length > 35 ? repo.slice(0, 32) + '...' : repo)}</a></td>
    <td style="font-size:0.78rem;color:var(--t2);white-space:nowrap">${dt}</td>
    <td><button class="btn sm" onclick="event.stopPropagation();showDetail(${s.id})" title="Detalhes">🔍</button></td>
  </tr>`;
}

function updatePager() {
  const tp = Math.ceil(state.total / state.limit) || 1;
  document.getElementById('pageInfo').textContent = `Página ${state.page} / ${tp}`;
  document.getElementById('prevBtn').disabled = state.page <= 1;
  document.getElementById('nextBtn').disabled = state.page >= tp;
}

function nextPage() {
  const tp = Math.ceil(state.total / state.limit) || 1;
  if (state.page < tp) { state.page++; loadSecrets(); }
}
function prevPage() {
  if (state.page > 1) { state.page--; loadSecrets(); }
}
function changeLimit(val) {
  state.limit = parseInt(val);
  state.page = 1;
  loadSecrets();
}

function sortBy(col) {
  if (state.sortBy === col) {
    state.sortDesc = !state.sortDesc;
  } else {
    state.sortBy = col;
    state.sortDesc = true;
  }
  state.page = 1;
  loadSecrets();
}

// ── Detail Modal ──
let _currentModalId = null;

async function showDetail(id) {
  _currentModalId = id;
  const m = document.getElementById('modal');
  const b = document.getElementById('modalBody');
  m.classList.add('active');
  b.innerHTML = '<div class="center"><div class="loading-spinner"></div> Carregando...</div>';
  try {
    const r = await fetch(`/api/secrets/${id}`);
    const d = await r.json();
    const s = d.secret || {};
    document.getElementById('modalTitle').textContent = `${s.key_type || '?'}: ${s.key_name || '?'}`;

    let vh = '<span class="status unknown">⏳ Não testada</span>';
    if (s.validated) {
      if (s.is_valid === 1) vh = '<span class="status valid">✅ Válida</span>';
      else if (s.is_valid === 0) vh = '<span class="status invalid">❌ Inválida</span>';
      else vh = '<span class="status unknown">❓ Indeterminada</span>';
    }

    const fullVal = s.key_value || '';
    const masked = s.masked_value || '****';
    const ctx = s.context || '';

    b.innerHTML = `<div class="detail-grid">
      <div class="detail-item"><span class="lbl">Tipo</span><span class="val">${esc(s.key_type || '-')}</span></div>
      <div class="detail-item"><span class="lbl">Nome</span><span class="val">${esc(s.key_name || '-')}</span></div>
      <div class="detail-item"><span class="lbl">Confiança</span><span class="val">${s.confidence || '-'}/10</span></div>
      <div class="detail-item"><span class="lbl">Status</span><span class="val">${vh}</span></div>
      <div class="detail-item detail-full"><span class="lbl">Valor (mascarado)</span><div class="kv">${esc(masked)}</div></div>
      <div class="detail-item detail-full"><span class="lbl">Valor completo</span><div class="kv" style="color:var(--t1);font-size:0.72rem">${esc(fullVal.length > 500 ? fullVal.slice(0, 500) + '...' : fullVal)}</div></div>
      <div class="detail-item detail-full"><span class="lbl">Fonte</span><span class="val"><a href="${esc(s.source || '#')}" target="_blank" class="repo-link">${esc(s.source || '-')}</a></span></div>
      <div class="detail-item"><span class="lbl">Repositório</span><span class="val">${esc(s.repo_name || '-')}</span></div>
      <div class="detail-item"><span class="lbl">Arquivo</span><span class="val">${esc((s.file_path || '').split('/').pop() || '-')}</span></div>
      <div class="detail-item"><span class="lbl">Data</span><span class="val">${s.date_found || '-'}</span></div>
      <div class="detail-item"><span class="lbl">Autor</span><span class="val">${esc(s.author || '-')}</span></div>
      <div class="detail-item"><span class="lbl">Scan ID</span><span class="val" style="font-family:monospace;font-size:0.7rem">${esc(s.scan_id || '-')}</span></div>
      ${s.validation_msg ? `<div class="detail-item detail-full"><span class="lbl">Validação</span><span class="val">${esc(s.validation_msg)}</span></div>` : ''}
      ${ctx ? `<div class="detail-item detail-full"><span class="lbl">Contexto (${ctx.length} chars)</span><div class="kv">${esc(ctx.slice(0, 600))}</div></div>` : ''}
    </div>`;
  } catch (e) {
    b.innerHTML = '<p style="color:var(--red)">Erro ao carregar detalhes</p>';
  }
}

async function revalidateModal() {
  if (!_currentModalId) return;
  showToast('🔄 Revalidando...', 'info');
  try {
    await fetch(`/api/revalidate/${_currentModalId}`, { method: 'POST' });
    showToast('✅ Revalidação iniciada!', 'success');
    setTimeout(() => { showDetail(_currentModalId); loadStats(); loadSecrets(); }, 3000);
  } catch (e) {
    showToast('❌ Erro ao revalidar', 'error');
  }
}

function esc(t) { if (!t) return ''; const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
function closeModal() { document.getElementById('modal').classList.remove('active'); _currentModalId = null; }

// ── Scans ──
function renderScans(scans) {
  const tb = document.getElementById('scansBody');
  document.getElementById('scanCount').textContent = scans.length;
  if (!scans.length) {
    tb.innerHTML = '<tr><td colspan="8" class="center">Nenhum scan executado</td></tr>';
    return;
  }
  tb.innerHTML = scans.map(s => {
    const sc = s.status === 'completed' ? 'valid' : s.status === 'failed' ? 'invalid' : 'pending';
    const st = s.status === 'completed' ? '✅' : s.status === 'failed' ? '❌' : '⏳';
    const dur = s.duration_seconds ? `${s.duration_seconds.toFixed(1)}s` : '-';
    const date = (s.created_at || '').slice(0, 19).replace('T', ' ');
    return `<tr>
      <td style="font-family:monospace;font-size:0.75rem;color:var(--t3)">${esc((s.scan_id || '').slice(0, 8))}</td>
      <td>${esc(s.scan_type || '-')}</td>
      <td>${s.total_found || 0}</td>
      <td style="color:var(--green);font-weight:600">${s.new_found || 0}</td>
      <td>${s.repos_scanned || 0}</td>
      <td style="font-size:0.78rem;color:var(--t2)">${dur}</td>
      <td><span class="status ${sc}">${st} ${s.status}</span></td>
      <td style="font-size:0.78rem;color:var(--t2)">${date}</td>
    </tr>`;
  }).join('');
}

// ── Token Pool ──
function renderPool(harvested) {
  const tb = document.getElementById('poolBody');
  if (!harvested.length) {
    tb.innerHTML = '<tr><td colspan="4" class="center">Nenhum token colhido ainda</td></tr>';
    return;
  }
  tb.innerHTML = harvested.map(h => {
    const added = h.added ? new Date(h.added * 1000).toISOString().slice(0, 19).replace('T', ' ') : '-';
    return `<tr>
      <td style="font-family:monospace;font-size:0.75rem;color:var(--yellow)">${esc(h.token || '-')}</td>
      <td style="font-size:0.8rem">${esc(h.source || '-')}</td>
      <td style="font-size:0.8rem">${h.uses || 0}</td>
      <td style="font-size:0.78rem;color:var(--t2)">${added}</td>
    </tr>`;
  }).join('');
}

// ── Actions ──
async function runScan() {
  showToast('🔍 Iniciando scan em background...', 'info');
  try {
    const r = await fetch('/api/scan', { method: 'POST' });
    const d = await r.json();
    if (r.ok) {
      showToast('✅ Scan iniciado! Atualize em alguns minutos.', 'success');
      setTimeout(() => { loadStats(); loadSecrets(); }, 3000);
    } else showToast(`⚠️ ${d.message || 'erro'}`, 'warning');
  } catch (e) { showToast('❌ Erro ao iniciar scan', 'error'); }
}

async function runValidate() {
  showToast('✓ Validando keys pendentes...', 'info');
  try {
    await fetch('/api/validate?limit=50', { method: 'POST' });
    showToast('✅ Validação iniciada!', 'success');
    setTimeout(() => { loadStats(); loadSecrets(); }, 5000);
  } catch (e) { showToast('❌ Erro', 'error'); }
}

async function exportData() {
  try {
    const p = new URLSearchParams({ format: 'json' });
    if (state.typeFilter) p.append('key_type', state.typeFilter);
    if (state.statusFilter === 'valid') { p.append('validated', 'true'); p.append('is_valid', 'true'); }
    if (state.statusFilter === 'invalid') { p.append('validated', 'true'); p.append('is_valid', 'false'); }
    if (state.search) p.append('search', state.search);

    const r = await fetch(`/api/export?${p}`);
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `secrets-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📥 Exportado com sucesso!', 'success');
  } catch (e) { showToast('❌ Erro ao exportar', 'error'); }
}

function showToast(msg, type = 'info') {
  const w = document.getElementById('toastWrap');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  w.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(100%)';
    t.style.transition = 'all 0.3s ease';
    setTimeout(() => t.remove(), 300);
  }, 4000);
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  loadStats();
  loadSecrets();
  setInterval(loadStats, 15000); // auto-refresh
});