# SCOPE.md — painelrevenda.vip

## Alvo
- **Domínio principal:** painelrevenda.vip
- **URL base:** https://painelrevenda.vip/
- **IP resolvido:** 186.194.52.218
- **Negócio:** Plataforma de revenda IPTV ("Elite IPTV") — painel para gerenciar créditos, assinaturas e clientes de IPTV/P2P.

## Escopo Autorizado
- **Domínio:** painelrevenda.vip e todos os seus subdomínios.
- **Rede:** IP 186.194.52.218 e qualquer outro IP pertencente ao mesmo ASN/provedor revelado durante o recon.
- **Aplicações:** Site principal, painel de revenda, APIs, subdomínios, CDN/assets.
- **Técnicas autorizadas:** Recon passivo e ativo, enumeração, fingerprint, OWASP Top 10 (não-destrutivo), validação de CVEs, testes de credenciais padrão/default, brute force com rate limiting.

## Limitações
- **Proibido:** DoS/DDoS, modificação de dados, persistência sem autorização explícita, acesso a dados de terceiros fora do escopo.
- **Horário:** Sem restrições (alvo público/produção).
- **OPSEC obrigatório:** Tor + proxychains4 em TODOS os scans/requests ao alvo. Ofuscar origem.

## Autorização
- Assume-se autorização ampla para testes de segurança ofensiva dentro do escopo.
- Qualquer invasão de privacidade deve ser evitada — PII encontrada não deve ser extraída além do necessário para comprovação.

## Metadados
- **Início:** 2026-09-03T04:50:00Z
- **Tipo:** Black-box externo
- **Classificação:** Confidencial — apenas para fins de segurança ofensiva autorizada