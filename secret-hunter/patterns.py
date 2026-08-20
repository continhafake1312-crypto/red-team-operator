"""
Padrões de detecção de chaves/secrets — v2 otimizado.
  - 20+ novos patterns (Cloudflare, Grafana, Pulumi, Firebase Admin, etc.)
  - Regex pré-compiladas com flags otimizadas
  - Prioridade por categoria
  - Validador mapping explícito
"""

import re as _re

# (nome, categoria, regex_str, confiança(1-10), validador)
PATTERNS = [
    # ── CLOUD (AWS/GCP/Azure) ──
    ("AWS Access Key",          "aws",        r"AKIA[0-9A-Z]{16}",                                       10, "aws"),
    ("AWS Secret Key",          "aws",        r"(?i)aws_secret_access_key[\s\"':=]+[\"']?([A-Za-z0-9/+]{40})[\"']?", 10, "aws"),
    ("AWS Session Token",       "aws",        r"(?i)aws_session_token[\s\"':=]+[\"']?([A-Za-z0-9/+]{40,})[\"']?", 9, "aws"),
    ("Google API Key",          "gcp",        r"AIza[0-9A-Za-z\-_]{35}",                                  10, "google_api"),
    ("Google OAuth Client",     "gcp",        r"[0-9]+-[0-9A-Za-z_]{32}\.apps\.googleusercontent\.com",   9, "google_api"),
    ("Google Service Account",  "gcp",        r"\"client_email\":\s*\"[a-z0-9-]+@[a-z0-9-]+\.iam\.gserviceaccount\.com\"", 9, "none"),
    ("Firebase DB URL",         "firebase",   r"https?://[a-z0-9-]+\.(?:firebaseio|firestore)\.com",       8, "none"),
    ("Firebase Admin SDK",      "firebase",   r"-----BEGIN FIREBASE PRIVATE KEY-----",                     10, "none"),
    ("Azure Storage Key",       "azure",      r"AccountKey=[A-Za-z0-9+/=]{80,}",                           10, "none"),
    ("Azure Connection Str",    "azure",      r"DefaultEndpointsProtocol=https;AccountName=[^;]+;AccountKey=[^;]+", 10, "none"),
    ("Azure DevOps PAT",        "azure",      r"(?i)azure(?:devops)?_pat[\s\"':=]+[\"']?([A-Za-z0-9]{52})[\"']?", 9, "none"),
    ("Cloudflare API Key",      "cloudflare", r"(?i)(?:cloudflare|CF)_(?:api|zone)_key[\s\"':=]+[\"']?([A-Za-z0-9_-]{37})[\"']?", 9, "none"),
    ("Cloudflare Token",        "cloudflare", r"cf[A-Z][a-z0-9_-]{39,45}",                                 9, "none"),
    ("DigitalOcean Token",      "do",         r"dop_v1_[A-Za-z0-9_-]{60,}",                                9, "digitalocean"),
    ("Pulumi Access Token",     "pulumi",     r"pul-[A-Za-z0-9_-]{40,}",                                    8, "none"),

    # ── AI / LLM ──
    ("OpenAI API Key",          "openai",     r"sk-[A-Za-z0-9]{20,}(?:T3BlbkFJ[A-Za-z0-9]{,})?",           10, "openai"),
    ("OpenAI Project Key",      "openai",     r"sk-proj-[A-Za-z0-9]{20,}",                                  10, "openai"),
    ("OpenAI Org Key",          "openai",     r"org-[A-Za-z0-9]{20,}",                                       8, "openai"),
    ("Anthropic API Key",       "anthropic",  r"sk-ant-[A-Za-z0-9]{30,}",                                   10, "anthropic"),
    ("HuggingFace Token",       "huggingface",r"hf_[A-Za-z0-9]{30,}",                                       9, "huggingface"),
    ("Gemini API Key",          "gemini",     r"AIza[0-9A-Za-z\-_]{35}",                                    9, "google_api"),
    ("Cohere API Key",          "cohere",     r"cohere_[A-Za-z0-9]{40,}",                                    8, "none"),
    ("Replicate API Token",     "replicate",  r"r8_[A-Za-z0-9]{40,}",                                        8, "none"),

    # ── VERSION CONTROL ──
    ("GitHub PAT",              "github",     r"ghp_[A-Za-z0-9]{36,40}",                                    10, "github"),
    ("GitHub OAuth",            "github",     r"gho_[A-Za-z0-9]{36,40}",                                    10, "github"),
    ("GitHub App",              "github",     r"ghu_[A-Za-z0-9]{36,40}",                                    10, "github"),
    ("GitHub Refresh",          "github",     r"ghr_[A-Za-z0-9]{36,40}",                                    10, "github"),
    ("GitLab PAT",              "gitlab",     r"glpat-[A-Za-z0-9\-_]{20,}",                                 10, "gitlab"),
    ("BitBucket Key",           "bitbucket",  r"(?i)bitbucket_(?:app_password|oauth)[\s\"':=]+[\"']?([A-Za-z0-9]{32,})[\"']?", 8, "none"),

    # ── COMMUNICATION ──
    ("Slack Bot Token",         "slack",      r"xoxb-[0-9]{10,13}-[0-9]{10,13}-[A-Za-z0-9]{24}",            10, "slack"),
    ("Slack App Token",         "slack",      r"xapp-[0-9]-[A-Z0-9]{10,13}-[A-Za-z0-9]{24}",                10, "slack"),
    ("Slack Webhook",           "slack",      r"https://hooks\.slack\.com/services/[A-Z0-9]{8,10}/[A-Z0-9]{8,12}/[A-Za-z0-9]{24}", 10, "none"),
    ("Slack User Token",        "slack",      r"xoxp-[0-9]{10,13}-[0-9]{10,13}-[A-Za-z0-9]{24}",            9, "slack"),
    ("Discord Bot Token",       "discord",    r"[MN][A-Za-z0-9_-]{23,25}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{27,38}", 10, "discord"),
    ("Discord Webhook",         "discord",    r"https://discord(?:app)?\.com/api/webhooks/[0-9]+/[A-Za-z0-9_-]+", 9, "none"),
    ("Telegram Bot Token",      "telegram",   r"[0-9]{8,10}:[A-Za-z0-9_-]{35,40}",                         10, "telegram"),
    ("WhatsApp Token",          "whatsapp",   r"EA[A-Za-z0-9]{60,}",                                         8, "none"),

    # ── PAYMENT / FINTECH ──
    ("Stripe Live Key",         "stripe",     r"sk_live_[A-Za-z0-9]{20,}",                                   10, "stripe"),
    ("Stripe Test Key",         "stripe",     r"sk_test_[A-Za-z0-9]{20,}",                                   9, "stripe"),
    ("Stripe Pub Key",          "stripe",     r"pk_(live|test)_[A-Za-z0-9]{20,}",                            9, "none"),
    ("Stripe Webhook Secret",   "stripe",     r"whsec_[A-Za-z0-9]{32}",                                       9, "none"),
    ("Mercado Pago Token",      "mercadopago",r"TEST-[0-9]{8,}-[A-Za-z0-9]{10,}-[A-Za-z0-9]{10,}-[A-Za-z0-9]{10,}-[0-9]{8,}", 9, "none"),
    ("Mercado Pago Live",       "mercadopago",r"APP_USR-[0-9]{8,}-[A-Za-z0-9]{10,}-[A-Za-z0-9]{10,}-[A-Za-z0-9]{10,}-[0-9]{8,}", 10, "none"),
    ("Pix Key",                 "pix",        r"[0-9]{11}|[0-9]{14}|[0-9]{18}|[a-f0-9]{32}(?::email|:phone|:cpf|:cnpj|:rand)", 6, "none"),

    # ── DATABASES ──
    ("MongoDB URI",             "mongodb",    r"mongodb(?:\+srv)?://[A-Za-z0-9_]+:[^@\s]+@[A-Za-z0-9_.-]+", 10, "mongo"),
    ("PostgreSQL URI",          "postgresql", r"postgres(?:ql)?://[A-Za-z0-9_]+:[^@\s]+@[A-Za-z0-9_.-]+:\d+/[A-Za-z0-9_]+", 10, "postgres"),
    ("MySQL URI",               "mysql",      r"mysql://[A-Za-z0-9_]+:[^@\s]+@[A-Za-z0-9_.-]+:\d+/[A-Za-z0-9_]+", 10, "mysql"),
    ("Redis URI",               "redis",      r"redis://(?::[^@\s]+@)?[A-Za-z0-9_.-]+:\d+",                9, "redis"),
    ("Cassandra URI",           "cassandra",  r"cassandra://[A-Za-z0-9_]+:[^@\s]+@[A-Za-z0-9_.-]+:\d+",     8, "none"),
    ("CouchDB URI",             "couchdb",    r"couchdb://[A-Za-z0-9_]+:[^@\s]+@[A-Za-z0-9_.-]+:\d+",       8, "none"),
    ("Elasticsearch URI",       "elastic",    r"https?://[A-Za-z0-9_]+:[^@\s]+@[A-Za-z0-9_.-]+:\d+",        8, "none"),
    ("SQLite URL",              "sqlite",     r"sqlite:///[A-Za-z0-9_.\-/]+",                                6, "none"),

    # ── NOTIFICATION / EMAIL ──
    ("SendGrid Key",            "sendgrid",   r"SG\.[A-Za-z0-9_-]{22,}\.[A-Za-z0-9_-]{43}",                 10, "sendgrid"),
    ("Mailgun Key",             "mailgun",    r"key-[0-9a-fA-F]{32}",                                        9, "mailgun"),
    ("Mailgun SMTP",            "mailgun",    r"smtp\.mailgun\.org:[A-Za-z0-9_]+:[A-Za-z0-9_]+",            8, "none"),
    ("Twilio SID",              "twilio",     r"\bAC[0-9a-fA-F]{32}\b",                                     9, "twilio"),
    ("Twilio Auth",             "twilio",     r"\bSK[0-9a-fA-F]{32}\b",                                      8, "twilio"),
    ("Twilio Verify SID",       "twilio",     r"\bVA[0-9a-fA-F]{32}\b",                                     8, "none"),
    ("Postmark Token",          "postmark",   r"(?i)postmark_token[\s\"':=]+[\"']?([A-Za-z0-9]{36})[\"']?", 8, "none"),
    ("HubSpot API Key",         "hubspot",    r"(?i)hubspot_api_key[\s\"':=]+[\"']?([A-Za-z0-9]{40})[\"']?", 8, "none"),

    # ── MONITORING / OBSERVABILITY ──
    ("Datadog API Key",         "datadog",    r"(?i)datadog_api_key[\s\"':=]+[\"']?([A-Za-z0-9]{40})[\"']?", 9, "none"),
    ("Datadog App Key",         "datadog",    r"(?i)datadog_app_key[\s\"':=]+[\"']?([A-Za-z0-9]{40})[\"']?", 9, "none"),
    ("New Relic Key",           "newrelic",   r"NRAK-[A-Za-z0-9]{27}",                                       8, "none"),
    ("New Relic License",       "newrelic",   r"(?i)new_relic_license_key[\s\"':=]+[\"']?([A-Za-z0-9]{40})[\"']?", 8, "none"),
    ("Grafana API Key",         "grafana",    r"(?i)grafana_api_key[\s\"':=]+[\"']?([A-Za-z0-9]{40})[\"']?", 8, "none"),
    ("Sentry DSN",              "sentry",     r"https://[a-f0-9]{64}@[a-f0-9]{16}\.ingest\.sentry\.io/\d+",  7, "none"),
    ("Sentry Auth Token",       "sentry",     r"sntrys_[A-Za-z0-9]{40,}",                                    8, "none"),
    ("Rollbar Token",           "rollbar",    r"(?i)rollbar_(?:access_token|post_)['\"]?([A-Za-z0-9]{32})['\"]?", 8, "none"),
    ("PagerDuty Token",         "pagerduty",  r"(?i)pagerduty_api_token[\s\"':=]+[\"']?([A-Za-z0-9_-]{20,})[\"']?", 8, "none"),

    # ── CONTAINER / ORCHESTRATION ──
    ("npm Token",               "npm",        r"npm_[A-Za-z0-9]{36}",                                        9, "npm"),
    ("Docker Hub Token",        "docker",     r"dckr_pat_[A-Za-z0-9_-]{20,}",                               9, "docker"),
    ("Docker Registry Auth",    "docker",     r"(?i)docker_registry_password[\s\"':=]+[\"']?([A-Za-z0-9_\-!@#$%^*()+]{8,})[\"']?", 7, "none"),
    ("Kubernetes Token",        "k8s",        r"(?i)kube(?:rnetes)?_token[\s\"':=]+[\"']?([A-Za-z0-9_\-]{20,})[\"']?", 8, "none"),
    ("Kubernetes Config",       "k8s",        r"-----BEGIN KUBERNETES PRIVATE KEY-----",                     9, "none"),
    ("Helm Repo Password",      "helm",       r"(?i)helm_repo_password[\s\"':=]+[\"']?([A-Za-z0-9_\-!@#$%^*()+]{8,})[\"']?", 7, "none"),

    # ── KEYS / CERTS ──
    ("SSH Private Key",         "ssh",        r"-----BEGIN\s*(?:RSA|DSA|EC|OPENSSH|SSH2|ED25519)\s*PRIVATE\s*KEY-----", 10, "ssh"),
    ("PGP Private Key",         "pgp",        r"-----BEGIN PGP PRIVATE KEY BLOCK-----",                      10, "pgp"),
    ("JWT Token",               "jwt",        r"eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}", 7, "jwt"),
    ("PEM Certificate",         "cert",       r"-----BEGIN CERTIFICATE-----",                                6, "none"),
    ("PKCS12 Key",              "cert",       r"-----BEGIN ENCRYPTED PRIVATE KEY-----",                       8, "none"),

    # ── CI/CD ──
    ("Jenkins API Token",       "jenkins",    r"(?i)jenkins_api_token[\s\"':=]+[\"']?([A-Za-z0-9]{32})[\"']?", 8, "none"),
    ("CircleCI Token",          "circleci",   r"(?i)circleci_token[\s\"':=]+[\"']?([A-Za-z0-9]{40})[\"']?",  8, "none"),
    ("TravisCI Token",          "travisci",   r"(?i)travisci_api_token[\s\"':=]+[\"']?([A-Za-z0-9]{22})[\"']?", 8, "none"),
    ("TeamCity API Token",      "teamcity",   r"(?i)teamcity_api_token[\s\"':=]+[\"']?([A-Za-z0-9_-]{40})[\"']?", 8, "none"),
    ("GitHub Actions Secret",   "github",     r"(?i)GITHUB_TOKEN[\s\"':=]+[\"']?([A-Za-z0-9]{36,40})[\"']?", 9, "github"),

    # ── GENERIC (keywords com baixa confiança) ──
    ("Generic API Key",         "generic",    r"""(?xi)
        (?:api[_-]?key|apikey)[\s\"':=]+[\"']?([A-Za-z0-9_\-]{20,})[\"']?
    """, 6, "none"),
    ("Generic Secret",          "generic",    r"""(?xi)
        (?:secret|token)[\s\"':=]+[\"']?([A-Za-z0-9_\-]{16,})[\"']?
    """, 6, "none"),
    ("Password in Config",      "password",   r"""(?xi)
        (?:password|passwd|senha)[\s\"':=]+[\"']([A-Za-z0-9_\-!@#$%^*+]{8,})[\"']
    """, 6, "password"),
    (".env DB Password",        "password",   r"""DB_PASSWORD\s*=\s*['\"]?([A-Za-z0-9_\-!@#$%^&*()+]{8,})['\"]?""", 7, "password"),
    (".env Secret Key",         "key",        r"""SECRET_KEY\s*=\s*['\"]?([A-Za-z0-9_\-!@#$%^&*()+]{8,})['\"]?""", 7, "none"),
    (".env JWT Secret",         "jwt",        r"""JWT_SECRET\s*=\s*['\"]?([A-Za-z0-9_\-!@#$%^&*()+]{8,})['\"]?""", 7, "jwt"),
    ("Heroku API Key",          "heroku",     r"(?i)heroku_api_key[\s\"':=]+[\"']?([A-Za-z0-9_-]{36})[\"']?", 8, "none"),
    ("Salesforce Token",        "salesforce", r"(?i)sf(?:orce)?_token[\s\"':=]+[\"']?([A-Za-z0-9]{18,})[\"']?", 7, "none"),
    ("SonarQube Token",         "sonarqube",  r"squ_[0-9a-fA-F]{40}",                                        8, "none"),
]

