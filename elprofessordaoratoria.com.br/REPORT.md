# RELATÓRIO DE PENTEST — elprofessordaoratoria.com.br

**Tipo**: Pentest Web/API Externo Black-Box  
**Início**: 2026-08-20  
**Status**: EM ANDAMENTO  

---

## Sumário Executivo

Pentest em andamento. Recon passivo concluído revelou extensa superfície de ataque:
ecossistema de 14 subdomínios, 5 IPs de origem real (sem Cloudflare), múltiplos
painéis administrativos expostos (Portainer, Mautic) e infraestrutura interna
(n8n, MinIO, Supabase, Odoo, Dify, Baserow) em servidores Hostinger e GCP.

---

## Findings por Severidade

### Crítica (0)
Nenhum confirmado ainda.

### Alta (0)
Nenhum confirmado ainda.

### Média (0)
Nenhum confirmado ainda.

### Baixa (0)
Nenhum confirmado ainda.

### Info (4)

**I-001 — Painel Portainer (Docker UI) exposto na internet**
- **Alvo**: https://portainer.elprofessordaoratoria.com.br/
- **Detalhe**: Portainer 2.21.5 acessível sem autenticação inicial (tela de login).
  Docker management UI exposto publicamente. Endpoint /api/status e /api/auth
  acessíveis sem rate limiting.
- **Impacto**: Portainer é interface de gerenciamento Docker. Se credenciais forem
  obtidas, container escape → RCE no host.
- **Status**: Em investigação (credenciais default testadas sem sucesso até o momento).

**I-002 — Painel Mautic (Marketing Automation) exposto na internet**
- **Alvo**: https://mautic.elprofessordaoratoria.com.br/s/login
- **Detalhe**: Mautic acessível, página de login exposta. Password reset habilitado.
- **Impacto**: Mautic gerencia campanhas de marketing e dados de contatos. Vazamento
  de PII possível.
- **Status**: Em investigação.

**I-003 — API GCP exposta (api.elprofessordaoratoria.com.br)**
- **Alvo**: https://api.elprofessordaoratoria.com.br/
- **Detalhe**: Endpoint retorna 404 para todos os caminhos testados. Pode requerer
  autenticação ou ser endpoint específico.
- **Impacto**: Potencial back-end de aplicação exposto.
- **Status**: Em investigação.

**I-004 — Infraestrutura interna extensa (ecossistema Nova Dimensão)**
- **Alvo**: 82.112.244.187 (Hostinger)
- **Detalhe**: Servidor compartilhado hospeda n8n, MinIO, Supabase, Odoo, Dify,
  Baserow, CRM, S3 interno, Portainer, Mautic. Todos serviços potencialmente
  acessíveis publicamente.
- **Impacto**: Superfície de ataque massiva.
- **Status**: Aguardando confirmação de portas/serviços (recon ativo).

---

## Detalhamento dos Findings

### I-001 — Portainer Docker UI

**URL**: https://portainer.elprofessordaoratoria.com.br/  
**Portainer Version**: 2.21.5  
**InstanceID**: 3ca33b66-7ef2-4a2a-971a-5e10edef581e  
**Demo Environment**: disabled  
**Endpoints acessíveis**:
- `GET /` — 200 OK (SPA Angular, título "Portainer")
- `GET /api/status` — 200 OK (versão e instance ID)
- `GET /#!/init/admin` — 200 OK (página de setup admin)

**Credenciais testadas (rejeitadas)**:
- admin:admin, admin:portainer, admin:password, admin:admin123,
  admin:portainer123, admin:123456, admin:P@ssw0rd

### I-002 — Mautic Marketing

**URL**: https://mautic.elprofessordaoratoria.com.br/s/login  
**Acessível**: Página de login com formulário e CSRF token
- `GET /s/login` — 200 OK (título "Mautic")
- `GET /s/register` — 302 (registro desabilitado)
- `GET /passwordreset` — 200 OK (página de reset de senha)

### I-003 — API GCP

**URL**: https://api.elprofessordaoratoria.com.br/  
**Retorno**: 404 para todos os endpoints testados (/, /api, /v1, /health,
/graphql, /swagger, /openapi.json, /docs)
**IP**: 35.199.71.234 (Google Cloud Platform)

### I-004 — Infraestrutura Nova Dimensão

**IP**: 82.112.244.187 (Hostinger)  
**Serviços reportados**: n8n, MinIO, Supabase, Odoo, Dify, Baserow, CRM, S3  
**A confirmar via recon ativo**.

---

## Acessos Obtidos

- Nenhum acesso obtido até o momento.

---

## Objetivos de Alto Valor Atingidos

- [ ] Acesso interno (foothold)
- [ ] Acesso administrativo (admin/RCE)
- [ ] Acesso financeiro (pagamentos/transações)
- [ ] Acesso a dados/PII (usuários/clientes)

---

## Timeline

- **2026-08-20T05:51:00Z** — Início do engagement.
- **2026-08-20T06:18:00Z** — Recon passivo concluído. 14 subdomínios, 5 IPs reais.
- **2026-08-20T18:00:00Z** — Painéis Portainer (2.21.5) e Mautic confirmados acessíveis. API GCP 404.