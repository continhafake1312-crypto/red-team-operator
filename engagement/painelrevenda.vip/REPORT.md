# RELATÓRIO DE PENTEST — painelrevenda.vip

## Metadados
- **Alvo:** painelrevenda.vip (Elite IPTV — Revenda IPTV)
- **IP:** 186.194.52.218
- **Início:** 2026-09-03T04:50:00Z
- **Término:** Em andamento
- **Tipo:** Black-box externo
- **Classificação:** Confidencial

## Sumário Executivo
Teste de penetração black-box na plataforma de revenda IPTV "Elite IPTV". O objetivo é identificar vulnerabilidades que possam comprometer a confidencialidade, integridade ou disponibilidade dos sistemas, com foco em acesso administrativo ao painel de revenda, dados financeiros (PIX) e PII de clientes/revendedores.

### Descobertas da Fase de Exploração de Rede (network specialist)
O servidor 186.194.52.218 expõe **8 portas de serviços** diretamente na internet, incluindo **MySQL (3306) — extremamente crítico**. Embora nenhuma credencial padrão tenha funcionado, a simples exposição do banco de dados de produção na internet é uma falha grave de segurança. Múltiplos serviços de email (Exim, Dovecot) e FTP também estão expostos, expandindo a superfície de ataque. O Cloudflare protege o tráfego HTTP/HTTPS mas não os demais serviços.

## Findings (Incremental)

| ID | Severidade | Título | Status |
|----|-----------|--------|--------|
| F-001 | 🔴 CRÍTICA | MySQL (MariaDB 10.11.17) publicamente exposto | ✅ Confirmado |
| F-002 | 🟠 ALTA | FTP (ProFTPD) publicamente exposto | ✅ Confirmado |
| F-005 | 🟠 ALTA | Múltiplos serviços sensíveis expostos (8 portas) | ✅ Confirmado |
| F-008 | 🟠 ALTA | Cloudflare bypass via Playwright + Stealth | ✅ Confirmado |
| F-009 | 🟠 ALTA | Painel real identificado: revenda-eliteiptv.online | ✅ Confirmado |
| F-010 | 🟡 MÉDIA | +40 subdomínios e domínios relacionados descobertos via CRT.sh | ✅ Confirmado |
| F-003 | 🟡 MÉDIA | Exim 4.99.5 SMTP exposto com VRFY | ✅ Confirmado |
| F-004 | 🟡 MÉDIA | Dovecot IMAP/POP3 exposto | ✅ Confirmado |
| F-006 | 🟡 MÉDIA | Subdomain takeover candidate (smmbrasil.net) | ✅ Confirmado |
| F-007 | 🔵 BAIXA | Roundcube Webmail protegido por Cloudflare | ⏳ Parcial |
| F-011 | 🔵 BAIXA | Análise do modelo de negócio e preços | ✅ Info |
| F-012 | 🔵 BAIXA | Preparação para JWT Attack | 🔄 Pronto |

## Detalhamento dos Findings

### F-001: MySQL (MariaDB) publicamente exposto [CRÍTICA]
O servidor MySQL (MariaDB 10.11.17) está acessível publicamente na porta 3306. Testadas 40+ combinações de credenciais. Conexão estabelecida (porta responde), mas todas as credenciais falharam (ERROR 1045). Recomendação: força bruta intensiva com wordlists específicas.

### F-008: Bypass de Cloudflare via Playwright + Stealth [ALTA]
Cloudflare JS challenge bypassado com Playwright Chromium headless + modo stealth + proxy Tor. Após resolução do challenge, obtido acesso ao conteúdo real da landing page SPA (60KB de HTML, 4 bundles JS, assets). Cookies de sessão obtidos: wssplashchk, _ga.

### F-009: Identificação do painel real [ALTA]
Descoberto que painelrevenda.vip é APENAS landing page marketing. O painel de revenda real está em **revenda-eliteiptv.online** (Cloudflare 104.21.71.180, 172.67.147.247). Domínio do painel identificado via análise do JS bundle principal (contém URLs de login/registro). revenda-eliteiptv.online retorna 403 via Tor e 404 via bypass direto (nginx sem conteúdo configurado).

### F-010: Subdomínios e domínios relacionados [MÉDIA]
CRT.sh revelou 40+ subdomínios e domínios relacionados:
- Subdomínios: ftp, mail, pop, smtp, webmail, www, cpanel, cpcalendars, cpcontacts, webdisk, autodiscover.painelrevenda.vip
- Relacionados: eliteiptv.one, iptvrevenda.org, smartplay.club, eliteiptv.pro, revendaiptv.club, revendaiptv.pro
- Todos atrás de Cloudflare (JS challenge ou 403)
- DirectAdmin detectado na porta 2222 (também atrás de Cloudflare)

## Attack Surface Consolidada

