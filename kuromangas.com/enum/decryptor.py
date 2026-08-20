#!/usr/bin/env python3
"""
Kuro Mangas API decryptor — pure Python reproduction of the client-side crypto
scheme (finding F-001 / F-002).

Reproduces (from /assets/index-CBRSqHNC.js):

    vk2 = VITE_API_URL  ("/api")
    function xk2(){
        const e = VITE_API_ENCRYPTION_KEY;                 // hardcoded (below)
        const r = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        const o = document.createElement("a"); o.href="/";
        const n = `${o.hostname}::v2`;                    // "<hostname>::v2"
        const i = window.getComputedStyle?.(document.body) ? "x9_4v2_b" : "bot";
        const k = CryptoJS.MD5(r + n + i).toString().substring(0,8); // 8 hex
        return e + k;                                      // passphrase
    }
    function iY1(e, datakey){
        if(!e || !("_v_secure" in e)) return e;
        const key = xk2();
        const pt  = CryptoJS.Rabbit.decrypt(e._v_secure, key).toString(CryptoJS.enc.Utf8);
        const obj = JSON.parse(pt);
        return datakey ? obj[datakey] : obj;
    }

CryptoJS.Rabbit.decrypt(ciphertext, passphrase):
  - ciphertext is base64 of "Salted__" + 8-byte salt + Rabbit-encrypted bytes
  - passphrase (string) + salt -> EvpKDF (MD5, iter=1, keySize=4 words/16B, ivSize=2 words/8B)
  - Rabbit key/IV setup (RFC 4503, CryptoJS endian-swap variant)
  - keystream XOR (block = 16 bytes / 4 words)

Usage:
    python3 decryptor.py --b64 "<_v_secure value>" --date 2026-08-20 \\
        --datakey _rrz86oy [--hostname kuromangas.com]
    python3 decryptor.py --file real_responses/post_auth_request-reset.json
    python3 decryptor.py --body '{"_v_secure":"..."}' --header-datakey _rrz86oy
"""
import sys, json, base64, hashlib, struct, argparse, datetime, os

# ---- Hardcoded client secret (F-001) ----------------------------------------
VITE_API_ENCRYPTION_KEY = "2i3ato8l6sai74shksfE2oMmieshoforanuYTusF4jKdqEwhUEft9dsadcxzde3"
DEFAULT_HOSTNAME = "kuromangas.com"

# ---- 32-bit helpers ----------------------------------------------------------
MASK32 = 0xFFFFFFFF
def rotl(x, n): return ((x << n) | (x >> (32 - n))) & MASK32
def rotr(x, n): return ((x >> n) | (x << (32 - n))) & MASK32

def endian_swap(w):
    """CryptoJS endian swap of a 32-bit word (big <-> little)."""
    return (((w << 8)  | (w >> 24)) & 0x00ff00ff) | \
           (((w << 24) | (w >> 8))  & 0xff00ff00)

# ---- xk2() key derivation ----------------------------------------------------
def xk2(date=None, hostname=DEFAULT_HOSTNAME, real_browser=True):
    e = VITE_API_ENCRYPTION_KEY
    if date is None:
        date = datetime.datetime.utcnow().strftime("%Y-%m-%d")
    n = f"{hostname}::v2"
    i = "x9_4v2_b" if real_browser else "bot"
    k = hashlib.md5((date + n + i).encode("utf-8")).hexdigest()[:8]
    return e + k

# ---- OpenSSL EvpKDF (EVP_BytesToKey, MD5, iter=1) ----------------------------
def evpkdf(password_bytes, salt_bytes, key_len, iv_len):
    """OpenSSL EVP_BytesToKey with MD5, 1 iteration."""
    derived = b""
    prev = b""
    while len(derived) < key_len + iv_len:
        prev = hashlib.md5(prev + password_bytes + salt_bytes).digest()
        derived += prev
    return derived[:key_len], derived[key_len:key_len + iv_len]

# ---- Rabbit stream cipher (RFC 4503 / CryptoJS) ------------------------------
CINC = (0x4D34D34D, 0xD34D34D3, 0x34D34D34, 0x4D34D34D,
        0xD34D34D3, 0x34D34D34, 0x4D34D34D, 0xD34D34D3)

