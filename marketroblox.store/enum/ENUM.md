# Enumeration Report — marketroblox.com

**Date:** 2026-08-24T04:35:00Z  
**Status:** Concluded — access obtained, API discovered  
**Operator:** enum (especialista)

---

## 1. Access & Authentication

### Registration
- **Endpoint:** `POST /ajaxs/client/auth.php`
- **Params:** `action=Register`, `csrf_token`, `username`, `email`, `password`, `repassword`
- **Format:** `application/x-www-form-urlencoded` (JSON não funciona)
- **CSRF:** Token oculto em `<input id="csrf_token">` em todas as páginas
- **Resultado:** Registration ABERTA — qualquer um pode criar conta
- **Conta de teste:** `testgcdoyv` / `Test1234!`

### Login
- **Endpoint:** `POST /ajaxs/client/auth.php`
- **Params:** `action=Login`, `csrf_token`, `username`, `password`
- **Result:** `{"status":"success","msg":"Đăng nhập thành công!"}`
- **Cookies:** `PHPSESSID`, `user_login` (hash HMAC), `user_agent`

### Session Cookie
- `PHPSESSID=0803be978951ac0417f0a3fbff038110`
- `user_login` = HMAC longo (proteção contra tampering)
- Sem cookie HttpOnly/Secure observado

---

## 2. Content Discovery Results

### ffuf — Root (common.txt) — Endpoints NOT 404/403

| Endpoint | Status | Size | Tipo |
|---|---|---|---|
| `/.well-known/acme-challenge` | 301 | 1154b | redirect |
| `/.well-known/http-opportunistic` | 200 | 27b | `["http://marketroblox.com"]` |
| `/api` | 301 | 1154b | redirect |
| `/assets` | 301 | 1154b | redirect |
| `/bandwidth` | 301 | 1154b | redirect |
| `/cgi-bin` | 301 | 1154b | redirect |
| `/cgi-sys` | 301 | 1154b | redirect |
| `/cron` | 301 | 1154b | redirect |
| `/client` | 200 | 91KB | homepage |
| `/client_configs` | 200 | 91KB | homepage |
| `/clientapi` | 200 | 91KB | homepage |
| `/clients` | 200 | 91KB | homepage |
| `/controlpanel` | 200 | 35KB | cPanel redirect |
| `/cpanel` | 200 | 35KB | cPanel redirect |
| `/webmail` | 200 | 35KB | cPanel webmail |
| `/blog` | 200 | 45KB | blog listing |
| `/blogs` | 200 | 45KB | blog listing |
| `/config.php` | 200 | 0b | PHP vazio |
| `/aa` ~ `/zzz` | **302** | 0b | Catch-all redirect |

### Key Observations
- **302 redirects** com 0 bytes são catch-all — TODOS os paths inexistentes viram 302
- **Páginas de 45KB** = login page (user-form com CSRF)
- **Páginas de 35KB** = cPanel redirect page
- **Páginas de 91KB** = homepage (full HTML)
- **15079 bytes** = custom 404 page (fancy animation)
- **1610 bytes** = API 404 JSON `{"status":"error","msg":"..."}`

---

## 3. API Endpoints — CRÍTICO

