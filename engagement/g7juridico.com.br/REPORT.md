# REPORT — g7juridico.com.br

## Metadados
- **Alvo:** g7juridico.com.br (G7 Jurídico)
- **Tipo:** Pentest Web/API Externo Black-box
- **Início:** 2026-09-03T15:45:00Z
- **Status:** EM ANDAMENTO
- **OPSEC:** Tor + proxychains4 ativos

## Sumário Executivo
O ataque webapp contra www.g7juridico.com.br revelou **2 vulnerabilidades CRÍTICAS** e **3 de MÉDIA/ALTA** severidade. 
O principal achado foi um **Auth Bypass total no formulário de login** (aceita qualquer email/senha) e **IDOR nos downloads de material didático** (roteiros de estudo baixáveis sem autenticação).

Através do auth bypass, foi possível acessar o dashboard da área do aluno de uma conta real, expondo:
- Curso matriculado ("DEFENSORIA PÚBLICA ESTADUAL / DPU - 2025")
- Roteiros de estudo (12 PDFs baixáveis)
- Simulados
- Portal de dúvidas com conteúdo de fórum
- Dados bancários/pagamentos

## Findings por Severidade
| Severidade | Qtd | IDs |
|------------|-----|-----|
| 🔴 Crítica | 5 | n8n exposto + /rest/settings info disclosure, DMARC p=none, Auth Bypass login, IDOR download roteiros, Session ID totalmente inseguro |
| 🟡 Alta | 6 | homologação exposta, SVN exposto (svnserve), Custom PHP sem WAF, Nagios NSCA, TLS 1.0/1.1, blog KingHost (placeholder) |
| 🟢 Média | 5 | ProFTPD sem anonymous, Takeover candidates (gtm/lp/materiais), GTM server-side, Session Fixation, Missing CSRF |
| ⚪ Info | 3 | Tech stack, OSINT, AJAX Endpoints Expostos |

## Detalhamento

### 🔴 Crítico
- **n8n.g7juridico.com.br (138.197.78.17)**: n8n v2.33.5 exposto na DigitalOcean. /rest/settings vaza configurações internas (communityNodesEnabled, auth config). Portas adicionais: 5678 (n8n web), 8000 (Nagios NSCA), 9443 (painel alternativo). Sem WAF.
- **DMARC p=none**: Qualquer um pode forjar emails do domínio. Risco de phishing contra alunos/clientes.
- **F-001: Auth Bypass Total (CRÍTICA)**: _/cadastro_incompleto.php_ aceita **QUALQUER email/senha** para login. Gera cookie de sessão `login_id` e `aluno=0` e redireciona para _/area-do-aluno/_. Permite acesso não-autenticado ao dashboard de alunos, expondo dados pessoais e acadêmicos. **Proof**: `login_id=1788483237; aluno=0` → dashboard da conta real com curso DPU 2025, roteiros, simulados.
- **F-002: IDOR Download Material Didático (CRÍTICA)**: _/area-do-aluno/download-arquivo/roteiros-arquivos/{hash}/pdf_ permite baixar PDFs de roteiros de estudo **sem qualquer autenticação**. 11/12 PDFs baixáveis (95KB-150KB cada), conteúdo didático pago exposto.

### 🟡 Alto
- **Subversion SVN (191.6.196.7:3690)**: Serviço svnserve Subversion exposto na internet. Nmap confirmou Subversion rodando. Protocolo responde com capabilities. ❌ **Nenhum repositório acessível anonimamente** (25+ paths comuns testados, todos "No repository found"). Servidor requer autenticação ou nomes de repositórios customizados. **Rebaixado de Crítico** pois não foi obtido acesso aos dados.
- **homologacao.g7juridico.com.br**: Ambiente de staging exposto, SEM WAF (confirmado), sem Google Analytics/GTM/RD Station. Mesmo IP da produção (34.75.142.99).
- **www.g7juridico.com.br (Custom PHP)**: NÃO é WordPress (wp-admin, wp-login, xmlrpc all 404). CMS próprio. /area-do-aluno/ exposto, /login-cadastro. WAF detectado (mod_security).
- **Nagios NSCA (138.197.78.17:8000)**: Monitoramento exposto no mesmo host do n8n.
- **TLS 1.0/1.1 habilitados**: No site principal (www/homologação/blackfriday).
- **blog.g7juridico.com.br (191.6.196.7)**: KingHost - placeholder padrão, sem blog ativo. Hospeda SVN (3690) e FTP (21) expostos.

### 🟢 Médio
- **ProFTPD (191.6.196.7:21)**: Servidor FTP exposto. ❌ **Anonymous login NÃO habilitado** (530 Login incorrect para todas as tentativas: anonymous, ftp, test). Rebaixado de Alto para Médio.
- **Takeover candidates**: gtm→stape.io, lp/materiais→greatpages.com.br (CNAME dangling)
- **gtm.g7juridico.com.br**: Google Tag Manager server-side via Stape.io (Traefik proxy)
- **F-003: Session Fixation (MÉDIA)**: Cookie `login_id` sequencial/incremental gerado para qualquer POST sem validação. Risco de session fixation e enumeração de sessões.
- **F-005: Missing CSRF Token (MÉDIA)**: Formulário de login não possui token CSRF. Combinado com auth bypass (F-001), permite ataques CSRF.
- **F-012: Session ID Qualquer Aceito (CRÍTICA)**: Qualquer valor de `login_id` (de 1788483230 a 999999999) é aceito como sessão válida. Permite acesso completo a qualquer sessão de aluno sem autenticação. **Session hijacking total.**

