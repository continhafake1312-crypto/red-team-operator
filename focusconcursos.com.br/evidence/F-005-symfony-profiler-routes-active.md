# F-005 Symfony Profiler Routes Routing Active
Alvo: payment.focusconcursos.com.br (54.152.191.245 via AWS ELB)
Severidade: Média
Timestamp: 2026-08-22T02:09:59Z

## Reprodução
```bash
proxychains4 curl -i https://payment.focusconcursos.com.br/_profiler/
```

## Output
```
HTTP/2 404
content-type: application/json
server: nginx
cache-control: no-cache, private

{"exception":"Symfony\\Component\\HttpKernel\\Exception\\NotFoundHttpException","message":"Not Found","track":null}
```

## Endpoints Testados (todos retornam 404 NotFoundHttpException)
- `/_profiler/`
- `/_profiler/latest`
- `/_profiler/empty`
- `/_profiler/search`
- `/_profiler/phpinfo`
- `/_profiler/config`
- `/_profiler/request`
- `/_profiler/router`
- `/_profiler/open?file=/etc/passwd`
- `/_wdt/`
- `/_wdt/{token}`
- `/_errors/`
- `/_error/{code}`
- `/app_dev.php/`
- `/app_dev.php/_profiler/`

## Interpretação
- Todos os endpoints com prefixo `_profiler`, `_wdt`, `_errors` são roteados pelo Symfony
- Retornam `Symfony\Component\HttpKernel\Exception\NotFoundHttpException` (404) em vez de erro 404 do nginx
- Isso confirma que o **Symfony Kernel está processando essas requisições**
- O route loader do Profiler está registrado, mas nenhuma rota específica está configurada

## Impacto
- Se o ambiente entrar em modo debug, o profiler ficará imediatamente acessível
- Rotas de debug expostas potencialmente em futuras atualizações
- Informação de fingerprinting: Symfony HttpKernel confirmado

## Recomendação
- Remover ou desabilitar ProfilerBundle em produção
- Bloquear rotas `/_profiler`, `/_wdt`, `/_errors` no nginx antes de chegar ao Symfony
- Verificar configuração do ambiente (deve estar em prod)

## Próximo passo
- Monitorar se essas rotas ficam acessíveis após mudanças no ambiente
- Testar com tokens específicos de profiler (se X-Debug-Token for obtido em outro lugar)