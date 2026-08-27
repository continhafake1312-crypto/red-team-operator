# REPORT — Relatório de Pentest (incremental)

## Metadados
- **Alvo:** `soultv.com.br` (`https://www.soultv.com.br`)
- **Tipo:** Black-box Web/API + Externo
- **Negócio:** A confirmar (aparenta serviço de streaming/IPTV — "Soul TV")
- **Owner:** A confirmar
- **Início:** 2026-08-27
- **OPSEC:** Tor + proxychains4, 2Captcha para Cloudflare bypass
- **Coordenador:** `pentest` (Red Team Operator)

## Sumário Executivo
(Atualizado ao final de cada fase)

## Tabela de Findings

| ID | Severidade | Título | Host/Asset | Evidência | Status |
|----|------------|-------|-----------|-----------|--------|
| C-001 | **HIGH** | Subdomain takeover / controle por terceiro (`testad` → GitHub Pages de terceiro) | testad.soultv.com.br | evidence/C-001.txt | Confirmado (não claimado) |
| C-002 | MEDIUM | Azure Blob `stsoultvbrs/media` leitura pública de blobs (sem list/write) | stsoultvbrs.blob.core.windows.net | evidence/C-002.txt | Confirmado |
| C-003 | MEDIUM | Firebase config vazada + Email/Password auth REST (cred-stuffing surface) | tv-iteractiva (Firebase) | evidence/C-003.txt | Confirmado (anon OFF) |
| F-004 | **MEDIUM** | Pure-FTPd anonymous login (read-only, root chrootado vazio, sem upload) | video02:21 | evidence/F-004.txt | Confirmado |
| F-005 | **HIGH** (pot. CRIT) | Wowza JMX RMI 8084/8085 exposto — creds default `admin:admin` (read-only, root/AlmaLinux/46 clientes/RCE primitive) | video02:8084/8085 | evidence/F-005.txt | Confirmado (c/ F-E01) |
| F-007 | LOW | Wowza HTTP provider 1935 serve HLS VOD sample sem auth (demo default; risco latente bypass paywall) | video02:1935 | evidence/F-007.txt | Confirmado |
| P01–P10 | (preliminares) | Ver `recon/passive/findings_preliminary.md` (a validar nas fases webapp/enum) | vários | — | Pendente |

> Findings cloud consolidados em `recon/passive/cloud_validation.md`. C-XXX = findings cloud;
> F-XXX = findings webapp/rede (fases seguintes).

## Attack Surface Consolidada
(Ver `recon/SUMMARY.md` após Fase 4)

## Acessos Obtidos
- (nenhum até o momento)

## Objetivos de Alto Valor
- (preenchido conforme progresso)

## Cronologia
Ver `timeline.log`.

## Detalhamento de Findings
(Preenchido incrementalmente — um bloco por finding, referenciando `evidence/F-XXX.txt` / `evidence/C-XXX.txt`)

### C-001 — Subdomain takeover / controle por terceiro (HIGH)
`testad.soultv.com.br` tem CNAME → `kevinzuniga.github.io` (GitHub Pages). O subdomínio serve
HTTP 200 "IMA HTML5 Simple Demo", cujo conteúdo é totalmente controlado pelo repo público
`kevinzuniga/soultv-ima-test` (owner `kevinzuniga`, GitHub user terceiro — soultv não tem
posse/admin sobre o repo). Não está "open-claimable" agora (repo ativo serve 200), mas o
terceiro pode servir phishing/malware em subdomínio legítimo da soultv a qualquer momento
(subdomain impersonation). Se o repo/CNAME for removido, o subdomínio vira dangling 404
"There isn't a GitHub Pages site here" → takeover clássico por qualquer atacante (precondition
CNAME soultv→github.io já configurado). **Recomendação:** remover o CNAME do DNS da soultv;
hospedar o teste IMA em infra própria (org GitHub soultv, Cloudflare Pages ou Azure Blob).
Detalhes + snapshots: `evidence/C-001.txt`, `recon/passive/cloud_validation/testad_*.{html,txt}`.

### C-002 — Azure Blob Storage leitura pública de blobs (MEDIUM)
Conta `stsoultvbrs`, container `media`: anonymous BLOB READ habilitado (blobs legíveis se path
conhecido, ex.: `media/brand/Kanuca_TV_100x100.png` = 200/61KB). Listagem anônima 404
(access level = Blob, não Container). Gravabilidade anônima NEGADA (PUT canário 404 — não
escalou para Crítica; canário não persistiu). 29 containers candidatos testados → todos 404
(não enumeráveis anonimamente). CORS desabilitado (403). SAS/AccountKey NÃO vazados em JS.
Paths de mídia vazam via CMS API pública `/v1/brand/{id}` (ver P01) → catálogo de assets
enumerável sem auth, porém sem dados sensíveis confirmados em `media`. **Recomendação:**
migrar `media` para private + servir via CDN/SAS temporária; auditar demais containers via
portal Azure. Detalhes: `evidence/C-002.txt`.