class Rabbit:
    def __init__(self, key_bytes, iv_bytes=None):
        # key: 16 bytes -> 4 big-endian words, then endian-swapped (CryptoJS)
        K = list(struct.unpack(">4I", key_bytes))
        K = [endian_swap(w) for w in K]
        # initial state X
        self.X = [
            K[0], (K[3] << 16 | K[2] >> 16) & MASK32,
            K[1], (K[0] << 16 | K[3] >> 16) & MASK32,
            K[2], (K[1] << 16 | K[0] >> 16) & MASK32,
            K[3], (K[2] << 16 | K[1] >> 16) & MASK32,
        ]
        # initial counter C
        self.C = [
            (K[2] << 16 | K[2] >> 16) & MASK32, (K[0] & 0xffff0000) | (K[1] & 0x0000ffff),
            (K[3] << 16 | K[3] >> 16) & MASK32, (K[1] & 0xffff0000) | (K[2] & 0x0000ffff),
            (K[0] << 16 | K[0] >> 16) & MASK32, (K[2] & 0xffff0000) | (K[3] & 0x0000ffff),
            (K[1] << 16 | K[1] >> 16) & MASK32, (K[3] & 0xffff0000) | (K[0] & 0x0000ffff),
        ]
        self.b = 0
        for _ in range(4):
            self._next_state()
        # modify counters
        for i in range(8):
            self.C[i] ^= self.X[(i + 4) & 7]
        # IV setup
        if iv_bytes is not None and len(iv_bytes) >= 8:
            IV = list(struct.unpack(">2I", iv_bytes[:8]))
            IV0, IV1 = IV[0], IV[1]
            i0 = endian_swap(IV0)
            i2 = endian_swap(IV1)
            i1 = (i0 >> 16) | (i2 & 0xffff0000)
            i3 = ((i2 << 16) & MASK32) | (i0 & 0x0000ffff)
            self.C[0] ^= i0; self.C[1] ^= i1; self.C[2] ^= i2; self.C[3] ^= i3
            self.C[4] ^= i0; self.C[5] ^= i1; self.C[6] ^= i2; self.C[7] ^= i3
            for _ in range(4):
                self._next_state()

    def _next_state(self):
        X = self.X; C = self.C
        C_ = list(C)
        C[0] = (C[0] + CINC[0] + self.b) & MASK32
        carry = 1 if (C[0] & MASK32) < (C_[0] & MASK32) else 0
        C[1] = (C[1] + CINC[1] + carry) & MASK32
        carry = 1 if (C[1] & MASK32) < (C_[1] & MASK32) else 0
        C[2] = (C[2] + CINC[2] + carry) & MASK32
        carry = 1 if (C[2] & MASK32) < (C_[2] & MASK32) else 0
        C[3] = (C[3] + CINC[3] + carry) & MASK32
        carry = 1 if (C[3] & MASK32) < (C_[3] & MASK32) else 0
        C[4] = (C[4] + CINC[4] + carry) & MASK32
        carry = 1 if (C[4] & MASK32) < (C_[4] & MASK32) else 0
        C[5] = (C[5] + CINC[5] + carry) & MASK32
        carry = 1 if (C[5] & MASK32) < (C_[5] & MASK32) else 0
        C[6] = (C[6] + CINC[6] + carry) & MASK32
        carry = 1 if (C[6] & MASK32) < (C_[6] & MASK32) else 0
        C[7] = (C[7] + CINC[7] + carry) & MASK32
        self.b = 1 if (C[7] & MASK32) < (C_[7] & MASK32) else 0
        # g-values
        G = [0] * 8
        for i in range(8):
            gx = (X[i] + C[i]) & MASK32
            ga = gx & 0xffff
            gb = (gx >> 16) & 0xffff
            gh = ((((ga * ga) >> 17) + ga * gb) >> 15) + gb * gb
            gl = (((gx & 0xffff0000) * gx) + ((gx & 0x0000ffff) * gx)) & MASK32
            G[i] = (gh ^ gl) & MASK32
        X[0] = (G[0] + ((G[7] << 16 | G[7] >> 16) & MASK32) + ((G[6] << 16 | G[6] >> 16) & MASK32)) & MASK32
        X[1] = (G[1] + ((G[0] << 8  | G[0] >> 24) & MASK32) + G[7]) & MASK32
        X[2] = (G[2] + ((G[1] << 16 | G[1] >> 16) & MASK32) + ((G[0] << 16 | G[0] >> 16) & MASK32)) & MASK32
        X[3] = (G[3] + ((G[2] << 8  | G[2] >> 24) & MASK32) + G[1]) & MASK32
        X[4] = (G[4] + ((G[3] << 16 | G[3] >> 16) & MASK32) + ((G[2] << 16 | G[2] >> 16) & MASK32)) & MASK32
        X[5] = (G[5] + ((G[4] << 8  | G[4] >> 24) & MASK32) + G[3]) & MASK32
        X[6] = (G[6] + ((G[5] << 16 | G[5] >> 16) & MASK32) + ((G[4] << 16 | G[4] >> 16) & MASK32)) & MASK32
        X[7] = (G[7] + ((G[6] << 8  | G[6] >> 24) & MASK32) + G[5]) & MASK32

    def keystream_block(self):
        """Generate one 4-word keystream block (after one nextState)."""
        self._next_state()
        X = self.X
        S = [
            X[0] ^ ((X[5] >> 16) & 0xffff) ^ ((X[3] << 16) & 0xffff0000),
            X[2] ^ ((X[7] >> 16) & 0xffff) ^ ((X[5] << 16) & 0xffff0000),
            X[4] ^ ((X[1] >> 16) & 0xffff) ^ ((X[7] << 16) & 0xffff0000),
            X[6] ^ ((X[3] >> 16) & 0xffff) ^ ((X[1] << 16) & 0xffff0000),
        ]
        S = [endian_swap(w) for w in S]
        return S

    def decrypt(self, ciphertext_bytes):
        out = bytearray()
        off = 0
        while off < len(ciphertext_bytes):
            block = ciphertext_bytes[off:off + 16]
            if len(block) == 0:
                break
            # pad last partial block with zeros to a full word-aligned chunk
            pad = (16 - (len(block) % 16)) % 16
            block_b = block + b"\x00" * pad
            M = list(struct.unpack(">4I", block_b)) if len(block_b) == 16 else None
            if M is None:
                # less than 4 bytes remaining — handle byte-wise with keystream
                ks = self.keystream_block()
                ks_bytes = struct.pack(">4I", *ks)
                for j in range(len(block)):
                    out.append(block[j] ^ ks_bytes[j])
                break
            ks = self.keystream_block()
            pt_words = [M[i] ^ ks[i] for i in range(4)]
            pt_bytes = struct.pack(">4I", *pt_words)
            out.extend(pt_bytes[:len(block)])
            off += 16
        return bytes(out[:len(ciphertext_bytes)] if False else out)

