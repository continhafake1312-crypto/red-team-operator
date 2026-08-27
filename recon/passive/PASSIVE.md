# Recon Passivo - Focus Concursos
## OSINT Consolidado
**Data:** 2026-08-26

---

## Sumário

- [OSINT - Emails](#osint---emails)
- [OSINT - Pessoas](#osint---pessoas)
- [OSINT - Breaches/Vazamentos](#osint---breachesvazamentos)
- [OSINT - GitHub](#osint---github)
- [OSINT - Repositórios/URLs](#osint---repositóriosurls)
- [Cred-Stuffing Candidates](#cred-stuffing-candidates)
- [Recomendações de Próximos Passos](#recomendações-de-próximos-passos)

---

## OSINT - Emails

| Email | Tipo | Breaches |
|-------|------|----------|
| luis@focusconcursos.com.br | CORPORATIVO | 2 breaches (GoNitro, Learnable) ⚠️ |
| anderson@focusconcursos.com.br | CORPORATIVO | Nenhum |
| apps@grupofocus.com.br | CORPORATIVO | Nenhum |
| diegocavalcanti@outlook.com | PESSOAL | 2 breaches (Dubsmash, Stealer Logs) ⚠️ |
| luizguilhermefr@gmail.com | PESSOAL | 10 breaches ⚠️ |
| amahesvaran@gmail.com | PESSOAL | 3 breaches (Appen, GoNitro, Peatix) |

## OSINT - Pessoas

### Sócios/Administradores (CNPJ Público)
- **Rejanete Beatris Schons** - Administrador presente em múltiplos CNPJs do grupo
- **Evaldo Participacoes Ltda** - Holding (sócio)
- **Rbs Participacoes Ltda** - Holding (sócio)
- **Rcas Participacoes Ltda** - Holding (sócio)
- **Rwastrath Participacoes Ltda** - Holding (sócio)
- **Ers Participacoes Ltda** - Holding (sócio)
- **Rbia Participacoes Ltda** - Holding (sócio)
- **Renata Astrath Participacoes Ltda** - Holding (sócio)

### Estrutura Societária
- **Focus Concursos** = Grupo Focus de Educacao LTDA
- CNPJ 14.334.814/0002-58 (Filial - BAIXADA em 2019)
- CNPJ 14.334.814/0003-39 (Matriz Ativa - Barueri/SP)
- CNPJ 14.334.814/0001-77 (Faculdade Focus - Cascavel/PR)
- CNPJ 19.594.970/0001-90 (ZASS E-COMMERCE LTDA-ME - operadora de e-commerce)

## OSINT - Breaches/Vazamentos

### Resumo
- **Total de emails verificados:** 6
- **Emails em breaches:** 4 (66%)
- **Cred-stuffing candidates:** 3 (luis@focusconcursos.com.br, diegocavalcanti@outlook.com, luizguilhermefr@gmail.com)
- **Vazamento específico da Focus:** ❌ NÃO encontrado
- **Dump SQL/banco de dados:** ❌ NÃO encontrado

### Detalhes dos Breaches

#### luis@focusconcursos.com.br **CRED-STUFFING CANDIDATE**
| Breach | Data | Campos Vazados |
|--------|------|----------------|
| GoNitro.com | 2020-08 | name, id, username, **password**, first_name |
| Learnable.com | Desconhecida | name, id, username, **password**, first_name |

#### diegocavalcanti@outlook.com **CRED-STUFFING CANDIDATE**
| Breach | Data | Campos Vazados |
|--------|------|----------------|
| Dubsmash.com | 2018-12 | origin, username, **password**, id |
| Stealer Logs | Desconhecida | origin, username, **password**, id |

#### luizguilhermefr@gmail.com **CRED-STUFFING CANDIDATE**
| Breach | Data | Campos Vazados |
|--------|------|----------------|
| MySpace.com | 2008-07 | **password**, username, name, dob, etc |
| Vakinha.com.br | 2020-06 | **password**, username, name, etc |
| LinkedIn.com | 2012-05 | **password**, username, name, etc |
| Deezer.com | 2019-09 | **password**, username, name, etc |
| Disqus.com | 2012-07 | **password**, username, name, etc |
| Canva.com | 2019-05 | **password**, username, name, etc |
| Twitter (scraping) | 2022-01 | profile data |
| MyHeritage.com | 2017-10 | **password**, username, name, etc |
| Last.fm | 2012-07 | **password**, username, name, etc |
| Legendas.tv | 2017-10 | **password**, username, name, etc |

#### amahesvaran@gmail.com
| Breach | Data | Campos Vazados |
|--------|------|----------------|
| Appen.com | 2020-06 | name, id, username |
| GoNitro.com | 2020-08 | name, id, username |
| Peatix.com | 2018-12 | name, id, username |

### Pastebin Relacionado
- **https://pastebin.com/RgYVaupy** - "escondido" (2018-11-06)
- Conteúdo: Links para materiais de estudo pirateados incluindo cursos FOCUS
- NOTA: Não é vazamento de dados, e sim compilação de links de materiais didáticos

## OSINT - GitHub
- Nenhum repositório GitHub oficial identificado
- Code Search GitHub não disponível sem autenticação
- APK identificado: br.com.focusconcursos (SHA-256: 2345ab41...)
- Nenhum secret/token encontrado em código público

## OSINT - Repositórios/URLs
### Subdomínios ativos
- focusconcursos.com.br (principal - ecommerce)
- lms.focusconcursos.com.br (LMS)
- metodo.focusconcursos.com.br (Método)
- www.focusconcursos.com.br

### Diretórios/Endpoints sensíveis
- /admin - Painel administrativo (funcional, retorna login)
- /login - Área do aluno
- /cadastro - Cadastro
- /robots.txt - Disallow /admin

## Cred-Stuffing Candidates

### Alta Prioridade
1. **luis@focusconcursos.com.br** - Email corporativo com senha exposta em 2 breaches
2. **diegocavalcanti@outlook.com** - Senha exposta em Dubsmash + Stealer Logs
3. **luizguilhermefr@gmail.com** - 10 breaches com senha exposta

### Média Prioridade
4. **amahesvaran@gmail.com** - 3 breaches (sem password explícito mas pode conter hash)

## Recomendações de Próximos Passos
1. **Cred-stuffing** no painel admin (/admin) usando combinações de luis@focusconcursos.com.br com senhas vazadas
2. **Cred-stuffing** no LMS (lms.focusconcursos.com.br)
3. **Força bruta** no /admin (sem rate-limit identificado)
4. **Verificar** se luis@ e anderson@ são contas de administrador do sistema
5. **Buscar** por vazamentos da plataforma de e-commerce (ZASS E-COMMERCE) - pode conter dados de alunos
6. **Verificar** se os sócios (Rejanete Beatris Schons) têm outras empresas ou exposição online