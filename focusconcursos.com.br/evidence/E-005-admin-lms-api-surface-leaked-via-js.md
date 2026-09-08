# E-005 — admin + lms focusconcursos — API-Surface COMPLETE leak via /js/main.js + cred default NEG
Data: 2026-09-08 (enum, via Tor)

admin.focusconcursos.com.br:
- GET /login → 200 5630B (Materialize; projeto title "Administrativo"; csrf-token meta; CSP upgrade-insecure-requests)
- MIX: /mix-manifest.json (9 assets: CKEditor, app, main, vendor)
- **/js/main.js = 3,904,996B** — extrai rotas com grep `"/[a-z...]":` → 172 rotas em js_routes_all.txt, dezenas SPA: /accesses,/addresses,/attend,/attributes,/bonus,/bulk,/calendar-dashboard,/cancel,/categories,/classrooms(+/create),/contacts,/contents,/contracts(+/create),/coupons(+/create),/courses,/customer-dashboard,/digital_libraries,/documents,/education-grades,/employees(+/create),/examining-boards,/exams(+/create),/family-plan-configuration(+/create),/ckfinder/browser...
- **Rotas de API internas versionadas vaza'd** (org-domain style: core/finance/heimdall/order/question):
    /api/core/v1/general-config/companies
    /api/finance/v1/commissions/reports/{sellers,teachers}
    /api/finance/v1/invoices/unissued/orders
    /api/finance/v1/lesson-contract[/,/reports,/reports/summary]
    /api/heimdall/v1/tenants          ← serviço interno "Heimdall" (multi-tenant enumeration em prod!)
    /api/order/v1/coupons[/]
    /api/question/v1/{comments,notifications,question-books,questions}[/]
- refs cruzadas: lms.focusconcursos.com.br/remember-token/ (cross-login), www.focusconcursos.com.br/cursos/
- /password/reset → 200 (form, csrf-token meta); /.htaccess 200 (Laravel front-controller); /.gitignore 200 (public whitelist index.php); /robots.txt "Disallow: /"
- Nenhuma rota /api/* respondeu não-404 sem auth (1552B HTML 404 Laravel).

lms.focusconcursos.com.br:
- /login 200 6399B (title "LMS Focus Concursos"); mix-manifest (app,main,vendor)
- **/js/main.js = 1,015,940B** → 74 rotas API: /api/order/subscriptions/renew; /api/person/{person,user,person-courses(+/paginate,/favorites),watch-histories,practice-exams,questions,simulated-exam-auth,invites,messages,notices,digital-libraries,family-plan-configurations,people/invites/can-invite,people/,course/}; /api/product/{live-events,public-service-exams}; /api/question/{questions,question-books,question-book-default}[/], questions/product/{id}
- Live sem sessão: 302 HTML refresh (auth middleware; não 401 json) nas rotas /api/person/* /api/question/* testadas; sanctum+passport=404 (sem OAuth/sanctum).

Cred default single-shot (P-007 laravel-acl superadmin@domain.com/password):
- POST admin /login → 302 back to /login → FALHA
- POST lms   /login → 302 back to /login → FALHA
(sem lockout; 1 tentativa/host; cookies XSRF+token ok)

Hand-off webapp: lista full de endpoints p/ IDOR/BOLA after session; lembrete rotas /remember-token cross-app.

Arquivos: enum/admin.focusconcursos.com.br/{js_routes_all.txt,js_main.js}, enum/lms.focusconcursos.com.br/{js_routes_all.txt,js_main.js,api_sweep.txt}.
