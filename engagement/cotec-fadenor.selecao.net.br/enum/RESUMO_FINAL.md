# RESUMO FINAL - PENTEST COTEC/FADENOR/SELEÇÃO

**Data:** 25/08/2026  
**Alvo Principal:** https://ifes25-semproxy.selecao.net.br (64.31.24.186)  
**Alvos Secundários:**  
- https://anteriores.cotec.fadenor.com.br (143.244.178.136)  
- https://suporte.selecao.net.br  
- https://proxy-auth.selecao.net.br (sem resultados)

**Plataforma:** ProSeleta (Impacta Soluções Web) - PHP/Laravel  
**Servidores:** Apache 2.4.41 (Ubuntu) - site principal; nginx 1.18.0 (Ubuntu) - anteriores

---

## 1. FORGOT PASSWORD / USER ENUMERATION

| Endpoint | Status |
|---|---|
| `/admin/password/reset` | 404 |
| `/admin/esqueci` | 404 |
| `/admin/recuperar` | 404 |
| `/admin/forgot-password` | 404 |
| `/password/reset` | 404 |
| `/password/email` | 404 |
| `/forgot-password` | 404 |
| `/login/esqueci/` | **302** (redirect p/ login) |

**Conclusão:** Nenhum endpoint de forgot password dedicado encontrado. O link "Esqueci minha senha" está no formulário de login mas não redireciona para uma página de reset separada (ou o fluxo é interno via e-mail sem página pública). User enumeration não foi possível.

---

## 2. LARAVEL .env / DEBUG

| Endpoint | Status | Observação |
|---|---|---|
| `/.env` | 404 | Custom Laravel 404 |
| `/.env.backup` | 404 | Custom Laravel 404 |
| `/composer.json` | 404 | Custom Laravel 404 |
| `/storage/logs/laravel.log` | 404 | Custom Laravel 404 |
| `/.git/config` | 404 | Custom Laravel 404 |
| `/admin/login/?APP_DEBUG=true` | **200** | Login page (com debug params) |
| `/admin/login/?__debug__` | **200** | Login page |
| `/_ignition/health-check` | 404 | Custom Laravel 404 |
| `/_ignition/` | 404 | Custom Laravel 404 |
| `/_ignition/execute-solution` | **405** | **Ignition PRESENTE** |

### CRÍTICO: Laravel Ignition Detectado!
- `/_ignition/execute-solution` → **405 Method Not Allowed** (rota existe confirma)
- GET retorna página de erro limpa: "Oops! An Error Occurred" (diferente do 404 do Laravel)
- POST com JSON retorna 404 (formato incorreto ou versão patched)
- **Protótipo:** Sistema Laravel com Ignition (CVE-2021-3129 potencial)
- Testar com diferentes formatos de payload para RCE

---

## 3. ANTERIORES.COTEC.FADENOR.COM.BR

### Info Geral
- **Título:** "Processos anteriores"
- **Framework:** Laravel (sistema ProSeleta/COTEC)
- **Servidor:** nginx 1.18.0 (Ubuntu)
- **IP:** 143.244.178.136

### Endpoints Descobertos
| Endpoint | Status | Notas |
|---|---|---|
| `/` | **200** | Página inicial com listagem de processos |
| `/robots.txt` | **200** | `User-agent: *` / `Disallow:` (vazio) |
| `/index.php` | **200** | Aplicação principal (110KB) |
| `/.htaccess` | **403** | Forbidden |
| `/assets/` | **301** → `/assets/` (403 listing) |
| `/assets/documentos/` | **403** | No directory listing |
| `/atualizacoes` | **200** | Lista de processos com search (`?q=`) |
| `/atualizacoes/928` | **200** | Detalhes do processo (IDOR via ID numérico) |
| `/atualizacoes/928/meus-recursos` | **200** | Formulário CPF + data nascimento (com CSRF) |
| `/build` | **301** → `/build/` |

### SQLi Testes
- **`?q=' OR '1'='1`** → Sem erro SQL (parâmetro escapado com HTML entities)
- **`?q=1' AND SLEEP(5)`** → Tempo 1.3s (vs baseline 1.6s) - **não vulnerável**
- Conclusão: Usa Eloquent ORM com parâmetros seguros

### PDF Access
- PDFs acessíveis publicamente em `/assets/documentos/{id}/`
- Path pattern: `/assets/documentos/{id}/{edital,anexos,publicacoes,resultados}/`
- Sem autenticação necessária para download

### Formulário /meus-recursos
- **CSRF token presente** (`_token`)
- Campos: CPF + data de nascimento
- POST com token expirado → **419 Page Expired**
- Sistema similar a "esqueci senha" (não é forgot password mas expõe dados pessoais)

