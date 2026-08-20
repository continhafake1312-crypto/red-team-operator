/* Secret Hunter Dashboard — Frontend */
const state = {page:1, limit:50, total:0, typeFilter:'', statusFilter:'', search:'', chart:null, chartType:'doughnut'};
const debounce = (fn, d=400) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), d); }; };
const debounceSearch = debounce(() => { state.search = document.getElementById('searchInput').value; state.page = 1; loadSecrets(); });

async function loadStats() {
  try {
    const r = await fetch('/api/stats'); const d = await r.json(); const s = d.stats || {};
    document.getElementById('totalSecrets').textContent = s.total_secrets || 0;
    document.getElementById('validSecrets').textContent = s.valid || 0;
    document.getElementById('invalidSecrets').textContent = s.invalid || 0;
    document.getElementById('pendingSecrets').textContent = s.pending || 0;
    document.getElementById('uniqueTypes').textContent = s.unique_types || 0;
    document.getElementById('uniqueRepos').textContent = s.unique_repos || 0;
    renderChart(d.by_type || []);
    loadTypeFilter(d.by_type || []);
    renderScans(d.recent_scans || []);
  } catch (e) { console.error(e); }
}

function renderChart(types) {
  const ctx = document.getElementById('typeChart');
  const labels = types.map(t => t.key_type || '?');
  const values = types.map(t => t.total || 0);
  const colors = ['#58a6ff','#3fb950','#f85149','#d29922','#bc8cff','#ff7b24','#79c0ff','#56d4dd','#f778ba','#db6d28','#7ee787','#e3b341','#ffa657','#a5d6ff','#d2a8ff'];
  if (state.chart) state.chart.destroy();
  state.chartType = document.getElementById('chartType').value;
  state.chart = new Chart(ctx, {
    type: state.chartType,
    data: { labels, datasets: [{ data: values, backgroundColor: colors, borderColor: '#161b22', borderWidth: 2, hoverOffset: 8 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { color: '#8b949e', font: { size: 10 }, padding: 8, boxWidth: 12 } },
        tooltip: { callbacks: { label: (c) => { const t = c.dataset.data.reduce((a,b)=>a+b,0)||1; return ` ${c.label}: ${c.parsed} (${((c.parsed/t)*100).toFixed(1)}%)`; } } }
      }
    }
  });
}

function loadTypeFilter(types) {
  const sel = document.getElementById('typeFilter'); const cur = sel.value;
  sel.innerHTML = '<option value="">Todos os tipos</option>';
  types.forEach(t => { const o = document.createElement('option'); o.value = t.key_type; o.textContent = `${t.key_type} (${t.total})`; sel.appendChild(o); });
  sel.value = cur;
}

function applyFilters() {
  state.typeFilter = document.getElementById('typeFilter').value;
  state.statusFilter = document.getElementById('statusFilter').value;
  state.page = 1; loadSecrets();
}

async function loadSecrets() {
  const tbody = document.getElementById('keysBody');
  tbody.innerHTML = '<tr><td colspan="7" class="center">Carregando...</td></tr>';
  try {
    const p = new URLSearchParams({ limit: state.limit, offset: (state.page-1)*state.limit });
    if (state.typeFilter) p.append('key_type', state.typeFilter);
    if (state.search) p.append('search', state.search);
    if (state.statusFilter === 'valid') { p.append('validated','true'); p.append('is_valid','true'); }
    else if (state.statusFilter === 'invalid') { p.append('validated','true'); p.append('is_valid','false'); }
    else if (state.statusFilter === 'pending') p.append('validated','false');

    const r = await fetch(`/api/secrets?${p}`); const d = await r.json();
    const secrets = d.secrets || []; state.total = d.total || 0;
    document.getElementById('resultCount').textContent = state.total;
    if (!secrets.length) { tbody.innerHTML = '<tr><td colspan="7" class="center">Nenhum secret encontrado</td></tr>'; }
    else tbody.innerHTML = secrets.map(renderRow).join('');
    updatePager();
  } catch (e) { tbody.innerHTML = '<tr><td colspan="7" class="center" style="color:var(--red)">Erro ao carregar</td></tr>'; }
}

