# enum/ENUM.md — Fase 5: Enumeração Profunda

**Alvo:** wcursos.com.br (Sistema Tutor / plataforma EAD — módulo e-commerce `com.rlg.ecommerce`)
**Hosts enumerados:** `www.wcursos.com.br` (PROD) · `wcursos.sistematutor.com.br` (TESTE) · `www.wcursosead.com.br` (WEAD)
**Stack confirmada (correção do recon):** **Apache Tomcat 9.0.120 + Spring MVC** (NÃO Struts) + e-commerce module `com.rlg.ecommerce` (vendor "RLG"). Springfox Swagger 2.0 exposto.
**Catch-all soft-404:** md5 `c1036fc02029d96d3f4cc49f8a9768eb` (12200B) em PROD; 404 761B (md5 `aff51085…`) em TESTE; 404 762B (md5 `480fe633…`) em WEAD.
**WAF:** AWS WAF ativo (403 em payloads; rate-limit intermitente após ~4500 reqs). Tor + proxychains em todos os requests.
**Data:** 2026-08-27 (enum phase concluída)

---

## 1. Endpoints /portal/* — mapa completo (136 endpoints, 62 NOVOS)

Fonte: 16 JS bundles em `/resources/template-portal3/js/1_445/*.js` (build `1_445`). Lista consolidada em `js_all/all_portal_endpoints.txt` + `js_all/js_endpoints.txt`.

**62 endpoints novos (não estavam nos 74 do recon):** `RecebeImagem, addMessage, anularAvaliacao, aviso-detalhe, boleto-download, chat, chat-server, contrato-cancelamento, contrato-print, contratoPadrao, diagrama, documento, documento-aluno-download, documento-marcado, documento-online-key, documentoAlunoAvaliacao, documentoAlunoDuvida, documentoAlunoRequerimento, documentoProfessorAvaliacao, documentoProfessorDuvida, documentoRespostaRequerimento, dowloadArquivoTemp, ebook-ai-download, enviar-senha, esqueci-a-senha, getAgenda, getEbookAI, getItemPedido, getProdutos, getURLIntegracao, getValorProduto, leitor, loginFacebook, loginGoogle, media, multiplo-login, ping-test, professorai-lista, professorai-pergunta, ranking, readMessage, realizarAvaliacao, rotacionarImagemAvaliacao, salvarAvaliacao, salvarAvaliacao2, salvarDuvidaVideo, salvarPedido, sendMultimediaLogSimples, setTestSimuladoFinalizar, setTestSimuladoOpcao, test-cartao-resposta, test-comentario-video, test-gabarito, test-result, test-simulado-estatistica, trascricao-download, updatePhoto, validar-codigo, validar-login, validar-login-juspodium` (lista completa em `js_endpoints.txt`).

**Comportamento unauth:** TODOS `/portal/*` (exceto os 4 da fluxo de senha) retornam **302 → /portal/login** — mesmo em TESTE (auth gating idêntico ao PROD). Nenhum endpoint `/portal/*` vaza dados sem sessão.

### 1.1 Unauth (sem sessão) — 4 páginas do fluxo de senha + health:
- `POST /portal/checkOnline` → 200 vazio (health-check, retorna JSON só com aviso ativo)
- `/portal/esqueci-a-senha` (form) → POST `/portal/enviar-senha` com `method=login, tipo=<1-4>, email, cpf|dataNascimento`
- `/portal/validar-codigo` → formulário de login (valida código de resete)
- `/portal/validar-login-juspodium` → mesmo form de login (apenas branded diferente; SSO Juspodium não é path de auth separado)

---

## 2. APIs / Documentação

### Springfox Swagger UI — EXPOSTO nos 3 hosts
- `GET /swagger-ui.html` → 200 (2927B, md5 `dba6f561…`) — Springfox Swagger UI 2.0
- `GET /swagger-resources` → 200 `[{"name":"default","location":"/v2/api-docs","swaggerVersion":"2.0"}]`
- `GET /v2/api-docs` → 200 spec **VAZIA** (só bloco info + basePath "/"; NENHUM path/definition) — Springfox registrado mas nenhum controller anotado com `@Api`. Confirma framework Spring + versão Springfox.
- `v3/api-docs`, `openapi.json` → não habilitados.
- **Não há** /v3/api-docs, /openapi.json populado, /graphql, /api-docs funcional.

