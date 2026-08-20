# RELATÓRIO DE PENTEST — bagy.com.br

**Início:** 2026-08-20T05:35:00Z
**Alvo:** https://www.bagy.com.br/
**Tipo:** Black-box Externo (Web/API + Mobile)
**Empresa:** BAGY SOLUÇÕES DE COMÉRCIO DIGITAL LTDA. (CNPJ: 27.357.470/0001-63)

---

## Sumário Executivo

Engagement de pentest black-box contra a plataforma Bagy (e-commerce SaaS brasileira). 
Até o momento, **2 takeovers de subdomínio confirmados** (pixel.bagy.com.br CRÍTICO, 
staging.bagy.com.br ALTO), além de múltiplos vetores de alto valor identificados:
WordPress 7.0.4 com Elementor/Oxygen, API Load Balancer no Google Cloud, servidor 
Golang oculto com Traefik exposto, SSO OpenID Configuration vazado, e infraestrutura 
exposta na Locaweb.

## Resumo de Findings

| ID | Título | Severidade | Status |
|----|-------|-----------|--------|
| F-001 | Subdomain Takeover — pixel.bagy.com.br | **Crítica** | ✅ Confirmado |
| F-002 | Subdomain Takeover — staging.bagy.com.br | **Alta** | ✅ Confirmado |
| — | WordPress 7.0.4 + Elementor 3.23.1 exposto (on.bagy.com.br) | **Alta** | 🔍 Em análise |
| — | OpenID Configuration exposto (/.well-known/openid-configuration) | **Alta** | 🔍 Em análise |
| — | Traefik default cert + hostname interno do cluster vazado (35.199.71.234) | **Média** | 🔍 Em análise |
| — | DMARC p=quarantine pct=20 (80% dos emails aceitos sem DMARC) | **Média** | 🔍 Em análise |
| — | CAA não configurado (qualquer CA pode emitir certificados) | **Média** | 🔍 Em análise |
| — | Elementor 3.23.1 desatualizado — 7 CVEs de XSS conhecidos | **Média** | 🔍 Em análise |

## Timeline

| Data | Ação | Resultado |
|------|------|-----------|
| 2026-08-20T05:35 | Início do engagement | Estrutura criada, recon inicial feito |
| 2026-08-20T05:45 | Recon passivo + OSINT concluído | 76 subdomínios, 38 vivos, 56 IPs, 2 takeovers |
| 2026-08-20T06:00 | Validação de takeovers | F-001 (pixel) e F-002 (staging) confirmados |
| 2026-08-20T06:00 | Recon ativo concluído | 39 hosts up, ~96 portas, Golang oculto + Traefik |
| 2026-08-20T06:10 | CVE research concluído | WP 7.0.4 clean; Elementor XSS; Oxygen RCE potencial |
| 2026-08-20T06:30 | Attack surface consolidado | SUMMARY.md com ranking de payoff |

## Findings

### F-001 — Subdomain Takeover — pixel.bagy.com.br (CRÍTICA)
- **CNAME:** pixel.bagy.com.br → pixel.hotmart.com → NXDOMAIN
- **Impacto:** qualquer pessoa pode registrar subdomínio no Hotmart e hospedar conteúdo malicioso sob pixel.bagy.com.br
- **Evidência:** evidence/F-001.txt
- **Recomendação:** remover CNAME imediatamente

### F-002 — Subdomain Takeover — staging.bagy.com.br (ALTA)
- **CNAME:** staging.bagy.com.br → bagy-stores-env-lb.us-east-2.elasticbeanstalk.com → NXDOMAIN
- **Impacto:** controle do subdomínio via AWS Elastic Beanstalk
- **Evidência:** evidence/F-002.txt
- **Recomendação:** remover CNAME imediatamente

### F-003 — Firebase Configuration Exposure — ig.bagy.com.br (MÉDIA)
- **Firebase Project:** deeplink-b3800 (API Key, Auth Domain, Database URL, Storage Bucket expostos)
- **Impacto:** API Key pública permite abuso de quota e enumeração de contas; database desabilitado pelo owner
- **Evidência:** evidence/F-003.txt
- **Recomendação:** revisar necessidade de exposição; implementar App Check

### F-004 — DMARC Policy Weak — Email Spoofing (MÉDIA)
- **Política:** p=quarantine pct=20 — apenas 20% dos emails falsos são filtrados
- **SPF:** ~all (softfail) — servidores não autorizados ainda entregam emails
- **Impacto:** 80% dos emails spoofados em nome de @bagy.com.br chegam na caixa de entrada
- **Evidência:** evidence/F-004.txt
- **Recomendação:** aumentar pct gradualmente até p=reject; mudar SPF para -all

### F-005 — CAA Record Not Configured (MÉDIA)
- **Impacto:** qualquer CA pode emitir certificados SSL para bagy.com.br
- **Evidência:** evidence/F-005.txt
- **Recomendação:** restringir CAA às CAs autorizadas (Let's Encrypt, DigiCert, etc.)

### F-006 — Traefik Default Certificate — Internal Cluster Name Disclosure (MÉDIA)
- **Alvo:** server.bagy.com.br (35.199.71.234) — servidor GCP exposto diretamente (sem CDN)
- **Descoberta:** Traefik Ingress Controller rodando em cluster Kubernetes; hostname interno vazado
- **Certificado:** auto-assinado TRAEFIK DEFAULT CERT expirando em 1 dia
- **Evidência:** evidence/F-006.txt
- **Recomendação:** substituir certificado; restringir acesso; colocar atrás de CDN

---

## Severidades

- **Crítica:** 1 (F-001)
- **Alta:** 1 (F-002) + 3 em análise
- **Média:** 4 (F-003, F-004, F-005, F-006)
- **Baixa:** 0
- **Info:** 0

---
*Relatório incremental — atualizado em 2026-08-20T06:30:00Z*