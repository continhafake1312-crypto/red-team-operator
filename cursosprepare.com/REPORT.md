# REPORT — Pentest cursosprepare.com

> Relatório incremental. Atualizado a cada finding/fase.

## Metadados
| Campo | Valor |
|---|---|
| Alvo | cursosprepare.com (https://www.cursosprepare.com/) |
| Negócio | Plataforma de cursos preparatórios |
| Stack | Wix managed (Pepyaka) + Google Cloud (www) |
| Owner | — |
| OPSEC | Tor + proxychains4, 2Captcha, UA rotativo |
| Início | 2026-08-27T03:25Z |
| Janela | Em andamento |

## Sumário executivo
Engagement iniciado. Recon rápido do coordenador identificou site construído em Wix (registrar Wix, NS wixdns.net, server Pepyaka, Wix site ID `dcffb6fe-b153-4b2e-bd44-5de8281fcb28`). Email corporativo via Google Workspace. WWW bloqueia Tor exit (Google Cloud 403); apex acessível via Tor. Fases de recon passivo/ativo a seguir.

## Findings
| ID | Severidade | Título | Host | Status |
|---|---|---|---|---|
| — | — | (nenhum ainda) | — | — |

## Attack surface consolidada
(see recon/SUMMARY.md após fase 4)

## Acessos obtidos
(nenhum ainda)

## Cronologia
- 2026-08-27T03:25Z — Engagement iniciado; OPSEC verificado (Tor 150.40.127.65 / proxychains 45.66.35.28); 2Captcha configurado.
- 2026-08-27T03:26Z — Recon rápido: Wix stack identificado, Wix site ID obtido, MX Google Workspace, www bloqueia Tor (Google Cloud 403).
- 2026-08-27T03:27Z — Estrutura + SCOPE.md + PLAN.md + REPORT.md + timeline.log criados.

## Evidências
(see evidence/F-XXX.txt)
