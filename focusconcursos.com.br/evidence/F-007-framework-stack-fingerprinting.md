# F-007 Framework Stack Fingerprinting
Alvo: payment.focusconcursos.com.br (54.152.191.245 via AWS ELB)
Severidade: Info
Timestamp: 2026-08-22T02:09:25Z

## Stack Identificada
```
AWS ELB (awselb/2.0)
  └── Nginx (server: nginx)
       └── PHP (index.php front controller)
            ├── Symfony Components
            │   ├── symfony/debug (Debug\\Exception\\FatalErrorException)
            │   └── symfony/http-kernel (HttpKernel\\Exception\\NotFoundHttpException)
            └── Laravel/Lumen Components
                └── prettus/laravel-validator (Prettus\\Validator\\Exceptions\\ValidatorException)
```

## Detalhes

### Infraestrutura
- **CDN/Proxy**: AWS ELB (detectado via resposta 405 OPTIONS)
- **Servidor Web**: Nginx
- **Cache**: Cache-Control: no-cache, private
- **SSL/TLS**: HTTP/2 via ELB termination

### Framework
- **Symfony Componentes**: 
  - `Symfony\Component\Debug\Exception\FatalErrorException` (erro do componente Debug)
  - `Symfony\Component\HttpKernel\Exception\NotFoundHttpException` (erro do HttpKernel)
  - `Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException` (método não permitido)
- **Laravel Componentes**:
  - `Prettus\Validator\Exceptions\ValidatorException` (pacote prettus/laravel-validator)
  - Este pacote é mantido pela Prettus e é usado em projetos Laravel/Lumen

### Endpoints Confirmados
- **Raiz**: `{"status":"ok"}` (200)
- **Symfony Roteados**: `_profiler/*`, `_wdt/*`, `_errors/*`, `login`, `logout`, `admin`, `api/*`
- **API Ativa**: `api/v1/transactions`, `api/v1/subscriptions`, `api/v1/plans`
- **Config Expostos**: `.htaccess`, `web.config`, `robots.txt`, `favicon.ico`

## Impacto
- Informação útil para ataques direcionados
- Combinação Symfony + Laravel é incomum (possível Lumen com componentes Symfony)
- Permite pesquisa de CVEs específicos para as versões

## Recomendação
- Esconder versões de servidores e frameworks
- Implementar headers de segurança (X-Content-Type-Options, X-Frame-Options, etc.)