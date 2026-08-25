# Relatório de Segurança — MySQL Exposed

**Engagement**: cotec-fadenor.selecao.net.br
**Data**: 2026-08-25
**Especialista**: Network/Pentest
**Classificação**: CONFIDENCIAL — APENAS PARA USO AUTORIZADO

---

## Sumário Executivo

Dois servidores MySQL expostos publicamente foram identificados e testados exaustivamente. **Nenhum acesso foi obtido** — ambos os alvos implementam proteção contra força bruta (`max_connect_errors`) e não utilizam credenciais padrão.

| Alvo | IP | Porta | Versão | Status |
|------|------|------|--------|--------|
| 1 | 64.31.24.186 | 3306 | MySQL 8.0.32 | 🔴 Acesso negado (bloqueado) |
| 2 | 177.53.143.156 | 3306 | MySQL 5.5.60 EOL | 🔴 Acesso negado (bloqueado) |

---

## Alvo 1 — 64.31.24.186:3306 (MySQL 8.0.32) — CRÍTICO

### Informações Gerais
| Campo | Valor |
|-------|-------|
| IP | 64.31.24.186 |
| Porta | 3306/TCP |
| Versão | MySQL 8.0.32-0ubuntu0.20.04.2 (Ubuntu) |
| Auth Plugin | caching_sha2_password |
| Hostname | s8.proseleta.com.br |
| Contexto | Backend ProSeleta (sistema de processos seletivos IFES) |
| Web | ifes25-semproxy.selecao.net.br (Apache 2.4.41, PHP, ProSeleta) |

### Testes Realizados

1. **Banner Grab / Enumeração (nmap mysql-*)**
   - mysql-info: Confirmado MySQL 8.0.32, caching_sha2_password
   - mysql-enum: Detectou 10 usuários como "válidos com senha vazia"
     - Usuários: root, netadmin, guest, user, web, sysadmin, administrator, webadmin, admin, test
     - **⚠️ Possíveis falsos positivos** — o script NSE pode confundir existência de usuário com credenciais válidas em MySQL 8.0 com caching_sha2_password
   - mysql-empty-password: Falhou (erro de script)

2. **Teste de Credenciais Default**
   - 10+ usuários × 30+ senhas testados (root, admin, test, user, web, guest, etc.)
   - Senhas testadas: vazio, root, admin, password, mysql, toor, 123456, selecao, proseleta, cotec, fadenor, P@ssw0rd, changeme, etc.
   - **Resultado: todas falharam com "Access denied"**

3. **Brute Force (Hydra)**
   - 42 senhas customizadas + mysql-betterdefaultpasslist.txt
   - 0 senhas válidas encontradas

4. **Bloqueio**
   - IP Tor (185.220.101.158/192.42.116.17): bloqueado após ~10 tentativas
   - IP direto (56.125.111.53): bloqueado após ~100 tentativas
   - Mensagem: *"Host 'IP' is blocked because of many connection errors; unblock with 'mysqladmin flush-hosts'"*

### Risco
| Categoria | Risco | Justificativa |
|-----------|-------|---------------|
| Exposição | 🔴 ALTO | MySQL exposto à internet sem restrição de origem |
| Autenticação | 🟡 MÉDIO | max_connect_errors ativado mas credenciais fortes |
| Versão | 🟡 MÉDIO | MySQL 8.0.32 (suportado, mas patch mais recente disponível) |
| Dados | 🔴 ALTO | PII de candidatos, credenciais admin, dados financeiros |

### Recomendações Imediatas
1. Restringir acesso MySQL ao IP do servidor web (whitelist)
2. Auditar usuários no MySQL (remover contas desnecessárias como guest, test)
3. Implementar fail2ban ou similar para proteção contra força bruta
4. Atualizar MySQL para última versão 8.0.x
5. Verificar se há credenciais em arquivos de configuração PHP no servidor web

---

## Alvo 2 — 177.53.143.156:3306 (MySQL 5.5.60 EOL) — CRÍTICO

### Informações Gerais
| Campo | Valor |
|-------|-------|
| IP | 177.53.143.156 |
| Porta | 3306/TCP |
| Versão | MySQL 5.5.60-log |
| Auth Plugin | mysql_native_password |
| Hostname | painel.tupihost.net / proxy-auth.selecao.net.br |
| Contexto | Proxy de autenticação Locaweb |
| Web | proxy-auth.selecao.net.br (502 Bad Gateway) |

### Testes Realizados

1. **Banner Grab / Enumeração (nmap mysql-*)**
   - mysql-info: Confirmado MySQL 5.5.60-log
   - mysql-enum: "No valid accounts found" (10 guesses)
   - mysql-empty-password: "Can't get hostname for your address" (Tor)

2. **Teste de Credenciais Default**
   - Usuários: root, admin, locaweb, proxy, authproxy, test, user, sistema, painel
   - Senhas: vazio, root, admin, password, mysql, 123456, locaweb, proxy, authproxy, etc.
   - **Resultado: todas falharam**

