"""
Pool dinâmico de tokens GitHub v2 — auto-alimentado + persistido.
  - Round-robin com peso por rate limit residual
  - Tokens colhidos durante scan são automaticamente adicionados
  - Persistido em data/tokens.pool (sobrevive a restarts)
  - Thread-safe com RLock
"""

import json
import threading
import time
from pathlib import Path

POOL_FILE = Path(__file__).parent / "data" / "tokens.pool"
_lock = threading.RLock()
_pool = {
    "tokens": {},      # token → {added_at, source_repo, status, last_used, uses, rate_ok}
    "dead": {},        # token → {died_at, reason}
    "seed": [],        # tokens originais (do .env)
}
_loaded = False


def _load():
    global _loaded
    if _loaded:
        return
    _loaded = True
    if POOL_FILE.exists():
        try:
            data = json.loads(POOL_FILE.read_text())
            _pool["tokens"] = data.get("tokens", {})
            _pool["dead"] = data.get("dead", {})
            _pool["seed"] = data.get("seed", [])
        except Exception:
            pass


def _save():
    try:
        POOL_FILE.parent.mkdir(parents=True, exist_ok=True)
        POOL_FILE.write_text(json.dumps(_pool, indent=2))
    except Exception:
        pass


def set_seed_tokens(tokens: list):
    _load()
    with _lock:
        _pool["seed"] = list(tokens)
        _save()


def add(token: str, source_repo: str = "") -> bool:
    """Adiciona token ao pool se não existir. Retorna True se novo."""
    _load()
    with _lock:
        if token in _pool["dead"] or token in _pool["tokens"] or token in _pool["seed"]:
            return False
        _pool["tokens"][token] = {
            "added_at": time.time(),
            "source_repo": source_repo,
            "status": "active",
            "last_used": 0,
            "uses": 0,
            "rate_ok": True,
        }
        _save()
        return True


def mark_dead(token: str, reason: str = ""):
    _load()
    with _lock:
        _pool["tokens"].pop(token, None)
        _pool["dead"][token] = {"died_at": time.time(), "reason": reason}
        _save()


def get_active() -> list:
    """Retorna tokens ativos (seed + colhidos)."""
    _load()
    with _lock:
        active = list(_pool["seed"])
        active.extend(_pool["tokens"].keys())
        return active


def get_harvested() -> list:
    _load()
    with _lock:
        return list(_pool["tokens"].keys())


def record_use(token: str, ok: bool = True):
    _load()
    with _lock:
        if token in _pool["tokens"]:
            t = _pool["tokens"][token]
            t["uses"] += 1
            t["last_used"] = time.time()
            t["rate_ok"] = ok
            if t["uses"] % 50 == 0:
                _save()


def stats() -> dict:
    _load()
    with _lock:
        return {
            "seed_count": len(_pool["seed"]),
            "harvested_count": len(_pool["tokens"]),
            "dead_count": len(_pool["dead"]),
            "total_active": len(_pool["seed"]) + len(_pool["tokens"]),
            "harvested": [
                {"token": t[:20] + "...", "source": v.get("source_repo", ""),
                 "uses": v.get("uses", 0), "added": v.get("added_at", 0)}
                for t, v in sorted(_pool["tokens"].items(),
                                   key=lambda x: x[1].get("uses", 0), reverse=True)
            ],
        }