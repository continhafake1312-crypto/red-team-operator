# RELATÓRIO DE PENTEST — elprofessordaoratoria.com.br

**Tipo**: Pentest Web/API Externo Black-Box  
**Início**: 2026-08-20  
**Status**: EM ANDAMENTO  

---

## Sumário Executivo

Pentest em andamento. Recon passivo e enumeração profunda concluídos. Foram
descobertos múltiplos findings de segurança, incluindo:

- **F-001 (Média)**: Arquivo `.env` exposto no Mautic com credenciais de teste
  (admin:mautic, DB root sem senha)
- **F-002 (Alta)**: Portainer 2.21.5 (Docker UI) exposto publicamente
- **F-003 (Média)**: WordPress user enumeration via REST API (2 usuários expostos)
- **F-004 (Crítica)**: Bancos de dados PostgreSQL (5432) e MariaDB (3306) expostos
  publicamente
- **F-005 (Média)**: Serviço web Markmap na porta 3000 sem autenticação
- **F-006 (Info)**: WordPress XML-RPC ativo (brute force possível)
- **F-007 (Info)**: API GCP endpoint `/healthz` acessível
- **F-009 (Alta)**: n8n 1.109.1 (Workflow Automation) exposto publicamente via
  novadimensaodigital.com.br — config exposta em /rest/settings
- **F-010 (Média)**: MinIO Console exposto publicamente
- **F-011 (Alta)**: Portainer 2.21.5 (segunda instância) exposto em
  portainer.novadimensaodigital.com.br

Nenhum acesso administrativo ou RCE obtido até o momento. Credenciais default
dos painéis testadas sem sucesso. Acesso aos serviços internos (n8n, MinIO,
Portainer, PostgreSQL) requer credenciais adicionais.

---

## Findings por Severidade

### Crítica (1)
**F-004 — Bancos de Dados Expostos (PostgreSQL + MariaDB)**
- **Alvo**: 82.112.244.187:5432 (PostgreSQL) / 147.93.38.23:3306 (MariaDB 11.8.8)
- **Detalhe**: Duas portas de banco de dados acessíveis publicamente da internet.
  PostgreSQL requer senha (SSL com CN=ndd). MariaDB nega root sem/senha.
- **Impacto**: Se credenciais forem obtidas, acesso completo aos dados.
- **Status**: Credenciais testadas (common) sem sucesso. Brute force necessário.

### Alta (3)
**F-002 — Portainer Docker UI Exposto**
- **Alvo**: https://portainer.elprofessordaoratoria.com.br/ (Portainer CE 2.21.5)
- **Detalhe**: Interface de gerenciamento Docker exposta na internet. 2 instâncias
  encontradas (elprofessordaoratoria e novadimensaodigital). /api/status público.
  Admin já configurado em ambas.
- **Impacto**: Crítico se credenciais obtidas (container escape → RCE no host).
- **Status**: Credenciais default testadas (~20 combos) sem sucesso.

**F-009 — n8n Workflow Automation Exposto**
- **Alvo**: https://n8n.novadimensaodigital.com.br/ (n8n 1.109.1, Docker)
- **Detalhe**: Plataforma de automação de workflows exposta. /rest/settings sem
  auth expõe configuração completa (DB, Node.js version, webhook URLs).
  Node.js 22.17.0, PostgreSQL.
- **Impacto**: Crítico se credenciais obtidas (workflows executam código Node.js
  arbitrário — RCE direto).
- **Status**: Em investigação. CVE research pendente (n8n tem histórico de RCEs
  não-autenticados).

**F-011 — Portainer (Nova Dimensão) Exposto**
- **Alvo**: https://portainer.novadimensaodigital.com.br/ (Portainer CE 2.21.5)
- **Detalhe**: Segunda instância do Portainer no ecossistema Nova Dimensão.
  InstanceID diferente: 0458b3d6.
- **Impacto**: Mesmo risco do F-002.
- **Status**: Mesma versão, mesma configuração.

### Média (4)
**F-001 — Mautic .env Exposto**
- **Alvo**: https://mautic.elprofessordaoratoria.com.br/.env
- **Detalhe**: Arquivo .env.test acessível publicamente com credenciais de ambiente
  de teste (DB root sem senha, admin:mautic).
- **Impacto**: Exposição de credenciais de ambiente de teste.
- **Status**: Confirmado.

**F-003 — WordPress User Enumeration via REST API**
- **Alvo**: https://elprofessordaoratoria.com.br/wp-json/wp/v2/users/
- **Detalhe**: Dois usuários expostos: admin (ID1) e Gabriel (ID2).
- **Impacto**: Permite ataques direcionados de brute force.
- **Status**: Confirmado.

**F-005 — Serviço Markmap Exposto (porta 3000)**
- **Alvo**: http://82.112.244.187:3000/
- **Detalhe**: Serviço Express.js de geração de mind maps (Markmap). POST /
  cria novos mapas sem autenticação. Mapas vazios gerados.
- **Impacto**: Serviço interno exposto publicamente.
- **Status**: Confirmado.

**F-010 — MinIO Console Exposto**
- **Alvo**: https://minio.novadimensaodigital.com.br/ (MinIO Console)
- **Detalhe**: Interface de gerenciamento de armazenamento S3 exposta. API S3
  (porta 9000) bloqueada por firewall. Login requer credenciais.
- **Impacto**: Se credenciais obtidas, acesso a objetos armazenados.
- **Status**: Credenciais default testadas (minioadmin/minioadmin).

### Baixa (0)
Nenhum.

### Info (3)
**F-006 — WordPress XML-RPC Ativo**
- **Alvo**: https://elprofessordaoratoria.com.br/xmlrpc.php
- **Detalhe**: XML-RPC habilitado. Permite brute force e pingback.
- **Status**: Confirmado.

