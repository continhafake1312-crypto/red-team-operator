#!/usr/bin/env python3
import sys, socket, struct, time
# Raw RMI protocol probe to detect if JMX RMI registry is unauth
# RMI transport handshake: client sends "JRMI" + version + protocol
host="160.202.130.243"; port=8084
def probe(proto=b'\x4b'):
    s=socket.socket(socket.AF_INET, socket.SOCK_STREAM); s.settimeout(8)
    try:
        s.connect((host,port))
        # RMI handshake: magic "JRMI" + version(2 bytes 0x0002) + protocol byte (0x4b=StreamProtocol,0x4c=SingleOp,0x4d=Multiplex)
        s.sendall(b"JRMI"+b"\x00\x02"+proto)
        data=s.recv(256)
        return data
    except Exception as e:
        return f"ERR: {e}".encode()
    finally:
        s.close()
for p,name in [(b'\x4b','StreamProtocol'),(b'\x4c','SingleOp'),(b'\x4d','Multiplex')]:
    r=probe(p)
    print(f"{name}: {r[:80]!r}")
