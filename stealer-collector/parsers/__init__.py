from .redline import RedLineParser
from .vidar import VidarParser
from .generic import GenericParser
from .base import BaseParser
from .lumma import LummaParser


PARSERS = [
    RedLineParser(),
    VidarParser(),
    LummaParser(),
    GenericParser(),
]


def parse_log(raw_text, db, raw_log_id):
    for parser in PARSERS:
        if parser.can_parse(raw_text):
            parser.parse(raw_text, db, raw_log_id)
            return parser
    GenericParser().parse(raw_text, db, raw_log_id)
    return None