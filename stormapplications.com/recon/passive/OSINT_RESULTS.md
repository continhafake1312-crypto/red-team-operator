# OSINT Results - StormApplications.com
**Data**: 2026-08-23
**Metodologia**: Reconhecimento passivo (OSINT) via GitHub API, ReceitaWS, DuckDuckGo, IntelX, redes sociais, secret scanners.

---

## Sumário

| Categoria | Qtd |
|-----------|-----|
| Emails confirmados | 3 |
| Emails suspeitos | 1 |
| Pessoas identificadas | 3 (+1 não relacionado) |
| Breaches confirmados | 0 |
| Repos GitHub relacionados | 2 (knstormapps) + 1 (horaguti) |
| Secrets reais encontrados | 0 |
| Candidatos cred-stuffing | 3 emails + 2 sócios |

---

## Emails Encontrados

| Email | Fonte | Uso |
|-------|-------|-----|
| contato@stormapplications.com | Termos de Serviço | Canal oficial |
| stormapplicationsltda@outlook.com | Receita Federal (CNPJ) | Cadastro Receita |
| stormappsrecebimentos@gmail.com | GitHub (knstormapps) | Recebimentos/LULA |

**Padrão de naming**: `stormapps{X}`@gmail.com → provável que existam outros.

---

## Pessoas Físicas

### 1. Kauan Vinicius de Alcantara Horaguti
- **Cargo**: Sócio (STORM APPLICATIONS SOLUCOES DIGITAIS LTDA)
- **GitHub**: github.com/horaguti (criado 2024-08-06)
- **Facebook**: facebook.com/kauan.horaguti/
- **Instagram/LinkedIn/Twitter**: Não encontrados publicamente
- **Observação**: Empresa aberta no nome completo dele em 2024-08-19. Data próxima à criação do GitHub `horaguti` (2024-08-06) sugere preparação para startup.

### 2. Guilherme Klein de Andrade
- **Cargo**: Sócio-Administrador (STORM APPLICATIONS SOLUCOES DIGITAIS LTDA)
- **LinkedIn**: br.linkedin.com/in/guilherme-klein-de-andrade-06b78015a
  - Outra empresa: **Jet Beer** (Sócio) — vetor de cred-stuffing adicional
- **Facebook**: facebook.com/guilherme.kleindeandrade.10/
- **GitHub**: Não encontrado
- **Localização**: Novo Mundo (região Niterói/RJ?)

### 3. Yuri Horaguti
- **GitHub**: github.com/yurihoraguti (criado 2020-05-19)
- Provável parente de Kauan Horaguti
- Sem repositórios públicos

---

## GitHub

### Repositórios Relevantes

| Repo | Dono | Conteúdo | Secrets |
|------|------|----------|---------|
| documentacao-wallet | knstormapps | API docs wallet | Placeholder apenas |
| Templates | knstormapps | Domain Connect fork | Nada |
| for-step | horaguti | TypeScript site | Nada |

### Users Relacionados
- **knstormapps** (Perfil oficial da empresa, 2 repos)
- **horaguti** (Kauan Horaguti, 1 repo)
- **yurihoraguti** (Yuri Horaguti, 0 repos)

### Falsos Positivos
- DanielStormApps (EUA, iOS dev) — **NÃO RELACIONADO**
- StormApps (Paquistão) — **NÃO RELACIONADO**
- jooita/StormApplications (Java/Kafka) — **NÃO RELACIONADO**

---

## Breaches

**Nenhum breach confirmado** para os emails encontrados.
- IntelX: Free tier sem acesso a resultados
- Scylla.so: Bot protection
- Leak-Lookup: API key inválida
- HIBP: Sem API key para consulta

**Fatores atenuantes**: Empresa fundada em 2024-08-19 (~2 anos atrás). Baixa exposição temporal.

---

## Cred-Stuffing Candidates

### Emails para Teste em Painéis (mng.stormapplications.com, auth.stormapplications.com, wallet.stormapplications.com)

| Email | Prioridade | Justificativa |
|-------|-----------|---------------|
| contato@stormapplications.com | ALTA | Email oficial, provável admin account |
| stormapplicationsltda@outlook.com | ALTA | Email cadastral Receita, pode ser usado em AWS/Discloud |
| stormappsrecebimentos@gmail.com | MÉDIA | Email específico para recebimentos financeiros |

### Senhas Possíveis para Tester (common patterns)
- Nome empresa + ano: StorM2024, Storm2024, stormapps2024
- Nomes próprios: Kauan2024, Guilherme2024
- Padrão: Senhas fracas de startup brasileira

---

## Infraestrutura Adicional Identificada

- **API endpoints** (wallet.stormapplications.com):
  - /api/v1/account
  - /api/v1/payments/create
  - /api/v1/payments/:id
  - /api/v1/payments
  - /api/v1/withdrawals/create
  - /api/v1/withdrawals/:id
- **Autenticação**: x-api-key header ou Bearer token
- **Webhook**: X-Storm-Event, X-Storm-Signature (HMAC-SHA256)
- **Webhook events**: payment.completed, payment.failed

---

## Recomendações Imediatas

1. **Testar cred-stuffing** em mng.stormapplications.com/api/login com os 3 emails + senhas comuns
2. **Verificar Jet Beer** (LinkedIn de Guilherme) — email nessa empresa pode ser reusado na StorM
3. **Facebook de Kauan Horaguti** — pode conter fotos, datas, locais para engenharia social
4. **Pesquisar em bases pagas**: IntelX PRO, dehashed, leakcheck, breached.co para os 3 emails
5. **Escaneamento de subdomínios ativo**: wallet e mng merecem atenção

---

## Anexos

- `osint_emails.txt`
- `osint_people.txt`
- `osint_breaches.txt`
- `osint_github.txt`