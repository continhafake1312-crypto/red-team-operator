# F-008 Face Recognition — KYC Upload Endpoints Exposed (307 Redirect)
**Alvo:** `face-recognition1-5.ice.bet.br`
**Severidade:** Média
**Timestamp:** 2026-09-03T06:54:00Z

## Reprodução
```bash
# Base — HTTP 200 (KYC app)
curl -s https://face-recognition1.ice.bet.br/           # 200 - 94KB
curl -s https://face-recognition2.ice.bet.br/           # 200 - 94KB

# Upload endpoints — 307 redirect to /
curl -s -D- https://face-recognition1.ice.bet.br/upload  # 307 -> /
curl -s -D- https://face-recognition1.ice.bet.br/verify  # 307 -> /
curl -s -D- https://face-recognition1.ice.bet.br/capture # 307 -> /
curl -s -D- https://face-recognition1.ice.bet.br/selfie  # 307 -> /
curl -s -D- https://face-recognition1.ice.bet.br/documents # 307 -> /
```

### Via CloudFront
```
x-cache: Miss from cloudfront
via: 1.1 f5708e3c67cbe528064fe712cfd6d6e2.cloudfront.net (CloudFront)
x-amz-cf-pop: GRU1-P5
x-amz-cf-id: CXmUXNsecc3FYSrah9fjJcdSE3tELpgcwr6hdNIct7b2_SIGy5z5kQ==
```

### Conteúdo HTML referente a upload
Keywords encontradas no HTML: `document`, `form`, `file`, `upload`, `KYC`

## Interpretação
- **Face Recognition é um app KYC (Know Your Customer)** para verificação de identidade
- Endpoints `/upload`, `/verify`, `/capture`, `/selfie`, `/documents` existem mas **redirecionam para `/`** (requerem autenticação)
- Aplicação roda via **CloudFront** (AWS), mesmo padrão do admin
- Próximos passos: fuzzing mais profundo para encontrar endpoints POST, verificar se upload aceita arquivos arbitrários

## Impacto
- Se um endpoint de upload for descoberto, pode permitir upload de documentos falsos, malware ou bypass de KYC
- Dados de KYC são extremamente sensíveis (fotos de documentos, selfies, biometria)

## Próximo passo
- Fuzz de endpoints POST (upload de arquivos)
- Testar bypass de autenticação via CloudFront (path traversal, headers)
- Verificar se há rate limit em tentativas de upload