# GitHub Scan — org fernandapessoa (19 repos)

## Trufflehog + Gitleaks
- **1 unverified result**: SQLServer connection string em `RestAPI-Events-Menagment/appsettings.json`
  - `server=localhost;database=salesapidb;user=root;password=1234`
  - Connection refused (não é cred real de produção — repo acadêmico .NET)
- **0 verified secrets**

## Connection strings encontradas (manual grep)
- `RestAPI-Events-Menagment/appsettings.json`: localhost MySQL root/1234 (acadêmico)

## Padrão de senha fraca observado
- A desenvolvedora usa `1234` como senha de root MySQL em projetos acadêmicos
- Pode indicar padrão de senha fraca em infra de produção — candidato a cred-stuffing
- Reutilizar `1234`, `fernandapessoa`, `fernanda` como senhas em painéis (cPanel/WHM/FTP/SSH)

## Emails da dev (já coletados em OSINT)
- fernaandapessoa@outlook.com (principal)
- dener.fernandes.oliveira@gmail.com
- emerson.o@ufms.br
- ronald.f@ufms.br
