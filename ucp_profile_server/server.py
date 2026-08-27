import http.server, json, os
PROFILE = '/tmp/ucp_agent_profile.json'
class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        with open(PROFILE,'rb') as f: body=f.read()
        self.send_response(200)
        self.send_header('Content-Type','application/json')
        self.send_header('Cache-Control','public, max-age=300')
        self.send_header('Access-Control-Allow-Origin','*')
        self.end_headers()
        self.wfile.write(body)
    def log_message(self,*a): pass
http.server.HTTPServer(('127.0.0.1',8731),H).serve_forever()