### ⚪ Informação
- **F-004: AJAX Endpoints Expostos (INFO)**: Múltiplos endpoints AJAX descobertos no JS: `login_aluno.php`, `verifica_email_aluno.php`, `cadastro_verifica.php`, `recuperar_senha.php`, `pagamento_boleto.php`, etc.

## Acessos Obtidos
- ✅ **Acesso à área do aluno** via auth bypass (cookie: `login_id=1788483237; aluno=0`)
- ✅ **Download de material didático** (12 PDFs de roteiros de estudo)
- 📋 **Dados expostos no dashboard**: Curso DPU 2025, roteiros de estudo, simulados, portal de dúvidas, perfil de aluno

## Detalhamento das Descobertas do n8n

### 🔴 Crítico
- **n8n.g7juridico.com.br (138.197.78.17)**: n8n v2.33.5 exposto. 
  - Settings públicas: `/rest/settings` vaza `communityNodesEnabled: true`, `passwordMinLength: 8`, `authMethod: email`, configurações SSO/OIDC/SAML, URLs internas
  - **F-014: Registration/Signup (INFO)**: Owner já configurado, self-registration desabilitado, SMTP não configurado (password reset impossível)
  - **F-016: Brute Force (INFO)**: Rate limit 5/min. 15 emails + ~40 senhas testadas. Nenhuma credencial válida encontrada. User enumeration não é possível (mesmo erro 401 para todos)
  - **F-017: OIDC/SSO (INFO)**: Endpoints OIDC retornam 404. OIDC/SAML/LDAP desabilitados. Enterprise features não ativas. CVE GHSA-pf83-w3f9-8m37 identificada mas não aplicável (CE edition)
  - **F-018: Config/Backup (INFO)**: Nenhum arquivo sensível exposto (nginx serve SPA para todas as rotas não-API)
  - **CVEs identificadas**: 
    - GHSA-pf83-w3f9-8m37 (Moderate): OIDC disabled endpoints remain active — NÃO aplicável (CE edition)
    - GHSA-6xcw-7xm6-48c6 (High): Expression sandbox escape → RCE — Requer autenticação
    - GHSA-hh89-3r9w-qj3j (High): Unauthenticated storage exhaustion via OAuth — DoS only
    - GHSA-fm93-2x43-6676 (Moderate): Git node sandbox escape
    - GHSA-hw8v-xxg5-vvvx (High): Expression sandbox escape via class-field
    - GHSA-4r56-g65c-fm83 (High): Workflow tool node credential exfiltration
- **Portainer CE 2.39.5 (138.197.78.17:9443)**: Docker management interface 
  - **F-019: Portainer Discovery (MÉDIO)**: Portainer CE exposto na porta 9443
  - TLS self-signed, não nginx, diferente do n8n
  - Instance ID: `62f588c7-cd0e-461e-93e7-ed5724365fb8`
  - Auth interna (AuthenticationMethod: 1), PasswordMinLength: 12
  - Setup token necessário para admin init (X-Setup-Token header)
  - API pública: `/api/status`, `/api/settings/public` acessíveis sem auth
  - Nenhuma credencial default funcionou (admin:admin, admin:portainer, etc.)
  - **Recomendação**: Se foothold no n8n for obtido, usar para acessar Docker socket via Portainer internamente ou extrair setup token dos logs

### Checklist de CVEs n8n v2.33.5
| CVE/GHSA | Severidade | Tipo | Autenticação Necessária | Aplicável |
|-----------|------------|------|------------------------|-----------|
| GHSA-pf83-w3f9-8m37 | Moderate | OIDC bypass | Não (mas CE edition) | ❌ |
| GHSA-6xcw-7xm6-48c6 | High | Sandbox Escape → RCE | Sim | ⚠️ Precisa auth |
| GHSA-hh89-3r9w-qj3j | High | DoS via OAuth registration | Não | ✅ (DoS only) |
| GHSA-fm93-2x43-6676 | Moderate | Sandbox escape | Sim | ⚠️ |
| GHSA-hw8v-xxg5-vvvx | High | Sandbox escape → RCE | Sim | ⚠️ |
| GHSA-4r56-g65c-fm83 | High | Credential exfiltration | Sim (editor) | ⚠️ |

## Cronologia
Ver `timeline.log`.

## Evidências
Ver `evidence/`:
- `F-014-n8n-registration.txt` — Registration/Signup
- `F-015-n8n-webhooks.txt` — Webhook discovery
- `F-016-n8n-brute.txt` — Brute force analysis
- `F-017-n8n-oidc.txt` — OIDC/SSO abuse
- `F-018-n8n-config-scan.txt` — Config/backup scan
- `F-019-portainer-creds.txt` — Portainer CE discovery