# PLAN — Backlog de Vetores e Fases

> Espelho do todowrite. Fases em ordem, especialistas delegáveis, backlog de
> vetores pausados/ativos. Atualizado continuamente pelo coordenador.

## Fases (§5)

| # | Fase | Especialista | Status | Notas |
|---|------|--------------|--------|-------|
| 1 | Escopo (estrutura + artefatos) | pentest | done | estrutura criada |
| 2 | Recon Passivo + OSINT | recon-passive → osint/cloud | pending | |
| 3 | Recon Ativo | recon-active | pending | |
| 4 | Consolidar attack surface | pentest (SUMMARY.md) | pending | |
| 5 | Enumeração profunda | enum | pending | |
| 6 | Ataque webapp | webapp | pending | |
| 7 | CVE research + exploit | cve → exploit | pending | |
| 8 | Pós-exploração | postex (se foothold) | pending | |
| 9 | Relatório final | report | pending | |

## Backlog de Vetores (§19)

Vetores a explorar conforme surgem findings. Priorização por payoff (§16).

| ID | Vetor | Host/Alvo | Status | Motivo da pausa / Gatilho de retorno |
|----|-------|-----------|--------|--------------------------------------|
| — | (preenchido após recon) | | | |

## Ranking de Payoff (§16)

Atualizado após cada fase. 1 = maior payoff.

| Rank | Vetor/Alvo | Severidade esperada | Justificativa |
|------|------------|---------------------|---------------|
| — | (preenchido após recon/SUMMARY.md) | | |

## Notas de Adaptação (§1, §13)
- Alvo aparenta ser serviço de streaming/IPTV ("Soul TV"). Stack e infra a
  confirmar pelo recon. Possível Cloudflare (preparar bypass com 2Captcha).
- Foco em: APIs de autenticação, painéis de gestão, endpoints de
  streaming, creds de assinantes, configs de backend.

---
*Mantido pelo coordenador `pentest`.*
