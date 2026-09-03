# REPORT — g7juridico.com.br

## Metadados
- **Alvo:** g7juridico.com.br (G7 Jurídico)
- **Tipo:** Pentest Web/API Externo Black-box
- **Início:** 2026-09-03T15:45:00Z
- **Status:** EM ANDAMENTO
- **OPSEC:** Tor + proxychains4 ativos

## Sumário Executivo
Pentest em andamento. Fase de recon passivo concluída com descobertas críticas. Modo ofensivo em progresso.

## Findings por Severidade
| Severidade | Qtd | IDs |
|------------|-----|-----|
| Crítica | 2 | n8n exposto, DMARC p=none |
| Alta | 3 | homologação exposta, WordPress sem WAF, IP real exposto |
| Média | 3 | Takeover candidates, blog KingHost, GTM server-side |
| Baixa | 0 | — |
| Info | 2 | Tech stack identificada, OSINT |

## Detalhamento

### 🔴 Crítico
- **n8n.g7juridico.com.br**: Workflow automation (n8n v2.33.5) exposto na DigitalOcean (138.197.78.17) sem WAF. Risco de acesso a workflows internos, credenciais, pivoting.
- **DMARC p=none**: Qualquer um pode forjar emails do domínio. Risco de phishing contra alunos/clientes.

### 🟡 Alto
- **homologacao.g7juridico.com.br**: Ambiente de staging exposto sem proteção aparente. Segurança mais fraca que produção.
- **WordPress (www)**: Apache 2.4.29, sem WAF, IP real 34.75.142.99 exposto (sem Cloudflare). Fácil alvo para scanning.
- **IP real exposto**: Site principal sem Cloudflare. IP 34.75.142.99 (GCP) diretamente acessível.

### 🟢 Médio
- **Takeover candidates**: gtm→stape.io, lp/materiais→greatpages.com.br (CNAME dangling)
- **blog.g7juridico.com.br**: KingHost - possível WordPress separado
- **gtm.g7juridico.com.br**: Google Tag Manager server-side via Stape.io

## Acessos Obtidos
*Nenhum ainda - recon passivo concluído.*

## Cronologia
Ver `timeline.log`.

## Evidências
Ver `evidence/`.