**F-007 — API GCP Health Check**
- **Alvo**: https://api.elprofessordaoratoria.com.br/healthz
- **Detalhe**: Health check público (200 OK, 2 bytes).
- **Status**: Confirmado.

**F-008 — Mautic Git Exposure**
- **Alvo**: https://mautic.elprofessordaoratoria.com.br/.git/logs/
- **Detalhe**: Directory listing do .git/logs/ retorna 301.
- **Status**: Parcial (301 redirect, sem listing confirmado).

---

## Detalhamento dos Findings

### F-001 — Mautic .env Exposto

**Alvo**: https://mautic.elprofessordaoratoria.com.br/.env  
**Severidade**: Média  
**Endpoint**: `GET /.env` → 200 OK

**Conteúdo exposto**:
- DB_HOST=127.0.0.1 / DB_PORT=3306 / DB_NAME=mautictest
- DB_USER=root / DB_PASSWD= (vazio)
- MAUTIC_ADMIN_USERNAME=admin / MAUTIC_ADMIN_PASSWORD=mautic

**Impacto**: Exposição de configuração de ambiente (teste) com credenciais.
Evidência: `evidence/F-001-mautic-env-exposed.txt`

### F-002 — Portainer Docker UI Exposto

**Alvo**: https://portainer.elprofessordaoratoria.com.br/  
**Severidade**: Alta  
**Portainer Version**: 2.21.5  
**InstanceID**: 3ca33b66-7ef2-4a2a-971a-5e10edef581e  
**Demo Environment**: disabled  
**Endpoints acessíveis**:
- `GET /` — 200 OK (SPA Angular, título "Portainer")
- `GET /api/status` — 200 OK (versão e instance ID)
- `GET /#!/init/admin` — 200 OK (página de setup admin, mas admin já existe)

**Credenciais testadas (rejeitadas)**: admin:admin, admin:portainer, admin:password,
admin:admin123, admin:portainer123, admin:123456, admin:P@ssw0rd
**Evidência**: `evidence/F-002-portainer-exposed.txt`

### F-003 — WordPress User Enumeration

**Alvo**: https://elprofessordaoratoria.com.br/wp-json/wp/v2/users/  
**Severidade**: Média  
**Usuários**: admin (ID1), Gabriel (ID2)  
**Evidência**: `evidence/F-003-wp-users-disclosure.txt`

### F-004 — Bancos de Dados Expostos

**Alvo**: 82.112.244.187:5432 (PostgreSQL), 147.93.38.23:3306 (MariaDB 11.8.8)  
**Severidade**: Crítica  
**Evidência**: `evidence/F-004-databases-exposed.txt`

### F-005 — Serviço Markmap (porta 3000)

**Alvo**: http://82.112.244.187:3000/  
**Severidade**: Média  
**Descrição**: Serviço Express.js que gera mind maps. POST / cria novo mapa
sem autenticação. Mapas armazenados em /maps/<hex>/index.html (Markmap framework).

### F-006 — WordPress XML-RPC Ativo

**Alvo**: https://elprofessordaoratoria.com.br/xmlrpc.php  
**Severidade**: Info  
**Descrição**: XML-RPC ativo, permite brute force de credenciais e pingback.

### F-007 — API GCP Health Check

**Alvo**: https://api.elprofessordaoratoria.com.br/healthz  
**Severidade**: Info  
**Descrição**: Endpoint de health check do GCP Cloud Run acessível (200 OK).

### F-008 — Mautic Git Exposure

**Alvo**: https://mautic.elprofessordaoratoria.com.br/.git/logs/  
**Severidade**: Info  
**Descrição**: Redirecionamento 301 para /.git/logs/ (possível exposição de
diretório git). Acesso a arquivos .git/ negado (404).

### F-009 — n8n Workflow Automation

**Alvo**: https://n8n.novadimensaodigital.com.br/  
**Severidade**: Alta  
**Versão**: 1.109.1  
**Node.js**: 22.17.0  
**Database**: PostgreSQL (postgresdb)  
**Docker**: Sim  
**Config exposta**: /rest/settings (sem auth)  
**Evidência**: `evidence/F-005-n8n-exposed.txt`

### F-010 — MinIO Console

**Alvo**: https://minio.novadimensaodigital.com.br/  
**Severidade**: Média  
**Permissões**: Login requer credenciais. API S3 bloqueada por firewall.  
**Evidência**: `evidence/F-006-minio-exposed.txt`

### F-011 — Portainer (Nova Dimensão)

**Alvo**: https://portainer.novadimensaodigital.com.br/  
**Severidade**: Alta  
**Versão**: 2.21.5  
**InstanceID**: 0458b3d6-9eb5-408c-b415-9012c87c7479  
**Observação**: Segunda instância do Portainer (mesmo IP 82.112.244.187).

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
- **2026-08-20T18:00:00Z** — Painéis Portainer (2.21.5) e Mautic confirmados acessíveis.
- **2026-08-20T21:00:00Z** — Recon ativo concluído: PostgreSQL/MariaDB expostos, serviço 3000.
- **2026-08-20T21:30:00Z** — Enum profunda: .env exposto (Mautic), WP user disclosure, .git exposure.
- **2026-08-20T22:00:00Z** — Evidências geradas (F-001 a F-004). Sync git.
- **2026-08-20T22:30:00Z** — Descoberta de ecossistema Nova Dimensão Digital:
  n8n (1.109.1), MinIO Console e Portainer (2ª instância) acessíveis.
- **2026-08-20T22:45:00Z** — Evidências F-005 a F-011 geradas. Relatório final.