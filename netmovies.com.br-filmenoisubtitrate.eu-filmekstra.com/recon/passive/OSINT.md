# OSINT Consolidado - Recon Passivo
## Data: 2026-08-20

---

## T1: netmovies.com.br — NetMovies Entretenimento S.A.

### Empresa Identificada
- **Razao Social**: NetMovies Entretenimento S.A.
- **Nome Fantasia**: NetMovies
- **Segmento**: Streaming AVOD (Advertising Video on Demand), anteriormente locadora online de DVDs (desde 2006)
- **Fundacao**: 2006 (primeiro dominio registrado/site no ar desde 2006)
- **Sede**: Brasil (infra AWS sa-east-1 + Azure CDN)
- **LinkedIn**: https://br.linkedin.com/company/netmovies-entretenimento-s-a (1.647 seguidores)
- **Facebook**: https://www.facebook.com/netmovies/
- **Glassdoor**: https://www.glassdoor.com.br/Visao-geral/Trabalhar-na-NetMovies-EI_IE2632473.13,22.htm

### Infraestrutura
- **DNS**: AWS Route53 (ns-*.awsdns-*.co.uk/.com/.org/.net)
- **Hosting**: AWS EC2 (sa-east-1: 18.229.14.249, 56.126.19.14) + Azure CDN/Front Door
- **CDN**: Azure Edge (ottvssite-netmovies.azureedge.net, star-azureedge-prod.trafficmanager.net)
- **Email**: Microsoft 365 (netmovies-com-br.mail.protection.outlook.com) + Zendesk
- **Subdominios**: www.netmovies.com.br, release.netmovies.com.br, prod.netmovies.com.br

### Emails Encontrados
- Nenhum email direto de funcionarios encontrado em fontes abertas
- **Dominio de email**: @netmovies.com.br (Exchange Online)
- **Suporte**: Zendesk (confirmado via SPF)
- **Padrao provavel**: nome@netmovies.com.br, contato@netmovies.com.br, suporte@netmovies.com.br

### Pessoas Mapeadas
- Nao foi possivel extrair nomes especificos de funcionarios via fontes abertas
- LinkedIn da empresa: https://br.linkedin.com/company/netmovies-entretenimento-s-a (possivel extrair funcionarios com login)

### Breaches
- Nenhum vazamento publico conhecido encontrado
- Risco: base de usuarios desde 2006, possiveis vazamentos antigos

### GitHub
- Nenhum repositorio oficial da empresa encontrado
- Nenhum secret/token exposto encontrado

### Candidates para Cred-Stuffing
- contato@netmovies.com.br
- suporte@netmovies.com.br
- admin@netmovies.com.br
- sac@netmovies.com.br
- comercial@netmovies.com.br
- juridico@netmovies.com.br

---

## T2: filmenoisubtitrate.eu — Site de Legendas Romeno (Inativo)

### Entidade Identificada
- **Nome historico**: FilmeNoiSubtitrate.eu ("Filmes Novos Legendados" - Romeno)
- **Periodo**: 2014-2019 (Wayback snapshots)
- **Plataforma**: WordPress (tema Keremiya v4)
- **Idioma**: Romeno (categorias: Actiune, Horror, Comedie, Drama, Aventura, Animate, etc.)
- **Status atual**: 403 Cloudflare
- **Registrante**: Immaterialism Limited (San Marino / UK Company 15738452)
- **Contato tecnico**: tld-eurid@immateriali.sm

### Associacoes
- **Radio Excentric** (Romania, Galati): Site de radio online vinculado ao dominio
- **Facebook Radio Excentric**: https://www.facebook.com/Excentricro/
- **Radio Excentric IP**: 188.165.152.43 (OVH, Franca)
- **Radio Excentric Company**: https://www.firmadeaur.ro/company/radio-excentric-romania-4485104

### Emails Encontrados
- tld-eurid@immateriali.sm (Immaterialism - EURid registrar contact)

### Pessoas Mapeadas
- Nao foi possivel extrair nomes especificos do WordPress historico
- Radio Excentric tem equipe listada em https://radioexcentric.com/echipa-noastra (paginacao JS)

### Breaches
- Nenhum vazamento especifico encontrado
- Risco: WordPress antigo (pre-2015) com plugins vulneraveis e xmlrpc.php ativo

### GitHub
- Nenhum resultado encontrado

### Candidates para Cred-Stuffing
- admin@filmenoisubtitrate.eu
- webmaster@filmenoisubtitrate.eu
- info@filmenoisubtitrate.eu
- contato@filmenoisubtitrate.eu

---

## T3: filmekstra.com — Dominio Novo (Potencial Malicioso)

### Entidade Identificada
- **Nome**: NAO IDENTIFICADO (protegido por privacidade WHOIS)
- **Criacao**: 2026-08-05 (APENAS 15 DIAS)
- **Registrante**: KN (Saint Kitts and Nevis) via Tucows Privacy
- **Registrar**: Tucows Domains Inc.
- **Infra**: Cloudflare (aryanna.ns.cloudflare.com, benedict.ns.cloudflare.com)

### Presenca Online
- **Zero presenca** em redes sociais, midia, ou repositorios
- **Sem snapshot** no Wayback Machine
- **Sem MX, TXT, CNAME** alem do padrao Cloudflare
- Site retorna **403** (Cloudflare WAF block)

### Analise
- Dominio extremamente recente (15 dias)
- Nome "filmekstra" sugere "film extra" (variacao turca/indonesia para "filme extra")
- Sem infraestrutura visivel alem do Cloudflare
- Possivel: dominio estacionado, redirecionamento, ou preparado para ataque de phishing

### Emails Encontrados
- Nenhum email encontrado (WHOIS redacted, sem MX)

### Pessoas Mapeadas
- Nenhuma pessoa identificada

### Breaches
- Nenhum vazamento (dominio muito novo)

### GitHub
- Nenhum resultado

### Candidates para Cred-Stuffing
- admin@filmekstra.com
- info@filmekstra.com
- webmaster@filmekstra.com
- contact@filmekstra.com

---

## Proximos Passos Recomendados

1. **Cred-Stuffing (T1 - netmovies.com.br)**: Testar emails candidatos contra paineis de login:
   - https://www.netmovies.com.br/login ou similar
   - Painel Zendesk (https://netmovies.zendesk.com)
   - Office 365 (https://login.microsoftonline.com)

2. **Radios/Conexoes (T2)**: Explorar Radio Excentric como vetor de engenharia social
   - Contatar via formulario do site radioexcentric.com
   - Verificar equipe listada na pagina "Echipa Noastra"

3. **Monitoramento (T3)**: Deixar em watch passivo — se o filmekstra.com for ativado, pode ser phishing ou malware
   - DNS monitor (mudancas nos registros)
   - Certificado SSL (Censys/Shodan)

4. **Aprofundamento OSINT T1**:
   - Buscar CNPJ via https://www.receitaws.com.br (requer numero do CNPJ)
   - Extrair lista de funcionarios do LinkedIn (requer conta)
   - Procurar documentos fiscais (NF-e) que contenham NetMovies como tomador

5. **Verificacao de Breaches**:
   - Obter HIBP API key para verificacao massiva de emails
   - Buscar em telegram channels brasileiros (X1Group, ShadowLocker, etc.)

---

*Fim do relatorio OSINT consolidado.*