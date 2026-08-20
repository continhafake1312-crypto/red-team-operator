# Galeria de Evidências Visuais — pmminas.com

Engagement: pentest externo (black-box) · Alvo: `pmminas.com` · Data: 2026-08-20
Capturas: chromium headless (Playwright) via **Tor** (socks5://127.0.0.1:9050),
UA `Chrome/126.0.0.0 Linux`, viewport 1440×900, idioma pt-BR, espaçamento ≥6 s entre requests.
Nenhum challenge Cloudflare ("Just a moment...") foi encontrado em nenhuma captura.

## Índice

| ID | Descrição | Arquivo | Host | Timestamp (UTC) |
|----|-----------|---------|------|-----------------|
| F-009 | Login do cPanel (v134.0.20) exposto na internet via custom port proxying CF | `F-009-cpanel-185-2083.png` | 185.158.133.1:2083 (SNI `pmminas.com`, via borda CF) | 2026-08-20T16:42:25Z |
| F-009 | Login do WHM (root do servidor de origem) exposto | `F-009-whm-185-2087.png` | 185.158.133.1:2087 (SNI `pmminas.com`, via borda CF) | 2026-08-20T16:42:46Z |
| F-009 | Login do Webmail exposto | `F-009-webmail-185-2096.png` | 185.158.133.1:2096 (SNI `pmminas.com`, via borda CF) | 2026-08-20T16:43:04Z |
| F-011 | Login do cPanel legado (v132.0.7) no servidor HostGator — porta 80, vhost `cpanel.pmminas.com`, sem WAF | `F-011-cpanel-162-legado.png` | 162.241.203.31:80 (Host `cpanel.pmminas.com`) | 2026-08-20T16:50:46Z |
| F-011 | Login do cPanel legado — porta 2083 (Host qualquer) | `F-011-cpanel-162-2083.png` | 162.241.203.31:2083 | 2026-08-20T16:43:45Z |
| F-014 | Vazamento de PII via REST do Supabase: `GET /rest/v1/profiles?select=name,role,cpf&limit=3` (HTTP 200; CPF mascarado na imagem — dados completos em `evidence/F-014.txt`) | `F-014-supabase-profiles.png` | nnvdfnuopgtrjzfburub.supabase.co | 2026-08-20T16:45:41Z |
| F-022 | Página de teste em produção `/teste-popup/` com popup Elementor Pro e form funcional (`form name="initiate-checkout-arduhack"`, fields Nome/E-mail/WhatsApp) | `F-022-teste-popup.png` | pmminas.com | 2026-08-20T16:59:19Z |
| CONTEXTO | Home do Método OBA (contexto do alvo) | `CONTEXT-home-pmminas.png` | pmminas.com | 2026-08-20T16:41:40Z |

## Notas de método (por captura)

- **F-009 (2083/2087/2096)**: navegado como `https://pmminas.com:208x/` — a captura passa pela
  borda pública do Cloudflare (custom port proxying), que é exatamente a superfície descrita no
  finding. Título confirmado: "Login do cPanel" / "Login no WHM" / "Login no Webmail" (pt-BR).
- **F-011 legado (porta 80)**: o vhost `cpanel.pmminas.com` está **NXDOMAIN** no DNS público (migração
  para CF), então o browser não consegue resolvê-lo por proxy; a captura usou um forward-proxy local
  (apenas loopback) que reescreve o destino para o IP 162.241.203.31:80 preservando o header
  `Host: cpanel.pmminas.com`, com todo o egress ainda via Tor. Página idêntica à evidência curl
  (38.164 B, "Login do cPanel", com link "Redefinir senha" — variante v132).
- **F-011 (2083)**: URL com IP literal + certificado autoassinado do cPanel aceito para a captura.
- **F-014**: JSON real retornado pela API (limit=3, JWT de student criado via signup aberto —
  F-006/F-021), renderizado como imagem; CPFs mascarados (apenas 3 últimos dígitos) por higiene da
  galeria. A anon key foi recuperada do bundle JS salvo em `recon/active/js_simuladosoba.js`.
- **F-022**: o popup (post 6892) está inline no HTML da página, mas o gatilho configurado
  (`open_selector: #checkoutpopup`) **aponta para um elemento inexistente** — o popup nunca abre
  naturalmente para visitantes. Para a evidência, o gatilho foi simulado (clicar no seletor ausente),
  abrindo o popup exatamente como o handler do Elementor Pro o renderizaria. Detalhe adicional para o
  finding: mesmo "quebrado" para o visitante, o form (IDs públicos `post_id=6892`, `form_id=46111632`)
  continua exposto no HTML de produção.
- **F-012 (MySQL 3306)**: sem interface web — sem captura visual (evidência textual em
  `evidence/F-012.txt`).

## Referências cruzadas

| Finding | Evidência textual | Screenshot |
|---------|-------------------|------------|
| F-009 | `evidence/F-009.txt` | cpanel/whm/webmail 185:2083/2087/2096 |
| F-011 | `evidence/F-011.txt` | cPanel legado 162:80 (vhost) e 162:2083 |
| F-014 | `evidence/F-014.txt` (relacionado: F-006, F-021) | JSON profiles (nome+role+cpf) |
| F-018 | `evidence/F-018.txt` | — (API JSON, sem UI; PDFs em `evidence/`) |
| F-022 | `evidence/F-022.txt` | popup + form em `/teste-popup/` |
| Contexto | — | home do Método OBA |