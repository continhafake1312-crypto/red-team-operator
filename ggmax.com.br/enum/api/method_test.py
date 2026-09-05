#!/usr/bin/env python3
import sys, json
sys.path.insert(0, '/home/ubuntu/red-team-operator/ggmax.com.br/enum/api')
from api import req
endpoints = ['/api/announcements','/api/orders','/api/accounts','/api/accounts/search',
             '/api/categories','/api/reviews','/api/user-order-reviews','/api/tickets',
             '/api/tickets/categories','/api/faq','/api/help/categories','/api/search',
             '/api/blog','/api/blog/featured','/api/coupons','/api/coupons/validate',
             '/api/cart','/api/wallet','/api/notifications','/api/messages','/api/wishlist',
             '/api/auth','/api/register','/api/me','/api/sanctum/csrf-cookie','/api/sanctum',
             '/api/users/v2/inspect/test/order-reviews']
results = []
for ep in endpoints:
    for m in ['POST','PUT','DELETE','PATCH']:
        body = json.dumps({'q':'test','id':1,'test':True}) if m in ('POST','PUT','PATCH') else None
        r = req(ep, m, body, 'application/json')
        if r['status'] != 404 and not (r['status']==403 and r.get('size',0)>5000):
            line = f'{m:6s} {ep:50s} => {r["status"]} ({r.get("size",0)}B): {r.get("body","")[:140]}'
            print(line)
            results.append(line)
print('---done---')
with open('/tmp/method_test.txt','w') as fh:
    fh.write('\n'.join(results))