3. **CVE-2012-2122 (Authentication Bypass)**
   - 1000 tentativas de bypass via conexão concorrente
   - **Resultado: NÃO VULNERÁVEL** (versão 5.5.60 já corrigida)

4. **Brute Force (Nmap mysql-brute)**
   - 310 guesses em 268 segundos
   - **0 contas válidas**

### Risco
| Categoria | Risco | Justificativa |
|-----------|-------|---------------|
| Exposição | 🔴 ALTO | MySQL exposto à internet |
| Versão | 🔴 ALTO | MySQL 5.5 EOL desde 2020 — sem patches de segurança |
| Autenticação | 🟢 BAIXO | max_connect_errors ativado, sem credenciais padrão |
| Exploração | 🔴 ALTO | Múltiplos CVEs conhecidos para MySQL 5.5.x |

### CVEs Conhecidos para MySQL 5.5.x
- **CVE-2022-21367**: DoS via compressão
- **CVE-2021-35630**: DoS via subquery
- **CVE-2018-3081**: DoS via DML
- **CVE-2017-3641**: DoS (há exploit público)
- **Vários CVEs de escalação de privilégio local** (após autenticação)

### Recomendações Imediatas
1. **CRÍTICO**: Atualizar MySQL para versão suportada (5.7+ ou 8.0+)
2. Restringir acesso MySQL à fontes confiáveis
3. Desligar MySQL se não for mais necessário (502 Bad Gateway indica app offline)
4. Verificar se o proxy Locaweb tem comunicação legítima

---

## Tabela de Credenciais Testadas

### Alvo 1 (64.31.24.186)
```
root:vazio → Access denied
root:root → Access denied
root:admin → Access denied
root:password → Access denied
root:mysql → Access denied
root:toor → Access denied
root:selecao → Access denied
root:proseleta → Access denied
root:cotec → Access denied
root:fadenor → Access denied
root:123456 → Access denied
root:12345 → Access denied
root:admin123 → Access denied
root:root123 → Access denied
root:P@ssw0rd → Access denied
root:changeme → Access denied
root:ProSeleta → Access denied
admin:vazio → Access denied
admin:admin → Access denied
admin:root → Access denied
admin:password → Access denied
admin:mysql → Access denied
test:vazio → Access denied
test:test → Access denied
user:vazio → Access denied
user:user → Access denied
(+ nomes do nmap-enum com senhas comuns)
```

### Alvo 2 (177.53.143.156)
```
root:vazio → Access denied
root:root → Access denied
root:admin → Access denied  
root:password → Access denied
root:mysql → Access denied
root:123456 → Access denied
root:selecao → Access denied
root:proseleta → Access denied
root:locaweb → Access denied
root:proxy → Access denied
root:authproxy → Access denied
root:painel → Access denied
locaweb:locaweb → Access denied
locaweb:proxy → Access denied
locaweb:authproxy → Access denied
proxy:proxy → Access denied
authproxy:authproxy → Access denied
admin:admin → Access denied
sistema:sistema → Access denied
(+ outras combinações)
```

---

## Próximos Passos Recomendados

### Curto Prazo
1. **Web Enumeration** — Explorar ifes25-semproxy.selecao.net.br para:
   - SQL Injection no login (CPF/senha)
   - Credenciais hardcoded em código PHP/JS
   - Diretórios sensíveis (/backup, /sql, /config)
   - Arquivos de configuração expostos (.env, config.php)
   - Upload de arquivos e path traversal

2. **Static CDN Enumeration**
   - static-cdn.selecao.net.br pode conter arquivos de configuração
   - Verificar versões de frameworks para CVEs

3. **Força Bruta via Web** — Se o login web for diferente do MySQL diretamente:
   - Testar CPF comuns + senhas fracas
   - Tentativa de bypass de autenticação

### Médio Prazo
1. Esperar desbloqueio dos IPs (max_connect_errors expira)
2. Tentar autenticação após reset com proxy diferente
3. Verificar se MySQL permite conexão de sub-redes específicas

### Contas / Credenciais Alternativas
1. Verificar se as credenciais do mysql-enum podem ser reais para usuários específicos (ex: o sistema ProSeleta pode ter um usuário `proseleta` com senha própria)
2. Procurar credenciais em arquivos de configuração do CMS
3. Tentar credenciais de serviços expostos semelhantes

---

## Arquivos Gerados

```
enum/
├── mysql_64.31.24.186_nmap.txt    → Scan nmap completo
├── mysql_64.31.24.186_creds.txt   → Credenciais testadas
├── mysql_64.31.24.186_tables.txt  → Dump (vazio)
├── mysql_177.53.143.156_nmap.txt  → Scan nmap completo
├── mysql_177.53.143.156_creds.txt → Credenciais testadas
├── mysql_177.53.143.156_tables.txt → Dump (vazio)
└── MYSQL_REPORT.md                → Este relatório
```

---

**Fim do Relatório**