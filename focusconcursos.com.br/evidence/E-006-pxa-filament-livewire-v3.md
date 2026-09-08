# E-006 — pxa.focusconcursos.com.br = Filament v3 (Livewire 3.16.0) enum moderna
Data: 2026-09-08 (enum, via Tor)

- GET /login → 200 34309B — Livewire wire:snapshot x2:
    componente 1: {"name":"Filament\\Auth\\Pages\\Login","path":"login","method":"GET","release":"a-a-a",...,"locale":"pt_BR"} (name Filament AUTH!)
    componente 2: Filament\\Livewire\\Notifications
    form: <form id="form" wire:submit="authenticate" class="fi-sc-form">
- Livewire assets endpoint versionado: /livewire-20b400d1/{update,livewire.min.js?id=26bbdf42} (200 243284B, ver interna 3.16.0)
- GET /livewire/livewire.js → 404 (caminho clássico v2 ausente) — só rota /livewire-20b400d1/update
- /admin 302→/admin/login (painel Filament 2nd route), /app,/filament,/dashboard,/api → 404
- marca: "Pixel X App" (pxa) — produto pixelx.app via dns.pixelx.app AS275714.
- Plyr 3.7.8 + Alpine.js confirmados.

Hand-off webapp: Livewire v3 /livewire-20b400d1/update POST calls (snapshot spoofing, file upload components); Filament CVEs (v3 panel); SSH 22 OpenSSH 9.6p1 (Ubuntu 24.04) host pxa — threshold (rede phase, A-001).

Arquivos: enum/pxa.focusconcursos.com.br/{page_login.html,livewire.min.js}
