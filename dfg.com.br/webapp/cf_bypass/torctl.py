#!/usr/bin/env python3
import socket, sys, hashlib, hmac, secrets, binascii
CK='/run/tor/control.authcookie'
def send(s, line):
  s.send((line+'\r\n').encode())
  return s.recv(8192).decode(errors='replace')
def main():
  cmd=sys.argv[1] if len(sys.argv)>1 else 'NEWNYM'
  s=socket.socket(); s.connect(('127.0.0.1',9051))
  r=send(s,'PROTOCOLINFO 1'); 
  cookie=open(CK,'rb').read()
  nonce=secrets.token_bytes(16)
  h=hmac.new(cookie, b'HMAC-CONTROL:\x00'+nonce, hashlib.sha256).hexdigest()
  send(s,f'AUTHCHALLENGE SAFECOOKIE {binascii.hexlify(nonce).decode()}')
  send(s,f'AUTHENTICATE {h}')
  print(send(s, cmd))
  print(send(s,'QUIT'))
main()
