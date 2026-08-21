import sqlite3
import json
from datetime import datetime
from pathlib import Path
from config import DB_PATH


class Database:
    def __init__(self, db_path=None):
        self.db_path = Path(db_path or DB_PATH)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.conn = sqlite3.connect(str(self.db_path))
        self.conn.row_factory = sqlite3.Row
        self._init_tables()

    def _init_tables(self):
        self.conn.executescript("""
            CREATE TABLE IF NOT EXISTS raw_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source TEXT NOT NULL,
                source_url TEXT,
                channel TEXT,
                message_id INTEGER,
                raw_content TEXT NOT NULL,
                file_name TEXT,
                file_size INTEGER,
                collected_at TEXT NOT NULL DEFAULT (datetime('now')),
                parsed INTEGER DEFAULT 0,
                hash TEXT UNIQUE
            );

            CREATE TABLE IF NOT EXISTS credentials (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                raw_log_id INTEGER REFERENCES raw_logs(id),
                url TEXT,
                username TEXT,
                password TEXT,
                application TEXT,
                source_info TEXT,
                found_at TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS cookies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                raw_log_id INTEGER REFERENCES raw_logs(id),
                domain TEXT,
                name TEXT,
                value TEXT,
                path TEXT,
                expires TEXT,
                httponly INTEGER,
                source_info TEXT,
                found_at TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS wallets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                raw_log_id INTEGER REFERENCES raw_logs(id),
                wallet_type TEXT,
                address TEXT,
                private_key TEXT,
                found_at TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS autofill (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                raw_log_id INTEGER REFERENCES raw_logs(id),
                field_name TEXT,
                value TEXT,
                found_at TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS system_info (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                raw_log_id INTEGER REFERENCES raw_logs(id),
                key TEXT,
                value TEXT
            );

            CREATE TABLE IF NOT EXISTS tokens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                raw_log_id INTEGER REFERENCES raw_logs(id),
                token_type TEXT,
                value TEXT,
                found_at TEXT DEFAULT (datetime('now'))
            );

            CREATE INDEX IF NOT EXISTS idx_creds_url ON credentials(url);
            CREATE INDEX IF NOT EXISTS idx_creds_user ON credentials(username);
            CREATE INDEX IF NOT EXISTS idx_cookies_domain ON cookies(domain);
            CREATE INDEX IF NOT EXISTS idx_raw_hash ON raw_logs(hash);
        """)
        self.conn.commit()

    def save_raw_log(self, source, raw_content, source_url=None, channel=None,
                     message_id=None, file_name=None, file_size=None, hash_val=None):
        now = datetime.utcnow().isoformat()
        self.conn.execute("""
            INSERT OR IGNORE INTO raw_logs
                (source, source_url, channel, message_id, raw_content,
                 file_name, file_size, collected_at, hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (source, source_url, channel, message_id, raw_content,
              file_name, file_size, now, hash_val))
        self.conn.commit()
        return self.conn.execute(
            "SELECT id FROM raw_logs WHERE hash = ?", (hash_val,)
        ).fetchone()

    def save_credential(self, raw_log_id, url, username, password,
                        application=None, source_info=None):
        self.conn.execute("""
            INSERT INTO credentials (raw_log_id, url, username, password,
                                      application, source_info)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (raw_log_id, url, username, password, application, source_info))
        self.conn.commit()

    def save_cookie(self, raw_log_id, domain, name, value, path=None,
                    expires=None, httponly=None, source_info=None):
        self.conn.execute("""
            INSERT INTO cookies (raw_log_id, domain, name, value, path,
                                  expires, httponly, source_info)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (raw_log_id, domain, name, value, path, expires, httponly, source_info))
        self.conn.commit()

    def save_wallet(self, raw_log_id, wallet_type, address, private_key=None):
        self.conn.execute("""
            INSERT INTO wallets (raw_log_id, wallet_type, address, private_key)
            VALUES (?, ?, ?, ?)
        """, (raw_log_id, wallet_type, address, private_key))
        self.conn.commit()

    def save_autofill(self, raw_log_id, field_name, value):
        self.conn.execute("""
            INSERT INTO autofill (raw_log_id, field_name, value)
            VALUES (?, ?, ?)
        """, (raw_log_id, field_name, value))
        self.conn.commit()

    def save_token(self, raw_log_id, token_type, value):
        self.conn.execute("""
            INSERT INTO tokens (raw_log_id, token_type, value)
            VALUES (?, ?, ?)
        """, (raw_log_id, token_type, value))
        self.conn.commit()

    def mark_parsed(self, raw_log_id):
        self.conn.execute(
            "UPDATE raw_logs SET parsed = 1 WHERE id = ?", (raw_log_id,)
        )
        self.conn.commit()

    def get_unparsed(self, limit=100):
        return self.conn.execute(
            "SELECT * FROM raw_logs WHERE parsed = 0 LIMIT ?", (limit,)
        ).fetchall()

    def search_credentials(self, query=None, domain=None, limit=100):
        sql = "SELECT * FROM credentials WHERE 1=1"
        params = []
        if domain:
            sql += " AND url LIKE ?"
            params.append(f"%{domain}%")
        if query:
            sql += " AND (username LIKE ? OR password LIKE ? OR url LIKE ?)"
            p = f"%{query}%"
            params.extend([p, p, p])
        sql += " ORDER BY found_at DESC LIMIT ?"
        params.append(limit)
        return self.conn.execute(sql, params).fetchall()

    def search_cookies(self, domain=None, limit=100):
        sql = "SELECT * FROM cookies WHERE 1=1"
        params = []
        if domain:
            sql += " AND domain LIKE ?"
            params.append(f"%{domain}%")
        sql += " ORDER BY found_at DESC LIMIT ?"
        params.append(limit)
        return self.conn.execute(sql, params).fetchall()

    def stats(self):
        return dict(self.conn.execute("""
            SELECT
                (SELECT COUNT(*) FROM raw_logs) as total_logs,
                (SELECT COUNT(*) FROM raw_logs WHERE parsed=1) as parsed_logs,
                (SELECT COUNT(*) FROM credentials) as total_creds,
                (SELECT COUNT(DISTINCT url) FROM credentials) as unique_urls,
                (SELECT COUNT(DISTINCT username) FROM credentials) as unique_users,
                (SELECT COUNT(*) FROM cookies) as total_cookies,
                (SELECT COUNT(DISTINCT domain) FROM cookies) as unique_domains,
                (SELECT COUNT(*) FROM wallets) as total_wallets,
                (SELECT COUNT(*) FROM tokens) as total_tokens
        """).fetchone())

    def export_creds_json(self, limit=1000):
        rows = self.conn.execute(
            "SELECT * FROM credentials ORDER BY found_at DESC LIMIT ?", (limit,)
        ).fetchall()
        return json.dumps([dict(r) for r in rows], indent=2, default=str)

    def close(self):
        self.conn.close()