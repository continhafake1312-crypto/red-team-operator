# PLAN — Engagement sharpify.com.br

## Plano Mestre

| Fase | Descrição | Especialista | Status | Achados |
|------|-----------|-------------|--------|---------|
| 1 | Escopo + estrutura | Coordenador | ✅ COMPLETE | F-001 a F-004 |
| 2 | Recon passivo + OSINT | recon-passive | ✅ COMPLETE | F-001 (Crítico), F-002 (Alto), F-003 (Médio), F-004 (Info) |
| 3 | Recon ativo | recon-active | ✅ COMPLETE | F-005 (Médio), F-001 elevado Crítico |
| 4 | Consolidar attack surface | Coordenador | ✅ COMPLETE | SUMMARY.md com ranking | 
| 5 | Enumeração profunda | enum | ✅ COMPLETE | 57 endpoints, F-006, F-007 |
| 6 | Ataque webapp | webapp | ⏳ EM PROGRESSO | - |
| 7 | CVE research + exploit | cve / exploit | ⏳ PENDENTE | - |
| 8 | Pós-exploração | postex | ⏳ PENDENTE | - |
| 9 | Relatório final | report | ⏳ PENDENTE | - |

## Ranking de Payoff (Atualizado em: 2026-08-20T05:32:00Z)

### ALTO
1. **Acesso financeiro** 🔥 — API docs expõem endpoints de pagamento e saque (F-001)
2. **Acesso interno/foothold** — MinIO/S3 pode dar acesso a arquivos internos (F-002)
3. **Acesso administrativo (admin/RCE)** — pendente de exploração
4. **Acesso a dados/PII** — pendente de exploração

### MÉDIO
- **Documentação API exposta** (F-001) — permite mapeamento completo
- **MinIO storage** (F-002) — potencial acesso a dados
- **API Express pública** (F-003) — endpoints operacionais
- **Bucket S3 candidates** — sharpify-public, sharpify-assets

### BAIXO
- **Subdomínios não resolvem** (F-004) — possíveis takeover
- **Info disclosure** — tech stack vazado via wayback

## Backlog de Vetores

### 🔴 Ativos (em andamento)
1. **F-001: API docs exposta** → Verificar endpoints documentados se estão operacionais sem auth
2. **F-002: MinIO/S3** → Testar portas 9000/9001 sem auth, buckets públicos
3. **F-003: API Express** → Testar endpoints comuns da API

### ⏸️ Pausados (com gatilho de retorno)
- **Cloudflare bypass**: tentar após encontrar IP real (via histórico DNS, email headers, shodan)
- **Subdomain takeover**: se CNAMEs apontarem para serviços externos abandonados
- **JS bundle analysis**: se encontrarmos Next.js chunks acessíveis

## Observações
- Cloudflare detectado (cf-mitigated: challenge) — usar 2Captcha para bypass
- Tor + proxychains4 obrigatório
- 2Captcha key disponível em `~/.opencode/.2captcha_key`