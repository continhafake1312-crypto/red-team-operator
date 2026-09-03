# F-003 Plesk Obsidian 18.0.78 — API Discovery

**Severidade:** Alta (Painel de controle exposto)
**Alvo:** elite-iptv.com:8443, 79.137.20.193:8880
**Data:** 2026-09-03

## Descrição
Plesk Obsidian 18.0.78 encontrado no servidor de origem (79.137.20.193). 
A API RESTful completa (32 endpoints) foi mapeada via Swagger/OpenAPI spec.

## Detalhes
- **Versão:** Plesk Obsidian 18.0.78 (build 1800260722.05)
- **Portas:** 8880 (HTTP), 8443 (HTTPS)
- **Dominio:** elite-iptv.com, panel.elite-iptv.com
- **Servidor:** 79.137.20.193 (EVEO S.A. - AS53107)

## API Endpoints (32)
```
POST   /auth/keys              - Generate API secret key
DELETE /auth/keys/{key}        - Delete API key
GET    /cli/commands            - List CLI commands
POST   /cli/{id}/call          - Execute CLI command
GET    /clients                 - List clients
POST   /clients                - Create client
GET    /clients/{id}           - Get client details
PUT    /clients/{id}           - Update client
DELETE /clients/{id}           - Delete client
PUT    /clients/{id}/activate  - Activate client
PUT    /clients/{id}/suspend   - Suspend client
GET    /domains                - List domains
POST   /domains                - Create domain
GET    /domains/{id}           - Get domain details
PUT    /domains/{id}           - Update domain
DELETE /domains/{id}           - Delete domain
GET    /extensions             - List extensions
POST   /extensions             - Install extension
GET    /server                 - Server info
POST   /server/license         - Install license
GET    /databases              - List databases
GET    /ftpusers               - List FTP users
... e mais 12 endpoints
```

## Impacto
Painel de controle de hospedagem exposto na internet. Se credenciais 
forem obtidas, permite:
- Gerenciar todos os sites/domínios no servidor
- Acessar clientes e resellers
- Executar comandos CLI
- Modificar DNS, bancos de dados, FTP
- Instalar extensões

## Recomendação
- Restringir acesso ao Plesk por IP (firewall)
- Implementar 2FA
- Usar HTTPS obrigatório com certificado válido
- Desabilitar API se não necessária publicamente
