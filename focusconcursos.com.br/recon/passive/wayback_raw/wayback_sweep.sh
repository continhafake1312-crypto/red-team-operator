#!/bin/bash
# CDX wayback sweep - main + live subdomains - via Tor
cd /home/ubuntu/red-team-operator/focusconcursos.com.br/recon/passive/wayback_raw || exit 9
PPT="http://127.0.0.1:8118"
UA="Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0"
H="focusconcursos.com.br"
TARGETS="focusconcursos.com.br www.focusconcursos.com.br noticias.focusconcursos.com.br lps.focusconcursos.com.br metodo.focusconcursos.com.br sac.focusconcursos.com.br pagina.focusconcursos.com.br pxa.focusconcursos.com.br link.focusconcursos.com.br www3.focusconcursos.com.br metodo2.focusconcursos.com.br core.focusconcursos.com.br build.focusconcursos.com.br person.focusconcursos.com.br cart.focusconcursos.com.br order.focusconcursos.com.br product.focusconcursos.com.br finance.focusconcursos.com.br question.focusconcursos.com.br digital.focusconcursos.com.br presencial.focusconcursos.com.br simulados.focusconcursos.com.br legado.focusconcursos.com.br novo.focusconcursos.com.br novoblog.focusconcursos.com.br novolms.focusconcursos.com.br aluno.focusconcursos.com.br oauth.focusconcursos.com.br mobile.focusconcursos.com.br focusonline.com.br cursosfocus.com.br sistemaead.com.br"
# 1. domain sweep
curl -s -x $PPT -A "$UA" --max-time 240 "https://web.archive.org/cdx/search/cdx?url=*.${H}&matchType=domain&output=text&fl=original,timestamp,mimetype,statuscode&collapse=urlkey&limit=15000" > cdx_domain_full.txt
echo "domain_full_lines=$(wc -l < cdx_domain_full.txt)" >> sweep_status.log
sleep 3
# 2. per-host sweep
for S in $TARGETS; do
  OUT="cdx_${S}.txt"
  if [ ! -s "$OUT" ]; then
    curl -s -x $PPT -A "$UA" --max-time 120 "https://web.archive.org/cdx/search/cdx?url=${S}/*&output=text&fl=original,timestamp,mimetype,statuscode&collapse=urlkey&limit=3000" > "$OUT.tmp" && mv "$OUT.tmp" "$OUT"
    echo "$(date -u +%T) ${S}: $(wc -l < "$OUT")" >> sweep_status.log
    sleep 2
  fi
done
echo "all done" >> sweep_status.log