---

## 4. UPLOADS BYPASS (/uploads/)

### Arquivos conhecidos (todos 403)
- `/uploads/index2.php`
- `/uploads/info.php`
- `/uploads/admin.php`
- `/uploads/phpinfo.php`

### Bypass attempts - TODOS FALHARAM
| Técnica | Resultado |
|---|---|
| X-Forwarded-For: 127.0.0.1 | 403 |
| X-Real-IP: 127.0.0.1 | 403 |
| Both headers | 403 |
| Referer: admin/ | 403 |
| OPTIONS / PUT / POST | 403 |
| Path traversal `./` | 403 |
| Trailing `?` `#` `;` | 403 |
| Null byte `%00` | **404** (diferente!) |
| Case change | 403 (Index2.php) |
| UPPERCASE | **404** (INDEX2.PHP) |
| Double URL encode | **404** |

**Conclusão:** Bloqueio por .htaccess no Apache para extensão `.php` em `/uploads/`. Null byte e case change produzem 404 (arquivo não encontrado), confirmando que o bloqueio é por pattern matching no filename.

---

## 5. ADMIN ROUTES WITHOUT AUTH

### Endpoints Acessíveis Publicamente
| Endpoint | GET | POST | PUT | Accept: JSON |
|---|---|---|---|---|
| `/admin/concursos/` | **200** (JS redirect) | **200** (JS redirect) | **200** | **200** |
| `/admin/concursos` | **200** (JS redirect) | **200** (JS redirect) | **200** | - |
| `/admin/concursos/1` | **200** (JS redirect) | - | - | - |
| `/admin/login` | **200** | 419 (CSRF) | 405 | - |
| `/admin/clientes/` | **302** | 419 (CSRF) | 405 | 403 |
| `/admin/candidatos/` | **302** | 419 (CSRF) | 405 | 403 |
| `/admin/logs/` | **302** | 405 | 405 | 403 |
| `/admin/` | **302** | 405 | 405 | - |

### Observações Importantes
- **419 "Page Expired"** → Laravel CSRF token mismatch (rota existe mas requer CSRF)
- **405 Method Not Allowed** → Rota existe mas método não permitido
- **403 com Accept: JSON** → API routes protegidas
- `/admin/concursos/` retorna **200** mesmo sem auth, mas com JS redirect (proteção fraca)

### API Endpoints
| Endpoint | Status | Response |
|---|---|---|
| `/api/concursos` | **200** | `{"erro":true,"msg":"Chave de acesso inválida!"}` |
| `/api/candidatos` | **200** | `{"erro":true,"msg":"Chave de acesso inválida!"}` |
| `/api/concursos?chave=X` | **200** | Mesmo erro (chave inválida) |
| POST `/api/concursos` | **200** | Mesmo erro |

**API Key não encontrada** - provavelmente fornecida após autenticação.

---

## 6. SUPORTE.SELEÇÃO.NET.BR

- **Título:** "Ambiente Teste Suporte"
- **Mesma plataforma ProSeleta**
- `/robots.txt` → `Disallow: /admin/*, /painel/*, /uploads/*`
- `/admin/login` → 200
- `/admin/concursos` → **200** (mesmo comportamento do principal)
- API endpoints protegidos
- Endereçado como subdomínio de teste/suporte

---

## 7. WAYBACK MACHINE

| Domínio | Resultado |
|---|---|
| `suporte.selecao.net.br` | 3 snapshots (200 OK) |
| `proxy-auth.selecao.net.br` | Nenhum resultado |

---

## 8. RECOMENDAÇÕES / PRÓXIMOS PASSOS

### Prioridade Alta
1. **Ignition CVE-2021-3129** - Testar exaustivamente com diferentes payloads. Rota `/_ignition/execute-solution` confirmada ativa. Tentar formatos de payload de diferentes versões do Ignition.
2. **API Keys** - Buscar chave de API no código fonte JS, HTML, ou em arquivos de configuração expostos.
3. **Session Manipulation** - Testar CSRF tokens reutilizados, session fixation.

### Prioridade Média
4. **IDOR em concursos** - `/admin/concursos/{id}` retorna 200. Verificar diferenças nas respostas para IDs válidos vs inválidos.
5. **Suporte subdomain** - Pode ter configurações mais permissivas que o principal.
6. **Brute force diretórios** - Fazer varredura mais profunda com wordlists maiores.

### Prioridade Baixa
7. **PDF scraping** - Coletar PDFs de `/assets/documentos/` para análise de metadados.
8. **anterior.es** - Testar `/meus-recursos` com CSRF token válido e CPFs válidos para enumeração.