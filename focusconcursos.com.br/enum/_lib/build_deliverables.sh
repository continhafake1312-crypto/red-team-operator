#!/usr/bin/env bash
# build per-host deliverable files from collected artifacts (enum fase 5)
E=/home/ubuntu/red-team-operator/focusconcursos.com.br/enum
mkdir -p $E/admin.focusconcursos.com.br $E/lms.focusconcursos.com.br $E/mobile.focusconcursos.com.br \
         $E/pxa.focusconcursos.com.br $E/loja.grupofocus.com.br $E/nextjs.grupofocus.com.br \
         $E/nextjs.focusconcursos.com.br $E/apilms.grupofocus.com.br $E/cdn.gocache.com.br \
         $E/teste.grupofocus.com.br $E/docs.grupofocus.com.br $E/payment.focusconcursos.com.br \
         $E/integration.focusconcursos.com.br $E/misc.focusconcursos.com.br $E/wwwdev.focusconcursos.com.br

# ---- admin
{
 echo "# /js/main.js (3904996B) — rotas extraídas por grep em 2026-09-08"
 echo "## API-core:"; grep -E '^/api/' "$E/admin.focusconcursos.com.br/js_routes_all.txt"
 echo "## SPA-rotas:"; grep -vE '^/api/' "$E/admin.focusconcursos.com.br/js_routes_all.txt"
 echo "## refs externas:"
 grep -aohE 'https://[a-zA-Z0-9.-]+(focusconcursos|grupofocus)[a-zA-Z0-9.:/_-]*' "$E/admin.focusconcursos.com.br/js_main.js" | sort -u | head -20
 echo "## têm chave/token?"; grep -aoE '(eyJ[A-Za-z0-9_-]{20,208}|AKIA[A-Z0-9]{16}|sk_live_[A-Za-z0-9]{10,})' "$E/admin.focusconcursos.com.br/js_main.js" | head -5 || true
} > "$E/admin.focusconcursos.com.br/js_endpoints.txt"
cp "$E/admin.focusconcursos.com.br/js_routes_all.txt" "$E/admin.focusconcursos.com.br/content_discovery.txt"

# ---- lms
{
 echo "# /js/main.js (1015940B) — rotas da API de aluno (2026-09-08)"
 grep -E '^/api/' "$E/lms.focusconcursos.com.br/js_routes_all.txt"
 echo "## outras:"
 grep -vE '^/api/' "$E/lms.focusconcursos.com.br/js_routes_all.txt" | head -40
 echo "## secrets:"; grep -aoE '(eyJ[A-Za-z0-9_-]{20,270}|AKIA[A-Z0-9]{16}|sk_live_[A-Za-z0-9]{10,})' "$E/lms.focusconcursos.com.br/js_main.js" | head -5 || true
} > "$E/lms.focusconcursos.com.br/js_endpoints.txt"
cp "$E/lms.focusconcursos.com.br/js_routes_all.txt" "$E/lms.focusconcursos.com.br/content_discovery.txt"

# ---- mobile
cp "$E/mobile.focusconcursos.com.br/api_sweep.txt" "$E/mobile.focusconcursos.com.br/content_discovery.txt" 2>/dev/null
cp "$E/mobile.focusconcursos.com.br/params_probe.txt" "$E/mobile.focusconcursos.com.br/params.txt" 2>/dev/null

