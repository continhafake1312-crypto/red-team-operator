/* ── Secret Hunter Dashboard ── Frontend Logic ───────────────────── */

// ── State ──
let state = {
    page: 1,
    limit: 50,
    total: 0,
    typeFilter: '',
    statusFilter: '',
    search: '',
    chart: null,
    chartType: 'doughnut',
    autoRefresh: true,
    refreshInterval: null,
};

// ── Debounce ──
function debounce(fn, delay = 400) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

const debounceSearch = debounce(() => {
    state.search = document.getElementById('searchInput').value;
    state.page = 1;
    loadSecrets();
});

// ── Load Stats ──
async function loadStats() {
    try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        const stats = data.stats || {};

        document.getElementById('totalSecrets').textContent = stats.total_secrets ?? 0;
        document.getElementById('validSecrets').textContent = stats.valid ?? 0;
        document.getElementById('invalidSecrets').textContent = stats.invalid ?? 0;
        document.getElementById('pendingSecrets').textContent = stats.pending ?? 0;
        document.getElementById('uniqueTypes').textContent = stats.unique_types ?? 0;
        document.getElementById('uniqueRepos').textContent = stats.unique_repos ?? 0;

        // Atualiza chart
        updateChart(data.by_type || []);
        loadTypeFilter(data.by_type || []);
    } catch (e) {
        console.error('Erro ao carregar stats:', e);
    }
}

