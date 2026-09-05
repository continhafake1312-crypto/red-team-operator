# SCOPE — Engagement de Pentest

## Metadados
- **Alvo primário:** `https://seguranca.sinesp.gov.br`
- **Domínio raiz (recon):** `sinesp.gov.br`
- **Engagement dir:** `seguranca.sinesp.gov.br/`
- **Operador:** Red Team Operator (autônomo)
- **Início:** 2026-09-05T15:58:32Z (UTC)
- **Idioma:** pt-BR

## Contexto do alvo
SINESP = **Sistema Nacional de Informações de Segurança Pública** (governo
federal brasileiro — MJSP / Senasp). `seguranca.sinesp.gov.br` é
historicamente o portal **SINESP Cidadão**: denúncias, consulta a placas /
veículos, pessoas desaparecidas, mandados, etc. Stack tipicamente Java/Tomcat
ou similar (gov.br). Backend consome/dispõe APIs; pode haver integração com
sistemas federais (SERPRO, gov.br Login, BI).

## Escopo autorizado
Assume autorização ampla (§13). Em escopo:
- `*.sinesp.gov.br` (subdomínios do apex `sinesp.gov.br`)
- IPs de origem real descobertos via recon passivo/ativo
- Serviços expostos (HTTP/HTTPS e não-web) nesses hosts
- APIs, painéis, endpoints web

## Fora de escopo / regras de engajamento
- **Não-Destrutivo**: nenhum DoS, nenhuma modificação de dados, nenhuma
  persistência sem ordem explícita. Read-only em exploração.
- **OPSEC (§3)**: Tor + proxychains4 em TODOS os scans/requests ao alvo.
  Rotação de IP via NEWNYM se bloqueado. 2Captcha para bypass Cloudflare.
  UA rotativo, rate limiting. IP real do operador NUNCA toca o alvo.
- **Secretos fora do repo (§3)**: creds/keys/tokens em arquivos chmod 600 em
  `/tmp/opencode/` ou `~/.config/opencode/`, nunca no repo.

## Credenciais candidatas (NÃO no repo)
- Candidato recebido do operador: armazenado em
  `/tmp/opencode/sinesp_cred_candidate.txt` (chmod 600).
  Será testado contra login do SINESP durante a fase de exploit/webapp.

## Objetivos de alto valor (§7)
- Acesso a dados de cidadãos (PII: CPF, denúncias, placas, desaparecidos)
- Bypass de autenticação / cred default em painel admin
- API BOLA/IDOR expondo registros de cidadãos
- Vazamento de chaves/tokens em JS ou configs
- SSRF para sistemas federais internos (SERPRO, rede governamental)
- RCE não-autenticado em stack exposta

## Ferramentas principais previstas
subfinder, amass, assetfinder, crt.sh, dnsx, httpx, whatweb, wappalyzer,
waybackurls, theHarvester, ffuf, feroxbuster, gobuster, SecLists, nmap,
rustscan/masscan, wafw00f, nuclei, sqlmap, wpscan, searchsploit, gitleaks,
trufflehog, curl, httpx, katana/gospider.

## Regras de sincronização (§14)
Auto-sync git a cada finding, cred, acesso ou conclusão de fase.
