"""
Armazenamento SQLite — v2 otimizado (INSERT OR REPLACE, batch, ORDER BY seguro, WAL checkpoint).
Dados existentes em data/ são preservados (schema compatível).
"""

import sqlite3
import threading
from datetime import datetime
from pathlib import Path
from typing import Optional

DB_PATH = Path(__file__).parent / "data" / "secrets.db"

# Pool de conexões thread-local + lock para writes
_local = threading.local()
_write_lock = threading.Lock()
_WAL_CHECKPOINT_INTERVAL = 500  # checkpoint a cada N writes
_write_count = 0


def get_conn():
    """Retorna conexão thread-local com pragmas otimizados."""
    if not hasattr(_local, "conn") or _local.conn is None:
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(str(DB_PATH), timeout=30)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA synchronous=NORMAL")  # OFF → NORMAL (tradeoff segurança/velocidade)
        conn.execute("PRAGMA cache_size=-64000")     # 64MB cache
        conn.execute("PRAGMA temp_store=MEMORY")
        conn.execute("PRAGMA mmap_size=268435456")    # 256MB mmap
        conn.execute("PRAGMA busy_timeout=5000")
        _init_db(conn)
        _local.conn = conn
    return _local.conn


def _init_db(conn):
    """Schema compatível com dados existentes."""
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS secrets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key_type TEXT NOT NULL,
            key_name TEXT NOT NULL,
            key_value TEXT NOT NULL UNIQUE,
            masked_value TEXT,
            confidence INTEGER DEFAULT 5,
            context TEXT,
            source TEXT,
            file_path TEXT,
            commit_url TEXT,
            author TEXT,
            date_found TEXT,
            scan_date TEXT DEFAULT (datetime('now')),
            validated INTEGER DEFAULT 0,
            is_valid INTEGER,
            validation_msg TEXT,
            validation_date TEXT,
            repo_name TEXT,
            search_query TEXT,
            status TEXT DEFAULT 'found',
            scan_id TEXT,
            validator_type TEXT
        );
        CREATE TABLE IF NOT EXISTS scan_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scan_id TEXT UNIQUE NOT NULL,
            scan_type TEXT,
            query TEXT,
            pattern_count INTEGER DEFAULT 0,
            total_found INTEGER DEFAULT 0,
            new_found INTEGER DEFAULT 0,
            repos_scanned INTEGER DEFAULT 0,
            duration_seconds REAL DEFAULT 0,
            status TEXT DEFAULT 'running',
            error TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_secrets_type ON secrets(key_type);
        CREATE INDEX IF NOT EXISTS idx_secrets_valid ON secrets(validated, is_valid);
        CREATE INDEX IF NOT EXISTS idx_secrets_date ON secrets(date_found);
        CREATE INDEX IF NOT EXISTS idx_secrets_repo ON secrets(repo_name);
        CREATE INDEX IF NOT EXISTS idx_secrets_scan ON secrets(scan_id);
    """)
    # Migração segura: adiciona colunas que podem faltar em DBs antigos
    for col in ("validator_type",):
        try:
            conn.execute(f"SELECT {col} FROM secrets LIMIT 1")
        except sqlite3.OperationalError:
            conn.execute(f"ALTER TABLE secrets ADD COLUMN {col} TEXT")
    conn.commit()


def _checkpoint():
    """WAL checkpoint periódico (mantém tamanho controlado)."""
    global _write_count
    with _write_lock:
        _write_count += 1
        if _write_count >= _WAL_CHECKPOINT_INTERVAL:
            try:
                conn = get_conn()
                conn.execute("PRAGMA wal_checkpoint(TRUNCATE)")
            except Exception:
                pass
            _write_count = 0


# ── ALLOWED ORDER BY columns (segurança: evitar SQL injection) ──
_ALLOWED_ORDER = {"id", "key_type", "key_name", "confidence", "date_found",
                  "scan_date", "repo_name", "validated", "is_valid"}


def save_secret(data: dict) -> int:
    """INSERT OR REPLACE — 1 query só (era SELECT + INSERT/UPDATE)."""
    conn = get_conn()
    with _write_lock:
        try:
            conn.execute("""
                INSERT OR REPLACE INTO secrets
                    (key_type, key_name, key_value, masked_value, confidence, context,
                     source, file_path, commit_url, author, date_found,
                     validated, is_valid, repo_name, search_query, status, scan_id, validator_type)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, (
                data.get("key_type", ""),
                data.get("key_name", ""),
                data.get("key_value", ""),
                data.get("masked_value"),
                data.get("confidence", 5),
                (data.get("context") or "")[:2000],
                data.get("source", ""),
                data.get("file_path"),
                data.get("commit_url"),
                data.get("author"),
                data.get("date_found", ""),
                1 if data.get("validated") else 0,
                data.get("is_valid"),
                data.get("repo_name"),
                data.get("search_query"),
                data.get("status", "found"),
                data.get("scan_id"),
                data.get("validator_type", ""),
            ))
            conn.commit()
            _checkpoint()
            row = conn.execute("SELECT id FROM secrets WHERE key_value = ?",
                               (data["key_value"],)).fetchone()
            return row["id"] if row else 0
        except sqlite3.IntegrityError:
            return 0
        except Exception as e:
            conn.rollback()
            return 0


