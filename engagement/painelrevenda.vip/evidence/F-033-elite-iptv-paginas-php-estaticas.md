# F-033 elite-iptv.com — Páginas PHP Estáticas (sem processamento)
**Alvo:** elite-iptv.com (186.194.52.218)
**Severidade:** Informativo
**Timestamp:** 2026-09-03T16:25:00Z
**Status:** CONFIRMADO

## Análise das Páginas PHP

### Páginas encontradas (6)
```
order.php      → HTTP 302 (redirect para HTTPS)
pricing.php    → HTTP 200 (página de preços)
channels.php   → HTTP 200 (lista de canais, HTML estático, ~500KB)
faq.php        → HTTP 200 (FAQ estático)
contact.php    → HTTP 200 (seção de texto "Contact Us", sem formulário)
tutorials.php  → HTTP 200 (tutoriais estáticos)
subscription.php → HTTP 404 (não encontrado)
```

### Nenhum formulário ou processamento encontrado
```bash
# Verificação de forms:
# <form class="d-flex">  →  apenas search bar estética
# <section id="contact-form-intro"> → apenas texto informativo
# "Subscribing online is temporarily unavailable" → msg no order.php
```

### Funcionalidades dinâmicas identificadas
- **Tawk.to Live Chat**: `https://embed.tawk.to/651407890f2b18434fdadd55/1hbb3qs6t`
- **jQuery + Bootstrap**: CDN externos
- **CSS estático**: assets/css/style-main.css

### Diretórios/Arquivos testados
```
admin/     → 404
panel/     → 404
api/       → 404
cgi-bin/   → 403 (acesso negado)
.php/.env  → 404/403
uploads/   → 404 (todos)
phpinfo/   → 301/redirect
```

## Interpretação

O site elite-iptv.com é um **site informativo estático** com páginas PHP que servem conteúdo HTML fixo. Apesar de rodar PHP 5.6.40 (EOL crítico), as páginas não têm:

- Formulários de contato com processamento server-side
- Formulários de login/registro
- Upload de arquivos
- Query dinâmica ao banco de dados
- API endpoints

O único serviço interativo é o **Tawk.to chat** (serviço de terceiros).

## Implicações para CVEs

| CVE | Resultado | Motivo |
|-----|-----------|--------|
| CVE-2018-19518 (imap_open RCE) | Não explorável | Sem formulário que passe input para imap_open() |
| CVE-2019-11043 (PHP-FPM RCE) | Não vulnerável | Scanner phuip-fpizdam confirmou |
| CVE-2019-9641 (PHAR desserialização) | Não explorável | Sem upload de arquivos |
| Outras RCEs em PHP 5.6 | Pendentes | Dependem de vetor de entrada |

## Impacto

**Informativo.** Embora PHP 5.6.40 seja crítico, as páginas públicas têm superfície de ataque mínima. 
O verdadeiro risco está nos serviços paralelos (Plesk API, Plesk Panel, MySQL, FTP, SMTP) já identificados em scans anteriores.

## Próximo passo

Foco em ataques aos serviços paralelos:
1. Plesk API (:8443) — brute-force de senha com wordlist
2. Plesk Panel (:8880) — brute-force via HTTP
3. MySQL (3306) — tentar acesso remoto
4. revenda-eliteiptv.online — bypass Cloudflare via origem real