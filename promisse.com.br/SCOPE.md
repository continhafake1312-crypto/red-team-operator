# SCOPE — promisse.com.br

## Alvo Principal
- **Domínio**: promisse.com.br
- **URL**: https://promisse.com.br
- **Tipo**: Web Application Black-Box Externo
- **Data de início**: 2026-08-20

## Autorização
Escopo amplo de teste de intrusão externo. Assumimos autorização formal
do proprietário para execução de técnicas de pentest padrão (scans,
enumeração, exploração não-destrutiva) contra todos os subdomínios e
endpoints pertencentes ao domínio alvo.

## Regras de Engajamento
- ✅ Scan de portas e serviços
- ✅ Enumeração de subdomínios
- ✅ Descoberta de endpoints e diretórios
- ✅ Testes de injeção (SQLi, NoSQLi, SSTI, Command Injection)
- ✅ Testes de autenticação/autorização (IDOR, BOLA, Auth bypass)
- ✅ Testes de SSRF, XSS, Upload, CSRF
- ✅ Testes de JWT, GraphQL, Mass Assignment
- ✅ Fingerprint de versões e CVE research
- ✅ Exploração não-destrutiva de CVEs
- ✅ Testes de default/weak credentials
- ⛔ **Proibido**: DoS/DDoS, ataques destrutivos, modificação de dados,
    exfiltração massiva, engenharia social sem autorização explícita

## Contato de Emergência
- Operador: disponível via chat/issue no repositório

## Período
Início: 2026-08-20
Término: quando todos os vetores forem explorados ou por ordem do operador