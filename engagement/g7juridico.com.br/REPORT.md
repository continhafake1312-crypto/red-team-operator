# REPORT — g7juridico.com.br

## Metadados
- **Alvo:** g7juridico.com.br (G7 Jurídico)
- **Tipo:** Pentest Web/API Externo Black-box
- **Início:** 2026-09-03T15:45:00Z
- **Status:** EM ANDAMENTO
- **OPSEC:** Tor + proxychains4 ativos

## Sumário Executivo
Pentest em andamento. Fase de recon passivo e ativo concluídas com descobertas críticas. Múltiplas frentes em operação.

## Findings por Severidade
| Severidade | Qtd | IDs |
|------------|-----|-----|
| Crítica | 4 | n8n exposto, SVN exposto, DMARC p=none, n8n /rest/settings info disclosure |
| Alta | 5 | homologação exposta, ProFTPD exposto, Custom PHP sem WAF, Nagios NSCA, TLS 1.0/1.1 |
| Média | 3 | Takeover candidates, blog KingHost, GTM server-side |
| Baixa | 0 | — |
| Info | 2 | Tech stack, OSINT |

## Detalhamento

### 🔴 Crítico
- **n8n.g7juridico.com.br (138.197.78.17)**: n8n v2.33.5 exposto na DigitalOcean. /rest/settings vaza configurações internas (communityNodesEnabled, auth config). Portas adicionais: 5678 (n8n web), 8000 (Nagios NSCA), 9443 (painel alternativo). Sem WAF.
- **Subversion SVN (191.6.196.7:3690)**: Repositório de código exposto. Risco de vazamento de código fonte, credenciais em commits, arquivos .env/config.
- **DMARC p=none**: Qualquer um pode forjar emails do domínio. Risco de phishing contra alunos/clientes.

### 🟡 Alto
- **ProFTPD (191.6.196.7:21)**: Servidor FTP exposto. Testar anonymous login.
- **homologacao.g7juridico.com.br**: Ambiente de staging exposto, SEM WAF (confirmado), sem Google Analytics/GTM/RD Station. Mesmo IP da produção (34.75.142.99).
- **www.g7juridico.com.br (Custom PHP)**: NÃO é WordPress (wp-admin, wp-login, xmlrpc all 404). CMS próprio. /area-do-aluno/ exposto, /login-cadastro. WAF detectado (mod_security).
- **Nagios NSCA (138.197.78.17:8000)**: Monitoramento exposto no mesmo host do n8n.
- **TLS 1.0/1.1 habilitados**: No site principal (www/homologação/blackfriday).

### 🟢 Médio
- **Takeover candidates**: gtm→stape.io, lp/materiais→greatpages.com.br (CNAME dangling)
- **blog.g7juridico.com.br**: KingHost - placeholder padrão, sem blog ativo
- **gtm.g7juridico.com.br**: Google Tag Manager server-side via Stape.io (Traefik proxy)

## Acessos Obtidos
*Nenhum ainda - recon passivo concluído.*

## Cronologia
Ver `timeline.log`.

## Evidências
Ver `evidence/`.