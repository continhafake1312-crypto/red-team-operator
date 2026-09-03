# F-006 Páginas PHP Expostas — elite-iptv.com

**Severidade:** Baixa
**Alvo:** elite-iptv.com
**Data:** 2026-09-03

## Descrição
Páginas PHP do site de marketing expostas sem proteção adequada. 
Incluem páginas que processam formulários de contato e pedidos.

## Páginas Acessíveis
- /order.php (9970B) - Página de pedido/assinatura
- /pricing.php (9885B) - Preços
- /channels.php (502KB) - Lista de canais IPTV
- /faq.php (11329B) - FAQ
- /contact.php (9970B) - Formulário de contato
- /tutorials.php (16261B) - Tutoriais

## Informações Expostas
- Preços e planos de IPTV
- Lista completa de canais (502KB)
- Formulário de contato sem proteção CAPTCHA
- Tawk.to chat widget ID exposto: `651407890f2b18434fdadd55`

## Recomendação
- Implementar CAPTCHA em formulários públicos
- Validar e sanitizar todas as entradas de usuário
- Restringir acesso administrativo via .htaccess ou firewall
