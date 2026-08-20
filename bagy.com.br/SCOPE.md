# SCOPE — bagy.com.br

## Alvo Principal
- **Domínio:** www.bagy.com.br (e bagy.com.br)
- **URL:** https://www.bagy.com.br/
- **Empresa:** BAGY SOLUÇÕES DE COMÉRCIO DIGITAL LTDA. (CNPJ: 27.357.470/0001-63)
- **Setor:** E-commerce SaaS (plataforma de criação de lojas virtuais)

## Escopo de Testes
### Incluso (autorizado §13)
- www.bagy.com.br e todos os subdomínios descobertos (*.bagy.com.br)
- bagy.com.br (domínio raiz)
- Aplicação web principal (Webflow)
- APIs públicas/privadas descobertas
- Subdomínios: basedeconhecimento.bagy.com.br (conhecido), etc.
- CDN: Cloudflare + Azion Edge (bypass permitido)
- Apps mobile: com.converta.bagy (Android), Bagy Painel de Controle (iOS)
- Assets: cdn.prod.website-files.com (Webflow CDN)

### Excluso
- Ataques de negação de serviço (DoS/DDoS)
- Engenharia social contra funcionários/clientes
- Ataques físicos
- Manipulação não-autorizada de dados de clientes reais

## Regras de Engajamento
- **Abordagem:** Black-box (sem credenciais prévias)
- **Janela:** Contínua até exaustão de vetores ou ordem de parada
- **Stealth:** Rate limiting, User-Agent rotativo, Tor via proxychains4
- **2Captcha:** Chave fornecida para bypass de Cloudflare
- **Destrutividade:** Exploração não-destrutiva优先al; PoCs validam sem corromper dados
- **Sync:** Git commit+push a cada finding significativo

## Objetivos de Alto Valor (§7)
1. **Acesso interno** — foothold em infra da Bagy
2. **Acesso administrativo** — painel admin da plataforma e-commerce
3. **Acesso financeiro** — transações, planos, pagamentos
4. **Dados/PII** — dados de clientes (lojistas), credenciais

## Contatos e Redes Identificados
- Email: suporte@bagy.com.br
- Telefone: +55 31 98869-2222
- WhatsApp: +55 31 99745-9520
- LinkedIn: /company/bagy
- Instagram: @bagy.com.br
- Facebook: /bagy.com.br
- YouTube: UCV_nTXrfQ7Cn_JVfFLp-pTQ
- ReclameAqui: /empresa/bagy
- Base de Conhecimento: https://basedeconhecimento.bagy.com.br/hc/pt-br
- Repositórios Google: com.converta.bagy (Play Store)

---
*Última atualização: 2026-08-20T05:35:00Z*