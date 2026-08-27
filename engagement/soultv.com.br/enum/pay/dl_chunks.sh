#!/bin/bash
declare -A CH=( [215]=ad48773c4f6f972b6104 [293]=7141e0e684e893c9fa1f [299]=560954dbe12123178233 [336]=f651bec79709e9d90fd0 [346]=da6fc99173d5388131a7 [378]=380455f2d341264dd65d [399]=3a569416c25c2a70996f [454]=b6c399a4195350f67115 [489]=a6e5b2039ca4e3b0d2e6 [506]=863140588ce054c53fae [516]=e5080fb9379a212ef09f [576]=e234491ac219d45cd409 [597]=c075ff6847c909713575 [638]=4b3d64a745b19f5a29bb [762]=17164c133e5ed46f0ffd [764]=f7ac50c451d9bfb86023 [797]=f710ebebd58ac9b50dc8 [871]=cd5d222c7133b399ec96 [903]=b9614f9a30d22f3af80a [906]=f6d21ded265ee6787bf6 [919]=c9e1d97b128bb9108c97 [935]=d7720e11c94dc3523dc8 )
for id in "${!CH[@]}"; do
  f="$id.${CH[$id]}.js"
  sz=$(proxychains4 -q curl -s --max-time 25 "https://pay.soultv.com.br/$f" -o "chunk_$f" -w "%{http_code}/%{size_download}")
  echo "$f -> $sz"
done
# common chunk
sz=$(proxychains4 -q curl -s --max-time 25 "https://pay.soultv.com.br/common.25ad0a9b900180fa9739.js" -o "chunk_common.25ad0a9b900180fa9739.js" -w "%{http_code}/%{size_download}")
echo "common -> $sz"
