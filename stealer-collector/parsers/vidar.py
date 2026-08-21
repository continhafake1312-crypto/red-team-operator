import re
import csv
import io
from .base import BaseParser


class VidarParser(BaseParser):
    name = "vidar"

    def can_parse(self, text):
        first_500 = text[:500]
        has_csv_header = bool(re.search(
            r'^\[(Passwords|Cookies|Autofill|Wallets)\]$',
            first_500, re.MULTILINE
        ))
        has_csv_lines = bool(re.search(
            r'^Url,Login,Password|^Domain,Name,Value|^Name,Value',
            first_500, re.MULTILINE
        ))
        has_vidar = bool(re.search(r'Vidar|VIDAR', first_500))
        return has_csv_header or has_csv_lines or has_vidar

    def parse(self, text, db, raw_log_id):
        text = self.clean_text(text)
        self.extract_tokens(text, db, raw_log_id)

        sections = text.split('\n[')
        for section in sections:
            if not section.strip():
                continue
            lines = section.strip().split('\n')
            section_name = lines[0].strip('[] ')
            if not section_name:
                continue

            csv_data = '\n'.join(lines[1:])
            if not csv_data.strip():
                continue

            try:
                reader = csv.DictReader(io.StringIO(csv_data))
                for row in reader:
                    self._process_row(section_name, row, db, raw_log_id)
            except Exception:
                for line in lines[1:]:
                    if not line.strip():
                        continue
                    parts = line.strip().split(',')
                    if len(parts) >= 2:
                        self._process_csv_line(section_name, parts, db, raw_log_id)

    def _process_row(self, section, row, db, raw_log_id):
        if section in ('Passwords', 'Credentials'):
            db.save_credential(
                raw_log_id,
                url=row.get('Url', row.get('URL', '')),
                username=row.get('Login', row.get('Username', '')),
                password=row.get('Password', ''),
                application=row.get('Application', ''),
            )
        elif section == 'Cookies':
            db.save_cookie(
                raw_log_id,
                domain=row.get('Domain', ''),
                name=row.get('Name', ''),
                value=row.get('Value', ''),
                path=row.get('Path', '/'),
                expires=row.get('Expires', ''),
            )
        elif section == 'Autofill':
            db.save_autofill(
                raw_log_id,
                field_name=row.get('Name', ''),
                value=row.get('Value', ''),
            )
        elif section in ('Wallets', 'Cryptocurrency'):
            db.save_wallet(
                raw_log_id,
                wallet_type=row.get('Type', row.get('Wallet', '')),
                address=row.get('Address', row.get('Value', '')),
                private_key=row.get('Private Key', ''),
            )

    def _process_csv_line(self, section, parts, db, raw_log_id):
        if section == 'Passwords' and len(parts) >= 3:
            db.save_credential(
                raw_log_id,
                url=parts[0], username=parts[1], password=parts[2],
            )
        elif section == 'Cookies' and len(parts) >= 3:
            db.save_cookie(
                raw_log_id, domain=parts[0], name=parts[1], value=parts[2],
            )