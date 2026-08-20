"""
Padrões de detecção de chaves/secrets.

Cada pattern: (nome, categoria, regex, confiança, validador)
"""

PATTERNS = [
    # ── CLOUD ──
    ("AWS Access Key",        "aws",        r"AKIA[0-9A-Z]{16}",                    9, "aws"),
    ("AWS Secret Key",        "aws",        r"(?i)aws_secret_access_key[\s\"':=]+[\"']?([A-Za-z0-9/+]{40})[\"']?", 9, "aws"),
    ("Google API Key",        "gcp",        r"AIza[0-9A-Za-z\-_]{35}",              9, "google_api"),
    ("Firebase DB URL",       "firebase",   r"https?://[a-z0-9-]+\.(?:firebaseio|firestore)\.com", 8, "none"),

    # ── AI ──
    ("OpenAI API Key",        "openai",     r"sk-[A-Za-z0-9]{20,}(?:T3BlbkFJ[A-Za-z0-9]{,})?", 10, "openai"),
    ("OpenAI Project Key",    "openai",     r"sk-proj-[A-Za-z0-9]{20,}",             10, "openai"),
    ("Anthropic API Key",     "anthropic",  r"sk-ant-[A-Za-z0-9]{30,}",              9, "anthropic"),
    ("HuggingFace Token",     "huggingface",r"hf_[A-Za-z0-9]{30,}",                   9, "huggingface"),

    # ── VERSION CONTROL ──
    ("GitHub PAT",            "github",     r"ghp_[A-Za-z0-9]{36,40}",               10, "github"),
    ("GitHub OAuth",          "github",     r"gho_[A-Za-z0-9]{36,40}",               10, "github"),
    ("GitHub App",            "github",     r"ghu_[A-Za-z0-9]{36,40}",               10, "github"),
    ("GitLab PAT",            "gitlab",     r"glpat-[A-Za-z0-9\-_]{20,}",            10, "gitlab"),

    # ── COMMUNICATION ──
    ("Slack Bot Token",       "slack",      r"xoxb-[0-9]{10,13}-[0-9]{10,13}-[A-Za-z0-9]{24}", 10, "slack"),
    ("Slack Webhook",         "slack",      r"https://hooks\.slack\.com/services/[A-Z0-9]{8,10}/[A-Z0-9]{8,12}/[A-Za-z0-9]{24}", 10, "none"),
    ("Slack App Token",       "slack",      r"xapp-[0-9]-[A-Z0-9]{10,13}-[A-Za-z0-9]{24}", 10, "slack"),
    ("Discord Token",         "discord",    r"[MN][A-Za-z0-9_-]{23,25}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{27,38}", 9, "discord"),
    ("Telegram Bot Token",    "telegram",   r"[0-9]{8,10}:[A-Za-z0-9_-]{35,40}",      9, "telegram"),

    # ── PAYMENT ──
    ("Stripe Live Key",       "stripe",     r"sk_live_[A-Za-z0-9]{20,}",              10, "stripe"),
    ("Stripe Test Key",       "stripe",     r"sk_test_[A-Za-z0-9]{20,}",              9, "stripe"),
    ("Mercado Pago Token",    "mercadopago",r"TEST-[0-9]{8,}-[A-Za-z0-9]{10,}-[A-Za-z0-9]{10,}-[A-Za-z0-9]{10,}-[0-9]{8,}", 8, "none"),

    # ── DATABASES ──
    ("MongoDB URI",           "mongodb",    r"mongodb(?:\+srv)?://[A-Za-z0-9_]+:[^@\s]+@[A-Za-z0-9_.-]+", 10, "mongo"),
    ("PostgreSQL URI",        "postgresql", r"postgres(?:ql)?://[A-Za-z0-9_]+:[^@\s]+@[A-Za-z0-9_.-]+:\d+/[A-Za-z0-9_]+", 10, "postgres"),
    ("MySQL URI",             "mysql",      r"mysql://[A-Za-z0-9_]+:[^@\s]+@[A-Za-z0-9_.-]+:\d+/[A-Za-z0-9_]+", 10, "mysql"),
    ("Redis URI",             "redis",      r"redis://(?::[^@\s]+@)?[A-Za-z0-9_.-]+:\d+", 9, "redis"),

    # ── NOTIFICATION / EMAIL ──
    ("SendGrid Key",          "sendgrid",   r"SG\.[A-Za-z0-9_-]{22,}\.[A-Za-z0-9_-]{43}", 10, "sendgrid"),
    ("Mailgun Key",           "mailgun",    r"key-[0-9a-fA-F]{32}",                   9, "mailgun"),
    ("Twilio SID",            "twilio",     r"\bAC[0-9a-fA-F]{32}\b",                 9, "twilio"),
    ("Twilio Auth",           "twilio",     r"\bSK[0-9a-fA-F]{32}\b",                 9, "none"),

    # ── CLOUD SERVICES ──
    ("DigitalOcean Token",    "digitalocean",r"dop_v1_[A-Za-z0-9_-]{60,}",            9, "digitalocean"),
    ("npm Token",             "npm",        r"npm_[A-Za-z0-9]{36}",                   10, "npm"),
    ("Docker Hub Token",      "docker",     r"dckr_pat_[A-Za-z0-9_-]{20,}",           10, "docker"),
    ("New Relic Key",         "newrelic",   r"NRAK-[A-Za-z0-9]{27}",                  9, "none"),
    ("SonarQube Token",       "sonarqube",  r"squ_[0-9a-fA-F]{40}",                   9, "none"),

    # ── KEYS / CERTS ──
    ("SSH Private Key",       "ssh",        r"-----BEGIN\s*(?:RSA|DSA|EC|OPENSSH|SSH2)\s*PRIVATE\s*KEY-----", 10, "none"),
    ("PGP Private Key",       "pgp",        r"-----BEGIN PGP PRIVATE KEY BLOCK-----", 10, "none"),
    ("JWT Token",             "jwt",        r"eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}", 7, "jwt"),

    # ── AZURE ──
    ("Azure Storage Key",     "azure",      r"AccountKey=[A-Za-z0-9+/=]{80,}",        9, "none"),
    ("Azure Connection Str",  "azure",      r"DefaultEndpointsProtocol=https;AccountKey=[^;]+;", 9, "none"),

    # ── GENERIC (case-insensitive no keyword, case-sensitive no value) ──
    ("Generic API Key",       "generic",    r"(?i)(?:api[_-]?key|apikey)[\s\"':=]+[\"']?([A-Za-z0-9]{20,})[\"']?", 7, "none"),
    ("Generic Secret",        "generic",    r"(?i)(?:secret|token)[\s\"':=]+[\"']?([A-Za-z0-9_\-]{16,})[\"']?", 7, "none"),
    ("Password in Config",    "password",   r"(?i)(?:password|passwd|senha)[\s\"':=]+[\"']([A-Za-z0-9_\-!@#$%^*+]{8,})[\"']", 7, "none"),
    ("Password Assign",       "password",   r"(?i)(?:password|passwd|senha)\s*=\s*([A-Za-z0-9_\-]{8,})\b", 6, "none"),
    (".env DB Password",      "password",   r"DB_PASSWORD\s*=\s*['\"]?([A-Za-z0-9_\-!@#$%^&*()+]{8,})['\"]?", 8, "none"),
    (".env Secret Key",       "password",   r"SECRET_KEY\s*=\s*['\"]?([A-Za-z0-9_\-!@#$%^&*()+]{8,})['\"]?", 8, "none"),
]