### Descobertos via página `/client/document-api`

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/profile.php?api_key={key}` | Account info (username, balance) |
| GET | `/api/products.php?api_key={key}` | All categories + products |
| GET | `/api/product.php?api_key={key}&product={id}` | Single product details |
| GET | `/api/order.php?api_key={key}&order={id}` | Order details |
| POST | `/api/buy_product` | Purchase product |

### Minha API Key
```
3ef05b5cafb38e5b11d1693fbd2e43e3dMmGgWr0Fi9ve7t1jObq4AoVYZUkPyQN
```
(Pode ser regenerada via `/ajaxs/client/auth.php` com `action=changeAPIKey`)

### API Response Examples

**Profile:**
```json
{"status":"success","data":{"username":"testgcdoyv","money":"0.00"}}
```

**Products:** Lista completa de 7 categorias com produtos, preços, estoque (ver `api_products.json`)

**Buy:**
```json
{
  "status": "success",
  "msg": "Tạo đơn hàng thành công!",
  "trans_id": "JF465f728224ce11",
  "data": [
    "1000040304952|GUTJXYIFPWLHCNDOMBRKVAQESZ",
    ...
  ]
}
```
⚠️ **CRÍTICO:** A resposta de compra inclui **credenciais de contas Roblox** (username|password)!

### Order IDOR
- `/api/order.php?api_key={key}&order={id}` — testar enumeração de IDs de pedidos
- Order ID sample: `7NVD67d9a4bf5406b` (formato: prefixo+random)

### Buy endpoint validation
- Balance check: `{"status":"error","msg":"Insufficient balance, please top up"}`
- Quantity check: `{"status":"error","msg":"Invalid quantity"}` (para negativos)
- Stock check: `{"status":"error","msg":"Stock not sufficient"}`

---

## 4. JS Analysis

### JS Files Baixados e Analisados

| Arquivo | Tamanho | Observações |
|---|---|---|
| `/public/client/js/main.js` | 3509b | UI code (scroll, dropdown, modal, wishlist) |
| `/public/sweetalert2/sweetalert2.js` | 72671b | SweetAlert2 completo |
| `/public/cute-alert/cute-alert.js` | 4205b | Alertas customizados |
| `/public/client/js/slick.js` | 7968b | Slider |
| `/public/client/js/accordion.js` | 586b | Accordion UI |
| `/public/client/js/countdown.js` | 995b | Countdown timer |
| `/public/js/jquery-3.6.0.js` | 288580b | jQuery |
| `/mod/js/main.js?v=2` | **0 bytes** | **Vazio** — possivelmente carregado via auth |
| `/mod/css/main.css?v=27` | 35292b | CSS do módulo |

### JS Findings (Login Flow)
```javascript
var ajaxData = {
    action: 'Login',
    csrf_token: $("#csrf_token").val(),
    username: $("#page-login-username").val(),
    password: $("#page-login-password").val()
};
$.ajax({
    url: "https://marketroblox.com/ajaxs/client/auth.php",
    method: "POST",
    dataType: "JSON",
    data: ajaxData,
    ...
});
```

### JS Findings (Register Flow)
```javascript
var ajaxData = {
    action: 'Register',
    csrf_token: $("#csrf_token").val(),
    username: username,
    email: email,
    password: password,
    repassword: repassword
};
```

### Additional JS Endpoints
- `changeLanguage()` → POST `/ajaxs/client/update.php` (action=changeLanguage, id)
- `changeCurrency()` → POST `/ajaxs/client/update.php` (action=changeCurrency, id)
- `changeAPIKey()` → POST `/ajaxs/client/auth.php` (action=changeAPIKey, token)
- `openModal(``, productId, ``)` → load product modal

---

## 5. Bypass Attempts — /.env e /.git

### /.env variants
| Path | Status | Size | Verdict |
|---|---|---|---|
| `/.env` (normal) | 403 | 1601b | Bloqueado por WAF |
| `/.env.bak` | 403 | 1601b | Bloqueado |
| `/.env.old` | 403 | 1601b | Bloqueado |
| `/.env.local` | 403 | 1601b | Bloqueado |
| `/.env.production` | 403 | 1601b | Bloqueado |
| `/.env.backup` | 403 | 1601b | Bloqueado |
| `/.env.dev` | 403 | 1601b | Bloqueado |
| `/.env.save` | 403 | 1601b | Bloqueado |
| `/admin/.env` | 403 | 1601b | Bloqueado |
| `/api/.env` | 403 | 1601b | Bloqueado |
| `//.env` | 200 | 11920b | Custom 404 page |
| `/%2e%2e/.env` | 400 | 155b | Bad request |

