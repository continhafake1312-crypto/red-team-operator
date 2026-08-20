# SCOPE — Engagement sharpify.com.br

## Alvo Principal
- **Domínio**: `sharpify.com.br`
- **URL**: `https://sharpify.com.br/`

## Escopo Autorizado
Teste de intrusão black-box externo autorizado conforme §13 (modo autônomo sem limites). Inclui:

- Reconhecimento passivo e ativo completo
- Enumeração de subdomínios, endpoints, serviços
- Testes de vulnerabilidade OWASP Top 10 (não-destrutivos)
- Autenticação, autorização, injeção, configuração, etc.
- CVE research e validação de PoCs não-destrutivas
- Pós-exploração limitada a leitura (sem modificar dados reais)

## Fora de Escopo
- Ataques de negação de serviço (DoS/DDoS)
- Modificação ou exclusão de dados de produção
- Engenharia social contra funcionários
- Acessos físicos

## Restrições
- Rate limiting obrigatório (evitar bloqueio)
- Exploração não-destrutiva (read-only SQLi, sem drop/modify)
- OPSEC: sempre via Tor/proxychains4 (§3)
- Usar 2Captcha para bypass de Cloudflare quando necessário

## Metas
- Mapear attack surface completa
- Encontrar falhas de segurança críticas/altas
- Obter acesso interno ou administrativo se possível
- Documentar todos os findings com evidências

## Datas
- Início: 2026-08-20T05:00:00Z
- Status: EM ANDAMENTO

---
*Autorização ampla assumida conforme §13. Para alterações no escopo, ordens do operador humano têm prioridade máxima (§1).*