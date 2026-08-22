# F-006 Information Disclosure via Config Files
Alvo: payment.focusconcursos.com.br (54.152.191.245 via AWS ELB)
Severidade: Baixa
Timestamp: 2026-08-22T02:18:20Z

## Arquivos Expostos

### /.htaccess (553 bytes)
```apache
<IfModule mod_rewrite.c>
    Options -MultiViews
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)/$ /$1 [L,R=301]
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
</IfModule>
```

### /web.config (914 bytes)
```xml
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="Imported Rule 1">
          <match url="^(.*)/$" />
          <conditions><add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" /></conditions>
          <action type="Redirect" redirectType="Permanent" url="/{R:1}" />
        </rule>
        <rule name="Imported Rule 2">
          <match url="^" />
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
          </conditions>
          <action type="Rewrite" url="index.php" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

### /robots.txt (24 bytes)
```
User-agent: *
Disallow:
```

### /favicon.ico (0 bytes)

## Interpretação
- Arquivo `.htaccess` é o padrão do Laravel/Symfony
- Arquivo `web.config` é a tradução IIS do mesmo rewrite
- Presença de ambos indica **deploy cross-platform ou migração Windows→Linux**
- `robots.txt` com `Disallow:` vazio (permite tudo)
- `favicon.ico` vazio (sem configuração)

## Impacto
- Confirma stack: PHP rodando via index.php front controller
- Confirma rewrite rules padrão do framework
- Baixo impacto individual, mas útil para fingerprinting
- `web.config` pode indicar servidor Windows na origem

## Recomendação
- Remover `.htaccess` e `web.config` do diretório público
- Servir `robots.txt` apropriado para ambientes de produção

## Próximo passo
- N/A