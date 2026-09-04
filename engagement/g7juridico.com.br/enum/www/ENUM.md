# Enumeração - www.g7juridico.com.br

**Data:** 2026-09-04
**Servidor:** Apache/2.4.29 (Ubuntu)
**IP:** 34.75.142.99
**Proxy:** proxychains4 (Tor) — falhou (proxy offline); testes feitos diretamente

---

## 1. Sitemap Analysis

**Total de URLs no sitemap:** **707**

### Categorias principais (amostra):
| Categoria | Qtd |
|-----------|-----|
| Cursos individuais (Intensivo I/II, Disciplinas, Legislação, etc.) | ~350+ |
| Combos (Combo I a XVII, por ano) | ~200+ |
| Professores (páginas de docentes) | ~50+ |
| Carreiras (Magistratura, MP, Delegado, Analista, Defensoria, AGU, Cartórios) | ~100+ |
| Retas finais / ENEM / ENAC | ~15 |
| Páginas sistema (login-cadastro, cursos, noticias, contato) | 5 |

### URLs notáveis no sitemap:
- `/login-cadastro-migracao`
- `/teste-evernet-curso-video-degustacao` (testes expostos)
- `/quarentena-g7-degustacao-g7`
- `/curso-teste-cartao` (múltiplas entradas)
- `/curso-teste-pos-area-do-aluno`
- `/teste-everenet---nao-deletar`

---

## 2. JS Analysis

### JS URLs encontradas (10):
```
//code.jquery.com/jquery-migrate-1.2.1.min.js
https://d335luupugsy2.cloudfront.net/js/loader-scripts/b2073e1b-fa12-42cf-8a96-97de2d518800-loader.js
https://www.g7juridico.com.br/js_css/bootstrap.min.js
https://www.g7juridico.com.br/js_css/jquery-3.3.1.min.js
https://www.g7juridico.com.br/js_css/jquery-ui.min.js
https://www.g7juridico.com.br/js_css/jquery.mask.min.js
https://www.g7juridico.com.br/js_css/modernizr-custom.js
https://www.g7juridico.com.br/js_css/script_home.js
js_css/clamp.js
slick/slick.min.js
```

### Endpoints encontrados no JS:
- `/noticias`
- `/noticias/filtro/`
- `/` (root)
- `//code.jquery.com/...` (CDN)

### Secrets/Keys no JS:
- **Nenhum segredo crítico** (tokens JWT, API keys, Firebase, AWS, GitHub)
- Falsos positivos: referências a `password` em código jQuery, `sk-*` são variables CSS (`sk-clearifnotmatch`, `sk-keycode`, etc.)
- Google Analytics: `AW-797375100`
- Google Tag Manager: `GTM-KNR5RQK`

---

## 3. Content Discovery (ffuf - common.txt, fs 24736)

| Path | Status | Size | Notas |
|------|--------|------|-------|
| `/arquivos` | **301** | 357 | Redirect (diretório) |
| `/contato` | **200** | 35.806 | Página de contato funcional |
| `/cron` | **301** | 349 | Redirect - **provável cron job exposto** |
| `/imagens` | **301** | 355 | Diretório de imagens |
| `/information` | **200** | 46 | "Erro ao processar" (endpoint POST esperando dados) |
| `/index.php` | **200** | 87.328 | Homepage |
| `/login` | **200** | 28.255 | Página de login (alias?) |
| `/noticias` | **200** | 34.901 | Blog/notícias |
| `/robots.txt` | **200** | 72 | `Allow: /` + Sitemap |
| `/select` | **200** | 46 | "Erro ao processar" (endpoint POST) |
| `/selection` | **200** | 46 | "Erro ao processar" (endpoint POST) |
| `/server-status` | **403** | 287 | Apache status (protegido) |
| `/sitemap.xml` | **200** | 68.618 | Sitemap completo |

### Observação:
- Todos os paths inexistentes retornam **200** com ~24.736 bytes (custom 404 page)
- O filtro `-fs 24736` foi usado para ignorar páginas 404 customizadas

---

## 4. Login/Cadastro Analysis

### Formulário de Login
```
POST /cadastro_incompleto.php   (action do form)
Method: POST
Autocomplete: off
Campos:
  - ref (hidden)
  - Codigo (hidden)
  - Pos (hidden)
  - acao = "login" (hidden)
  - Email (text, maxlength=255)
  - senha (password, maxlength=100)
  - dica_cpf (text, CPF recovery field)
```

### Formulário de Cadastro
```
POST /pagamento                (action do form)
Campos:
  - ref (hidden)
  - (demais campos de cadastro não extraídos)
```

### Respostas:
- `POST /login-cadastro` (empty body) → **200**
- `POST /login-cadastro` (email+senha) → **200** (não valida credenciais without proper session)
- `POST /cadastro_incompleto.php` → **302** (redirect, provável redirecionamento após submit)
- `GET /pagamento` → **404**

### Recursos de segurança ausentes:
- **Nenhum CSRF token visível**
- **Nenhum captcha visível**
- Campo `dica_cpf` permite "recuperação" de senha por CPF (enumeration vector)
- `Codigo` hidden field pode ser ID de usuário enumerável