### /.git variants
| Path | Status | Size | Verdict |
|---|---|---|---|
| `/.git/HEAD` | 403 | 1601b | Bloqueado |
| `/.git/config` | 403 | 1601b | Bloqueado |
| `/.git/index` | 403 | 1601b | Bloqueado |
| `/.git/refs/heads/master` | 403 | 1601b | Bloqueado |
| `/.git/logs/HEAD` | 403 | 1601b | Bloqueado |
| `/.gitignore` | 403 | 1601b | Bloqueado |

### Bypass techniques tested
- HEAD method → 200 (mas retorna custom page)
- X-Forwarded-For: 127.0.0.1 → 200 (mas custom page)
- Directory traversal → 400 Bad Request
- Path normalization → 200 custom page

**Veredito:** WAF bloqueia efetivamente. 403 retorna página de 1601b (Cloudflare custom block page).

---

## 6. cPanel Enumeration

| Path | Status | Size | Observação |
|---|---|---|---|
| `/cpanel` | 200 | 35022b | Redirect page para cPanel |
| `/controlpanel` | 200 | 35022b | Idem |
| `/webmail` | 200 | 35022b | Webmail |
| `marketroblox.com:2083/` | 200 | 45005b | cPanel login page |
| `marketroblox.com:2083/cpsess*` | 200 | 45005b | cPanel session |

cPanel login page acessível diretamente na porta 2083 (SSL). Versão do cPanel não identificada no HTML.

---

## 7. Frontend Routes (Client App)

### Public Routes
| Path | Descrição |
|---|---|
| `/client/login` | Login form |
| `/client/register` | Registration form (open!) |
| `/client/forgot-password` | Password recovery |
| `/client/home` | Homepage |
| `/client/faq` | FAQ page |
| `/client/contact` | Contact page |
| `/client/policy` | Policy page |
| `/blogs` | Blog listing |
| `/category/god-fruit` | Product category (GOD FRUIT) |
| `/category/god-mythical` | Product category (GOD MYTHICAL) |
| `/category/race-v4` | Product category (RACE V4) |
| `/category/ramdom-lever---mythical` | Random lever category |
| `/product/{slug}` | Product detail page |

### Authenticated Routes
| Path | Descrição |
|---|---|
| `/client/profile` | User profile / wallet |
| `/client/transactions` | Transaction history |
| `/client/favorites` | Favorite products |
| `/client/document-api` | API documentation |
| `/client/logs` | Activity logs |
| `/product-orders` | Order history |
| `/client/logout` | Logout |

### Action-based Pages
| Path | Descrição |
|---|---|
| `/?action=recharge-crypto` | Crypto deposit |
| `/?action=affiliates` | Affiliate stats |
| `/?action=affiliate-history` | Affiliate history |
| `/?action=affiliate-withdraw` | Affiliate withdrawal |

---

## 8. PHP Backend Endpoints

| Endpoint | Size | Descrição |
|---|---|---|
| `/ajaxs/client/auth.php` | 68b | Auth API (login, register, changeAPIKey) |
| `/ajaxs/client/load_products.php` | 16286b | Load products HTML |
| `/ajaxs/client/update.php` | variável | Update API (changeLanguage, etc.) |
| `/client/load_menu.php` | 15079b | 404 (precisa auth) |
| `/client/update.php` | 15079b | 404 (precisa auth) |
| `/client/auth` | 15079b | 404 (precisa auth) |
| `/client/load_products` | 15079b | 404 (precisa auth) |
| `/index.php` | ~91KB | Front controller |
| `/config.php` | 0b | PHP vazio |

---

## 9. Product Catalog (via API)

### Categories with Products
| Category ID | Name | Products count |
|---|---|---|
| 2 | RACE V4 | 16 produtos (stock 0) |
| 28 | GOD MYTHICAL | 9 produtos (alguns com stock) |
| 29 | RAMDOM LEVER - MYTHICAL | 4 produtos (stock 0) |
| 30 | GOD FRUIT | 4 produtos (1 com stock) |
| 22 | CTV | 0 |
| 27 | FRUIT | 0 |
| 1 | RACEV4 | 0 |

