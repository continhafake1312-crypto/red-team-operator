#!/usr/bin/env python3
from jmxquery import JMXConnection, JMXQuery
import sys
urls = [
    "service:jmx:rmi:///jndi/rmi://160.202.130.243:8084/jmxrmi",
    "service:jmx:rmi://160.202.130.243:8084/jndi/rmi://160.202.130.243:8084/jmxrmi",
]
for url in urls:
    print(f"=== Trying unauth: {url} ===")
    try:
        # env without credentials
        conn = JMXConnection(url, [({}, {})])
        queries = [JMXQuery("*:*")]
        metrics = conn.query(queries)
        cnt=0
        for m in metrics:
            cnt+=1
            if cnt<=5: print("  ", m)
        print(f"  TOTAL MBeans: {cnt}")
        print("  UNAUTH JMX ACCESS CONFIRMED")
        break
    except Exception as e:
        print(f"  ERR: {type(e).__name__}: {e}")
