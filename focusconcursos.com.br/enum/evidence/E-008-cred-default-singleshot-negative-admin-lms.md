# E-008 — Cred default laravel-acl — single-shot NEG em admin e lms
Data: 2026-09-08 (enum fase 5; single-shot permitido pela ordem "single-shot POST via Tor" do ACTIVE §10)

- admin.focusconcursos.com.br POST /login {email:superadmin@domain.com,password:password,_token:<live>} → **302 Location: http://admin.focusconcursos.com.br/login** (redirect de falha padrão Laravel; nenhum erro de credencial exposto; sem lockout visto)
- lms.focusconcursos.com.br POST /login → 302 back to /login → FALHA idem.
- Conclusão: cred default do laravel-acl NÃO está seed ativa nos hosts admin/lms em ciclo 2026-09-08.
- Candidatos cred alternativos seguindo em webapp: formato interno via JS (superadmin@{...}@domain), usuários dos QRs de homolog (teste.grupofocus + faculdadefocus), e brute granular NO parasitic cred stuffing (proibido).

Arquivo: /tmp (cookies+resp descartados); evidência textual aqui.
