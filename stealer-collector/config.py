import json
import os
from pathlib import Path

CONFIG_DIR = Path.home() / ".stealer-collector"
CONFIG_FILE = CONFIG_DIR / "config.json"
DB_PATH = CONFIG_DIR / "logs.db"
RAW_DIR = CONFIG_DIR / "raw_logs"

DEFAULT_CHANNELS = [
    "https://t.me/berserklogs",
    "https://t.me/BorwitaFreeLogs",
    "https://t.me/frilogs",
    "https://t.me/Creditunionbanksstore",
    "https://t.me/Log_Market_Place",
    "https://t.me/logsgang2",
    "https://t.me/MalwareLogs",
    "https://t.me/Sl1ddifree",
    "https://t.me/snatch_cloud",
    "https://t.me/typicaltemshchik",
    "https://t.me/clouddvd",
    "https://t.me/realcloud0",
    "https://t.me/tichancloud",
    "https://t.me/BHF_CLOUD",
    "https://t.me/Skyl1neCloud",
    "https://t.me/Mariarticloud",
    "https://t.me/BurnCloudLogs",
    "https://t.me/mercedesbenzcloud",
    "https://t.me/PegasusCloud",
    "https://t.me/EuropeCloud",
    "https://t.me/ManticoreCloud",
    "https://t.me/Trident_Cloud",
    "https://t.me/cvv190_cloud",
    "https://t.me/FehuCloud",
    "https://t.me/DarkSideCloud",
    "https://t.me/StarLinkCloud",
    "https://t.me/ArenaCloudFree",
    "https://t.me/OBSERVERINFO",
    "https://t.me/dnftm_cloud",
    "https://t.me/CloudLeaksBR",
    "https://t.me/darknescloud",
    "https://t.me/CLOUDCASPERLINK",
    "https://t.me/DarkSideCloud",
    "https://t.me/darkside_hubb",
    "https://t.me/Redline_Cl0ud4",
    "https://t.me/universecloudtxt",
]

DEFAULT_CONFIG = {
    "api_id": "",
    "api_hash": "",
    "phone": "",
    "channels": DEFAULT_CHANNELS,
    "poll_interval": 60,
    "max_messages_per_channel": 500,
    "proxy": None,
    "exfil": {
        "webhook_url": "",
        "telegram_bot_token": "",
        "telegram_chat_id": "",
    },
}


def ensure_dirs():
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    RAW_DIR.mkdir(parents=True, exist_ok=True)


def load_config():
    ensure_dirs()
    if CONFIG_FILE.exists():
        with open(CONFIG_FILE) as f:
            return {**DEFAULT_CONFIG, **json.load(f)}
    save_config(DEFAULT_CONFIG)
    return DEFAULT_CONFIG


def save_config(cfg):
    ensure_dirs()
    with open(CONFIG_FILE, "w") as f:
        json.dump(cfg, f, indent=2)