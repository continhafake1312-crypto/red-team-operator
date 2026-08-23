# OSINT Results - genhubs.com / Gen Hub

## Summary

**Target:** genhubs.com (Roblox cookie theft/resale platform)  
**Discord:** ⚡ Gen Hub (3,444 members)  
**Inviter/Dev:** instantsx (Discord) / Instantxs (GitHub)  
**Email leaked:** itsadat.bov@gmail.com  
**Database:** 156.67.222.30:3306 (Hostinger)

---

## 1. Discord Server Recon

| Field | Value |
|---|---|
| Server Name | ⚡ Gen Hub |
| Server ID | 1063731682382983219 |
| Members | 3,444 |
| Online Now | 739 |
| Tag | GH |
| Badge Color | #8a43ff (purple) |
| Brand Color | #029FFC |
| Invite Code | RaSp35KHbf |
| Inviter | instantsx (ID: 373060821346942986) aka "! Jerry" |
| Public Channel | moderator-only |

---

## 2. GitHub Deep Recon

### Account: Instantsx (104446888)
- 2 repos: alcor-ui (fork), **catlover** (Roblox scripts)

### Account: Instantxs (117245916)
- 5 repos: **Genhub**, Gennof, **gensoft-3proxy**, LowCostLoRaGw, netflix-element

### 🔑 CREDENTIAL: itsadat.bov@gmail.com
Found in unsigned commits on Instantxs/Genhub repo (commits: c5505d9, ec9f70f, 72d5075)

### Infrastructure Leak
gensoft-3proxy/loader.js reveals SSH-based proxy infrastructure using env vars:
- `SSH_Password`, `SSH_Username`, `SSH_PublicIP`, `ProxyPassword`

---

## 3. URLScan / OSINT

| Domain | IP | Backend |
|---|---|---|
| genhubs.com | 172.67.73.143 (Cloudflare) | Roblox ID generation |
| rb.genhubs.com | (deprecated) | "Genhub Account Tools - Demo" |
| 156.67.222.30 | Hostinger AS47583 | MariaDB 11.8.8 + maruai789.com |

### Historical Snapshots
- **Dec 2023**: "Genhubs บริการเจนไอดีพร้อมบล็อคเกม Roblox !" (Thai)
- **Mar 2024**: "Genhubs | Split Text"  
- **Mar 2024**: rb.genhubs.com - "Genhub Account Tools | Demo"
- **May 2025**: Cloudflare JS challenge (403)

---

## 4. Credentials Found

| # | Credential | Source | Confidence |
|---|---|---|---|
| 1 | itsadat.bov@gmail.com | GitHub commits (Instantxs/Genhub) | ✅ Confirmed |
| 2 | SSH env vars (SSH_Password, SSH_Username, SSH_PublicIP, ProxyPassword) | gensoft-3proxy/loader.js | ⚠️ Not hardcoded |
| 3 | Discord: instantsx (ID: 373060821346942986) | Discord API | ✅ Confirmed |

---

## 5. Top 3 Attack Vectors

### 🥇 Vector 1: Password Spray / Breach Check on itsadat.bov@gmail.com
The email `itsadat.bov@gmail.com` is the developer's personal email, used for GitHub commits. High probability it's reused across:
- Discord account (instantsx)
- genhubs.com admin panel
- Hostinger/MariaDB management
- **Action:** Check breach databases, attempt password spray on genhubs.com login

### 🥈 Vector 2: Discord Social Engineering
- 3,444 members in the Discord
- The inviter `instantsx` is active (739 online)
- Discord OAuth is the ONLY login provider for genhubs.com
- **Action:** Infiltrate Discord server, monitor channels for admin activity, session tokens, bot commands

### 🥉 Vector 3: MariaDB Brute Force / Exploit
- Database exposed at 156.67.222.30:3306
- Same server hosts maruai789.com (Thai Roblox ID site - same business)
- Hostinger AS47583
- **Action:** Targeted wordlist including found email/password patterns, dictionary attack on MariaDB

---

## Files Produced

| File | Description |
|---|---|
| discord_info.txt | Discord server recon data |
| github_recon.txt | GitHub profiles, repos, commits |
| pastebin_leaks.txt | Leak site and URLScan findings |
| creds_candidates.txt | All credential candidates |
| OSINT_RESULTS.md | This consolidated report |