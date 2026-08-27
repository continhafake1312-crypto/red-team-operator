# Cloud Recon Findings — concurseiroprime.com.br
**Date:** 2026-08-27 | **Agent:** cloud | **OPSEC:** Tor/proxychains4, read-only

## Executive Summary

| Surface | Result |
|---|---|
| AWS S3 buckets (30 naming variants) | **NONE exist** — all 404/NoSuchBucket (us-east-1 + sa-east-1) |
| GCP Storage buckets | **Inconclusive via Tor** — Google returns `AccessDenied: not available in your location` (geo-block) |
| Azure Blob | **Inconclusive via Tor** — `*.blob.core.windows.net` returns HTTP 000 (Azure blocks Tor egress) |
| OpenStack Swift / SaveInCloud storage (`cdn.`/`storage-prime`) | Hardened — 403/404 on all probed paths, no directory listing |
| **Container Registry (Docker v2)** | None exposed on registry.concurseiroprime.com.br / origin IPs / Jelastic hosts |
| **Exposed Apache directory listings on origin** | **CONFIRMED — F-CLOUD-01** |

---

## F-CLOUD-01 — Apache Directory Listing Exposed on Laravel Origin (MEDIUM)

**Target:** `http://200.150.200.210` (Host: `prod-prime-matrix.jelastic.saveincloud.net`)
**Severity:** MEDIUM (info disclosure of internal structure + marketing/student assets)
**Auth:** NONE — publicly reachable
**Evidence:** `cloud_storage_paths.txt`, `cloud_storage_deep.txt`

### Exposed directory listings (`Options +Indexes` enabled)
| Path | Content | Notes |
|---|---|---|
| `/uploads/` | `felix_controle_emocional.pdf` (6.8 MB) | Course material PDF — light content leak |
| `/files/` | 9 subdirs: `shares/`, `188565/`, `129001/`, `122821/`, `122819/`, `114358/`, `90531/`, `79233/`, `69152/`, `67173/` | Numeric IDs — likely CMS campaign/event IDs |
| `/files/90531/` | ~50 WhatsApp Image JPEGs (2022-2023) + named banners (AULÃO, CONHECIMENTOS GERAIS, ADVOGADO, AGENTE ADM…) | **WhatsApp images — possible student/teacher photos** (faces, possibly docs) |
| `/files/114358/` | Simulado/SEPLAG/TRT/TSE/BNB banners + WhatsApp Image 2024 | Marketing campaign assets |
| `/files/122819/` | Professor photos (Adriane Fauth, Adriano Monteiro, Airton Moral, Alane Belfort, Augusto Cesar) + ALCE/BB campaign images | Internal team/asset inventory leak |
| `/files/122821/` | TV-Direito-Administrativo-na-Veia.jpg + thumbs | Marketing |
| `/files/67173/` | `grade pc.JPG`, `professores.JPG` | Internal grade/teacher chart |
| `/files/69152/` | `UFC.JPG` | Marketing |
| `/files/79233/` | (empty listing) | |
| `/files/188565/`, `/files/129001/`, `/files/shares/` | WhatsApp images + cursoprime-auloes.jpeg | Recent uploads |
| `/assets/` | `app/`, `demo/`, `snippets/`, `vendors/` — EduStore HTML template (2019) | Static template assets (low value) |
| `/img/` | `logos/{edustore,felix,prime}/`, `team/{2.jpg,3.jpg,kelvyncarbone.jpg}`, `portfolio/01-06`, `about/{casa,cdq,edgarabreu,edu,eqp,fib,gem,site}` | Internal branding/team photos |

### What this reveals
- Confirms `prod-prime-matrix.jelastic.saveincloud.net` is the **Laravel origin** behind Cloudflare
- Server misconfiguration: `Options +Indexes` enabled on multiple web roots
- Numeric `/files/<id>/` folders = CMS-managed media (campaign/event IDs), browsable by anyone
- **WhatsApp Image dumps** in `/files/90531/` (~50 files dated Sep 2022 – Aug 2023) and `/files/114358/` (2024) — these are user/team uploads; if they contain document scans (RG/CPF/receipts) they'd be **PII**. Spot-check of filenames suggests marketing photos, but full content review needed to rule out PII.

