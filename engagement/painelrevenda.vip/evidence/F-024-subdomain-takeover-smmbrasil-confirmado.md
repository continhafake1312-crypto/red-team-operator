# F-005 Subdomain Takeover — painelrevenda.vip.smmbrasil.net

**Alvo:** painelrevenda.vip (186.194.52.218) / smmbrasil.net
**Severidade:** Alta
**Timestamp:** 2026-09-03T06:34:00Z

## Descoberta

O domínio `smmbrasil.net` expirou e foi capturado pelo DropCatch em **2026-09-01** (2 dias atrás). O antigo CNAME `painelrevenda.vip.smmbrasil.net` que era usado para um serviço (provavelmente SMM/revenda) ainda está ativo no DNS.

## Reprodução

```bash
# CNAME ainda ativo
$ dig +short CNAME painelrevenda.vip.smmbrasil.net
urlforward-https.namebright.com.

$ dig +short A painelrevenda.vip.smmbrasil.net
44.208.83.180
54.84.240.235

# smmbrasil.net WHOIS
Domain Name: SMMBRASIL.NET
Creation Date: 2026-09-01T18:25:31Z
Registry Expiry Date: 2027-09-01T18:25:31Z
Registrar: DropCatch.com 1350 LLC
Name Server: NS1.NAMEBRIGHTDNS.COM
Name Server: NS2.NAMEBRIGHTDNS.COM

# HTTP request ao subdomínio
$ curl -sI "http://painelrevenda.vip.smmbrasil.net"
HTTP/1.1 301 Moved Permanently
Location: https://www.DropCatch.com/domain/smmbrasil.net

# smmbrasil.net SOA (atualizado hoje!)
$ dig +short SOA smmbrasil.net
ns1.namebrightdns.com. dns.namebright.com. 2026090301 28800 5000 1209600 10800
```

## Fluxo da Takeover

```
ANTES (domínio ativo do cliente):
  painelrevenda.vip.smmbrasil.net → [serviço SMM/revenda legítimo]

AGORA (domínio expirado, capturado):
  painelrevenda.vip.smmbrasil.net → CNAME → urlforward-https.namebright.com
                                   → DNS: NameBright (DropCatch)
                                   → HTTP: Redireciona para DropCatch.com
```

## Impacto

- **O CNAME ainda existe** no DNS público
- **O domínio smmbrasil.net** está sob controle do DropCatch (pode ser adquirido em leilão)
- **Quem comprar smmbrasil.net** pode criar um registro A/TXT para `painelrevenda.vip.smmbrasil.net` e assumir o subdomínio
- Tráfego destinado ao antigo serviço pode ser interceptado (ataque man-in-the-middle)
- Potencial para roubo de sessão, credenciais, ou malware distribution

**Risco aumentado** porque:
- `painelrevenda.vip` hospeda painel de revenda (provavelmente admin/clientes)
- Usuários podem ter o subdomínio salvo em favoritos/configurações

## Recomendação

1. **IMEDIATO**: Remover o CNAME `painelrevenda.vip.smmbrasil.net` do DNS da painelrevenda.vip
2. Registrar smmbrasil.net novamente se o domínio ainda for necessário
3. Revisar todos os registros DNS que apontam para domínios de terceiros
4. Implementar monitoramento de expiração de domínios

## Próximo passo

Verificar se há outros subdomínios de `painelrevenda.vip` apontando para domínios terceiros/expirados:
- `dig +trace painelrevenda.vip ANY`
- Verificar registros CNAME, NS, MX