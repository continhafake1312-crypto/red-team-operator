import re
from .base import BaseParser
from utils.patterns import COMBO_LINE, CRED_LINE, COOKIE_LINE


class GenericParser(BaseParser):
    name = "generic"

    def can_parse(self, text):
        return True

    def parse(self, text, db, raw_log_id):
        text = self.clean_text(text)
        self.extract_tokens(text, db, raw_log_id)

        self._extract_credentials(text, db, raw_log_id)
        self._extract_cookies(text, db, raw_log_id)

    def _split_combo(self, line):
        """Smart split: try rightmost separators first to avoid URL colons."""
        for sep in ['|', ';', '\t', ',', ':']:
            parts = line.rsplit(sep, 2)
            if len(parts) == 3:
                url, user, pwd = parts[0].strip(), parts[1].strip(), parts[2].strip()
                if url and user and pwd:
                    return url, user, pwd
        return None

    def _extract_credentials(self, text, db, raw_log_id):
        seen = set()
        for line in text.split('\n'):
            stripped = line.strip()
            if not stripped or len(stripped) < 6:
                continue

            result = self._split_combo(stripped)
            if result:
                url, user, pwd = result
                key = f"{url}:{user}:{pwd}"
                if key not in seen:
                    seen.add(key)
                    db.save_credential(raw_log_id, url, user, pwd)

    def _extract_cookies(self, text, db, raw_log_id):
        seen = set()
        for line in text.split('\n'):
            stripped = line.strip()
            if not stripped or len(stripped) < 10:
                continue

            parts = stripped.rsplit('\t', 2) if '\t' in stripped else stripped.rsplit('|', 2) if '|' in stripped else stripped.rsplit(':', 2) if stripped.count(':') >= 2 else None
            if parts and len(parts) >= 3:
                domain, name, value = parts[0].strip(), parts[1].strip(), parts[2].strip()
                key = f"{domain}:{name}"
                if key not in seen and domain and name:
                    seen.add(key)
                    db.save_cookie(raw_log_id, domain, name, value)