def save_secrets_batch(batch: list[dict]) -> int:
    """Batch insert — muito mais rápido para grandes volumes."""
    if not batch:
        return 0
    conn = get_conn()
    with _write_lock:
        try:
            rows = []
            for data in batch:
                rows.append((
                    data.get("key_type", ""),
                    data.get("key_name", ""),
                    data.get("key_value", ""),
                    data.get("masked_value"),
                    data.get("confidence", 5),
                    (data.get("context") or "")[:2000],
                    data.get("source", ""),
                    data.get("file_path"),
                    data.get("commit_url"),
                    data.get("author"),
                    data.get("date_found", ""),
                    1 if data.get("validated") else 0,
                    data.get("is_valid"),
                    data.get("repo_name"),
                    data.get("search_query"),
                    data.get("status", "found"),
                    data.get("scan_id"),
                    data.get("validator_type", ""),
                ))
            conn.executemany("""
                INSERT OR IGNORE INTO secrets
                    (key_type, key_name, key_value, masked_value, confidence, context,
                     source, file_path, commit_url, author, date_found,
                     validated, is_valid, repo_name, search_query, status, scan_id, validator_type)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, rows)
            conn.commit()
            _checkpoint()
            return conn.total_changes
        except Exception as e:
            conn.rollback()
            return 0


def get_secrets(key_type=None, validated=None, is_valid=None,
                search=None, limit=100, offset=0, order_by="scan_date", order_desc=True):
    conn = get_conn()
    where, params = [], []

    if key_type:
        where.append("key_type = ?"); params.append(key_type)
    if validated is not None:
        where.append("validated = ?"); params.append(1 if validated else 0)
    if is_valid is not None:
        where.append("is_valid = ?"); params.append(1 if is_valid else 0)
    if search:
        where.append("(key_value LIKE ? OR repo_name LIKE ? OR source LIKE ?)")
        like = f"%{search}%"
        params.extend([like, like, like])

    w = "WHERE " + " AND ".join(where) if where else ""
    # ORDER BY seguro — só permite colunas conhecidas
    order_col = order_by if order_by in _ALLOWED_ORDER else "scan_date"
    direction = "DESC" if order_desc else "ASC"
    sql = f"SELECT * FROM secrets {w} ORDER BY {order_col} {direction} LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    rows = conn.execute(sql, params).fetchall()
    return [dict(r) for r in rows]


def count_secrets(key_type=None, validated=None, is_valid=None) -> int:
    conn = get_conn()
    where, params = [], []
    if key_type:
        where.append("key_type = ?"); params.append(key_type)
    if validated is not None:
        where.append("validated = ?"); params.append(1 if validated else 0)
    if is_valid is not None:
        where.append("is_valid = ?"); params.append(1 if is_valid else 0)
    w = "WHERE " + " AND ".join(where) if where else ""
    return conn.execute(f"SELECT COUNT(*) FROM secrets {w}", params).fetchone()[0]


def get_secret_by_id(sid: int) -> Optional[dict]:
    conn = get_conn()
    r = conn.execute("SELECT * FROM secrets WHERE id = ?", (sid,)).fetchone()
    return dict(r) if r else None


def update_validation(sid: int, is_valid: Optional[bool], msg: str = ""):
    conn = get_conn()
    with _write_lock:
        conn.execute("""
            UPDATE secrets SET validated=1, is_valid=?, validation_msg=?,
                               validation_date=datetime('now')
            WHERE id=?
        """, (is_valid, msg[:2000], sid))
        conn.commit()


def update_validations_batch(items: list[tuple]):
    """Atualiza varias validações em lote."""
    if not items:
        return
    conn = get_conn()
    with _write_lock:
        conn.executemany("""
            UPDATE secrets SET validated=1, is_valid=?, validation_msg=?,
                               validation_date=datetime('now')
            WHERE id=?
        """, [(iv, msg[:2000], sid) for sid, iv, msg in items])
        conn.commit()


def get_unvalidated(limit=500) -> list[dict]:
    conn = get_conn()
    rows = conn.execute(
        "SELECT id, key_type, key_value, validator_type FROM secrets "
        "WHERE (validated=0) OR (validated=1 AND is_valid IS NULL) LIMIT ?",
        (limit,)
    ).fetchall()
    return [dict(r) for r in rows]


def get_stats_by_type() -> list[dict]:
    conn = get_conn()
    rows = conn.execute("""
        SELECT key_type,
               COUNT(*) as total,
               SUM(validated) as validated_count,
               SUM(CASE WHEN validated=1 AND is_valid=1 THEN 1 ELSE 0 END) as valid_count
        FROM secrets GROUP BY key_type ORDER BY total DESC
    """).fetchall()
    return [dict(r) for r in rows]


def get_dashboard_stats() -> dict:
    conn = get_conn()
    stats = conn.execute("""
        SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN validated=1 THEN 1 ELSE 0 END) AS validated,
            SUM(CASE WHEN validated=1 AND is_valid=1 THEN 1 ELSE 0 END) AS valid,
            SUM(CASE WHEN validated=1 AND (is_valid=0 OR is_valid IS NULL) THEN 1 ELSE 0 END) AS invalid
        FROM secrets
    """).fetchone()
    repos = conn.execute(
        "SELECT COUNT(DISTINCT repo_name) FROM secrets WHERE repo_name IS NOT NULL"
    ).fetchone()[0]
    types = conn.execute(
        "SELECT COUNT(DISTINCT key_type) FROM secrets"
    ).fetchone()[0]
    scans = conn.execute("SELECT COUNT(*) FROM scan_logs").fetchone()[0]
    recent = conn.execute(
        "SELECT COUNT(*) FROM secrets WHERE scan_date >= datetime('now', '-1 day')"
    ).fetchone()[0]
    total = stats["total"]
    validated = stats["validated"]
    return {
        "total_secrets": total,
        "validated": validated,
        "valid": stats["valid"],
        "invalid": stats["invalid"],
        "pending": total - validated,
        "unique_repos": repos,
        "unique_types": types,
        "total_scans": scans,
        "recent_24h": recent,
    }


# ── Scans ──

def save_scan_log(data: dict) -> str:
    conn = get_conn()
    conn.execute("""
        INSERT OR IGNORE INTO scan_logs
            (scan_id, scan_type, query, pattern_count, total_found, new_found,
             repos_scanned, duration_seconds, status, error)
        VALUES (?,?,?,?,?,?,?,?,?,?)
    """, (
        data.get("scan_id"), data.get("scan_type"), data.get("query"),
        data.get("pattern_count", 0), data.get("total_found", 0),
        data.get("new_found", 0), data.get("repos_scanned", 0),
        data.get("duration_seconds", 0), data.get("status", "running"),
        data.get("error"),
    ))
    conn.commit()
    return data.get("scan_id", "")


def update_scan_log(scan_id: str, updates: dict):
    conn = get_conn()
    with _write_lock:
        sets = ", ".join(f"{k}=?" for k in updates)
        vals = list(updates.values()) + [scan_id]
        conn.execute(f"UPDATE scan_logs SET {sets} WHERE scan_id=?", vals)
        conn.commit()


def get_recent_scans(limit=20) -> list[dict]:
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM scan_logs ORDER BY created_at DESC LIMIT ?", (limit,)
    ).fetchall()
    return [dict(r) for r in rows]