### What is NOT exposed
- `.git/` — exists (returns 403, not 404) but **fully protected** (`/.git/HEAD`, `index`, `logs/HEAD`, `refs/heads/*`, `packed-refs` all 403)
- `.env`, `.env.local`, `.env.production` — 404 (not at web root)
- `/storage/logs/laravel.log`, `/artisan`, `/composer.json`, `/package.json` — 404
- `/server-status`, `/server-info`, `/phpinfo.php` — 404
- `/media/`, `/storage/`, `/public/`, `/static/`, `/docs/`, `/backup/`, `/tmp/`, `/logs/`, `/wp-content/uploads/`, `/app/uploads/`, `/images/`, `/videos/`, `/pdf/`, `/aulas/`, `/mp3/` — all **301 redirect** back to hostname (mod_dir trailing-slash rule → not real accessible dirs). Laravel `/storage/*` paths also 301 → not the Laravel `storage/app/public` symlink.
- `/web.config` (IIS rewrite rules) — **200 exposed** (minor info leak, confirms stack mix)

### Remediation (for report)
- Disable `Options +Indexes` globally in Apache vhost for `prod-prime-matrix`
- Add `<Directory>` blocks denying `/uploads/`, `/files/`, `/assets/`, `/img/` direct access, or move to private storage with signed URLs
- Restrict origin `200.150.200.210` to Cloudflare IPs only (currently world-reachable)

---

## F-CLOUD-02 — Storage Origin (`cdn.` / `storage-prime`) Hardened (INFO)

`cdn.concurseiroprime.com.br` (200.150.203.70 = `storage-prime.jelastic.saveincloud.net`):
- Root `/` → 403, all common paths → 404, `/.env`/`/pdf`/`/aulas` → 403 (rule-protected)
- No directory listing exposed. Properly configured as media storage origin.
- NOT a public S3/Azure/GCP bucket — it is a Jelastic PaaS Apache vhost acting as media origin.

---

## Other Cloud Surfaces

- **IAM keys:** None surfaced in this phase. Repass to `osint` agent — if AWS/Azure keys appear in GitHub commits/gists, validate with `aws sts get-caller-identity` (read-only) via the `cloud` agent.
- **Container Registry:** No registry exposed. `200.150.203.70:443`/`200.150.200.210:443` returned HTTP 400 (Apache, not registry). `prod-prime-matrix.jelastic.saveincloud.net:443/v2/_catalog` → 404. Jelastic typically uses private registry on platform-managed port (not exposed to web).

---

## Limitations / Repass

1. **GCP Storage** — geo-blocked via Tor ("not available in your location"). Coordinator may re-test from a Brazil-located non-Tor egress if needed, OR accept that GCP is unlikely infra (target uses SaveInCloud/Jelastic Brazilian PaaS, not GCP).
2. **Azure Blob** — Azure edge blocks Tor egress (HTTP 000). Same recommendation. Given the stack (Laravel on Jelastic + Cloudflare), Azure is unlikely.
3. **Bucket name guessing** — only naming patterns from scope were tested. If `osint` finds hardcoded bucket URLs in JS/source, re-test those exact names.

---

## Files Produced
- `cloud_s3_buckets.txt` — 30 AWS S3 bucket tests (all 404)
- `cloud_azure_blob.txt` — Azure tests (inconclusive via Tor)
- `cloud_gcp.txt` — GCP tests (geo-blocked)
- `cloud_storage_paths.txt` — path probes on cdn/origin/matrix
- `cloud_storage_deep.txt` — deep enumeration of exposed listings + git/storage probes
- `cloud_findings.md` — this consolidation