### Products with Stock > 0
| ID | Name | Price | Stock |
|---|---|---|---|
| 199 | GOD KITSUNE INVENTORY | $80,000 | **75** |
| 202 | GOD 2 MYTHICAL | $15,000 | **39** |
| 210 | GOD 7 MYTHICAL INVENTORY | $53,000 | **15** |
| 211 | GOD 8 MYTHICAL INVENTORY | $73,000 | **39** |
| 212 | GOD 9 MYTHICAL INVENTORY | $85,000 | **25** |
| 219 | GOD 10 MYTHICAL INVENTORY KITSUNE USE | $110,000 | **11** |

---

## 10. Vulnerability Candidates

### 🔴 CRÍTICO
1. **API Key exposure** — Chave visível no HTML do `/client/document-api` (possível XSS/link sharing)
2. **Order IDOR** — `/api/order.php?order={id}` — testar enumeração de IDs de pedidos de outros usuários
3. **Buy response leaks creds** — Resposta de compra bem-sucedida inclui usuário/senha Roblox
4. **Open Registration** — Qualquer um pode criar conta

### 🟡 ALTO
5. **cPanel 2083** — Acessível externamente, testar default creds
6. **PHP 7.4.33 EOL** — Múltiplos CVEs conhecidos
7. **CSRF token** — Reutilizável? Testar se o mesmo token funciona múltiplas vezes
8. **Price manipulation** — Buy endpoint validou balance mas testar mass assignment

### 🟢 MÉDIO
9. **XSS via SweetAlert2** — Versão permite DOM XSS com inputs não sanitizados
10. **Directory listing** — `/mod/` e `/ajaxs/admin/` retornam 0 bytes (vazio)
11. **Weak rate limiting** — ffuf com 20 req/s não foi bloqueado
12. **Referrer leakage** — API key na URL (não usar HTTPS?)

### ⚪ INFO
13. **Cloudflare WAF** — Protege /.env e /.git efetivamente
14. **LiteSpeed cache** — `x-turbo-charged-by: LiteSpeed`
15. **No HSTS** — Header não implementado
16. **Google Dork** — `site:marketroblox.com` pode revelar mais endpoints

---

## 11. Payoff Rankings Updated

| Prioridade | Vetor | Host | Payoff |
|---|---|---|---|
| 🔴 CRÍTICO | API Order IDOR | marketroblox.com | Dados de pedidos/credenciais |
| 🔴 CRÍTICO | Buy endpoint creds leak | marketroblox.com | Contas Roblox completas |
| 🔴 CRÍTICO | cPanel 2083 login | marketroblox.com | Acesso total hosting |
| 🔴 ALTO | PHP 7.4.33 EOL RCE | marketroblox.com | Code execution |
| 🟡 MÉDIO | BOLA/IDOR em produtos | marketroblox.com | Dados de outros usuários |
| 🟡 MÉDIO | Mass assignment buy | marketroblox.com | Compras gratuitas |
| 🟢 BAIXO | XSS SweetAlert2 | marketroblox.com | DOM XSS |

---

## 12. Next Steps for WebApp Attack

1. **Test Order IDOR** — Enumerar `/api/order.php` com IDs sequenciais/aleatórios
2. **Test Admin auth bypass** — Força bruta em `/ajaxs/client/auth.php` com `action=adminLogin`
3. **Test Mass Assignment** — Adicionar campos extras no POST do buy (`price=0`, `admin=true`, `role=admin`)
4. **Test CVE PHP 7.4.33** — Pesquisar CVEs específicos para RCE
5. **Test cPanel default creds** — Tentar `admin:admin`, `root:toor`, etc
6. **Register multiple accounts** — Para testar IDOR entre contas
7. **Extract ALL product data** — Usar `/api/products.php` para mapear todos os ativos
8. **Test Parameter Pollution** — Adicionar parâmetros duplicados no buy