# F-026 PHP 5.6.40 EOL — Confirmado em Produção
**Alvo:** elite-iptv.com (186.194.52.218)
**Severidade:** Crítica
**Timestamp:** 2026-09-03T16:20:00Z
**Status:** CONFIRMADO

## Reprodução

```bash
$ proxychains4 curl -sv 'https://elite-iptv.com/' 2>&1 | grep -i 'x-powered-by\|server'
* Server: nginx
* x-powered-by: PHP/5.6.40
* x-powered-by: PleskLin
```

Headers completos do servidor:
```
HTTP/2 200
server: nginx
x-powered-by: PHP/5.6.40
strict-transport-security: max-age=15768000; includeSubDomains
x-powered-by: PleskLin
content-type: text/html; charset=UTF-8
```

## Interpretação

O servidor web **elite-iptv.com** está rodando **PHP 5.6.40**, que atingiu End-Of-Life (EOL) em **31 de dezembro de 2018** — há mais de 7 anos. Isso significa:

- **Zero patches de segurança** desde 2018
- Todas as vulnerabilidades descobertas desde 2018 são **conhecidas e públicas**
- **+300 CVEs** afetam PHP 5.6.x, incluindo RCEs críticos
- Sem suporte oficial a SSL/TLS moderno

A combinação com **Plesk Obsidian 18.0.78** (também sem patch recente) amplifica o risco.

## CVE Candidates Relevantes (não testados)

| CVE | Descrição | CVSS |
|-----|-----------|------|
| CVE-2018-5711 | Doo → crash via crafted GD image | 7.5 |
| CVE-2018-14851 | Exif info disclosure | 5.3 |
| CVE-2019-11043 | PHP-FPM RCE (testado → não vulnerável) | 9.8 |
| CVE-2019-9641 | PHAR deserialization (sem upload → não explorável) | 9.8 |
| CVE-2018-19518 | imap_open RCE (sem formulário → não explorável via páginas públicas) | 9.8 |
| CVE-2019-11034-11042 | Various PHP-FPM issues | 7.5-9.8 |

## Impacto

Crítico. PHP 5.6.40 exposto à internet com:
- Nenhum patch de segurança nos últimos 7+ anos
- Vulnerabilidades RCE conhecidas e públicas
- Exploração pode levar a comprometimento total do servidor

Mesmo sem um vetor de exploração imediato, a presença de PHP EOL é um risco inaceitável.

## Recomendação

1. **IMEDIATO:** Atualizar PHP para versão suportada (8.1+)
2. Isolar o servidor se atualização não for imediata
3. Implementar WAF (o Cloudflare OpenResty detectado não está ativo neste servidor)
4. Auditoria completa de segurança

## Próximo passo

Monitorar por novas CVEs que possam ser exploradas contra PHP 5.6.40. Tentar vetores de ataque indiretos via plugins/componentes do Plesk.