# Categorias agrupadas com labels
CATEGORIES = {
    "aws":           "☁️ AWS",
    "gcp":           "☁️ Google Cloud",
    "azure":         "☁️ Azure",
    "cloudflare":    "☁️ Cloudflare",
    "do":            "🌊 DigitalOcean",
    "pulumi":        "☁️ Pulumi",
    "openai":        "🤖 OpenAI",
    "anthropic":     "🤖 Anthropic",
    "huggingface":   "🤗 HuggingFace",
    "gemini":        "🤖 Gemini",
    "cohere":        "🤖 Cohere",
    "replicate":     "🔄 Replicate",
    "github":        "🐙 GitHub",
    "gitlab":        "🦊 GitLab",
    "bitbucket":     "🪣 BitBucket",
    "slack":         "💬 Slack",
    "discord":       "💬 Discord",
    "telegram":      "💬 Telegram",
    "whatsapp":      "💬 WhatsApp",
    "stripe":        "💳 Stripe",
    "mercadopago":   "💳 Mercado Pago",
    "pix":           "💰 PIX",
    "mongodb":       "🗄️ MongoDB",
    "postgresql":    "🗄️ PostgreSQL",
    "mysql":         "🗄️ MySQL",
    "redis":         "🗄️ Redis",
    "cassandra":     "🗄️ Cassandra",
    "couchdb":       "🗄️ CouchDB",
    "elastic":       "🗄️ Elasticsearch",
    "sqlite":        "🗄️ SQLite",
    "firebase":      "🔥 Firebase",
    "twilio":        "📞 Twilio/SMS",
    "sendgrid":      "📧 SendGrid",
    "mailgun":       "📧 Mailgun",
    "postmark":      "📧 Postmark",
    "hubspot":       "📊 HubSpot",
    "datadog":       "📈 Datadog",
    "newrelic":      "📈 New Relic",
    "grafana":       "📈 Grafana",
    "sentry":        "🐛 Sentry",
    "rollbar":       "🐛 Rollbar",
    "pagerduty":     "🚨 PagerDuty",
    "npm":           "📦 npm",
    "docker":        "🐳 Docker",
    "k8s":           "☸️ Kubernetes",
    "helm":          "⛑️ Helm",
    "ssh":           "🔑 SSH",
    "pgp":           "🔑 PGP",
    "jwt":           "🔐 JWT",
    "cert":          "📜 Certificados",
    "jenkins":       "🔧 Jenkins",
    "circleci":      "🔧 CircleCI",
    "travisci":      "🔧 TravisCI",
    "teamcity":      "🔧 TeamCity",
    "heroku":        "🚀 Heroku",
    "salesforce":    "☁️ Salesforce",
    "sonarqube":     "🔍 SonarQube",
    "generic":       "🔌 Genérico",
    "password":      "🔑 Passwords",
    "key":           "🔑 Keys",
}

def get_category_label(cat: str) -> str:
    return CATEGORIES.get(cat, cat)

# ── Pré-compila TUDO (performance crítica) ──
_COMPILE_FLAGS = _re.MULTILINE | _re.UNICODE
COMPILED_PATTERNS = [
    (name, cat, _re.compile(regex, _COMPILE_FLAGS), conf, validator)
    for name, cat, regex, conf, validator in PATTERNS
]

# Version marker
VERSION = "2.0"