### Spring Boot Actuator — NÃO PRESENTE
- Confirmado em todos os hosts: `/actuator/*` → catch-all (PROD) / 404 (TESTE, WEAD). **Não é Spring Boot** — é Spring MVC puro sobre Tomcat standalone. Ver `actuator.txt`.

---

## 3. Findings (com evidência em evidence/F-00X.txt)

### F-001 — Information Disclosure: Stack Traces (MEDIUM) — ver `evidence/F-001-…`
- **`GET /multimedia` → 500** em TODOS os hosts (incl. PRODUÇÃO), vaza:
  - Apache Tomcat **9.0.120**, Spring MVC, `com.rlg.ecommerce.controller.VirtualDirectoryServlet` (linha 79, bug `String.substring(-1)`), `com.rlg.ecommerce.filter.CheckConnectionFilter`.
- **WEAD-only:** `GET /portal/enviar-senha|validar-codigo|validar-login-juspodium` → 500 vazam stack trace (NPE em Spring DispatcherServlet). PROD/TESTE retornam forms limpos.
- **Impacto:** confirma stack para CVE targeting (Tomcat 9.0.x + Spring, **NÃO Struts**). Class names internos auxiliam exploit crafting.

### F-002 — User Enumeration + Password-Reset Abuse (MEDIUM) — ver `evidence/F-002-…`
- **`POST /portal/enviar-senha`** — **SEM reCAPTCHA** (ao contrário de `/portal/validar-login`):
  - `tipo=1,2,3` → lookup por **email + cpf** → msg "Não conseguimos encontrar nenhum aluno…" (conta inexistente). Conta existente → mensagem **diferente** ⇒ **oracle de user enumeration**.
  - `tipo=4` → lookup por **email + `dataNascimento`** (DATA DE NASCIMENTO) — **parâmetro oculto `dataNascimento`** (formatos `dd/mm/yyyy` ou `yyyy-mm-dd`). Reset por email+data de nascimento, sem CPF.
  - `tipo=0,5,9,99` → inválido.
  - Sem reflection de input (sem XSS refletido aqui).
- **Próximos passos webapp:** sondar com emails OSINT (`contato@wcursos.com.br`, etc.) p/ confirmar oracle e msg de sucesso; avaliar rate-limit; testar `tipo=4` com data de nascimento obtida via OSINT.

---

## 4. Candidatos a vuln (para webapp) — URLs/parâmetros específicos

### 4.1 Auth bypass / cred-stuffing (prioridade 1)
- `POST /portal/validar-login` (reCAPTCHA v3, sitekey `6Lf9XikaAAAAAIwrj6kpicX6mQhvC6MpkRpJOqC-`) — params: `method=login, login=<email|CPF>, senha, manterConectado, g-recaptcha-response`. 2Captcha necessário.
- `GET /portal/loginFacebook?accessToken=&userID=` e `GET /portal/loginGoogle?idTokenString=&googleClientID=` — OAuth alternativos (FB appId / Google client_id vazios no JS = server-configured; testar tokens forjados).

### 4.2 Upload / LFI / Path Traversal (prioridade 2 — alto payoff, params mapeados via JS)
Fluxo de upload (auth-gated, mas params = alto risco quando autenticado):
- `POST /portal/RecebeArquivo` (multipart): `file` (nomeado `{idUser}.{ext}`), `diretorio=<diretório controlável>`, `delete=<bool>` → **path traversal no `diretorio`** + **upload de extensão arbitrária** (possível webshell se cair em webroot).
- `POST /portal/RecebeImagem` (variante imagem).
- `POST /portal/deleteFile` : `directory, nameFile` → **deleção arbitrária de arquivos** por dir+name.
- `GET /portal/dowloadArquivoTemp?directory=&nameFile=` (typo "dowload") → **leitura arbitrária de arquivos (LFI/path traversal)**.
- `POST /portal/verificaArquivoProfessor`: `directory, nameFile, idUser`.
- `GET /portal/documento-marcado?tipo=&idDocumento=&token=` e `GET /portal/documento-online-key?idDocumento=&tipo=&token=` — acesso a documento por token+id (IDOR + chave).

### 4.3 IDOR / BOLA (prioridade 3 — requer sessão; IDs inteiros previsíveis)
- `GET /portal/getDocumentoAluno?id=`, `getBlocoNota?id=`, `getContentTopic?id=`
- `GET /portal/getContratoPadrao?idAlunoMensalidade=`, `getDeclaracoes?idAlunoMensalidade=&situacaoContrato=`
- `GET /portal/getAlunos?idCurso=&idAvaliacao=&idDisciplina=` (lista alunos), `getCupons?idProfessor=`
- `GET /portal/getItemPedido?idPedido=`, `getValorProduto?idProduto=`, `getProdutos?tipoProduto=`
- `GET /portal/getDisciplina?idCurso=`, `getProfessor?idCurso=&idDisciplina=`

