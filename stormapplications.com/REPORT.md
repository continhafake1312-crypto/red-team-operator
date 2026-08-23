# Relatório de Pentest — stormapplications.com

## Metadados

| Campo | Valor |
|-------|-------|
| Alvo | `stormapplications.com` |
| URL | `https://www.stormapplications.com/` |
| Tipo | Black-box Web/API Externo |
| Início | `2026-08-23T00:00:00Z` |
| Status | **Em andamento** |

## Sumário Executivo

Engagement em andamento. Subdomínio `mng.stormapplications.com` (painel admin) foi priorizado e exaustivamente enumerado. Foram identificados 4 findings, incluindo CORS misconfiguration com headers sensíveis expostos (Alta) e bypass de autenticação 403 via headers customizados (Alta). O acesso administrativo não foi obtido — a autenticação é via Discord OAuth e requer um token de sessão válido.

## Tabela de Findings

| ID | Severidade | Host | Tipo | Status |
|----|-----------|------|------|--------|
| F-001 | Alta | mng.stormapplications.com | CORS Misconfiguration | Aberto |
| F-002 | Alta | mng.stormapplications.com | Auth Bypass | Aberto |
| F-003 | Média | mng.stormapplications.com | Info Disclosure | Aberto |
| F-004 | Info | mng.stormapplications.com | Fingerprinting | Aberto |

## Acessos Obtidos

*Nenhum acesso obtido.*

## Objetivos de Alto Valor — Progresso

| Objetivo | Status |
|----------|--------|
| Acesso interno (foothold) | ❌ Não alcançado |
| Acesso administrativo (admin/RCE) | ❌ Não alcançado |
| Acesso financeiro | ❌ Não alcançado |
| Acesso a dados/PII | ❌ Não alcançado |

## Attack Surface Consolidada

### mng.stormapplications.com (Painel Admin)
- **IP**: 172.67.150.146, 104.21.39.240 (Cloudflare)
- **Backend**: AWS eu-central-1 (Caddy → discloud.com)
- **Insâncias**: i-0a06f4c3917127575, i-028e90aad8ec2bb5f
- **Autenticação**: Discord OAuth
- **Endpoint acessível**: `/api/login` (com bypass header), `/.well-known/http-opportunistic`
- **Blob Storage**: `blob.stormapplications.com` (GET público, POST/PUT auth required)
- **CORS**: `Access-Control-Allow-Origin: *` com headers internos expostos

### Subdomínios Relacionados
- `auth.stormapplications.com` → 302 para mng/api/login
- `api-beta.stormapplications.com` → Versão beta (mesmo backend, página diferente)
- `manager.stormapplications.com` → 301 para mng
- `blob.stormapplications.com` → CDN de assets

## Cronologia

Ver `timeline.log`.

## Evidências

- `evidence/F-001.md` — CORS Misconfiguration
- `evidence/F-002.md` — 403 Auth Bypass via Custom Headers
- `evidence/F-003.md` — AWS Internal Infrastructure Disclosure
- `evidence/F-004.md` — Backend Platform Fingerprinting