function renderRow(s) {
  const pct = (s.confidence || 5) * 10;
  const col = pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--yellow)' : 'var(--red)';
  let sc = 'unknown', sl = '⏳ Pendente';
  if (s.validated) {
    if (s.is_valid === 1) { sc='valid'; sl='✅ Válida'; }
    else if (s.is_valid === 0) { sc='invalid'; sl='❌ Inválida'; }
    else { sc='unknown'; sl='❓ Indeterminado'; }
  }
  const dt = s.date_found || '-';
  const repo = s.repo_name ? s.repo_name.split('/').slice(-2).join('/') : (s.source||'').slice(0,35);
  return `<tr onclick="showDetail(${s.id})" style="cursor:pointer">
    <td><span class="type-badge">${s.key_type}</span></td>
    <td style="font-family:monospace;font-size:.8rem;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.masked_value||'****'}</td>
    <td><div class="conf-bar"><div class="conf-fill" style="width:${pct}%;background:${col}"></div></div> <span style="font-size:.75rem;color:var(--t3)">${s.confidence}/10</span></td>
    <td><span class="status ${sc}">${sl}</span></td>
    <td><a href="${s.source||'#'}" target="_blank" class="repo-link" onclick="event.stopPropagation()">${repo}</a></td>
    <td style="font-size:.8rem;color:var(--t2)">${dt}</td>
    <td><button class="btn sm" onclick="event.stopPropagation();showDetail(${s.id})">🔍</button></td>
  </tr>`;
}

function updatePager() {
  const tp = Math.ceil(state.total / state.limit) || 1;
  document.getElementById('pageInfo').textContent = `Página ${state.page} / ${tp}`;
  document.getElementById('prevBtn').disabled = state.page <= 1;
  document.getElementById('nextBtn').disabled = state.page >= tp;
}
function nextPage(){ const tp=Math.ceil(state.total/state.limit)||1; if(state.page<tp){state.page++;loadSecrets();} }
function prevPage(){ if(state.page>1){state.page--;loadSecrets();} }

async function showDetail(id) {
  const m = document.getElementById('modal'); const b = document.getElementById('modalBody');
  m.classList.add('active');
  b.innerHTML = '<div class="center">Carregando...</div>';
  try {
    const r = await fetch(`/api/secrets/${id}`); const d = await r.json(); const s = d.secret || {};
    document.getElementById('modalTitle').textContent = `${s.key_type}: ${s.key_name||'?'}`;
    let vh = '<span class="status unknown">⏳ Não testada</span>';
    if (s.validated) {
      if (s.is_valid === 1) vh = '<span class="status valid">✅ Válida</span>';
      else if (s.is_valid === 0) vh = '<span class="status invalid">❌ Inválida</span>';
      else vh = '<span class="status unknown">❓ Indeterminada</span>';
    }
    b.innerHTML = `<div class="detail-grid">
      <div class="detail-item"><span class="lbl">Tipo</span><span class="val">${s.key_type||'-'}</span></div>
      <div class="detail-item"><span class="lbl">Nome</span><span class="val">${s.key_name||'-'}</span></div>
      <div class="detail-item"><span class="lbl">Confiança</span><span class="val">${s.confidence||'-'}/10</span></div>
      <div class="detail-item"><span class="lbl">Status</span><span class="val">${vh}</span></div>
      <div class="detail-item detail-full"><span class="lbl">Valor (mascarado)</span><div class="kv">${s.masked_value||'****'}</div></div>
      <div class="detail-item detail-full"><span class="lbl">Fonte</span><span class="val"><a href="${s.source||'#'}" target="_blank" class="repo-link">${s.source||'-'}</a></span></div>
      <div class="detail-item"><span class="lbl">Repositório</span><span class="val">${s.repo_name||'-'}</span></div>
      <div class="detail-item"><span class="lbl">Arquivo</span><span class="val">${(s.file_path||'').split('/').pop()||'-'}</span></div>
      <div class="detail-item"><span class="lbl">Data</span><span class="val">${s.date_found||'-'}</span></div>
      <div class="detail-item"><span class="lbl">Autor</span><span class="val">${s.author||'-'}</span></div>
      ${s.validation_msg?`<div class="detail-item detail-full"><span class="lbl">Validação</span><span class="val">${s.validation_msg}</span></div>`:''}
      ${s.context?`<div class="detail-item detail-full"><span class="lbl">Contexto</span><div class="kv">${esc(s.context)}</div></div>`:''}
    </div>`;
  } catch (e) { b.innerHTML = '<p style="color:var(--red)">Erro ao carregar</p>'; }
}