### 4.4 Token-based (menos previsível, mas testar enum)
- `GET /portal/media?token=`, `getEbookAI?token=`, `getURLIntegracao?token=` (SSRF/open-redirect: retorna URL aberta em nova aba), `getTopico?token=`, `getTranscricao?token=`, `getTempoVideo?chave=&token=`, `arquivarAvaliacaoBaseQuestao?token=`
- `POST /portal/getDiagrams` (`tokenTopico`), `GET /portal/diagrama/{token}` e `/portal/diagrama/{tokenTopico}/{token}`
- `GET /portal/chat?idChatMultimedia=&tokenAluno=&tokenProfessor=` + `POST /portal/addMessage` (`idChatMultimedia, mensagem, tokenAluno, tokenProfessor`) + `GET /portal/readMessage` (mesmos params)

### 4.5 WebSocket (auth-gated, mas rota não-HTTP)
- `WSS /portal/chat-server?sala={tokenAluno}-{tokenProfessor}` — handshake retorna 302→login (auth gate via HTTP upgrade). Após auth, possível bypass de WAF em mensagens (avaliar no webapp com sessão).

### 4.6 E-commerce (módulo `com.rlg.ecommerce`, separado do /portal)
- `GET /login` (store) → `POST /pagamento` com `email+senha` (login) ou `email2+cpf` (cadastro) — **com reCAPTCHA** (segundo auth surface).
- `GET /produto` e `/produto/{id}` → 200 (40445B, mesma resposta — testar IDOR em `/produto/{id}`).
- `GET /multimedia` (VirtualDirectoryServlet) — 500 unauth; mapeado a `/multimedia/*`. O bug `substring(-1)` em `VirtualDirectoryServlet:79` sugere parsing de path — investigar input handling.
- `GET /noticias`, `/pagamento`, `/pdf` (302) — e-commerce.

### 4.7 Assessment / test (auth-gated)
- `POST /portal/setTestSimuladoOpcao` (`token, idAvaliacao, idQuestao, idAlternativa`), `setTestSimuladoFinalizar`, `setTestAgendamento`, `realizarAvaliacao`, `anularAvaliacao`, `salvarAvaliacao`, `salvarAvaliacao2`, `test-cartao-resposta`, `test-gabarito`, `test-result`, `test-simulado-estatistica`, `test-comentario-video` — manipulação de notas/simulados.

### 4.8 AI professor (auth-gated)
- `POST /portal/professorai-lista` (`tokenProduto`), `POST /portal/professorai-pergunta` — feature AI server-side (sem chave no client); testar IDOR em `tokenProduto`.

---

## 5. JS analysis — resumo
- 16 bundles em `/resources/template-portal3/js/1_445/` baixados (ver `js_all/`). Tamanhos: portal.js 148K, epub.js 412K, documents.js 108K, avaliacao.js 60K, chat-professor-ai.js 36K, video.js 23K, content.js 11K, chat.js 16K, demais pequenos.
- `customizado.js` vazio (0B); `comum.js` 118B (placeholder).
- **NENHUM segredo/chave hardcoded** (ver `js_all/js_keys.txt`). FB appId e Google client_id vazios (server-side). reCAPTCHA v3 sitekey público. AI feature server-side.
- Externais: `ebooks.hexag.online/embed/`, `ui-avatars.com/api/`, vdocipher, sambatech, plyr.
- Padrões de path: `/fotoaluno/foto{token}.jpg` (avatar), `/imagemsite/{tenantId}/{filename}` (ex: `/imagemsite/2414/disney-pixar.jpg` — tenant TESTE id=2414; directory listing off).

---

## 6. Diferenças entre hosts (ver `host_compare.txt`)

| Aspecto | PROD (www) | TESTE (sistematutor) | WEAD (wcursosead) |
|---|---|---|---|
| Catch-all | 12200B soft-404 | 404 761B | 404 762B |
| `/portal/login` | 200 form | 200 form | **500 ERROR (quebrado)** |
| `/portal/*` 500s | forms limpos | forms limpos | **stack traces (NPE)** |
| `/multimedia` | 500 stack trace | 500 stack trace | 500 stack trace |
| Template CSS | styles3.css v1.21.311 | styles4.css v1.21.169 (**build mais antigo**) | styles12.css v3.9.662 (loja) |
| Asset version | v=1.311 | v=1.169 (antigo) | (loja) |
| Branding | "WCursos" | "PARA TESTES - SUPORTE EAD" | "Loja Virtual - WEAD" |
| Swagger UI | exposto | exposto | exposto |
| Actuator | não | não | não |

