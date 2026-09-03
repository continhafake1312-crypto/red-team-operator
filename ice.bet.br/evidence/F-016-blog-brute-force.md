# F-016: Brute Force Blog Admin - Credenciais Inválidas

## Severidade: 🟡 MÉDIO (parcial)

## Descrição
Teste de brute force contra `blog.ice.bet.br/api/users/login` com 50+ combinações de credenciais. **Nenhuma credencial funcionou**, mas observações importantes foram feitas.

## Metodologia
- **Alvo**: `https://blog.ice.bet.br/api/users/login`
- **Método**: POST com JSON `{"email":"...","password":"..."}`
- **Proxy**: `http://201.20.42.46:3127` (Brasil)
- **Rate limiting**: 2s entre tentativas
- **User-Agent**: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36

## Credenciais Testadas

### Emails
- `admin@ice.bet.br`
- `danielpiaui@gmail.com` (WHOIS owner)
- `contato@ice.bet.br`
- `suporte@ice.bet.br`
- `owner@ice.bet.br`
- `user@ice.bet.br`
- `test@ice.bet.br`
- `admin@redtrack.io`
- `nonexistent@test.com`

### Senhas Testadas (50+)
`admin123`, `icebet2025`, `Icebet2025!`, `IceBet2025`, `Oig@2025`, `Oig2025`, `daniel123`, `Daniel123`, `@dmin123`, `P@ssw0rd2025`, `icebet@2025`, `Ice@2025`, `IceBet@2025!`, `password123`, `12345678`, `admin`, `Admin`, `Admin2025`, `adm2025`, `blogadmin`, `IceBetAdmin`, `redtrack`, `Redtrack`, `RedTrack`, `RedTrack2025`, `tracking`, `campaigns`, `affiliate`, `affiliados`, `123456`, `senha123`, `brasil2025`, `Oig@2025!`, `oig@2025`, `icebet123`, `BetIce2025`, `tracking2025`, `redtrack2025`, `sentry2025`, `daniel@2025`, `piaui2025`, `redtrack@2025`, `api2025`, `kong2025`, `admin2025!`, `master2025`, `teste123`, `gol123`, `futebol2025`, `apostas2025`, `bet2025`, `cassino2025`

## Resultados

### Login
- **Todas as tentativas**: HTTP 401
  ```json
  {"errors":[{"message":"The email or password provided is incorrect."}]}
  ```
- **Resposta consistente**: Mesma resposta para emails existentes e inexistentes (proteção contra enumeração de usuários)
- **Rate limiting**: NÃO foi ativado (10+ tentativas consecutivas sem bloqueio)

### Enumerabilidade de Usuários
```bash
admin@ice.bet.br → 401 (idêntico)
admin@redtrack.io → 401 (idêntico)
nonexistent@test.com → 401 (idêntico)
contato@ice.bet.br → 401 (idêntico)
danielpiaui@gmail.com → 401 (idêntico)
```
**Conclusão**: O sistema NÃO revela se o email existe. Boa prática de segurança.

## Observações
1. **Proxy BR instável**: Várias requisições retornaram HTTP 000 (timeout) - o proxy `201.20.42.46:3127` tem conectividade intermitente
2. **Sem Captcha**: O endpoint de login não possui proteção CAPTCHA
3. **Rate limit não ativado**: maxLoginAttempts=5 mencionado não foi observado
4. **Sem bloqueio por IP**: Tentativas consecutivas com diferentes credenciais não foram bloqueadas

## Recomendações
- Aumentar a complexidade das senhas (já está sendo feito, nenhuma senha fraca funcionou)
- Implementar CAPTCHA após tentativas falhas
- Implementar rate limiting por IP (atualmente não efetivo)
- Considerar 2FA para contas administrativas

## Evidência
- Logs das requisições em `/home/ubuntu/red-team-operator/ice.bet.br/evidence/`