// ── Type Chart ──
function updateChart(types) {
    const ctx = document.getElementById('typeChart').getContext('2d');

    const labels = types.map(t => t.key_type || '?');
    const values = types.map(t => t.total || 0);
    const validValues = types.map(t => t.valid_count || 0);

    const colors = [
        '#58a6ff', '#3fb950', '#f85149', '#d29922', '#bc8cff',
        '#ff7b24', '#79c0ff', '#56d4dd', '#f778ba', '#db6d28',
        '#7ee787', '#e3b341', '#ffa657', '#a5d6ff', '#d2a8ff',
    ];

    const bgColors = labels.map((_, i) => colors[i % colors.length]);

    if (state.chart) {
        state.chart.destroy();
    }

    const config = {
        type: state.chartType,
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: bgColors,
                borderColor: '#161b22',
                borderWidth: 2,
                hoverOffset: 8,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#8b949e',
                        font: { size: 10 },
                        padding: 8,
                        boxWidth: 12,
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const pct = ((ctx.parsed / total) * 100).toFixed(1);
                            return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`;
                        }
                    }
                }
            }
        },
        plugins: [ChartDataLabels ? {
            id: 'custom-datalabels',
            afterDatasetsDraw(chart) {
                if (state.chartType === 'doughnut' || state.chartType === 'pie') {
                    const meta = chart.getDatasetMeta(0);
                    meta.data.forEach((arc, i) => {
                        const val = chart.data.datasets[0].data[i];
                        if (val > 0 && chart.data.datasets[0].data.reduce((a, b) => a + b, 0) > 0) {
                            const pct = (val / chart.data.datasets[0].data.reduce((a, b) => a + b, 0)) * 100;
                            ctx.font = '8px sans-serif';
                            ctx.fillStyle = '#f0f6fc';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            const center = arc.getCenterPoint();
                            ctx.fillText(pct >= 3 ? `${pct.toFixed(0)}%` : '', center.x, center.y);
                        }
                    });
                }
            }
        } : null].filter(Boolean),
    };

    state.chart = new Chart(ctx, config);
}

function updateChartType() {
    state.chartType = document.getElementById('chartTypeSelector').value;
    loadStats();
}

// ── Type Filter ──
function loadTypeFilter(types) {
    const sel = document.getElementById('typeFilter');
    const current = sel.value;
    sel.innerHTML = '<option value="">Todos os tipos</option>';
    types.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.key_type;
        opt.textContent = `${t.key_type} (${t.total})`;
        sel.appendChild(opt);
    });
    sel.value = current;
}

function applyFilters() {
    state.typeFilter = document.getElementById('typeFilter').value;
    state.statusFilter = document.getElementById('statusFilter').value;
    state.page = 1;
    loadSecrets();
}

// ── Load Secrets ──
async function loadSecrets() {
    const tbody = document.getElementById('keysBody');
    tbody.innerHTML = '<tr class="loading-row"><td colspan="7"><div class="loading"><div class="spinner"></div> Carregando...</div></td></tr>';

    try {
        const params = new URLSearchParams({
            limit: state.limit,
            offset: (state.page - 1) * state.limit,
            order_by: 'scan_date',
            order_desc: 'true',
        });

        if (state.typeFilter) params.append('key_type', state.typeFilter);
        if (state.search) params.append('search', state.search);

        // Status filter mapping
        if (state.statusFilter === 'valid') { params.append('validated', 'true'); params.append('is_valid', 'true'); }
        else if (state.statusFilter === 'invalid') { params.append('validated', 'true'); params.append('is_valid', 'false'); }
        else if (state.statusFilter === 'pending') { params.append('validated', 'false'); }

        const res = await fetch(`/api/secrets?${params}`);
        const data = await res.json();
        const secrets = data.secrets || [];

        state.total = data.total || 0;
        document.getElementById('resultCount').textContent = `${state.total} resultados`;

        if (secrets.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--text-secondary)">Nenhum secret encontrado</td></tr>';
        } else {
            tbody.innerHTML = secrets.map(s => renderSecretRow(s)).join('');
        }

        updatePagination();
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--red)">Erro ao carregar dados</td></tr>';
    }
}

function renderSecretRow(s) {
    const confPct = (s.confidence || 5) * 10;
    const confColor = confPct >= 80 ? 'var(--green)' : confPct >= 50 ? 'var(--yellow)' : 'var(--red)';

    let statusClass = 'unknown';
    let statusLabel = '⏳ Pendente';
    if (s.validated) {
        if (s.is_valid === true) { statusClass = 'valid'; statusLabel = '✅ Válida'; }
        else if (s.is_valid === false) { statusClass = 'invalid'; statusLabel = '❌ Inválida'; }
        else { statusClass = 'unknown'; statusLabel = '❓ Indeterminado'; }
    }

    const dateStr = s.date_found ? s.date_found.slice(0, 10) : '-';
    const repoShort = s.repo_name ? s.repo_name.split('/').slice(-2).join('/') : (s.source ? s.source.slice(0, 35) + '...' : '-');

    return `
        <tr onclick="showDetail(${s.id})" style="cursor:pointer">
            <td><span class="key-type-badge" style="background:var(--bg-tertiary);color:var(--accent)">${s.key_type}</span></td>
            <td style="font-family:monospace;font-size:0.8rem;max-width:200px;overflow:hidden;text-overflow:ellipsis">${s.masked_value || s.key_value?.slice(0, 30) + '...'}</td>
            <td>
                <div class="confidence-bar">
                    <div class="confidence-fill" style="width:${confPct}%;background:${confColor}"></div>
                </div>
                <span style="font-size:0.75rem;color:var(--text-muted);margin-left:0.3rem">${s.confidence}/10</span>
            </td>
            <td><span class="status-dot ${statusClass}">${statusLabel}</span></td>
            <td><a href="${s.source || '#'}" target="_blank" class="repo-link" onclick="event.stopPropagation()">${repoShort}</a></td>
            <td style="font-size:0.8rem;color:var(--text-secondary)">${dateStr}</td>
            <td><button class="btn-icon" onclick="event.stopPropagation();showDetail(${s.id})">🔍</button></td>
        </tr>
    `;
}

// ── Pagination ──
function updatePagination() {
    const totalPages = Math.ceil(state.total / state.limit) || 1;
    document.getElementById('pageInfo').textContent = `Página ${state.page} de ${totalPages}`;
    document.getElementById('prevBtn').disabled = state.page <= 1;
    document.getElementById('nextBtn').disabled = state.page >= totalPages;
}

function nextPage() {
    const totalPages = Math.ceil(state.total / state.limit) || 1;
    if (state.page < totalPages) {
        state.page++;
        loadSecrets();
    }
}

function prevPage() {
    if (state.page > 1) {
        state.page--;
        loadSecrets();
    }
}

// ── Detail Modal ──
async function showDetail(id) {
    const modal = document.getElementById('modal');
    const body = document.getElementById('modalBody');
    modal.classList.add('active');

    body.innerHTML = '<div class="loading"><div class="spinner"></div> Carregando...</div>';

    try {
        const res = await fetch(`/api/secrets/${id}`);
        const data = await res.json();
        const s = data.secret || {};

        document.getElementById('modalTitle').textContent = `${s.key_type}: ${s.key_name || 'Unknown'}`;

        let validHtml = '<span class="status-dot unknown">⏳ Não testada</span>';
        if (s.validated) {
            if (s.is_valid === true) validHtml = '<span class="status-dot valid">✅ Válida</span>';
            else if (s.is_valid === false) validHtml = '<span class="status-dot invalid">❌ Inválida</span>';
            else validHtml = '<span class="status-dot unknown">❓ Indeterminada</span>';
        }

        body.innerHTML = `
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="label">Tipo</span>
                    <span class="value">${s.key_type || '-'}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Nome</span>
                    <span class="value">${s.key_name || '-'}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Confiança</span>
                    <span class="value">${s.confidence || '-'}/10</span>
                </div>
                <div class="detail-item">
                    <span class="label">Status</span>
                    <span class="value">${validHtml}</span>
                </div>
                <div class="detail-item detail-full">
                    <span class="label">Valor (mascarado)</span>
                    <div class="key-value-display">${s.masked_value || s.key_value?.slice(0, 30) + '...' || '-'}</div>
                </div>
                <div class="detail-item detail-full">
                    <span class="label">Fonte</span>
                    <span class="value"><a href="${s.source || '#'}" target="_blank" style="color:var(--accent)">${s.source || '-'}</a></span>
                </div>
                <div class="detail-item">
                    <span class="label">Repositório</span>
                    <span class="value">${s.repo_name || '-'}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Arquivo</span>
                    <span class="value">${s.file_path?.split('/').pop() || '-'}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Data do Commit</span>
                    <span class="value">${s.date_found || '-'}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Autor</span>
                    <span class="value">${s.author || '-'}</span>
                </div>
                ${s.validation_msg ? `
                <div class="detail-item detail-full">
                    <span class="label">Mensagem de Validação</span>
                    <span class="value">${s.validation_msg}</span>
                </div>
                ` : ''}
                ${s.context ? `
                <div class="detail-item detail-full">
                    <span class="label">Contexto</span>
                    <div class="key-value-display">${escapeHtml(s.context)}</div>
                </div>
                ` : ''}
            </div>
        `;
    } catch (e) {
        body.innerHTML = '<p style="color:var(--red)">Erro ao carregar detalhes</p>';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

// ── Scan History ──
async function loadScans() {
    const tbody = document.getElementById('scansBody');
    try {
        const res = await fetch('/api/scans?limit=10');
        const data = await res.json();
        const scans = data.scans || [];

        if (scans.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:1rem;color:var(--text-secondary)">Nenhum scan executado ainda</td></tr>';
            return;
        }

        tbody.innerHTML = scans.map(s => {
            const statusClass = s.status === 'completed' ? 'status-dot valid' :
                s.status === 'failed' ? 'status-dot invalid' : 'status-dot pending';
            return `
                <tr>
                    <td style="font-family:monospace;font-size:0.8rem">${s.scan_id?.slice(0, 8) || '-'}</td>
                    <td>${s.scan_type || '-'}</td>
                    <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.query?.slice(0, 50) || '-'}</td>
                    <td>${s.total_found ?? 0}</td>
                    <td>${s.new_found ?? 0}</td>
                    <td>${s.repos_scanned ?? 0}</td>
                    <td>${s.duration_seconds ? s.duration_seconds.toFixed(1) + 's' : '-'}</td>
                    <td><span class="${statusClass}">${s.status}</span></td>
                    <td style="font-size:0.8rem;color:var(--text-secondary)">${s.created_at?.slice(0, 19)?.replace('T', ' ') || '-'}</td>
                </tr>
            `;
        }).join('');
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--red)">Erro ao carregar histórico</td></tr>';
    }
}

// ── Run Scan ──
async function runScan() {
    const btn = event.target.closest('button');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px"></span> Escaneando...';

    showToast('🔍 Scan iniciado em background...', 'info');

    try {
        const res = await fetch('/api/scan', { method: 'POST' });
        if (res.ok) {
            showToast('✅ Scan concluído com sucesso!', 'success');
            loadStats();
            loadSecrets();
            loadScans();
        } else {
            const err = await res.json();
            showToast(`❌ Falha no scan: ${err.detail || 'erro desconhecido'}`, 'error');
        }
    } catch (e) {
        showToast('❌ Erro ao iniciar scan. O servidor está rodando com async support?', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span class="icon">⚡</span> Novo Scan';
    }
}

// ── Export ──
async function exportData() {
    try {
        const params = new URLSearchParams({ format: 'json' });
        if (state.typeFilter) params.append('key_type', state.typeFilter);
        if (state.statusFilter === 'valid') { params.append('validated', 'true'); params.append('is_valid', 'true'); }
        else if (state.statusFilter === 'invalid') { params.append('validated', 'true'); params.append('is_valid', 'false'); }

        const res = await fetch(`/api/export?${params}`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `secrets-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('📥 Exportação concluída!', 'success');
    } catch (e) {
        showToast('❌ Erro ao exportar', 'error');
    }
}

// ── Toast ──
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ── Auto Refresh ──
function startAutoRefresh() {
    if (state.refreshInterval) clearInterval(state.refreshInterval);
    state.refreshInterval = setInterval(() => {
        loadStats();
        loadScans();
    }, 15000);
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    loadSecrets();
    loadScans();
    startAutoRefresh();
});