**Diferenças-chave:**
1. **WEAD misconfigurado** — `/portal/login` quebrado (500), portal 500s vazam stack trace. WEAD = tenant incompleto/quebrado, mas útil p/ info disclosure.
2. **PROD vaza stack trace só via `/multimedia`** (e-commerce servlet); portal PROD tem erros limpos.
3. **TESTE roda build mais antigo** (styles4.css, v=1.169) — possivelmente Spring/Tomcat mais antigo que PROD (v=1.311). Dados sintéticos ("PARA TESTES").
4. Mesma superfície de endpoints (136) e mesmo auth gate nos 3 hosts.
5. Fluxo de reset `/portal/enviar-senha` (sem reCAPTCHA, oracle de enum, `tipo=4`+`dataNascimento`) acessível em PROD/TESTE (forms limpos) — WEAD quebra. **Abusar via PROD/TESTE.**

---

## 7. Artefatos produzidos
```
enum/
├── ENUM.md (este)
├── host_compare.txt
├── js_all/
│   ├── all_portal_endpoints.txt   (136 endpoints)
│   ├── js_endpoints.txt            (mapeamento endpoints+params)
│   ├── js_keys.txt                 (scan de segredos — nenhum)
│   ├── api_docs.json               (Swagger findings)
│   ├── api_docs_www.json|_teste.json|_wead.json
│   └── *.js                        (16 bundles baixados)
├── www.wcursos.com.br/
│   ├── content_discovery.txt|content_discovery.json
│   ├── actuator.txt
│   └── swagger_v2_apidocs.json
├── wcursos.sistematutor.com.br/
│   ├── content_discovery.txt|content_discovery.json|content_discovery_full.json
│   ├── actuator.txt
│   └── params.txt
└── wcursosead.com.br/
    ├── content_discovery.txt|content_discovery.json
    ├── actuator.txt
    ├── wead_validar_login_500.html
    ├── wead_enviar_senha_500.html
    ├── wead_validar_codigo_500.html
    └── wead_juspodium_500.html
evidence/
├── F-001-wead-stacktrace-info-disclosure.txt
└── F-002-enviar-senha-user-enum.txt
```

---

## 8. Próximos passos (handoff → webapp)

1. **Auth bypass `/portal/validar-login`** (2Captcha p/ reCAPTCHA v3) — ponto único de entrada; libera todos os IDOR/upload. Testar CPFs default/numerados + OSINT emails.
2. **`POST /portal/enviar-senha`** (sem captcha): confirmar **user enumeration oracle** com emails OSINT (`contato@wcursos.com.br`, `julianoduarteprojetista@gmail.com`, `daniugf@uol.com.br`); testar `tipo=4` + `dataNascimento` (birth-date via OSINT) → password reset/ATO.
3. **Upload / LFI** (após sessão): `RecebeArquivo` (path traversal em `diretorio`, extensão arbitrária), `dowloadArquivoTemp` (LFI), `deleteFile` (deleção arbitrária).
4. **IDOR/BOLA** (após sessão): enumerar `getDocumentoAluno?id=`, `getContratoPadrao?idAlunoMensalidade=`, `getAlunos`, `getDeclaracoes`, `getItemPedido?idPedido=`, `media?token=`, `getURLIntegracao?token=` (SSRF/redirect).
5. **OAuth forjado**: `/portal/loginFacebook` e `/loginGoogle` com tokens sintéticos — validar se backend confia no token sem verificação.
6. **`/multimedia`** (e-commerce, unauth): explorar `VirtualDirectoryServlet` (bug substring) — fuzz path/params p/ encontrar input que não crasha (potencial leak/IDOR de mídia).
7. **`/produto/{id}`**: testar IDOR em produto.
8. **CVE phase:** Tomcat 9.0.120 + Spring MVC (NÃO Struts). Mapear CVEs Tomcat 9.0.x + Spring (Spring4Shell requer Spring ≤5.3.17 — verificar versão via behavior).

*Fase 5 (enum) concluída por especialista enum em 2026-08-27.*
