import re

# Common credential patterns
URL_RE = re.compile(
    r"https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+(?::\d+)?(?:/[-\w$.+!*'(),;:@&=?/~#%]*)?",
    re.IGNORECASE
)

EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")

# Stealer log section headers
SECTION_HEADERS = re.compile(
    r"\[\s*!?\]?\s*(?:Passwords?|Cookies|Autofill|Wallets?|Credit\s*Cards?|"
    r"History|Downloads|VPN|FTP|Telegram|Discord|Sessions?|"
    r"System\s*Info|IP\s*Info|Machine\s*Info|Card|Bank|"
    r"Credentials?|Logins?|Accounts?|Browsers?|Extensions?|"
    r"File\s*Zilla|Steam|Cryptocurrency|Metamask|"
    r"Notes?|Softwares?|Messengers?|Emails?|"
    r"URL:Login:Pass|Combo|UCL)\s*\]",
    re.IGNORECASE
)

# Field extractors for structured stealer logs
FIELD_EXTRACTORS = {
    "url": re.compile(r"(?:URL|Url|url|Site|site|Host|host|Domain|domain|Login\s*URI)\s*[:\-=]\s*(.+)", re.IGNORECASE),
    "username": re.compile(r"(?:Username|username|User|user|Login|login|Email|email|E-mail|Account|account|Name|name)\s*[:\-=]\s*(.+)", re.IGNORECASE),
    "password": re.compile(r"(?:Password|password|Pass|pass|Pwd|pwd|Senha|senha)\s*[:\-=]\s*(.+)", re.IGNORECASE),
    "cookie_domain": re.compile(r"(?:Domain|domain|Host|host)\s*[:\-=]\s*(.+)", re.IGNORECASE),
    "cookie_name": re.compile(r"(?:Name|name|Cookie|cookie)\s*[:\-=]\s*(.+)", re.IGNORECASE),
    "cookie_value": re.compile(r"(?:Value|value|Data|data|Content|content)\s*[:\-=]\s*(.+)", re.IGNORECASE),
    "cookie_expires": re.compile(r"(?:Expires|expires|Expire|expire|Exp|exp)\s*[:\-=]\s*(.+)", re.IGNORECASE),
    "wallet_type": re.compile(r"(?:Wallet|wallet|Type|type)\s*[:\-=]\s*(.+)", re.IGNORECASE),
    "wallet_address": re.compile(r"(?:Address|address|Addr|addr|Wallet|wallet|Public|public)\s*[:\-=]\s*(.+)", re.IGNORECASE),
    "wallet_key": re.compile(r"(?:Private|private|Key|key|Seed|seed|Phrase|phrase|Mnemonic|mnemonic)\s*[:\-=]\s*(.+)", re.IGNORECASE),
    "ip": re.compile(r"(?:IP|ip|Ip|IP\s*Address|ip\s*address)\s*[:\-=]\s*(.+)", re.IGNORECASE),
    "os": re.compile(r"(?:OS|os|Os|Operating\s*System|operating\s*system|System|system)\s*[:\-=]\s*(.+)", re.IGNORECASE),
    "hwid": re.compile(r"(?:HWID|hwid|Hwid|Hardware\s*ID|hardware\s*id|Machine\s*ID|machine\s*id)\s*[:\-=]\s*(.+)", re.IGNORECASE),
    "date": re.compile(r"(?:Date|date|Date\s*Time|date\s*time|Time|time|Log\s*Date|log\s*date)\s*[:\-=]\s*(.+)", re.IGNORECASE),
}

# Combo/CSV line patterns
COMBO_SEPARATORS = re.compile(r"[:\|;,\t]")
COMBO_LINE = re.compile(r"^(.+)[:\|;,\t](.+)[:\|;,\t](.+)$")

# Generic credential line: url:user:pass or url|user|pass
CRED_LINE = re.compile(
    r"^(?:https?://)?(?:[-\w]+\.)+[-\w]+[:\|;,\t].+[:\|;,\t].+$",
    re.IGNORECASE
)

# Cookie line patterns
COOKIE_LINE = re.compile(
    r"^(?:https?://)?(?:[-\w]+\.)+[-\w]+[:\|;,\t][^:\|;,\t]+[:\|;,\t][^:\|;,\t]+$",
    re.IGNORECASE
)

# Token patterns
DISCORD_TOKEN = re.compile(r"(?:mfa\.\w{84}|[MN][\w-]{23,28}\.[\w-]{6,7}\.[\w-]{27,})")
TELEGRAM_TOKEN = re.compile(r"\d{7,10}:[\w\-]{35,40}")
AWS_KEY = re.compile(r"(?:AKIA|ASIA|AKI|ABIA|ACCA)[0-9A-Z]{16}")
GOOGLE_API_KEY = re.compile(r"AIza[0-9A-Za-z\-_]{35}")
GITHUB_TOKEN = re.compile(r"gh[pousr]_[A-Za-z0-9_]{36,255}")

# Stealer name detection
STEALER_NAMES = re.compile(
    r"(RedLine|Redline|Vidar|Raccoon|Lumma|StealC|Aurora|"
    r"MetaStealer|Polar|RisePro|CryptBot|Taurus|"
    r"MarsStealer|Echelon|Arkei|Azorult|"
    r"Predator|Mystery|Blitzed|Typhon|Rh@cab)",
    re.IGNORECASE
)

# Common log headers (RedLine-style ASCII art)
ASCII_HEADER = re.compile(
    r"╔[═╦╗╤╧╡╞╟╠╣╩]*═*╗|"
    r"\[+\s*(?:REDLINE|RED LINE|VIDAR|RACCOON|LUMMA|STEALC)\s*\]+",
    re.IGNORECASE
)

# IPv4
IP_RE = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")