# ---- Top-level decrypt of an API response ------------------------------------
def decrypt_response(secure_b64, date=None, hostname=DEFAULT_HOSTNAME,
                     datakey=None, real_browser=True):
    passphrase = xk2(date=date, hostname=hostname, real_browser=real_browser)
    raw = base64.b64decode(secure_b64)
    if raw[:8] != b"Salted__":
        # CryptoJS also accepts raw ciphertext (no salt) — derive with empty salt
        salt = b""
        ct = raw
    else:
        salt = raw[8:16]
        ct = raw[16:]
    key, iv = evpkdf(passphrase.encode("utf-8"), salt, key_len=16, iv_len=8)
    r = Rabbit(key, iv)
    pt = r.decrypt(ct)
    text = pt.decode("utf-8")
    obj = json.loads(text)
    if datakey and isinstance(obj, dict) and datakey in obj:
        return obj[datakey]
    return obj

# ---- CLI ---------------------------------------------------------------------
def _extract_b64(body):
    if isinstance(body, str):
        try:
            body = json.loads(body)
        except Exception:
            pass
    if isinstance(body, dict) and "_v_secure" in body:
        return body["_v_secure"]
    if isinstance(body, str) and body.lstrip().startswith("U2FsdGVk"):
        return body.strip()
    return body

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--b64")
    ap.add_argument("--file")
    ap.add_argument("--body")
    ap.add_argument("--header-datakey")
    ap.add_argument("--datakey")
    ap.add_argument("--date", default=None)
    ap.add_argument("--hostname", default=DEFAULT_HOSTNAME)
    ap.add_argument("--bot", action="store_true", help="use 'bot' branch (no getComputedStyle)")
    ap.add_argument("--raw", action="store_true", help="print raw decrypted object (no datakey extraction)")
    args = ap.parse_args()

    datakey = args.datakey or args.header_datakey
    if args.file:
        d = json.load(open(args.file))
        b64 = d.get("body") if isinstance(d.get("body"), str) and "_v_secure" in d.get("body","") else d.get("body")
        if isinstance(b64, str):
            b64 = _extract_b64(b64)
        dk = datakey or d.get("dk") or d.get("datakey")
        date = args.date or d.get("date") or datetime.datetime.utcnow().strftime("%Y-%m-%d")
        out = decrypt_response(b64, date=date, hostname=args.hostname,
                               datakey=None if args.raw else dk,
                               real_browser=not args.bot)
        print(json.dumps(out, ensure_ascii=False, indent=2))
        return
    if args.body:
        b64 = _extract_b64(args.body)
    elif args.b64:
        b64 = _extract_b64(args.b64)
    else:
        ap.error("need --b64, --body or --file")
    out = decrypt_response(b64, date=args.date, hostname=args.hostname,
                           datakey=None if args.raw else datakey,
                           real_browser=not args.bot)
    print(json.dumps(out, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
