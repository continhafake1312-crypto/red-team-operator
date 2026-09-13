# Attack Surface Summary — cursosdetransito.com.br

## Topologia da Infraestrutura
```
Internet → AWS ELB (sa-east-1) → Apache/2.4.58 Ubuntu → WordPress 6.8.3
                                                                  ↓
                                                      Elementor 3.29.2 + WooCommerce 9.8.7
                                                                  ↓
                                          Plugins: Yoast SEO Premium 24.8, FluentForm, WPC Share Cart,
                                                   WhatsApp WP, WP Rocket, HappyAddons, VWO
```

### Infraestrutura Física
- **AWS EC2 sa-east-1 (São Paulo)** — IPs: 177.71.241.166, 52.67.183.160, 54.233.154.243
- **AWS ELB** — Elastic Load Balancer (awselb/2.0)
- **Cloudflare** — Parcial (apenas `www` e `certificados` atrás do Cloudflare)
- **Email MX**: Office 365 (cursosdetransito-com-br.mail.protection.outlook.com)

### Subdomínios (10 descobertos)
| Subdomínio | IP | Obs |
|------------|----|-----|
| cursosdetransito.com.br | 177.71.241.166 | Principal, sem CF |
| www.cursosdetransito.com.br | Cloudflare | Redireciona |
| certificados.cursosdetransito.com.br | Cloudflare | Certificados |
| alisson.cursosdetransito.com.br | — | Sem resolução |
| mail.cursosdetransito.com.br | — | Sem resolução |
| pgto.cursosdetransito.com.br | — | Pagamentos? |
| parceiros.cursosdetransito.com.br | — | Parceiros |
| curlink.cursosdetransito.com.br | — | Links? |
| curspf.cursosdetransito.com.br | — | SPF? |
| teste.cursosdetransito.com.br | — | Teste |
| www2.cursosdetransito.com.br | — | Descoberto via gau |

## Ranking de Payoff §16

| Prioridade | Vetor | Payoff Esperado | Status |
|------------|-------|-----------------|--------|
| 🔴 **CRÍTICO** | **WooCommerce REST API sem auth** — /wp-json/wc/v3/ exposto | Dados de vendas, clientes, produtos, cupons | ⏳ Pendente verificação |
| 🔴 **CRÍTICO** | **WordPress REST API usuários expostos + enum** — 7 usuários com slugs | Força bruta, password spray | ⏳ Pendente |
| 🔴 **CRÍTICO** | **FluentForm** — plugin formulário v6.0.3 | SQLi, upload, injeção | ⏳ Pendente |
| 🟠 **ALTA** | **Elementor 3.29.2** — CVE recentes? | RCE, stored XSS | ⏳ Pendente CVE |
| 🟠 **ALTA** | **Apache 2.4.58 (Ubuntu)** — sem WAF aparente | Exploração direta | ⏳ Pendente |
| 🟠 **ALTA** | **/certificados/** — painel de certificados | Acesso a certificados, dados de alunos | ⏳ Pendente |
| 🟠 **ALTA** | **/core/three.php** — arquivo órfão | LFI/RFI, info disclosure | ⏳ Pendente |
| 🟠 **ALTA** | **/wp-content/themes/cursos-de-transito/ajax.php** — AJAX handler antigo | SQLi, file read | ⏳ Pendente |
| 🟡 **MÉDIA** | **/chat/** — chat server PHP | Injeção, XSS | ⏳ Pendente |
| 🟡 **MÉDIA** | **/painel/esqueci-a-senha/** — recovery form | User enum, brute force | ⏳ Pendente |
| 🟡 **MÉDIA** | **Yoast SEO Premium 24.8** — info disclosure | Metadados | ⏳ Pendente |
| 🟡 **MÉDIA** | **AWS ELB IPs diretos** — bypass Cloudflare | Acesso a backend | ⏳ Pendente |
| 🟢 **BAIXA** | **WPC Share Cart 2.1.5** | Lógica | ⏳ Pendente |
| 🟢 **BAIXA** | **Upload dirs** /wp-content/uploads | Path traversal | ⏳ Pendente |

## Credenciais Conhecidas
| Serviço | Usuário | Observação |
|---------|---------|------------|
| WordPress | `suporte` | Admin (ID 1) |
| WordPress | `ibac-dev` | Admin (ID 2) |
| WordPress | `dev_alisson` | Provável admin (ID 14) — ALISSON CUSTODIO |
| WordPress | `mariana` | Editor/autor |
| WordPress | `mariana-lima-halfen` | Autor |
| WordPress | `juliana-belei` | Autor |
| WordPress | `luiza-plautz` | Autor |
| Email | `contato@alisson.cursosdetransito.com.br` | Contato |
| Email | `pedro.bubna@ibacbrasil.com` | Clarity (analytics) |