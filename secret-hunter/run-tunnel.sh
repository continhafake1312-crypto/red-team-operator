#!/usr/bin/env bash
# Secret Hunter — túnel serveo.net 24/7 (auto-reconexão via systemd)
ssh -o StrictHostKeyChecking=no \
    -o UserKnownHostsFile=/dev/null \
    -o ServerAliveInterval=30 \
    -o ServerAliveCountMax=3 \
    -o ExitOnForwardFailure=yes \
    -R 80:localhost:8080 serveo.net > /tmp/serveo.log 2>&1 &
SSH_PID=$!
# Aguarda e salva a URL
for i in $(seq 1 40); do
    URL=$(grep -oE "https://[a-zA-Z0-9.-]+" /tmp/serveo.log | head -1)
    if [ -n "$URL" ]; then
        echo "$URL" > /home/ubuntu/secret-hunter/data/tunnel_url.txt
        break
    fi
    sleep 1
done
# Mantém até o ssh morrer (systemd reinicia)
wait $SSH_PID