### C-003 — Firebase config vazada + cred-stuffing surface (MEDIUM)
Project `tv-iteractiva`; apiKey `AIzaSyB0l9KbAzmvwoV31dD8Nr6P3FJfujc1Xcc` (válida) vazada em JS
bundles pay/ppv (P02). Validação: **anon auth OFF** (`ADMIN_ONLY_OPERATION`); **Email/Password
auth ON + REST alcançável** (`INVALID_LOGIN_CREDENTIALS` em signInWithPassword) → superfície
de brute-force / credential-stuffing via apiKey pública, sem app/CAPTCHA — contas lidam com
pagamentos, valor financeiro. RTDB 401 (secured). Storage: list 400 (rules v1), read 403,
upload 403 (secured). Firestore: 403 edge do Google sob Tor (4 exits) → INCONCLUSIVO; provável
default-deny, validar na fase webapp via Firebase Web SDK real. **Recomendação:** restringir
apiKey a HTTP referrers soultv; reCAPTCHA Enterprise / 2FA / lockout; upgrade Storage rules p/
v2. Detalhes + respostas JSON: `evidence/C-003.txt`, `recon/passive/cloud_validation/firebase/`.

### F-004 — Pure-FTPd anonymous login read-only (MEDIUM)
`video02.soultv.com.br` (160.202.130.243:21) roda Pure-FTPd [privsep][TLS] com **login anônimo
habilitado** (`USER anonymous` / `PASS <qualquer>` → `230 Any password will work`). O diretório
root do FTP é **chrootado e vazio** (apenas `.`/`..`, timestamp May 19 2025). CWD para todos os
paths comuns testados (`/content`, `/vod`, `/live`, `/stream`, `/media`, `/recordings`, `/logs`,
`/conf`, `/backup`, `/uploads`, `/www`, `/nginx`, `/usr/local/WowzaStreamingEngine/conf`,
`/applications`, `/etc`, etc.) → `550 No such file`. **Escrita negada**: `STOR` canário →
`550 Anonymous users may not overwrite existing files`; `MKD` negado. `SITE EXEC` indisponível.
→ Nenhum dado/cred acessível, sem upload possível, sem privesc via FTP. O anonymous serve apenas
como instalação default/chroot para recebimento de mídia por publishers via usuários FTP reais.
**Impacto:** baixo (hardening) — a existência de anonymous em si é falha de configuração e
footprint do servidor. **Recomendação:** desabilitar login anônimo no Pure-FTPd. Detalhes:
`evidence/F-004.txt`.

### F-005 — Wowza JMX RMI exposto com creds default admin:admin (HIGH / potencial CRÍTICA)
`video02:8084/8085` = portas JMX RMI do Wowza Streaming Engine 4.8.0 (8084=rmiConnectionPort,
8085=rmiRegistryPort c/ binding `/jmxrmi`). **Credenciais default `admin:admin` aceitas no JMX**
(acesso **read-only**) — validado pelo especialista `enum` (F-E01) via cliente Java RMI com
`RMISocketFactory` redirecionando `localhost:8084` → `160.202.130.243`. Acesso read-only a 2446
MBeans permitiu disclosure: `user.name=root`, OS **AlmaLinux 9.7**, kernel 5.14.0-611.36.1.el9_7,
12 cores/62GB; **licença crackeada** `Wowza Streaming Engine 4 Perpetual Edition (zedays.co)
4.8.0`; GUIDs admin/server/session; paths de config (`conf/admin.password`, content, keys,
mediacache); **46 operadores IPTV clientes** vazados (application MBeans); e o primitivo de RCE
`jvmtiAgentLoad` (invocável read-only → RCE root se houver primitivo de escrita de arquivo).
**Correção de falso-positivo:** a versão preliminar deste finding atribuía o "host interno
18.231.132.245 / Secret Hunter Dashboard" à soultv — revisão do network confirmou que o IP no
redirect 'N' do JRMP é o **eco do IP de saída do Tor** do operador (validado em 3 circuitos); o
host `18.231.132.245` era um nó de saída Tor de terceiro, não infraestrutura da soultv.
**Impacto:** disclosure crítico imediato (root/OS/46 clientes/licença) + chain para RCE root
(CVE-2020-9004: cred Manager read-only → ativar JMX unauth + restart → MLet RCE; ou
jvmtiAgentLoad c/ upload). **Recomendação:** alterar `jmxremote.password` default, firewall JMX
8084/8085 (não expor publicamente), rotacionar GUIDs/admin.password, remediar licença.
Detalhes: `evidence/F-005.txt` (reconciliado com `evidence/F-E01.txt`).

### F-007 — Wowza HTTP provider 1935 serve HLS sem auth (LOW)
`video02:1935` (Server: nginx/1.7.5, realm "Wowza Media Systems") serve playlists HLS de VOD
**sem autenticação** para paths do application `vod/sample/*` (`/vod/sample/playlist.m3u8`,
`/manifest.m3u8`, `/chunklist.m3u8`, `/index.m3u8`, `/_definst_/sample/...`, `/mp4:sample/...`,
`/live/ngrp:sample/...`) → 200 OK, enquanto `/`, `/live`, `/vod` (raiz) exigem Digest (401). Foi
possível baixar master playlist → chunklist → segmento `.ts` (954 KB, MPEG-TS válido). O conteúdo
acessível é o **sample/demo default do Wowza** (sample.mp4 512x288), **não mídia real da soultv**
→ severidade Baixa. **Risco latente (Médio):** se aplicações VOD reais (com mídia de
assinantes) herdarem a mesma regra "playlist.m3u8 sem auth no path", conteúdo pago seria
acessível sem cred = bypass de paywall/DRM. **Recomendação:** remover application `sample`/`vod`
default; garantir que TODOS os paths HLS exijam auth (Digest ou signed-URL token); aplicar auth
consistente no HTTP provider. Detalhes + matriz de paths: `evidence/F-007.txt`.

---
*Relatório incremental gerado pelo coordenador `pentest`. Consolidado final
pelo especialista `report`.*
