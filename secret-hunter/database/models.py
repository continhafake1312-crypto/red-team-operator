"""
Modelos de banco de dados SQLAlchemy para armazenar secrets encontrados.
"""

from datetime import datetime, timezone
from sqlalchemy import (
    create_engine, Column, Integer, String, Text, DateTime,
    Boolean, Float, JSON, Index, func
)
from sqlalchemy.orm import declarative_base, sessionmaker

Base = declarative_base()


class Secret(Base):
    """Um secret/chave encontrado em um scan."""
    __tablename__ = "secrets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    key_type = Column(String(64), nullable=False, index=True)       # aws, stripe, github_token...
    key_name = Column(String(128), nullable=False)                   # AWS Access Key ID, Stripe Live Key...
    key_value = Column(Text, nullable=False)                         # O valor da chave encontrada
    masked_value = Column(String(64), nullable=True)                 # Versão mascarada pra exibição
    confidence = Column(Integer, default=5)                          # Nível de confiança (1-10)
    context = Column(Text, nullable=True)                            # Contexto onde foi encontrado
    source = Column(String(256), nullable=False, index=True)         # De onde veio (repo URL, commit, gist)
    file_path = Column(String(512), nullable=True)                   # Caminho do arquivo
    commit_url = Column(String(512), nullable=True)                  # URL do commit
    author = Column(String(128), nullable=True)                      # Autor do commit
    date_found = Column(String(32), nullable=True)                   # Data do commit/arquivo
    scan_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Validação
    validated = Column(Boolean, default=False)                      # Se já foi validado
    is_valid = Column(Boolean, nullable=True)                       # Se a chave é válida (None = não testado)
    validation_msg = Column(String(256), nullable=True)             # Mensagem da validação
    validation_date = Column(DateTime, nullable=True)               # Quando foi validado
    validation_raw = Column(Text, nullable=True)                    # Resposta raw da validação

    # Metadados
    metadata_json = Column(JSON, nullable=True)                     # Metadados extras
    search_query = Column(String(256), nullable=True, index=True)   # Query usada pra encontrar
    repo_name = Column(String(256), nullable=True, index=True)      # Nome do repo
    status = Column(String(32), default="found")                    # found, rotating, revoked, expired

    __table_args__ = (
        Index("idx_secret_key_value_hash", "key_value"),  # Use hash index
        Index("idx_secret_validated", "validated", "is_valid"),
        Index("idx_secret_date", "date_found"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "key_type": self.key_type,
            "key_name": self.key_name,
            "key_value": self.masked_value or self.key_value[:20] + "...",
            "confidence": self.confidence,
            "context": self.context[:200] + "..." if self.context and len(self.context) > 200 else self.context,
            "source": self.source,
            "file_path": self.file_path,
            "commit_url": self.commit_url,
            "author": self.author,
            "date_found": self.date_found,
            "scan_date": self.scan_date.isoformat() if self.scan_date else None,
            "validated": self.validated,
            "is_valid": self.is_valid,
            "validation_msg": self.validation_msg,
            "validation_date": self.validation_date.isoformat() if self.validation_date else None,
            "repo_name": self.repo_name,
            "status": self.status,
        }


class ScanLog(Base):
    """Log de cada scan executado."""
    __tablename__ = "scan_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    scan_id = Column(String(64), unique=True, nullable=False, index=True)
    scan_type = Column(String(32), nullable=False)                  # github_code, github_commit, gist, local
    query = Column(String(256), nullable=True)                      # Query usada
    pattern_count = Column(Integer, default=0)                      # Quantos patterns buscados
    total_found = Column(Integer, default=0)                        # Total de findings
    new_found = Column(Integer, default=0)                          # Novos (não duplicatas)
    repos_scanned = Column(Integer, default=0)                      # Repos escaneados
    duration_seconds = Column(Float, default=0.0)                   # Duração
    status = Column(String(32), default="running")                  # running, completed, failed
    error = Column(Text, nullable=True)                             # Mensagem de erro
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "scan_id": self.scan_id,
            "scan_type": self.scan_type,
            "query": self.query,
            "pattern_count": self.pattern_count,
            "total_found": self.total_found,
            "new_found": self.new_found,
            "repos_scanned": self.repos_scanned,
            "duration_seconds": round(self.duration_seconds, 2),
            "status": self.status,
            "error": self.error,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class StatCounter(Base):
    """Contadores agregados para o dashboard (cache)."""
    __tablename__ = "stat_counters"

    id = Column(Integer, primary_key=True, autoincrement=True)
    stat_key = Column(String(64), unique=True, nullable=False, index=True)
    stat_value = Column(Integer, default=0)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


def init_db(db_path: str):
    """Inicializa o banco de dados e retorna engine e session."""
    engine = create_engine(f"sqlite:///{db_path}?check_same_thread=False")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    return engine, Session