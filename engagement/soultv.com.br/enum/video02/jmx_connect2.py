#!/usr/bin/env python3
from jmxquery import JMXConnection, JMXQuery
import sys
url = "service:jmx:rmi:///jndi/rmi://160.202.130.243:8084/jmxrmi"
print(f"=== Trying unauth: {url} ===")
try:
    conn = JMXConnection(url)
    metrics = conn.query([JMXQuery("*:*")])
    cnt=0
    for m in metrics:
        cnt+=1
        if cnt<=10: print("  ", m)
    print(f"  TOTAL MBeans: {cnt}")
    print("  >>> UNAUTH JMX ACCESS CONFIRMED <<<")
except Exception as e:
    print(f"  ERR: {type(e).__name__}: {e}")
