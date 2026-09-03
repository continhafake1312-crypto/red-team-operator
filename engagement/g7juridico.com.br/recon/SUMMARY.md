# Attack Surface Summary — g7juridico.com.br

## Ranking de Payoff (Atualizado)

| # | Alvo/Vetor | Payoff | Descrição | Próximo Passo |
|---|---|---|---|---|
| 1 | **n8n.g7juridico.com.br** | 🔴 **CRÍTICO** | n8n v2.33.5 exposto em DigitalOcean (138.197.78.17) sem WAF. Workflow automation com potencial acesso a redes internas e credenciais. | Portscan, brute login, CVEs, webhook scan |
| 2 | **Email Spoofing (DMARC p=none)** | 🔴 **CRÍTICO** | DMARC sem enforcement permite forjar emails do domínio. Spear-phishing contra alunos. | Validar spoofing, relatar |
| 3 | **homologacao.g7juridico.com.br** | 🟡 **ALTO** | Ambiente de staging exposto, mesmo IP da produção (34.75.142.99). Segurança potencialmente mais fraca. | Fingerprint, wpscan, creds padrão |
| 4 | **WordPress (www)** | 🟡 **ALTO** | Apache 2.4.29 / WordPress. IP real 34.75.142.99 exposto (sem Cloudflare). Sem WAF. | WPScan, enum usuarios, plugins |
| 5 | **Sem WAF** | 🟡 **ALTO** | wafw00f negativo. Scanning/exploração sem restrições. | — |
| 6 | **blog.g7juridico.com.br** | 🟢 **MÉDIO** | KingHost (191.6.196.7). Apache. Possível WP separado. | Portscan, fingerprint |
| 7 | **Takeover Candidates** | 🟢 **MÉDIO** | gtm→stape.io, lp/materiais→greatpages.com.br (CNAME dangling) | Validar disponibilidade |
| 8 | **IP 34.75.142.99 (GCP)** | 🟢 **MÉDIO** | Servidor principal Google Cloud. Demais portas expostas? | Portscan completo |
| 9 | **IP 138.197.78.17 (DigitalOcean)** | 🟢 **MÉDIO** | n8n. Outros serviços na mesma VM? | Portscan completo |

## Infrastructure Overview

```
Internet
├── Cloudflare [lp, materiais subdomains only]
│   └── GreatPages (LP/materiais)
├── Google Cloud [34.75.142.99]
│   ├── www.g7juridico.com.br (Apache/WordPress)
│   ├── homologacao.g7juridico.com.br (staging)
│   └── blackfriday.g7juridico.com.br (campanha)
├── DigitalOcean [138.197.78.17]
│   └── n8n.g7juridico.com.br (nginx/n8n v2.33.5)
├── KingHost [191.6.196.7]
│   └── blog.g7juridico.com.br (Apache)
├── Google Cloud [34.95.178.104]
│   └── gtm.g7juridico.com.br (Stape.io - GTM server)
└── Zoho [204.141.42.x]
    ├── mail.g7juridico.com.br (Zoho Mail)
    └── links.g7juridico.com.br (Zoho ZeptoMail)
```

## Hosts Prioritários para Recon Ativo

| Ordem | Host | IP | Tech | Payoff |
|---|---|---|---|---|
| 1 | n8n.g7juridico.com.br | 138.197.78.17 | nginx 1.24.0 / n8n v2.33.5 | 🔴 Crítico |
| 2 | www.g7juridico.com.br | 34.75.142.99 | Apache 2.4.29 / WordPress | 🟡 Alto |
| 3 | homologacao.g7juridico.com.br | 34.75.142.99 | Apache 2.4.29 / WordPress (clone) | 🟡 Alto |
| 4 | blog.g7juridico.com.br | 191.6.196.7 | Apache | 🟢 Médio |
| 5 | 34.75.142.99 | — | Google Cloud (outras portas) | 🟢 Médio |
| 6 | 138.197.78.17 | — | DigitalOcean (outras portas) | 🟢 Médio |