# Categorias agrupadas
CATEGORIES = {
    "aws":           "☁️ AWS",
    "gcp":           "☁️ Google Cloud",
    "azure":         "☁️ Azure",
    "openai":        "🤖 OpenAI",
    "anthropic":     "🤖 Anthropic",
    "huggingface":   "🤖 HuggingFace",
    "github":        "🐙 GitHub",
    "gitlab":        "🦊 GitLab",
    "slack":         "💬 Slack",
    "discord":       "💬 Discord",
    "telegram":      "💬 Telegram",
    "stripe":        "💳 Stripe",
    "mercadopago":   "💳 Mercado Pago",
    "mongodb":       "🗄️ MongoDB",
    "postgresql":    "🗄️ PostgreSQL",
    "mysql":         "🗄️ MySQL",
    "redis":         "🗄️ Redis",
    "firebase":      "🔥 Firebase",
    "twilio":        "📞 Twilio",
    "sendgrid":      "📧 SendGrid",
    "mailgun":       "📧 Mailgun",
    "digitalocean":  "🌊 DigitalOcean",
    "npm":           "📦 npm",
    "docker":        "🐳 Docker",
    "newrelic":      "📊 New Relic",
    "sonarqube":     "🔍 SonarQube",
    "ssh":           "🔑 SSH Keys",
    "pgp":           "🔑 PGP Keys",
    "jwt":           "🔐 JWT",
    "generic":       "🔌 Genérico",
    "password":      "🔑 Passwords",
}


def get_category_label(cat):
    return CATEGORIES.get(cat, cat)