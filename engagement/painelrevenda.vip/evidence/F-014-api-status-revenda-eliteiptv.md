# F-002 API Status Exposure — revenda-eliteiptv.online

**Severidade:** Baixa
**Alvo:** revenda-eliteiptv.online
**Data:** 2026-09-03

## Descrição
Endpoint `/api/status` expõe informações do servidor: 
- Carga atual do servidor (load)
- Tempo de atividade (uptime)

A resposta é em formato XML-like com informações potencialmente úteis 
para fingerprinting.

## Reprodução
```bash
curl -H "Cookie: cf_clearance=<token>" https://revenda-eliteiptv.online/api/status
# Resposta: <load>1.06</load>
#            <uptime>306 Days 20:12:01</uptime>
```

## Resposta
```
<load>1.06</load>
<uptime>306 Days 20:12:01</uptime>
```

## Impacto
- Information disclosure (carga do servidor, uptime)
- Auxilia fingerprinting e planejamento de ataques
- Indica que o backend é Laravel (mensagens de erro 405)

## Recomendação
- Remover ou restringir endpoint de status público
- Implementar autenticação para endpoints de monitoramento
- Desabilitar exibição de versões/softwares em mensagens de erro
