import re
import hashlib
from utils.patterns import (
    FIELD_EXTRACTORS, SECTION_HEADERS,
    DISCORD_TOKEN, TELEGRAM_TOKEN, AWS_KEY, GITHUB_TOKEN
)


class BaseParser:
    name = "base"

    def can_parse(self, text):
        return False

    def parse(self, text, db, raw_log_id):
        pass

    def extract_field(self, text, field_name):
        pattern = FIELD_EXTRACTORS.get(field_name)
        if pattern:
            m = pattern.search(text)
            if m:
                return m.group(1).strip()
        return None

    def extract_tokens(self, text, db, raw_log_id):
        tokens = []
        for token_type, pattern in [
            ("discord", DISCORD_TOKEN),
            ("telegram", TELEGRAM_TOKEN),
            ("aws", AWS_KEY),
            ("github", GITHUB_TOKEN),
        ]:
            for m in pattern.finditer(text):
                t = (token_type, m.group())
                if t not in tokens:
                    tokens.append(t)
                    db.save_token(raw_log_id, token_type, m.group())
        return tokens

    def hash_content(self, text):
        return hashlib.sha256(text.encode()).hexdigest()[:32]

    def clean_text(self, text):
        text = re.sub(r'\r\n?', '\n', text)
        text = re.sub(r'\ufeff', '', text)
        text = re.sub(r'[^\S\n]+', ' ', text)
        return text.strip()

    def extract_sections(self, text):
        sections = {}
        current_section = None
        lines = []

        for line in text.split('\n'):
            stripped = line.strip()
            if not stripped:
                continue
            if SECTION_HEADERS.search(stripped):
                if current_section and lines:
                    sections[current_section] = '\n'.join(lines)
                current_section = stripped.strip('[]! ')
                lines = []
            elif current_section:
                lines.append(stripped)

        if current_section and lines:
            sections[current_section] = '\n'.join(lines)

        return sections