function esc(t){const d=document.createElement('div');d.textContent=t;return d.innerHTML;}
function closeModal(){document.getElementById('modal').classList.remove('active');}

function renderScans(scans) {
  const tb = document.getElementById('scansBody');
  if (!scans.length) { tb.innerHTML = '<tr><td colspan="9" class="center">Nenhum scan executado</td></tr>'; return; }
  tb.innerHTML = scans.map(s => {
    const sc = s.status==='completed'?'valid':s.status==='failed'?'invalid':'pending';
    return `<tr>
      <td style="font-family:monospace;font-size:.8rem">${(s.scan_id||'').slice(0,8)}</td>
      <td>${s.scan_type||'-'}</td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.query||'-'}</td>
      <td>${s.total_found||0}</td><td>${s.new_found||0}</td><td>${s.repos_scanned||0}</td>
      <td>${s.duration_seconds?s.duration_seconds.toFixed(1)+'s':'-'}</td>
      <td><span class="status ${sc}">${s.status}</span></td>
      <td style="font-size:.8rem;color:var(--t2)">${(s.created_at||'').slice(0,19).replace('T',' ')}</td>
    </tr>`;
  }).join('');
}

async function runScan() {
  showToast('🔍 Iniciando scan em background...', 'info');
  try {
    const r = await fetch('/api/scan', {method:'POST'});
    const d = await r.json();
    if (r.ok) { showToast('✅ Scan iniciado! Atualize em alguns minutos.', 'success'); setTimeout(loadStats, 2000); }
    else showToast(`⚠️ ${d.message||'erro'}`, 'warning');
  } catch (e) { showToast('❌ Erro ao iniciar scan', 'error'); }
}

async function runValidate() {
  showToast('✓ Validando keys pendentes...', 'info');
  try {
    await fetch('/api/validate?limit=50', {method:'POST'});
    showToast('✅ Validação iniciada!', 'success');
    setTimeout(() => { loadStats(); loadSecrets(); }, 5000);
  } catch (e) { showToast('❌ Erro', 'error'); }
}

async function exportData() {
  try {
    const p = new URLSearchParams({format:'json'});
    if (state.typeFilter) p.append('key_type', state.typeFilter);
    if (state.statusFilter==='valid'){p.append('validated','true');p.append('is_valid','true');}
    const r = await fetch(`/api/export?${p}`); const blob = await r.blob();
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = `secrets-${new Date().toISOString().slice(0,10)}.json`; a.click();
    URL.revokeObjectURL(url); showToast('📥 Exportado!', 'success');
  } catch (e) { showToast('❌ Erro ao exportar', 'error'); }
}

function showToast(msg, type='info') {
  const w = document.getElementById('toastWrap'); const t = document.createElement('div');
  t.className = `toast ${type}`; t.textContent = msg; w.appendChild(t);
  setTimeout(() => { t.style.opacity='0'; t.style.transform='translateX(100%)'; t.style.transition='all .3s'; setTimeout(()=>t.remove(),300); }, 4000);
}

document.addEventListener('DOMContentLoaded', () => {
  loadStats(); loadSecrets();
  setInterval(loadStats, 15000); // auto-refresh
});