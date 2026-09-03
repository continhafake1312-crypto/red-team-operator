# F-002 ProFTPD — Login Anônimo Habilitado, CVE-2015-3306 NÃO Aplicável

**Alvo:** painelrevenda.vip (186.194.52.218)
**Severidade:** Média
**Timestamp:** 2026-09-03T06:31:00Z
**CVE:** CVE-2015-3306 (mod_copy RCE) — **NÃO APLICÁVEL**

## Reprodução

```bash
# Banner grab
$ echo "" | proxychains4 nc -w 5 186.194.52.218 21
220 ProFTPD Server ready.

# Login anônimo funciona
$ USER anonymous
331 Password required for anonymous
$ PASS anonymous@test.com
230 OK Login successful

# Comandos HELP
214-The following commands are recognized (* =>'s unimplemented):
 CWD     XCWD    CDUP    XCUP    SMNT*   QUIT    PORT    PASV    
 EPRT    EPSV    ALLO    RNFR    RNTO    DELE    MDTM    RMD     
 XRMD    MKD     XMKD    PWD     XPWD    SIZE    SYST    HELP    
 NOOP    FEAT    OPTS    HOST    CLNT    AUTH    CCC*    CONF*   
 ENC*    MIC*    PBSZ    PROT    TYPE    STRU    MODE    RETR    
 STOR    STOU    APPE    REST    ABOR    RANG    USER    PASS    
 ACCT*   REIN*   LIST    NLST    STAT    SITE    MLSD    MLST    
214 Direct comments to root@186.194.52.218

# FEAT
211-Features:
 AUTH TLS, CCC, CLNT, CSID, EPRT, EPSV, HOST, LANG en-US,
 MDTM, MFF, MFMT, MLST, PBSZ, PROT, RANG STREAM, REST STREAM,
 SIZE, SSCN, TVFS, UTF8
211 End

# SITE HELP — mod_copy NÃO listado
214-The following SITE commands are recognized:
 RATIO -- show all ratios in effect
 HELP
 CHGRP
 CHMOD

# Teste de mod_copy — CPFR/CPTO NÃO RECONHECIDOS
$ SITE CPFR /etc/passwd
500 'SITE CPFR' not understood
```

## Interpretação

- ProFTPD com login anônimo habilitado — qualquer pessoa pode fazer download (dependendo da configuração do diretório)
- Módulo `mod_copy` **não está instalado** — CVE-2015-3306 (RCE via CPFR/CPTO) não aplicável
- Suporte a AUTH TLS (FTPS) disponível
- Versão exata não foi exposta no banner (configuração padrão do ProFTPD)

## Impacto

- **Anônimo**: Risco de enumeração de arquivos e diretórios acessíveis publicamente
- **mod_copy**: CVE-2015-3306 NÃO aplicável
- **CVE-2023-51766**: Não testável sem versão exata (requer 1.3.8+) — improvável em instalação cPanel

## Recomendação

1. Desabilitar login anônimo se não for necessário
2. Restringir acesso FTP apenas a IPs confiáveis ou via SFTP/SSH
3. Manter ProFTPD atualizado

## Próximo passo

Se credenciais de usuário do servidor forem obtidas, tentar login FTP para acessar arquivos do site/dados do painel.