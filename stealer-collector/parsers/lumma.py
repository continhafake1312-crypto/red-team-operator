import re
from .base import BaseParser


class LummaParser(BaseParser):
    name = "lumma"

    def can_parse(self, text):
        first_500 = text[:500]
        has_lumma = bool(re.search(r'Lumma|LUMMA|LummaC2', first_500))
        has_log_structure = bool(re.search(
            r'(?:LOGIN|PASS|URL|COOKIE|WALLET|Screenshots?)\s*:',
            first_500
        ))
        has_js_format = ': "' in first_500 and 'LOG:' in first_500
        return has_lumma or (has_log_structure and has_js_format)

    def parse(self, text, db, raw_log_id):
        text = self.clean_text(text)
        self.extract_tokens(text, db, raw_log_id)

        lines = text.split('\n')
        block = {}

        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue

            # JSON-like format: "URL": "value",
            js_match = re.match(
                r'"([A-Z_]+)"\s*:\s*"(.+?)"',
                stripped
            )
            if js_match:
                key = js_match.group(1).upper()
                block[key] = js_match.group(2)
                continue

            # LOG: format
            log_match = re.match(
                r'LOG:\s*(?:\[.*?\])\s*(.+)',
                stripped
            )
            if log_match:
                self._parse_log_line(log_match.group(1), db, raw_log_id)
                continue

            # Key: Value format
            kv = re.match(
                r'(URL|LOGIN|PASS|PASSWORD|COOKIE|DOMAIN|'
                r'NAME|VALUE|WALLET|SEED|PRIVATE|ADDRESS)\s*:\s*(.+)',
                stripped, re.IGNORECASE
            )
            if kv:
                block[kv.group(1).upper()] = kv.group(2).strip()

        self._flush_block(block, db, raw_log_id)

    def _parse_log_line(self, line, db, raw_log_id):
        parts = re.split(r'\s*\|\s*', line)
        if len(parts) >= 3:
            db.save_credential(
                raw_log_id,
                url=parts[0].strip(),
                username=parts[1].strip(),
                password=parts[2].strip(),
            )
        elif len(parts) >= 2 and '@' in parts[0]:
            db.save_credential(
                raw_log_id,
                url='',
                username=parts[0].strip(),
                password=parts[1].strip(),
            )

    def _flush_block(self, block, db, raw_log_id):
        if not block:
            return

        if 'URL' in block and ('LOGIN' in block or 'PASS' in block):
            db.save_credential(
                raw_log_id,
                url=block.get('URL', ''),
                username=block.get('LOGIN', ''),
                password=block.get('PASS', block.get('PASSWORD', '')),
            )

        if 'DOMAIN' in block and 'NAME' in block:
            db.save_cookie(
                raw_log_id,
                domain=block.get('DOMAIN', ''),
                name=block.get('NAME', ''),
                value=block.get('VALUE', ''),
            )

        if 'WALLET' in block or 'SEED' in block:
            db.save_wallet(
                raw_log_id,
                wallet_type=block.get('WALLET', ''),
                address=block.get('ADDRESS', ''),
                private_key=block.get('SEED', block.get('PRIVATE', '')),
            )