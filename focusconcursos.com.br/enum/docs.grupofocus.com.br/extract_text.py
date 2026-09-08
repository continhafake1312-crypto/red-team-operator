import re, html as H
p="/home/ubuntu/red-team-operator/focusconcursos.com.br/enum/docs.grupofocus.com.br/page-root.html"
out="/home/ubuntu/red-team-operator/focusconcursos.com.br/enum/docs.grupofocus.com.br"
raw=open(p,encoding='utf-8',errors='replace').read()
clear=re.sub(r'<script.*?</script>','',raw,flags=re.S)
clear=re.sub(r'<style.*?</style>','',clear,flags=re.S)
open(out+"/page_root_links.txt","w").write("\n".join(sorted(set(re.findall(r'href="([^"]+)"', clear)))))
# render-ish text: replace block tags with newlines
txt=re.sub(r'<(h[1-6]|p|li|div|tr|br|pre|code|table|section)[^>]*>', '\n', clear)
txt=re.sub(r'<[^>]+>',' ',txt)
txt=H.unescape(txt)
lines=[l.strip() for l in txt.split('\n')]
lines=[l for l in lines if l and len(l)>2 and not l.startswith('1:')]
open(out+"/page_root_text.txt","w").write("\n".join(lines))
print("text lines:",len(lines))
# show everything that mentions routes/paths/hmac/static props
import sys
for l in lines:
    if re.search(r'(?i)(http|/api|endpoint|hmac|bearer|authorization|token|header|param|body|schema|json|url|rota|stage|homolog|test)', l) and len(l)<400:
        print(l[:400])
