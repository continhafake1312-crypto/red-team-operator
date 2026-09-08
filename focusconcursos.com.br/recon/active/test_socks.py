import socket, struct, time

def test(ip, port):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(12)
    try:
        s.connect(("127.0.0.1", 9050))
        s.sendall(b"\x05\x01\x00")
        r = s.recv(2); print("greet:", r.hex())
        req = b"\x05\x01\x00\x01" + socket.inet_aton(ip) + struct.pack(">H", port)
        s.sendall(req)
        r = s.recv(1024); print("resp:", r[:8].hex(), "code", r[1])
    except Exception as e:
        print("ERR", type(e).__name__, e)
    finally:
        s.close()

test("54.86.140.91", 80)
