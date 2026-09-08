#!/usr/bin/env bash
D=/home/ubuntu/red-team-operator/focusconcursos.com.br/enum
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
rm -f "$D/teste.grupofocus.com.br/ffuf.log"
nohup ffuf -X GET -u "https://teste.grupofocus.com.br/FUZZ" -w "$D/_lib/wl_common.txt" -x "socks5h://127.0.0.1:9050" -t 3 -p 0.2 -H "User-Agent: $UA" -mc all -ac -of json -o "$D/teste.grupofocus.com.br/ffuf_common.json" > "$D/teste.grupofocus.com.br/ffuf.log" 2>&1 &
echo "relaunched pid $!"
