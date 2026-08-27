import urllib.request, ssl, threading, sys, time
ctx=ssl.create_default_context(); ctx.check_hostname=False; ctx.verify_mode=ssl.CERT_NONE
names=open('/tmp/opencode/soultv_bucket_names.txt').read().split()
out=open('/home/ubuntu/engagement/soultv.com.br/recon/passive/cloud_buckets.txt','w',buffering=1)
lock=threading.Lock()
hits=[]
def check(provider, name, url):
    try:
        req=urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0'})
        r=urllib.request.urlopen(req,timeout=8,context=ctx)
        body=r.read(1500).decode('utf-8','replace')
        if '<ListBucketResult' in body or '<EnumerationResult' in body or '<Blobs' in body or ('InvalidQueryParameterValue' not in body and r.status==200 and len(body)>50):
            with lock:
                hits.append((provider,name,r.status))
                out.write(f'HIT {provider} {name} {r.status} | {body[:150].replace(chr(10)," ")}\n'); out.flush()
    except urllib.error.HTTPError as e:
        # 403 = exists but private; 404 = not exists; 301 redirect
        if e.code==403:
            with lock: out.write(f'PRIVATE {provider} {name} 403\n'); out.flush()
    except Exception:
        pass
threads=[]
providers=[
    ('S3', lambda n: f"https://{n}.s3.amazonaws.com/"),
    ('S3-region', lambda n: f"https://s3.amazonaws.com/{n}/"),
    ('GCP', lambda n: f"https://storage.googleapis.com/{n}/"),
    ('Azure', lambda n: f"https://soultv.blob.core.windows.net/{n}?restype=container&comp=list"),
    ('Azure2', lambda n: f"https://{n}.blob.core.windows.net/?comp=list"),
]
out.write(f"=== Checking {len(names)} names x {len(providers)} providers ===\n"); out.flush()
for n in names:
    for p,fn in providers:
        url=fn(n)
        t=threading.Thread(target=check,args=(p,n,url)); t.start(); threads.append(t)
        if len(threads)>=80:
            for t in threads: t.join(timeout=10)
            threads=[t for t in threads if t.is_alive()]
for t in threads: t.join(timeout=15)
out.write(f"\n=== Summary: {len(hits)} public hits ===\n")
for h in hits: out.write(f'PUBLIC {h[0]} {h[1]} {h[2]}\n')
out.write("DONE\n"); out.close()
print("done, hits:",len(hits))
