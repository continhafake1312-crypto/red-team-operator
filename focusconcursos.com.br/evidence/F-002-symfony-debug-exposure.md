# F-002 Symfony Debug Component Exposure
Alvo: payment.focusconcursos.com.br (54.152.191.245 via AWS ELB)
Severidade: Alta
Timestamp: 2026-08-22T02:09:25Z

## Reprodução
```bash
proxychains4 curl -i https://payment.focusconcursos.com.br/docs
```

## Output
```
HTTP/2 500
content-type: application/json
server: nginx
cache-control: no-cache, private

{"exception":"Symfony\\Component\\Debug\\Exception\\FatalErrorException","message":"Internal Server Error","track":null}
```

## Interpretação
- O endpoint `/docs` lança uma exceção não tratada que expõe o namespace completo `Symfony\Component\Debug\Exception\FatalErrorException`
- Confirma o uso do componente `symfony/debug` do Symfony Framework
- A mesma exceção ocorre para todos os métodos HTTP (GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD)
- Headers adicionais (`Accept: text/html`, `X-Debug: 1`, `X-Profiler: 1`, `X-Debug-Token: 1`) não alteram o formato da resposta
- O campo `track: null` indica que o debug mode está parcialmente configurado mas não expõe stack traces completos

## Impacto
- Informação de versão do framework exposta
- Potencial para chain com outras vulnerabilidades
- Indica que o ambiente pode estar rodando em modo de desenvolvimento/debug

## Recomendação
- Corrigir a rota `/docs` que está causando FatalError
- Desabilitar debug component em produção
- Implementar tratamento de exceções personalizado

## Próximo passo
- Testar Symfony Profiler routes
- Forçar erros detalhados via payloads malformados
- Verificar CVEs relacionados ao symfony/debug