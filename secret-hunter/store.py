"""
Armazenamento SQLite direto (sem ORM).
"""

import sqlite3
import threading
from datetime import datetime
from pathlib import Path
from typing import Optional

DB_PATH = Path(__file__).parent / "data" / "secrets.db"
_local = threading.local()


def get_conn():
    """Retorna conexão thread-local."""
    if not hasattr(_local, "conn") or _local.conn is None:
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        _local.conn = sqlite3.connect(str(DB_PATH))
        _local.conn.row_factory = sqlite3.Row
        _local.conn.execute("PRAGMA journal_mode=WAL")
        _local.conn.execute("PRAGMA synchronous=OFF")
        _init_db(_local.conn)
    return _local.conn


def _init_db(conn):
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
            scan_id TEXT
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


# ── Secrets ──────────────────────────────────────────────────────────────

def save_secret(data: dict) -> int:
    """Insere ou atualiza. Retorna id."""
    conn = get_conn()
    try:
        existing = conn.execute(
            "SELECT id FROM secrets WHERE key_value = ?", (data["key_value"],)
        ).fetchone()
        if existing:
            conn.execute("""
                UPDATE secrets SET
                    validated=COALESCE(?, validated),
                    is_valid=COALESCE(?, is_valid),
                    validation_msg=COALESCE(?, validation_msg),
                    validation_date=CASE WHEN ? IS NOT NULL THEN datetime('now') ELSE validation_date END
                WHERE id=?
            """, (
                data.get("validated"),
                data.get("is_valid"),
                data.get("validation_msg"),
                data.get("validation_date"),
                existing["id"],
            ))
            conn.commit()
            return existing["id"]

        conn.execute("""
            INSERT INTO secrets
                (key_type, key_name, key_value, masked_value, confidence, context,
                 source, file_path, commit_url, author, date_found,
                 validated, is_valid, repo_name, search_query, status, scan_id)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, (
            data.get("key_type", ""),
            data.get("key_name", ""),
            data.get("key_value", ""),
            data.get("masked_value"),
            data.get("confidence", 5),
            data.get("context", "")[:2000],
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
        ))
        conn.commit()
        return conn.execute("SELECT last_insert_rowid()").fetchone()[0]
    except sqlite3.IntegrityError:
        return 0
    except Exception as e:
        print(f"[DB] Erro: {e}")
        conn.rollback()
        return 0


def get_secrets(key_type=None, validated=None, is_valid=None,
                search=None, limit=100, offset=0, order_by="scan_date", order_desc=True):
    conn = get_conn()
    where = []
    params = []
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
    direction = "DESC" if order_desc else "ASC"
    sql = f"SELECT * FROM secrets {w} ORDER BY {order_by} {direction} LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    rows = conn.execute(sql, params).fetchall()
    return [dict(r) for r in rows]


def count_secrets(key_type=None, validated=None, is_valid=None):
    conn = get_conn()
    where = []; params = []
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
    conn.execute("""
        UPDATE secrets SET validated=1, is_valid=?, validation_msg=?, validation_date=datetime('now')
        WHERE id=?
    """, (is_valid, msg[:500], sid))
    conn.commit()


def get_stats_by_type():
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
    total = conn.execute("SELECT COUNT(*) FROM secrets").fetchone()[0]
    validated = conn.execute("SELECT COUNT(*) FROM secrets WHERE validated=1").fetchone()[0]
    valid = conn.execute("SELECT COUNT(*) FROM secrets WHERE validated=1 AND is_valid=1").fetchone()[0]
    invalid = conn.execute("SELECT COUNT(*) FROM secrets WHERE validated=1 AND is_valid=0").fetchone()[0]
    repos = conn.execute("SELECT COUNT(DISTINCT repo_name) FROM secrets WHERE repo_name IS NOT NULL").fetchone()[0]
    types = conn.execute("SELECT COUNT(DISTINCT key_type) FROM secrets").fetchone()[0]
    scans = conn.execute("SELECT COUNT(*) FROM scan_logs").fetchone()[0]
    recent = conn.execute("SELECT COUNT(*) FROM secrets WHERE scan_date >= datetime('now', '-1 day')").fetchone()[0]
    return {
        "total_secrets": total, "validated": validated, "valid": valid,
        "invalid": invalid, "pending": total - validated,
        "unique_repos": repos, "unique_types": types,
        "total_scans": scans, "recent_24h": recent,
    }


# ── Scans ────────────────────────────────────────────────────────────────

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
    sets = ", ".join(f"{k}=?" for k in updates)
    vals = list(updates.values()) + [scan_id]
    conn.execute(f"UPDATE scan_logs SET {sets} WHERE scan_id=?", vals)
    conn.commit()


def get_recent_scans(limit=20):
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM scan_logs ORDER BY created_at DESC LIMIT ?", (limit,)
    ).fetchall()
    return [dict(r) for r in rows]