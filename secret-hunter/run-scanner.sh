#!/bin/bash
# Secret Hunter — Scanner wrapper 24/7
# O watchdog interno (threading.Timer) cuida dos travamentos.
# Este wrapper só reinicia se o processo morrer por qualquer motivo.
cd /home/ubuntu/secret-hunter
PY=/home/ubuntu/secret-hunter/venv/bin/python3
LOG=/home/ubuntu/secret-hunter/data/scan.log

while true; do
    echo "$(date '+%H:%M:%S') [WRAPPER] Iniciando scanner..." >> "$LOG"
    $PY -u main.py scan --free >> "$LOG" 2>&1
    EXIT_CODE=$?
    echo "$(date '+%H:%M:%S') [WRAPPER] Scanner terminou (exit=$EXIT_CODE). Reiniciando em 5s..." >> "$LOG"
    sleep 5
done
