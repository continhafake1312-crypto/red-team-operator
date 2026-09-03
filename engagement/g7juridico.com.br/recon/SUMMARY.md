# Attack Surface Summary — g7juridico.com.br

## Ranking de Payoff (Atualizado — Recon Ativo)

| # | Alvo/Vetor | Payoff | Descrição | Próximo Passo |
|---|---|---|---|---|
| 1 | **n8n.g7juridico.com.br** | 🔴 **CRÍTICO** | n8n v2.33.5 exposto (138.197.78.17) sem WAF. **/rest/settings vaza configs internas**. Portas 5678 (n8n web), 8000 (Nagios NSCA), 9443 (painel). SSO OIDC desabilitado mas configurado. Community nodes ativos. | CVE research, webhook enum, brute force, Nagios NSCA exploit |
| 2 | **191.6.196.7:3690 (SVN)** | 🔴 **CRÍTICO** | **Subversion exposto no blog (KingHost)**. Repositório de código pode conter credenciais, .env, código fonte. | svn ls/checkout anônimo |
| 3 | **Email Spoofing (DMARC p=none)** | 🔴 **CRÍTICO** | DMARC sem enforcement permite forjar emails do domínio. Spear-phishing contra alunos/clientes. | Validar spoofing |
| 4 | **191.6.196.7:21 (ProFTPD)** | 🟡 **ALTO** | **FTP exposto no blog.** Acesso anônimo potencial. Credenciais fracas. | FTP anônimo, brute force |
| 5 | **homologacao.g7juridico.com.br** | 🟡 **ALTO** | Clone produção (34.75.142.99). **Sem WAF, sem analytics**. Segurança mais fraca. Painel admin potencialmente exposto. | Brute force admin, testar diferenças |
| 6 | **www.g7juridico.com.br** | 🟡 **ALTO** | **Custom PHP (NÃO WordPress)**. Apache 2.4.29. Possível WAF (mod_security). /area-do-aluno/ expõe portal de alunos. | IDOR em cursos (?p=, ?post_type=course), auth bypass |
| 7 | **138.197.78.17:8000 (Nagios NSCA)** | 🟡 **ALTO** | **Nagios NSCA exposto** no servidor n8n. Pode aceitar comandos passivos. | Verificar comandos não-autenticados |
| 8 | **n8n /rest/settings (Info Disclosure)** | 🟡 **ALTO** | **Configurações internas do n8n vazadas**: auth method (email), SSO (OIDC desabilitado), community nodes enabled (⚠️ risco RCE via nodes maliciosos). | Explorar community nodes / verificar CVEs |
| 9 | **TLS 1.0/1.1 habilitados** | 🟡 **MÉDIO** | Site principal suporta TLS 1.0 e 1.1 (protocolos obsoletos com vulnerabilidades conhecidas). | — |
| 10 | **Takeover Candidates** | 🟢 **MÉDIO** | gtm→stape.io, lp/materiais→greatpages.com.br (CNAME dangling). blog→KingHost. | Validar disponibilidade |
| 11 | **blog.g7juridico.com.br** | 🟢 **MÉDIO** | KingHost (191.6.196.7). Apache. Site placeholder — blog parece inativo. | Investigar takeover |
| 12 | **Zoho / Stape IPs** | ⚪ **INFO** | Serviços terceiros (Zoho Mail, Zoho ZeptoMail, Stape GTM). Sem exploração direta. | — |

## Infrastructure Overview (Atualizado)

```
Internet
├── Cloudflare [lp, materiais subdomains only]
│   └── GreatPages (LP/materiais)
├── Google Cloud [34.75.142.99] ← Firewall restrito (só 80/443)
│   ├── www.g7juridico.com.br (Apache 2.4.29 / Custom PHP)
│   ├── homologacao.g7juridico.com.br (staging — sem WAF)
│   └── blackfriday.g7juridico.com.br (404 — desativado)
├── DigitalOcean [138.197.78.17] ← Portas: 22/80/443/5678/8000/9443
│   ├── n8n.g7juridico.com.br (nginx 1.24.0 / n8n v2.33.5)
│   ├── Nagios NSCA (porta 8000)
│   └── Painel adicional (porta 9443)
├── KingHost [191.6.196.7] ← Portas: 21/80/443/3690
│   ├── blog.g7juridico.com.br (Apache — site placeholder)
│   ├── ProFTPD (porta 21)
│   └── Subversion SVN (porta 3690) ⚠️
├── Google Cloud [34.95.178.104]
│   └── gtm.g7juridico.com.br (Stape.io — Traefik proxy)
└── Zoho [204.141.42.x]
    ├── mail.g7juridico.com.br (Zoho Mail)
    └── links.g7juridico.com.br (Zoho ZeptoMail)
```

## Hosts Prioritários para Próximas Fases

| Ordem | Host | IP | Tech | Payoff |
|---|---|---|---|---|
| 1 | n8n.g7juridico.com.br | 138.197.78.17 | nginx 1.24.0 / n8n v2.33.5 / Nagios NSCA | 🔴 Crítico |
| 2 | blog.g7juridico.com.br (SVN+ FTP) | 191.6.196.7 | Apache / ProFTPD / Subversion | 🔴 Crítico |
| 3 | homologacao.g7juridico.com.br | 34.75.142.99 | Apache 2.4.29 / Custom PHP (clone) | 🟡 Alto |
| 4 | www.g7juridico.com.br | 34.75.142.99 | Apache 2.4.29 / Custom PHP | 🟡 Alto |
| 5 | 138.197.78.17 (Nagios) | 138.197.78.17:8000 | Nagios NSCA | 🟡 Alto |
| 6 | blog.g7juridico.com.br | 191.6.196.7 | Apache (placeholder) | 🟢 Médio |