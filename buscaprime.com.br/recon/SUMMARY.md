# recon/SUMMARY.md — Attack Surface Consolidado

## Alvo: buscaprime.com.br

---

## Attack Surface

### Hosts Vivos (sem Cloudflare — ataque direto)
| Host | IP | Serviços | Notas |
|------|-----|----------|-------|
| seguro.buscaprime.com.br | 170.82.173.30 | HTTP (80), HTTPS (443) — gocache+openresty | **ORIGEM REAL** — checkout Yampi |

### Hosts com Cloudflare (exigem bypass)
| Host | Propósito | Tecnologia |
|------|-----------|------------|
| buscaprime.com.br | Site principal | Bootstrap, jQuery, PHP |
| app.buscaprime.com.br | Dashboard/Painel Admin | **Metronic 7.0.5** |
| painel.buscaprime.com.br | Login | PHP |
| mail.buscaprime.com.br | Webmail | cPanel |
| api.buscaprime.com.br | API (possível) | — |

### Endpoints de Alto Valor
| Endpoint | Método | Payoff |
|----------|--------|--------|
| `/api/public/dataset/v3/people/basic` | GET | 🔴 **Dados sensíveis** |
| `/buscar-dados-pelo-nome/consulta.php` | GET/POST | 🔴 Consulta CPF/nome |
| `/buscar-dados-pelo-cpf/consulta.php` | GET/POST | 🔴 Consulta CPF |
| `seguro.buscaprime.com.br/cart` | GET | 🟠 Checkout/sessão |
| `seguro.buscaprime.com.br/checkout` | GET | 🟠 Checkout completo |

---

## Ranking de Payoff (§16)

| # | Vetor | Payoff | Status | Próxima Ação |
|---|-------|--------|--------|-------------|
| 1 | **API pública de dados** | 🔴 Crítico | 🔍 Investigando | Testar parâmetros, SQLi, NoSQLi, IDOR |
| 2 | **Servidor origem (seguro)** | 🔴 Crítico | 🔍 Investigando | Fuzzing, gocache CVE, path traversal |
| 3 | **Yampi Checkout** | 🟠 Alto | 🔍 Investigando | Cookie tampering, CSRF, hCaptcha bypass |
| 4 | **Painel admin (app)** | 🟠 Alto | ⏳ Cloudflare | CloudFail, encontrar IP real |
| 5 | **Metronic 7.0.5** | 🟠 Alto | ⏳ CVE research | CVEs para Metronic 7.x |
| 6 | **Formulários de busca** | 🟡 Médio | ⏳ Aguardando | SQLi, XSS, LFI |
| 7 | **Subdomínios cPanel** | 🟢 Baixo | ⏳ Aguardando | Acessos padrão? |
| 8 | **Cloud buckets** | 🟢 Baixo | ✅ Exaurido | Nenhum bucket público |

---

## Credenciais / Acessos Obtidos
(nenhum até o momento)

## Objetivos de Alto Valor Atingidos (§7)
- ✅ Servidor origem descoberto (fora do Cloudflare)
- ✅ API de dados públicos identificada
- ✅ Stack tecnológica mapeada (gocache, openresty, Metronic 7.0.5, Yampi)
- ✅ Subdomínios mapeados (12)

---

**Última atualização:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")