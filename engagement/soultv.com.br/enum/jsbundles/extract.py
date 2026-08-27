#!/usr/bin/env python3
"""Extract endpoints, secrets, routes, keys from JS bundles."""
import re
import os
import sys
import json
import glob

BUNDLES_DIR = "/home/ubuntu/engagement/soultv.com.br/recon/passive/js_bundles"
OUT_DIR = "/home/ubuntu/engagement/soultv.com.br/enum/jsbundles"
os.makedirs(OUT_DIR, exist_ok=True)

# Regex patterns
PATTERNS = {
    "url_http": re.compile(r'https?://[a-zA-Z0-9\-._~%/?&=+#:@!*\'(),;-]{4,}', re.IGNORECASE),
    "api_path": re.compile(r'["\'`](/(?:api|v1|v2|v3|graphql|rest|admin|user|account|auth|login|logout|register|payment|subscription|order|stream|media|brand|category|channel|config|webhook)[a-zA-Z0-9\-._~%/]*?)["\'`]'),
    "rel_path": re.compile(r'["\'`](/[a-zA-Z][a-zA-Z0-9\-._~%]{2,}/[a-zA-Z0-9\-._~%/]{2,})["\'`]'),
    "firebase_key": re.compile(r'AIza[0-9A-Za-z_\-]{35}'),
    "aws_key": re.compile(r'AKIA[0-9A-Z]{16}'),
    "jwt": re.compile(r'eyJ[A-Za-z0-9_\-]{8,}\.eyJ[A-Za-z0-9_\-]{8,}\.[A-Za-z0-9_\-]{8,}'),
    "bearer": re.compile(r'[Bb]earer\s+[A-Za-z0-9_\-\.=]{10,}'),
    "google_api": re.compile(r'AIza[0-9A-Za-z_\-]{35}'),
    "stripe": re.compile(r'(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{20,}'),
    "mercadopago": re.compile(r'APP_USR-[0-9A-Za-z\-_]{10,}|ACCESS_TOKEN[=:]["\' ]?[0-9A-Za-z\-_]{20,}'),
    "pagseguro": re.compile(r'[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12}'),
    "paypal": re.compile(r'[A-Za-z0-9]{20,}_[A-Za-z0-9]{20,}'),
    "generic_key": re.compile(r'(?:api[_-]?key|apikey|secret|token|client[_-]?id|client[_-]?secret|access[_-]?token|auth[_-]?token)["\'`\s:=]+["\'`]([A-Za-z0-9+/=_\-]{12,})["\'`]', re.IGNORECASE),
    "env_var": re.compile(r'(?:process\.env|import\.meta\.env)\.([A-Z_][A-Z0-9_]{2,})'),
    "firebase_cfg": re.compile(r'(apiKey|authDomain|databaseURL|projectId|storageBucket|messagingSenderId|appId|measurementId)["\'`\s:]+["\'`]([A-Za-z0-9\-:.\/_]+)["\'`]'),
    "route_angular": re.compile(r'(?:path|loadChildren|component)\s*:\s*["\'`]([A-Za-z0-9_\-\/\.]+)["\'`]'),
    "graphql": re.compile(r'(?:query|mutation|subscription)\s+[A-Za-z_][A-Za-z0-9_]*\s*[\({]'),
    "webhook": re.compile(r'(?:webhook|callback|notify)[A-Za-z]*["\'`\s:=]+["\'`](https?://[^"\'`]+)["\'`]', re.IGNORECASE),
    "cloud_url": re.compile(r'https?://(?:[a-z0-9\-]+\.)*(amazonaws\.com|cloudfront\.net|blob\.core\.windows\.net|googleapis\.com|firebaseio\.com|firebaseapp\.com|appspot\.com|smartplay\.pe|logicahost\.com\.br|soultv\.com\.br|cloudfunctions\.net|run\.app)[^"\'`\s]*', re.IGNORECASE),
    "soultv_host": re.compile(r'https?://[a-z0-9\-]+\.soultv\.com\.br[^"\'`\s]*', re.IGNORECASE),
    "bucket": re.compile(r'(?:gs://|s3://|https?://[a-z0-9\-]+\.s3[a-z0-9\-]*\.amazonaws\.com/|https?://[a-z0-9\-]+\.blob\.core\.windows\.net/)[^"\'`\s]+', re.IGNORECASE),
    "azure_account": re.compile(r'(?:stsoultvbrs|soultv[a-z0-9]*)\.blob\.core\.windows\.net', re.IGNORECASE),
}

def analyze(path):
    with open(path, 'r', errors='ignore') as f:
        content = f.read()
    name = os.path.basename(path)
    results = {k: set() for k in PATTERNS}
    for key, pat in PATTERNS.items():
        for m in pat.finditer(content):
            val = m.group(0) if m.groups() == () else (m.group(1) if m.lastindex else m.group(0))
            # collapse
            if isinstance(val, tuple):
                val = "|".join(val)
            results[key].add(val.strip())
    return name, results

all_results = {}
summary_lines = []
for path in sorted(glob.glob(os.path.join(BUNDLES_DIR, "*.js"))):
    name, res = analyze(path)
    all_results[name] = res
    out_path = os.path.join(OUT_DIR, name + ".extracted.txt")
    with open(out_path, 'w') as f:
        f.write(f"# Extracted from {name}\n\n")
        for key, vals in res.items():
            if vals:
                f.write(f"\n## {key} ({len(vals)})\n")
                for v in sorted(vals):
                    f.write(f"  {v}\n")
    summary_lines.append(f"\n{'='*60}\n### {name}\n{'='*60}")
    for key, vals in res.items():
        if vals:
            summary_lines.append(f"\n**{key}** ({len(vals)}):")
            for v in sorted(vals)[:80]:
                summary_lines.append(f"  - {v}")

# consolidated unique endpoints
all_urls = set()
all_paths = set()
all_keys = set()
for name, res in all_results.items():
    for u in res.get("url_http", set()):
        all_urls.add(u)
    for p in res.get("api_path", set()):
        all_paths.add(p)
    for p in res.get("rel_path", set()):
        all_paths.add(p)
    for k in ["firebase_key","aws_key","jwt","bearer","stripe","mercadopago","pagseguro","paypal","generic_key"]:
        for v in res.get(k, set()):
            all_keys.add((k, v))

with open(os.path.join(OUT_DIR, "all_endpoints.txt"), 'w') as f:
    f.write("# All unique URLs across bundles\n\n")
    for u in sorted(all_urls):
        f.write(u + "\n")
    f.write("\n# All API/relative paths\n\n")
    for p in sorted(all_paths):
        f.write(p + "\n")

with open(os.path.join(OUT_DIR, "all_keys.txt"), 'w') as f:
    f.write("# Unique secrets/keys across bundles\n\n")
    for k, v in sorted(all_keys):
        f.write(f"[{k}] {v}\n")

with open(os.path.join(OUT_DIR, "EXTRACTION.md"), 'w') as f:
    f.write("# JS Bundle Extraction Summary\n\n")
    f.write("\n".join(summary_lines))

print(f"Done. Files in {OUT_DIR}")
print(f"Total unique URLs: {len(all_urls)}")
print(f"Total unique paths: {len(all_paths)}")
print(f"Total unique keys: {len(all_keys)}")
