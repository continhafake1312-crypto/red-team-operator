# REPORT — Relatório de Pentest (incremental)

## Metadados
- **Alvo:** `soultv.com.br` (`https://www.soultv.com.br`)
- **Tipo:** Black-box Web/API + Externo
- **Negócio:** A confirmar (aparenta serviço de streaming/IPTV — "Soul TV")
- **Owner:** A confirmar
- **Início:** 2026-08-27
- **OPSEC:** Tor + proxychains4, 2Captcha para Cloudflare bypass
- **Coordenador:** `pentest` (Red Team Operator)

## Sumário Executivo
(Atualizado ao final de cada fase)

## Tabela de Findings

| ID | Severidade | Título | Host/Asset | Evidência | Status |
|----|------------|-------|-----------|-----------|--------|
| C-001 | **HIGH** | Subdomain takeover / controle por terceiro (`testad` → GitHub Pages de terceiro) | testad.soultv.com.br | evidence/C-001.txt | Confirmado (não claimado) |
| C-002 | MEDIUM | Azure Blob `stsoultvbrs/media` leitura pública de blobs (sem list/write) | stsoultvbrs.blob.core.windows.net | evidence/C-002.txt | Confirmado |
| C-003 | MEDIUM | Firebase config vazada + Email/Password auth REST (cred-stuffing surface) | tv-iteractiva (Firebase) | evidence/C-003.txt | Confirmado (anon OFF) |
| P01–P10 | (preliminares) | Ver `recon/passive/findings_preliminary.md` (a validar nas fases webapp/enum) | vários | — | Pendente |

> Findings cloud consolidados em `recon/passive/cloud_validation.md`. C-XXX = findings cloud;
> F-XXX = findings webapp/rede (fases seguintes).

## Attack Surface Consolidada
(Ver `recon/SUMMARY.md` após Fase 4)

## Acessos Obtidos
- (nenhum até o momento)

## Objetivos de Alto Valor
- (preenchido conforme progresso)

## Cronologia
Ver `timeline.log`.

## Detalhamento de Findings
(Preenchido incrementalmente — um bloco por finding, referenciando `evidence/F-XXX.txt`)

---
*Relatório incremental gerado pelo coordenador `pentest`. Consolidado final
pelo especialista `report`.*
