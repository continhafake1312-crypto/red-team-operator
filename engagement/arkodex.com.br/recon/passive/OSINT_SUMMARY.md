# OSINT Summary - Arkodex (arkodex.com.br)
**Date:** 2026-08-26

## Exec Summary
- **Alvo:** ArkodeX - Plataforma de bots Discord/WhatsApp/Telegram (+70 bots)
- **Propietário/Dono:** Luan David (contato.luan.david@gmail.com)
- **Infra:** Cloudflare DNS + CDN, SPA React/Vite, Google Ads (AW-17703692532)
- **Subdomínio:** cloud.arkodex.com (Cloud panel)

## Findings Summary

| Categoria | Qtd | Detalhes |
|-----------|-----|----------|
| Emails encontrados | 1 confirmado | contato.luan.david@gmail.com |
| Pessoas mapeadas | 5 | Luan David, Arko, Sr-Ghost, arKodeX, LuanDavid |
| Cred-stuffing candidates | 1 | contato.luan.david@gmail.com (owner, high value) |
| Repos GitHub | 23 | 1 direto (ArkodeX-Pro) + 22 (arkodexx) |
| Secrets vazados | 0 | Nenhum encontrado em repos públicos |

## Descobertas Chave

### Pessoa Principal
**Luan David** é o proprietário/desenvolvedor:
- Email: contato.luan.david@gmail.com
- GitHub: Sr-Ghost (ArkodeX-Pro repo)
- WHOIS registrant do domínio arkodex.com.br

### Attack Surface OSINT
1. **Subdomínio cloud:** cloud.arkodex.com (não respondeu - pode ser interno)
2. **Painel admin:** /admin (protegido por rota, SPA)
3. **Payments:** PushinPay (gateway de pagamento)
4. **Produtos:** +40 bots Discord listados no sitemap
5. **Tech Stack:** React/Vite, Cloudflare, Google Ads, imgur (assets)

### Prioridade para Engajamento
- **ALTA:** Testar credenciais padrão/reutilizadas com contato.luan.david@gmail.com
- **ALTA:** cloud.arkodex.com - subdomínio cloud pode conter painel administrativo
- **MÉDIA:** Verificar secrets nos 22 repos do arkodexx
- **MÉDIA:** /admin - painel admin do site