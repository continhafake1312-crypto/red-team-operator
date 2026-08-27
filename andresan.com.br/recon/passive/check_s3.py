import subprocess,sys
candidates=[l.strip() for l in open('bucket_name_candidates.txt') if l.strip()]
hits=[]
for b in candidates:
    # S3 region-generic
    r=subprocess.run(['proxychains4','-q','curl','-s','-o','/dev/null','-w','%{http_code}','--max-time','12',f'https://{b}.s3.amazonaws.com'],capture_output=True,text=True)
    code=r.stdout.strip()
    if code and code not in ('000','404'):
        hits.append(f"S3 {b} -> HTTP {code}")
    # S3 us-east-1 path style (alguns buckets só respondem assim)
print('\n'.join(hits) if hits else 'no hits')
open('cloud_buckets.txt','w').write('\n'.join(hits))
