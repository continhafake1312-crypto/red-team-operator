#!/usr/bin/env bash
# gocache cdn bucket-path probing + misc host light enum
E=/home/ubuntu/red-team-operator/focusconcursos.com.br/enum
P="socks5h://127.0.0.1:9050"
UA="Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0"
D=$E/cdn.gocache.com.br
out=$D/paths_probe.txt
: > "$out"
try(){ # host path tag
  h=$1; p=$2
  r=$(curl -sk --proxy "$P" -m 15 -A "$UA" -o "$E/cdn.gocache.com.br/$3.out" -w '%{http_code}|%{size_download}' "https://$h/$2" 2>/dev/null)
  echo "$h /$2 -> $r" >> "$out"
  sleep 0.25
}
# cdn.focusconcursos = bucket facet 403; per-object GET is 200 per passive phase. Try known wayback path forms:
for h in cdn.focusconcursos.com.br cdn.grupofocus.com.br; do
  try "$h" "" t_root
  try "$h" "favicon.ico" t_favicon
  try "$h" "images/favicon-16x16.png" t_fav16
  try "$h" "robots.txt" t_robots
  try "$h" "fonts/Lato-Regular.woff" t_font
  try "$h" "app.js" t_appjs0
  try "$h" "assets/app.js" t_assetsapp
  try "$h" "themes/faculdade-focus/images/favicon.png" t_theme_fav
  try "$h" "admin/4/teachers/cm7ncz9g10heejxqn33mw9htq.webp" t_admin4
  try "$h" "s3/fc-static/x" t_s3
  try "$h" "fc-static" t_fcstatic
  try "$h" "test.html" t_testhtml
  try "$h" "uploads/2021/09/concurso-policia-civil-800x450.jpg" t_wpimg
done
echo "--- misc: crm reprobe / focusonline / faculdadefocus / sistemaead ---"
m(){ # url tag
  r=$(curl -sk -L --proxy "$P" -m 20 -A "$UA" -o "$E/cdn.gocache.com.br/$2.out" -w '%{http_code}|%{size_download}|%{url_effective}' "$1" 2>/dev/null)
  echo "$1 -> $r" >> "$out"
  sleep 0.3
}
m "https://crm.focusconcursos.com.br/" m_crm
m "https://crm.focusconcursos.com.br/login" m_crm_login
m "https://crm.focusconcursos.com.br/docs" m_crm_docs
m "https://focusonline.com.br/" m_fonline
m "https://focusonline.com.br/login" m_fonline_login
m "https://faculdadefocus.com.br/login" m_faclogin
m "https://www.faculdadefocus.com.br/" m_facul
m "https://sistemaead.com.br/_next/static/chunks/webpack-b563bd7683d1ff2b.js" m_sead_webpack
echo "--- done ---"
tail -25 "$out"