### Serviços Expostos (186.194.52.218)
| Porta | Serviço | Versão | Risco | Status Auth |
|-------|---------|--------|-------|-------------|
| 21/tcp | ProFTPD | (desconhecida) | 🟠 ALTO | ❌ Nenhuma credencial |
| 25/tcp | Exim SMTP | 4.99.5 | 🟡 MÉDIO | N/A (relay) |
| 80/tcp | OpenResty HTTP | 1.31.1.1 | 🟢 NORMAL | N/A |
| 110/tcp | Dovecot POP3 | DA (DirectAdmin) | 🟡 MÉDIO | ❌ admin:admin falhou |
| 143/tcp | Dovecot IMAP | DA (DirectAdmin) | 🟡 MÉDIO | ❌ admin:admin falhou |
| 443/tcp | OpenResty HTTPS | 1.31.1.1 | 🟢 NORMAL | N/A (Cloudflare) |
| 587/tcp | Exim Submission | 4.99.5 | 🟡 MÉDIO | N/A |
| 993/tcp | Dovecot IMAPS | DA (DirectAdmin) | 🟡 MÉDIO | ❌ admin:admin falhou |
| 2222/tcp | DirectAdmin | DA | 🟠 ALTO | Atrás de Cloudflare |
| 3306/tcp | **MariaDB MySQL** | **10.11.17-cll-lve-log** | **🔴 CRÍTICO** | **❌ 40+ combos falharam** |

### Domínios Web
| Domínio | Proteção | Conteúdo | Risco |
|---------|----------|----------|-------|
| painelrevenda.vip | Cloudflare JS Challenge | Landing page React SPA (marketing) | 🟢 BAIXO |
| revenda-eliteiptv.online | Cloudflare 403/Challenge | Painel de revenda REAL (inacessível) | 🔴 ALVO |
| webmail.painelrevenda.vip | Cloudflare JS Challenge | Roundcube Webmail | 🟡 MÉDIO |
| cpanel.painelrevenda.vip | Cloudflare/Empty | cPanel hospedagem | 🟡 MÉDIO |
| eliteiptv.one | Cloudflare JS Challenge | Relacionado IPTV | 🟡 MÉDIO |
| iptvrevenda.org | DNS não resolve | - | 🟢 BAIXO |
| smartplay.club | Cloudflare JS Challenge | Relacionado IPTV | 🟡 MÉDIO |

## Acessos Obtidos
*Nenhum acesso obtido até o momento.*

### Tentativas realizadas:
1. **Cloudflare Bypass (painelrevenda.vip)**: ✅ Sucesso via Playwright + Tor + Stealth
2. **Cloudflare Bypass (revenda-eliteiptv.online)**: ❌ Falha - 403 bloqueio permanente com Tor; 404 vazio via direto
3. **MySQL (3306)**: 40+ combinações de credenciais comuns testadas — todas falharam (ERROR 1045)
4. **FTP (21)**: 8 combinações testadas + anonymous — todas falharam
5. **IMAPS (993)**: admin:admin — autenticação falhou
6. **POP3S (995)**: admin:admin — autenticação falhou
7. **CVE-2012-2122**: ~300 tentativas — MariaDB 10.11.17 não é vulnerável
8. **API endpoints (painelrevenda.vip)**: 25 endpoints testados — todos 404 (apenas landing page)
9. **DirectAdmin (2222)**: Atrás de Cloudflare (não testado)
10. **Subdomínios relacionados**: 30+ domínios testados — todos atrás de Cloudflare

## Próximos Passos Recomendados
1. Força bruta intensiva MySQL com wordlist rockyou via hydra/medusa
2. Tentar bypass Cloudflare revenda-eliteiptv.online com IP residencial/proxy limpo
3. Testar DirectAdmin (2222) com credenciais padrão após bypass
4. Verificar vulnerabilidades Roundcube (CVE-2024-42008, CVE-2024-37383)
5. Scanner de vulnerabilidades via nuclei templates

## Cronologia
- **2026-09-03T04:50:00Z** — Início do engagement
- **2026-09-03T04:50:00Z** — Criação da estrutura e SCOPE.md/PLAN.md/REPORT.md
- **2026-09-03T04:51:00Z** — Fase 2: Recon passivo concluído (subdomínios, DNS, tech stack, OSINT)
- **2026-09-03T04:58:00Z** — Fase 3: Recon ativo concluído (portscan, vhosts, CF bypass, TLS)
- **2026-09-03T04:59:00Z** — Fase network: serviços expostos mapeados e testados
- **2026-09-03T04:59:00Z** — F-001 a F-007: Evidências geradas (network phase)
- **2026-09-03T06:00:00Z** — Fase webapp: Iniciando ataque web OWASP Top 10
- **2026-09-03T06:20:00Z** — Cloudflare bypass via Playwright + Tor bem-sucedido (painelrevenda.vip)
- **2026-09-03T06:30:00Z** — F-008: Bypass Cloudflare confirmado (conteúdo real obtido)
- **2026-09-03T06:35:00Z** — F-009: Painel real identificado (revenda-eliteiptv.online)
- **2026-09-03T06:45:00Z** — F-010: 40+ subdomínios descobertos via CRT.sh
- **2026-09-03T06:50:00Z** — F-011: Modelo de negócio e preços analisado
- **2026-09-03T06:55:00Z** — F-012: Preparação para JWT attack
- **2026-09-03T07:00:00Z** — Fase webapp: Concluída (bypass parcial, painel real inacessível)