---

## 5. Área do Aluno

### Comportamento:
- **`/area-do-aluno/`** → **302** → `/area-do-aluno/perfil`
- Redireciona sem autenticação (mostra página de login)
- Headers anti-cache: `no-store, no-cache, must-revalidate`
- `noindex, nofollow, noarchive, nosnippet` nos metadados
- Base URL: `https://www.g7juridico.com.br/area-do-aluno/`

### Subpaths descobertos:
| Path | Status |
|------|--------|
| `/area-do-aluno/perfil` | **302** (redireciona para login) |
| `/area-do-aluno/login` | **404** |
| `/area-do-aluno/cursos` | **404** |
| `/area-do-aluno/pedidos` | **404** |
| `/area-do-aluno/minha-conta` | **404** |
| `/area-do-aluno/admin` | **404** |
| `/area-do-aluno/dashboard` | **404** |
| `/area-do-aluno/painel` | **404** |
| `/area-do-aluno/config` | **404** |
| `/area-do-aluno/api` | **404** |
| `/area-do-aluno/sistema` | **404** |
| `/area-do-aluno/suporte` | **404** |

**Conclusão:** Requer autenticação via cookie/sessão. Nenhum bypass direto encontrado.

---

## 6. Config Files

| Path | Status | Size | Notas |
|------|--------|------|-------|
| `/.env` | **404** | 87.323 | Não exposto |
| `/.git/config` | **404** | 87.329 | Não exposto |
| `/config.php` | **404** | 87.329 | Não exposto |
| `/info.php` | **404** | 87.323 | Não exposto |
| `/phpinfo.php` | **404** | 87.329 | Não exposto |
| `/test.php` | **404** | 87.329 | Não exposto |
| `/admin` | **404** | 24.736 | Não exposto |
| `/administrator` | **404** | 24.736 | Não exposto |
| `/backend` | **404** | 24.736 | Não exposto |
| `/cms` | **404** | 24.736 | Não exposto |
| `/manager` | **404** | 24.736 | Não exposto |
| `/dashboard` | **404** | 24.736 | Não exposto |
| `/api/v1` | **404** | 24.736 | Não exposto |
| `/api/v2` | **404** | 24.736 | Não exposto |
| `/swagger` | **404** | 24.736 | Não exposto |
| `/openapi.json` | **404** | 87.299 | Não exposto |
| `/status` | **404** | 24.736 | Não exposto |
| `/health` | **404** | 24.736 | Não exposto |

**Conclusão:** Nenhum config file exposto. Todos retornam custom 404.

---

## 7. Homologação vs Produção

**Homologação inacessível** (`homologacao.g7juridico.com.br` → DNS resolve? → timeout/000).
- Possível: DNS apontando para mesmo IP (34.75.142.99) mas sem resposta HTTP
- Recomendação: testar via hosts file ou verificar se o virtual host está ativo

---

## 8. Parameter Fuzzing

**Resultado:** Nenhum parâmetro diferencial encontrado.
- Todos os parâmetros retornam 200 com ~87.329 bytes (mesmo tamanho do custom 404)
- O site ignora parâmetros GET desconhecidos
- Parâmetros conhecidos já descobertos: `?b=` (busca), `?p={ID}`, `?post_type=course`, `?ref=`, `?Codigo=`, `?Pos=`, `?acao=`, `?Email=`, `?senha=`, `?dica_cpf=`

---

## 9. Recomendações para Ataque Webapp

### Crítico / Alta Prioridade:
1. **`/cron` exposto (301) + `/arquivos` (301)** — investigar diretórios listáveis
2. **`/information`, `/select`, `/selection`** — endpoints que processam POST e retornam "Erro ao processar". Provar com diferentes parâmetros, Content-Type, method verbs (SQLi / LFI / IDOR)
3. **`/cadastro_incompleto.php`** — retorna 302, provável processador de formulário sem CSRF. Testar CSRF, SQLi, parameter pollution
4. **Hidden field `Codigo`** — possível IDOR se for ID de usuário/produto

### Média Prioridade:
5. **Login brute-force** — sem captcha, sem rate limiting aparente
6. **CPF enumeration via `dica_cpf`** — provável recovery de senha por CPF
7. **Área do aluno** — apesar de redirecionar, testar injeção de cookie/sessão, token fixation
8. **Sitemap expõe URLs de teste** — `teste-evernet-curso-video-degustacao`, `teste-everenet---nao-deletar`, `curso-teste-cartao` — podem ter permissões fracas
9. **Server-status (403)** — testar bypass via X-Forwarded-For, Host header manipulation

### Baixa Prioridade:
10. **WAF detection** — sem WAF aparente
11. **Google Analytics/Tag Manager** — GTAG `AW-797375100`, GTM `GTM-KNR5RQK`
12. **Homologação** — adicionar ao /etc/hosts para tentar acessar virtual host

---

## Arquivos gerados:
```
sitemap.xml / sitemap_urls.txt
js_urls.txt / js_endpoints.txt / js_secrets.txt
login_page.html
area_aluno_response.txt / area_aluno_paths.txt
content_disc.json
params.json
config_files.txt (produção + homolog)
robots.txt
ENUM.md
```