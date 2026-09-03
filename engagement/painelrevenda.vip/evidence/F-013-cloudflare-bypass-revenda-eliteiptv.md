# F-001 Cloudflare Bypass — revenda-eliteiptv.online

**Severidade:** Média
**Alvo:** revenda-eliteiptv.online
**Data:** 2026-09-03

## Descrição
Cloudflare estava configurado com "I'm Under Attack" mode (JS challenge) 
para o domínio, bloqueando requisições diretas. Foi possível bypassar usando 
Playwright com scripts anti-detecção para resolver o JS challenge e obter 
o cookie `cf_clearance`.

## Reprodução
```python
# Playwright com stealth scripts resolveu o Cloudflare JS challenge
context.add_init_script("""
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    window.chrome = { runtime: {}, loadTimes: function() {}, csi: function() {}, app: {} };
""")
# Após ~1s, o cookie cf_clearance foi obtido
```

## Evidência
Cookie cf_clearance obtido (primeiros 80 chars): 
`A..oDdT5EITYx5Ex3aNaChtE_R53hwnsJjNg3S_Qd4k-1788419633...`

Screenshots salvos em loot/revenda-eliteiptv/

## Impacto
Bypass da proteção Cloudflare permite acesso ao conteúdo real do servidor 
de origem e possibilidade de ataques à aplicação backend.

## Recomendação
- Configurar Cloudflare para usar validação mais forte (Turnstile)
- Implementar proteção adicional no backend contra bypass de CF
- Monitorar logs de acesso para requests sem cf_clearance válido