# ---- loja + next cluster
{
 echo "# rotas de handlers API Next.js vazadas nos chunks (loja+ead+www3+apilms — mesma app)"
 cat "$E/loja.grupofocus.com.br/js_api_routes.txt" 2>/dev/null
 echo "# chunks baixados (loja):"; ls -la "$E/loja.grupofocus.com.br/js/" 2>/dev/null | awk '{print $5,$9}'
 echo "# ead idêntico:"; ls "$E/nextjs.grupofocus.com.br/js/" 2>/dev/null
 echo "# www3 variant:"; ls "$E/nextjs.focusconcursos.com.br/js/" 2>/dev/null
} > "$E/loja.grupofocus.com.br/js_endpoints.txt"
cp "$E/loja.grupofocus.com.br/js_api_routes.txt" "$E/nextjs.grupofocus.com.br/js_api_routes.txt" 2>/dev/null || true
cp "$E/loja.grupofocus.com.br/js_endpoints.txt" "$E/nextjs.grupofocus.com.br/js_endpoints.txt"
{ echo "# sitemap principal: 4900 urls (ver sitemap_urls.txt)"; head -50 "$E/nextjs.focusconcursos.com.br/sitemap_urls.txt" 2>/dev/null; } > "$E/nextjs.focusconcursos.com.br/content_discovery.txt"

# ---- teste: content discovery + params
{
 echo "# hosts vivos & status ( escrito 2026-09-08 )"
 grep -E '\-> (200|302|403|405|500)' "$E/teste.grupofocus.com.br/sweep_laravel.txt" 2>/dev/null | head -40
 echo "# assets do mix-manifest (87):"
 grep -oE '/assets/[a-zA-Z0-9_./-]+\.js|/themes/[a-zA-Z0-9_./-]+' "$E/teste.grupofocus.com.br/mix_manifest_full.json" | sort -u
} > "$E/teste.grupofocus.com.br/content_discovery.txt"
{
 echo "# sitemap.xml target-host list (teste→faculdadefocus)"
 sed 's/></>\n</g' "$E/teste.grupofocus.com.br/g_sitemap.xml.out" | grep -oE 'https://faculdadefocus[^<]*' | head -40
} > "$E/teste.grupofocus.com.br/params.txt"

# ---- payment/integration
cp "$E/payment.focusconcursos.com.br/docs_params.txt" "$E/payment.focusconcursos.com.br/params.txt" 2>/dev/null
cp "$E/payment.focusconcursos.com.br/docs_params.txt" "$E/integration.focusconcursos.com.br/params.txt" 2>/dev/null || true

# ---- pxa
{
 echo "# pxa — Filament v3 + Livewire 3.16"
 echo "endpoints: /livewire-20b400d1/update (POST), /livewire-20b400d1/livewire.min.js?id=26bbdf42"
 echo "components: Filament\\Auth\\Pages\\Login, Filament\\Livewire\\Notifications"
 echo "/admin (302 /admin/login), /login 200 34309B"
} > "$E/pxa.focusconcursos.com.br/cms_enum.txt"

# ---- apilms
cp "$E/apilms.grupofocus.com.br/apilms_probe.txt" "$E/apilms.grupofocus.com.br/content_discovery.txt"

# ---- docs
{ echo "# GitBook docs — PLACEHOLDER"; echo "org 2czSUJTtZyqXOyI3dYVt / space Opaq9Di8Nj8MptgIccEp / site_Q5v4k / sitesp_2azHG"; echo "llms.txt/page.md = '# Page' vazio; sitemap = 1 página"; } > "$E/docs.grupofocus.com.br/content_discovery.txt"

# ---- misc
{
 echo "crm: 503 ELB persistente (/ , /login , /docs)"
 echo "focusonline.com.br: catch-all → focusconcursos.com.br (prod SPA 200)"
 echo "faculdadefocus.com.br: VIVO — /login 200 750077B (Laravel faculdade), / 200 1044481B; produtos no sitemap do teste"
 echo "novolms.focusconcursos.com.br (wayback Next.js /login): hoje DOWN 000"
 echo "sistemaead.com.br: CF 403 em chunk guess"
 echo "cdn.*: GoCache 403/404 all paths tested (14+14)"
} > "$E/misc.focusconcursos.com.br/content_discovery.txt"

# ---- wwwdev
{ echo "SNI wwwdev.focusconcursos.com.br @34.230.151.3 via Tor: 000 (SYN-blackhole); retry cooldown requerido" > "$E/wwwdev.focusconcursos.com.br/status.txt"; } ; true
