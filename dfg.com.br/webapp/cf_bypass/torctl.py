#!/usr/bin/env python3
import socket, sys, hashlib, hmac, secrets, binascii
CK='/run/tor/control.authcookie'
def recv(s):
  return s.recv(8192).decode(errors='replace')
def send(s, line):
  s.send((line+'\r\n').encode()); return recv(s)
def main():
  cmd=sys.argv[1] if len(sys.argv)>1 else 'NEWNYM'
  arg=sys.argv[2] if len(sys.argv)>2 else ''
  s=socket.socket(); s.settimeout(8); s.connect(('127.0.0.1',9051))
  send(s,'PROTOCOLINFO 1')
  cookie=open(CK,'rb').read()
  cnonce=secrets.token_bytes(32)
  r=send(s,'AUTHCHALLENGE SAFECOOKIE '+binascii.hexlify(cnonce).decode())
  snonce_hex=''
  for tok in r.split():
    if tok.startswith('SERVERNONCE='): snonce_hex=tok.split('=',1)[1]
  snonce=binascii.unhexlify(snonce_hex)
  chash=hmac.new(cookie, b'Tor safe cookie authentication'+cnonce+snonce, hashlib.sha256).hexdigest()
  ar=send(s,'AUTHENTICATE '+chash)
  if '250' not in ar: print('AUTH FAIL:', ar); sys.exit(1)
  if cmd=='SIGNAL':
    print(send(s, f'SIGNAL {arg}'))
  elif cmd=='GETINFO':
    print(send(s, f'GETINFO {arg}'))
  print(send(s,'QUIT'))
main()
