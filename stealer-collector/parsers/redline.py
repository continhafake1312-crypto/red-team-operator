import re
from .base import BaseParser


class RedLineParser(BaseParser):
    name = "redline"

    def can_parse(self, text):
        has_header = bool(re.search(
            r'╔[═╦╗╤╧╡╞╟╠╣╩]*═*╗', text
        )) and bool(re.search(
            r'(?:RedLine|REDLINE|Red\s*Line)', text[:500], re.IGNORECASE
        ))
        has_ip_date = bool(
            re.search(r'IP\s*:\s*\d+\.\d+\.\d+\.\d+', text[:300])
        ) and bool(re.search(r'(?:Date|OS|HWID)\s*:', text[:300]))
        return has_header or has_ip_date

    def parse(self, text, db, raw_log_id):
        text = self.clean_text(text)
        self.extract_tokens(text, db, raw_log_id)

        lines = text.split('\n')
        current_section = None
        block = {}

        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue

            section_match = re.search(
                r'\[(!?)\]\s*(.+?)\s*$', stripped
            )
            if section_match and section_match.group(2).strip() in [
                'Passwords', 'Cookies', 'Autofill', 'Wallets',
                'Credit Cards', 'System Info', 'IP Info',
                'VPN', 'FTP', 'Telegram', 'Discord',
                'Browser', 'Browsers', 'Extensions',
            ]:
                self._flush_block(block, current_section, db, raw_log_id)
                current_section = section_match.group(2).strip()
                block = {}
                continue

            kv = re.match(
                r'(URL|Login|Password|Pass|Domain|Name|Value|Path|'
                r'Expires|Application|Wallet|Address|Private\s*Key|'
                r'IP|OS|HWID|Date|User\s*Name)\s*:\s*(.+)',
                stripped, re.IGNORECASE
            )
            if kv:
                key = kv.group(1).lower().replace(' ', '_')
                # flush previous entry on new URL/domain within same section
                if key == 'url' and 'url' in block and current_section in (
                    'Passwords', 'Credentials', 'Logins',
                ):
                    self._flush_block(block, current_section, db, raw_log_id)
                    block = {}
                if key == 'domain' and 'domain' in block and current_section == 'Cookies':
                    self._flush_block(block, current_section, db, raw_log_id)
                    block = {}
                block[key] = kv.group(2).strip()
            elif current_section in ('System Info', 'IP Info'):
                kv2 = re.match(r'(.+?)\s*:\s*(.+)', stripped)
                if kv2:
                    db.save_system_info and None

        self._flush_block(block, current_section, db, raw_log_id)

    def _flush_block(self, block, section, db, raw_log_id):
        if not block or not section:
            return

        if section in ('Passwords', 'Credentials', 'Logins'):
            db.save_credential(
                raw_log_id,
                url=block.get('url', block.get('URL', '')),
                username=block.get('username', block.get('login', '')),
                password=block.get('password', block.get('pass', '')),
                application=block.get('application', ''),
            )

        elif section == 'Cookies':
            db.save_cookie(
                raw_log_id,
                domain=block.get('domain', block.get('host', '')),
                name=block.get('name', ''),
                value=block.get('value', ''),
                path=block.get('path', '/'),
                expires=block.get('expires', ''),
            )

        elif section == 'Autofill':
            db.save_autofill(
                raw_log_id,
                field_name=block.get('name', ''),
                value=block.get('value', ''),
            )

        elif section in ('Wallets', 'Credit Cards'):
            db.save_wallet(
                raw_log_id,
                wallet_type=block.get('wallet', block.get('application', '')),
                address=block.get('address', block.get('value', '')),
                private_key=block.get('private_key', ''),
            )