# SUMMARY — Attack Surface pmminas.com

**Consolidação**: coordenador | **Data**: 2026-08-20T05:15Z
**Fontes**: `recon/passive/PASSIVE.md`, `recon/active/ACTIVE.md`, OSINT

## Perfil do alvo
- **Negócio**: "Método OBA" — mentoria/infoproduto para concursos PMMG/PPMG/PMESP.
  PMMINAS NEGÓCIOS DIGITAIS LTDA (CNPJ 36.899.651/0001-02, Lavras/MG).
  Fundador: **Otávio Luiz de Souza** (advogado). Sócia: Natana Torres Soares.
- **Público-alvo**: ~5.195 alunos (PII em LMS Tutory — 3rd party, fora de escopo).

## Mapa de hosts

| Host | IP | O que é | Stack | WAF |
|------|----|---------|-------|-----|
| pmminas.com / www / pmminas.com.br | CF edge (104.21.x/172.67.x) | Site principal | **WordPress + Elementor 4.2.3 + Elementor Pro 4.1.0 + WP Rocket 3.21.3 + LS Cache + PHP 7.4.33 EOL + MySQL** | Cloudflare + BM |
| provaoral.pmminas.com | 185.158.133.1 (CF edge FRA) | App Forja OBA (Lovable/React) | React/Vite + **Supabase bfxkwfvmgysrxzlogduz** | CF + BM |
| simuladosoba.pmminas.com | 185.158.133.1 (CF edge FRA) | App Forja OBA (Lovable/React) | React/Vite + **Supabase nnvdfnuopgtrjzfburub** | CF + BM |
| stape.pmminas.com | 35.198.43.124 (GCP) | Analytics Stape | 3rd party | — (fora escopo) |
| pixel.pmminas.com | 44.212.224.149 (AWS) | Pixel Eduzz | 3rd party | — (fora escopo) |
| **185.158.133.1:2083/2087/2096** | (CF edge, custom ports) | **cPanel v134.0.20 + WHM + Webmail do site principal** | cPanel v134.0.20 (2026-04-30) | CF + BM |
| **162.241.203.31** | (direto, sem CF) | **cPanel legado HostGator br980 (VIVO)** | **cPanel v132.0.7 + WHM + Apache + MySQL 5.7.44-48 + Pure-FTPd + Exim 4.99.5 + BIND 9.16.23 + Dovecot + OpenSSH 9.9** | **NENHUM** |
| 177.154.191.198 | — | cPanel legado 2 | MORTO (todas portas fechadas) | — |
| mentoria.metodooba.com.br | 13.227.110.x (AWS GA) | LMS Tutory (PII alunos) | 3rd party | — (fora escopo) |

## Serviços expostos (resumo)
- **Web**: WP (CF), apps Lovable (CF), cPanel ×2, WHM ×2, Webmail ×2
- **Banco**: **MySQL 5.7.44-48 em 162:3306 (internet, sem WAF)**
- **Mail**: Exim 4.99.5 (portas 26/465/587), Dovecot (110/143/993/995)
- **Arquivo**: Pure-FTPd (21)
- **SSH**: OpenSSH 9.9 (22)
- **DNS**: BIND 9.16.23-RH (53) — AXFR a testar
- **Backend apps**: Supabase ×2 (anon JWT público, signup aberto c/ autoconfirm)

## Ranking de payoff (§16) — o que atacar primeiro

| # | Vetor | Severidade | Por quê | Especialista |
|---|-------|-----------|---------|--------------|
| 1 | **MySQL 162:3306** (F-012) | **Crítica** | EOL, sem WAF, multitenant — cred fraca = dump de todos os tenants | network |
| 2 | **cPanel/WHM 185:2083/2087** (F-009) | **Alta** | WHM = root da origem; cred-stuffing + CVEs v134.0.21/22 | webapp + cve |
| 3 | **Supabase ×2** (F-006/F-012-active) | Média→Alta | anon JWT público, signup aberto, RLS a validar (PII alunos) | webapp |
| 4 | **WordPress** (F-001/F-007) | Alta | xmlrpc multicall, user enum, Elementor 4.2.3/LS Cache/WP Rocket/PHP 7.4 EOL | webapp + cve |
| 5 | **SMTP 162:26/587** (F-013) | Média | relay aberto/injeção + DMARC p=none | network |
| 6 | **cPanel legado 162:2083** (F-011) | Média | sem WAF, reuso de senha provável | webapp |
| 7 | **FTP/BIND 162** (F-013) | Baixa/Média | anonymous/weak creds, AXFR | network |
| 8 | **Origem real do WP** (bypass CF) | Info | Shodan favicon -1889988095 (sem key), crt.sh por IP | recon (backlog) |

## Backlog (pausados)
- Shodan favicon (sem API key)
- GWS email existence (18 emails) — antes do cred-stuffing
- Tutory LMS — fora de escopo (3rd party)
- ffuf vhosts 162 (20k) + nmap top1000 162 — rodando em background (PIDs 57895/57896/56664)

## Limitações
- Origem real do WP oculta (CF); sem API key Shodan/Censys/HIBP; sem 2Captcha.