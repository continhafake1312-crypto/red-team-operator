# REPORT.md — cursosdetransito.com.br

## Sumário Executivo
> Relatório incremental de pentest. Em atualização.

## Descobertas

| ID | Tipo | Severidade | Descrição | Status |
|----|------|-----------|-----------|--------|
| F-001 | API Exposure | 🔴 CRÍTICO | WooCommerce REST API (/wc/v3) exposta sem autenticação — schema completo de produtos, pedidos, cupons, clientes, webhooks | Identificado |
| F-002 | API Exposure | 🟠 ALTO | WordPress Users REST API exposta — 7 usuários enumerados com slugs (suporte, ibac-dev, dev_alisson, etc.) | Identificado |
| F-003 | Directory Listing | 🟠 ALTO | /wp-content/uploads/ com directory listing habilitado — expõe uploads de 2015-2026 | Identificado |
| F-004 | Sensitive Paths | 🟠 MÉDIO | Múltiplos endpoints sensíveis no gau: /certificados/, /chat/, /core/three.php, /riodejaneiro/boleto.php | Identificado |
| F-005 | Plugin Exposure | 🟡 MÉDIO | wp-file-manager-pro, sucuri logs, fluentcrm — pastas expostas em /wp-content/uploads/ | Identificado |
| F-006 | Info Disclosure | 🟡 MÉDIO | Yoast SEO Premium v24.8 — metadados organizacionais expostos (CNPJ, email, telefone) | Identificado |
| F-007 | User Enumeration | 🟡 MÉDIO | Author enumeration via ?author=X — 7 usuários confirmados | Identificado |

## Credenciais / Acessos
| Serviço | Usuário | Senha/Token | Origem | Status |
|---------|---------|-------------|--------|--------|
| WordPress | suporte | — | REST API - author enum | Pendente brute-force |
| WordPress | ibac-dev | — | REST API - author enum | Pendente brute-force |
| WordPress | dev_alisson (Alisson Custodio) | — | REST API - author enum | Pendente brute-force |
| WordPress | mariana | — | REST API - author enum | Pendente brute-force |
| WordPress | juliana-belei (Juliana) | — | REST API - author enum | Pendente brute-force |
| WordPress | luiza-plautz (Luiza Plautz) | — | REST API - author enum | Pendente brute-force |
| WordPress | mariana-lima-halfen | — | REST API - author enum | Pendente brute-force |

## Anexos
- \`evidence/\` — prints, logs, PoCs
- \`loot/\` — dados extraídos
- \`scans/\` — outputs brutos de ferramentas