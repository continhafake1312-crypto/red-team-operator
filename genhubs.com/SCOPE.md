# SCOPE — genhubs.com

## Alvo
- **Domínio principal**: `genhubs.com`
- **URL base**: `https://genhubs.com`
- **Tipo**: Pentest externo black-box (Web/API)
- **Autorização**: Assumida conforme §13 — autorização ampla para testes de intrusão não-destrutivos dentro deste domínio e subdomínios associados.

## Escopo
- `*.genhubs.com` — todos os subdomínios
- Aplicações web, APIs, infraestrutura exposta
- Serviços de rede (DNS, SMTP, SSH, FTP, etc.)
- Cloud assets (S3/buckets, CDN, DNS)

## Fora de Escopo
- **Ataques de negação de serviço (DoS/DDoS)** — proibido
- **Engenharia social** — fora do escopo a menos que autorizado explicitamente
- **Modificação/destruição de dados** — exploração não-destrutiva apenas
- **Ataques físicos** — não aplicável

## Regras de Engajamento
- **Janela de teste**: Contínua enquanto o engagement estiver ativo
- **Rate limiting**: Respeitar servidores, evitar degradação
- **OPSEC**: Todo tráfego via Tor/proxychains4
- **Dados**: Se PII for encontrada, documentar mas não exfiltrar para serviços externos
- **Sync**: Git commit+push a cada finding ou fase concluída

## Objetivos de Alto Valor (§7)
1. Acesso interno/foothold na infraestrutura
2. Acesso administrativo (painéis admin, RCE)
3. Acesso financeiro (pagamentos, transações, assinaturas)
4. Acesso a dados/PII (usuários, clientes, alunos)

## Metodologia
Engagement seguindo `AGENTS.md` — fases: recon passivo → recon ativo → enumeração → webapp → CVE/exploit → pós-ex → relatório.

Data de início: 2026-08-23