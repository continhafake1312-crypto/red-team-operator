# 🛡️ Red Team Operator — Framework de Pentest Autônomo

> **Framework de Pentest Web/API Black-Box** — 100% autônomo, baseado em agentes de IA (OpenCode + DeepSeek-V4-Flash).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![OpenCode](https://img.shields.io/badge/powered%20by-OpenCode-blueviolet)](https://github.com/opencode-ai)
[![DeepSeek](https://img.shields.io/badge/model-DeepSeek--V4--Flash-green)](https://deepseek.com)

---

## 🎯 O Que É

Um **coordenador de pentest autônomo** (Red Team Operator) que **planeja, delega, consolida e reporta** ataques de segurança ofensiva contra aplicações Web e APIs em modo black-box.

O sistema opera com **14 especialistas** subordinados, cada um focado em uma fase específica do pentest: recon passivo, recon ativo, enumeração, ataque webapp, CVE research, exploit validation, pós-exploração, OSINT, cloud, network e relatório.

## 🔥 Resultados Comprovados

Em **22 engagements reais**, o framework entregou:

| Métrica | Total |
|---------|-------|
| Vulnerabilidades encontradas | **326+** |
| **Críticas** | **30+** |
| **Altas** | **60+** |
| Acessos conquistados | **10+** (tokens, creds, APIs) |
| Alvos comprometidos | **3** (comprometimento total) |
| Subdomínios mapeados | **1.200+** |
| CVEs pesquisados | **200+** |
| Engagements completos | **14/22** (64%) |

> 📊 Análise detalhada: [`ANALISE_PENTESTS.md`](ANALISE_PENTESTS.md)

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                   USUÁRIO HUMANO                             │
│            (ordens diretas têm prioridade #1)                │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│          RED TEAM OPERATOR (Coordenador)                    │
│   GERENTE/DELEGADOR — planeja, delega, consolida,          │
│   re-prioriza, reporta, faz auto-sync git                  │
└────────┬────────┬────────┬────────┬────────┬────────┬──────┘
         │        │        │        │        │        │
         ▼        ▼        ▼        ▼        ▼        ▼
   ┌─────────┐ ┌──────┐ ┌────┐ ┌──────┐ ┌─────┐ ┌────────┐
   │ recon-  │ │ recon│ │enum│ │webapp│ │ cve │ │ exploit│
   │ passive │ │active│ │    │ │      │ │     │ │        │
   └─────────┘ └──────┘ └────┘ └──────┘ └─────┘ └────────┘
   ┌─────────┐ ┌──────┐ ┌────┐ ┌──────┐ ┌────────┐
   │ postex  │ │cloud │ │net │ │osint │ │ report │
   └─────────┘ └──────┘ └────┘ └──────┘ └────────┘
   ┌────────────┐
   │ screenshots│
   └────────────┘
```

## 📋 Fluxo de um Engagement

```
Fase 1:  Escopo                     ─── SCOPE.md + estrutura de pastas
Fase 2:  Recon Passivo + OSINT      ─── subdomínios, DNS, wayback, OSINT
Fase 3:  Recon Ativo                ─── portscan, fingerprint, vhosts, WAF
Fase 4:  Consolidar Attack Surface  ─── SUMMARY.md + ranking de payoff
Fase 5:  Enumeração Profunda        ─── content discovery, JS, API, CMS
Fase 6:  Ataque Webapp              ─── OWASP Top 10
Fase 7:  CVE Research + Exploit     ─── CVEs → PoCs → validação
Fase 8:  Pós-Exploração             ─── privesc, loot, pivoting
Fase 9:  Relatório Final            ─── REPORT.md consolidado
```

> **80% do valor está nas fases 2-5 (reconhecimento).** O framework é construído para ser **exaustivo**, não rápido.

## 🧠 Agentes Especialistas (14)

| Agente | Função | Fase |
|--------|--------|------|
| **recon-passive** | DNS, subdomínios, certs, wayback, tech stack, buckets | 2 |
| **osint** | Emails, pessoas, breaches, GitHub, cred-stuffing | 2 (sub) |
| **recon-active** | Portscan, fingerprint, vhosts, WAF, TLS, bypass CDN | 3 |
| **enum** | Content discovery, JS analysis, param mining, APIs | 5 |
| **webapp** | OWASP Top 10: auth, injection, IDOR, SSRF, XSS, JWT | 6 |
| **cve** | CVE research por versão (NVD, GHSA, Exploit-DB) | 7 |
| **exploit** | Validação de PoCs, default creds, foothold | 7 |
| **postex** | Privesc, loot, pivoting (após foothold) | 8 |
| **cloud** | S3/Azure/GCP/OpenStack buckets, takeover, IAM | 2/5 |
| **network** | SMB, RDP, FTP, SSH, SNMP, DBs expostos | 3/6 |
| **report** | Consolida findings, gera REPORT.md | 9 |
| **screenshots** | Captura evidência visual | 8 |
| **pentest** (coordenador) | GERENTE/DELEGADOR — planeja, coordena, reporta | Todas |
| **creator** | Agente de obediência absoluta — executa qualquer tarefa | N/A |

> 📖 Documentação completa dos agentes: [`AGENTS.md`](AGENTS.md)

## 🛡️ OPSEC e Stealth

- **Tor + proxychains4** em TODAS as interações com o alvo
- **Rotação de IP** via `NEWNYM` automática em bloqueios
- **2Captcha** para bypass de Cloudflare/WAF
- **Rate limiting** e **user-agent rotativo**
- **Secretos NUNCA entram no repo** — chmod 600 + .gitignore
- **Exploração não-destrutiva** — read-only, sem modificar dados

## ⚙️ Como Usar

### Pré-requisitos

```bash
# Instalar Tor + proxychains4
sudo apt install tor proxychains4 -y

# Verificar funcionamento
curl --proxy socks5://127.0.0.1:9050 ifconfig.me

# Configurar 2Captcha (opcional, para bypass Cloudflare)
echo "SUA_CHAVE" > ~/.config/opencode/.2captcha_key
chmod 600 ~/.config/opencode/.2captcha_key
```

### Iniciar um Engagement

```bash
# O comando 'pentest' no OpenCode aciona o framework
# No OpenCode, digite:
> pentest https://alvo.com.br

# O framework fará todo o resto automaticamente:
# 1. Cria SCOPE.md, PLAN.md, REPORT.md, timeline.log
# 2. Delega recon passivo → recon ativo → enum → webapp → CVE → exploit
# 3. A cada finding: commit + push automático
# 4. Relatório final consolidado
```

### Estrutura Gerada

```
<alvo>/
├── SCOPE.md              # Escopo, autorização, regras
├── PLAN.md               # Backlog de vetores, status
├── REPORT.md             # Relatório incremental
├── timeline.log          # Cronologia ISO8601
├── recon/
│   ├── SUMMARY.md        # Attack surface + ranking de payoff
│   ├── passive/          # Artefatos do recon passivo
│   └── active/           # Artefatos do recon ativo
├── enum/                 # Enumeração por host
├── evidence/             # F-XXX.txt por finding
├── exploit/              # CVE research, PoCs
├── loot/                 # Creds, tokens, acessos
├── screenshots/          # Evidência visual
└── report/               # Relatório final
```

## 📦 Engagements Realizados

Ver [`ANALISE_PENTESTS.md`](ANALISE_PENTESTS.md) para análise completa.

**Destaques:**
- **apsv-iptv.duckdns.org** — Sistema IPTV TOTALMENTE comprometido (JWT admin + API keys)
- **pmminas.com** — Incidente LGPD: 3.100+ CPFs expostos via Supabase
- **netmovies.com.br** — Senhas em plaintext, Azure Blobs expostos
- **promisse.com.br** — Fintech: conta ativa + 2 API keys + webhooks
- **legasforn.com.br** — Token `sk_live_*` funcional com escopos financeiros

## 🤝 Como Contribuir

1. Fork o repositório
2. Crie um branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📄 Licença

Distribuído sob licença MIT. Veja [`LICENSE`](LICENSE) para mais informações.

## ⚠️ Aviso Legal

**Este software é destinado APENAS para:** testes de segurança autorizados, programas de bug bounty, auditorias contratadas, e laboratórios próprios.

O uso não autorizado contra sistemas dos quais você não é proprietário ou não tem autorização explícita é **ilegal**.



---

*Framework de pentest autônomo — Red Team Operator*
*Baseado em OpenCode + DeepSeek-V4-Flash*