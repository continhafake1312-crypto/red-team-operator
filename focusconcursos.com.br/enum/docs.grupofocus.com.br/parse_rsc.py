import json,re
p="/home/ubuntu/red-team-operator/focusconcursos.com.br/enum/docs.grupofocus.com.br/page-root.html"
html=open(p,encoding='utf-8',errors='replace').read()
chunks=re.findall(r'self\.__next_f\.push\(\[1,"(.*?)"\]\)',html,re.S)
parts=[]
for c in chunks:
    try:
        parts.append(json.loads('"'+c+'"'))
    except Exception:
        parts.append(c)
blob="".join(parts)
open("/home/ubuntu/red-team-operator/focusconcursos.com.br/enum/docs.grupofocus.com.br/rsc_blob.txt","w").write(blob)
print("blob bytes:",len(blob))
for kw in ["siteData","pagePath","space_","site_","revision","tableOfContents","title"]:
    c=len(re.findall('(?i)'+kw,blob))
    print(kw,c)
