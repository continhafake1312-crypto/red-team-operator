"""
Operações de banco de dados.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from .models import Secret, ScanLog, StatCounter, init_db, Base

import logging

logger = logging.getLogger(__name__)


class Database:
    """Wrapper para operações do banco."""

    def __init__(self, db_path: str):
        self.db_path = db_path
        self.engine, self.Session = init_db(db_path)

    def get_session(self) -> Session:
        return self.Session()

    # ── Secrets ──────────────────────────────────────────────────────────────

    def save_secret(self, secret_data: Dict[str, Any]) -> int:
        """Salva um secret retornando o ID. Se já existir (key_value duplicado), atualiza."""
        session = self.get_session()
        try:
            # Verifica duplicata pelo key_value
            existing = (
                session.query(Secret)
                .filter(Secret.key_value == secret_data.get("key_value", ""))
                .first()
            )
            if existing:
                # Atualiza metadados se for mais recente
                existing.scan_date = datetime.now(timezone.utc)
                existing.source = secret_data.get("source", existing.source)
                if secret_data.get("validated"):
                    existing.validated = True
                    existing.is_valid = secret_data.get("is_valid")
                    existing.validation_msg = secret_data.get("validation_msg")
                    existing.validation_date = datetime.now(timezone.utc)
                session.commit()
                return existing.id

            secret = Secret(
                key_type=secret_data.get("key_type", "unknown"),
                key_name=secret_data.get("key_name", "Unknown Key"),
                key_value=secret_data.get("key_value", ""),
                masked_value=secret_data.get("masked_value"),
                confidence=secret_data.get("confidence", 5),
                context=secret_data.get("context"),
                source=secret_data.get("source", ""),
                file_path=secret_data.get("file_path"),
                commit_url=secret_data.get("commit_url"),
                author=secret_data.get("author"),
                date_found=secret_data.get("date_found"),
                validated=secret_data.get("validated", False),
                is_valid=secret_data.get("is_valid"),
                validation_msg=secret_data.get("validation_msg"),
                metadata_json=secret_data.get("metadata_json"),
                search_query=secret_data.get("search_query"),
                repo_name=secret_data.get("repo_name"),
                status=secret_data.get("status", "found"),
            )
            session.add(secret)
            session.commit()
            return secret.id
        except Exception as e:
            session.rollback()
            logger.error(f"Erro ao salvar secret: {e}")
            return -1
        finally:
            session.close()

    def get_secret(self, secret_id: int) -> Optional[Dict[str, Any]]:
        session = self.get_session()
        try:
            secret = session.query(Secret).filter(Secret.id == secret_id).first()
            return secret.to_dict() if secret else None
        finally:
            session.close()

    def get_secrets(
        self,
        key_type: Optional[str] = None,
        validated: Optional[bool] = None,
        is_valid: Optional[bool] = None,
        status: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
        order_by: str = "scan_date",
        order_desc: bool = True,
        search: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        session = self.get_session()
        try:
            query = session.query(Secret)
            if key_type:
                query = query.filter(Secret.key_type == key_type)
            if validated is not None:
                query = query.filter(Secret.validated == validated)
            if is_valid is not None:
                query = query.filter(Secret.is_valid == is_valid)
            if status:
                query = query.filter(Secret.status == status)
            if search:
                like = f"%{search}%"
                query = query.filter(
                    and_(
                        Secret.key_value.like(like),
                        Secret.key_name.like(like),
                        Secret.source.like(like),
                        Secret.repo_name.like(like),
                    )
                )

            order_col = getattr(Secret, order_by, Secret.scan_date)
            if order_desc:
                query = query.order_by(desc(order_col))
            else:
                query = query.order_by(order_col)

            query = query.limit(limit).offset(offset)
            return [s.to_dict() for s in query.all()]
        finally:
            session.close()

    def get_secrets_count(
        self,
        key_type: Optional[str] = None,
        validated: Optional[bool] = None,
        is_valid: Optional[bool] = None,
    ) -> int:
        session = self.get_session()
        try:
            query = session.query(func.count(Secret.id))
            if key_type:
                query = query.filter(Secret.key_type == key_type)
            if validated is not None:
                query = query.filter(Secret.validated == validated)
            if is_valid is not None:
                query = query.filter(Secret.is_valid == is_valid)
            return query.scalar() or 0
        finally:
            session.close()

    def get_stats_by_type(self) -> List[Dict[str, Any]]:
        """Retorna contagem agrupada por tipo de key."""
        session = self.get_session()
        try:
            results = (
                session.query(
                    Secret.key_type,
                    func.count(Secret.id).label("total"),
                    func.sum(func.cast(Secret.validated, func.Integer)).label("validated_count"),
                    func.sum(
                        func.cast(
                            and_(Secret.validated == True, Secret.is_valid == True),
                            func.Integer,
                        )
                    ).label("valid_count"),
                )
                .group_by(Secret.key_type)
                .order_by(desc("total"))
                .all()
            )
            return [
                {
                    "key_type": r.key_type,
                    "total": r.total,
                    "validated_count": r.validated_count or 0,
                    "valid_count": r.valid_count or 0,
                }
                for r in results
            ]
        finally:
            session.close()

    def get_recent_secrets(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Retorna os secrets mais recentes."""
        return self.get_secrets(limit=limit, order_by="scan_date", order_desc=True)

    def get_valid_secrets(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Retorna secrets confirmados como válidos."""
        return self.get_secrets(
            validated=True, is_valid=True, limit=limit, order_by="validation_date", order_desc=True
        )

    def update_validation(
        self, secret_id: int, is_valid: bool, message: str = "", raw: str = ""
    ):
        session = self.get_session()
        try:
            secret = session.query(Secret).filter(Secret.id == secret_id).first()
            if secret:
                secret.validated = True
                secret.is_valid = is_valid
                secret.validation_msg = message[:250]
                secret.validation_raw = raw[:5000]
                secret.validation_date = datetime.now(timezone.utc)
                session.commit()
        except Exception as e:
            session.rollback()
            logger.error(f"Erro ao atualizar validação: {e}")
        finally:
            session.close()

    def bulk_update_status(self, ids: List[int], status: str):
        """Atualiza status de múltiplos secrets."""
        session = self.get_session()
        try:
            session.query(Secret).filter(Secret.id.in_(ids)).update(
                {"status": status}, synchronize_session=False
            )
            session.commit()
        except Exception as e:
            session.rollback()
            logger.error(f"Erro ao atualizar status em massa: {e}")
        finally:
            session.close()

    # ── Scan Logs ────────────────────────────────────────────────────────────

    def save_scan_log(self, log_data: Dict[str, Any]) -> str:
        session = self.get_session()
        try:
            log = ScanLog(**log_data)
            session.add(log)
            session.commit()
            return log.scan_id
        except Exception as e:
            session.rollback()
            logger.error(f"Erro ao salvar scan log: {e}")
            return ""
        finally:
            session.close()

    def update_scan_log(self, scan_id: str, updates: Dict[str, Any]):
        session = self.get_session()
        try:
            session.query(ScanLog).filter(ScanLog.scan_id == scan_id).update(updates)
            session.commit()
        except Exception as e:
            session.rollback()
            logger.error(f"Erro ao atualizar scan log: {e}")
        finally:
            session.close()

    def get_recent_scans(self, limit: int = 20) -> List[Dict[str, Any]]:
        session = self.get_session()
        try:
            logs = (
                session.query(ScanLog)
                .order_by(desc(ScanLog.created_at))
                .limit(limit)
                .all()
            )
            return [l.to_dict() for l in logs]
        finally:
            session.close()

    # ── Dashboard Stats ──────────────────────────────────────────────────────

    def get_dashboard_stats(self) -> Dict[str, Any]:
        """Retorna estatísticas agregadas para o dashboard."""
        session = self.get_session()
        try:
            total_secrets = session.query(func.count(Secret.id)).scalar() or 0
            validated = session.query(func.count(Secret.id)).filter(Secret.validated == True).scalar() or 0
            valid = session.query(func.count(Secret.id)).filter(and_(Secret.validated == True, Secret.is_valid == True)).scalar() or 0
            invalid = session.query(func.count(Secret.id)).filter(and_(Secret.validated == True, Secret.is_valid == False)).scalar() or 0
            pending = total_secrets - validated
            unique_repos = (
                session.query(func.count(func.distinct(Secret.repo_name)))
                .filter(Secret.repo_name.isnot(None))
                .scalar()
                or 0
            )
            unique_types = (
                session.query(func.count(func.distinct(Secret.key_type)))
                .scalar()
                or 0
            )
            total_scans = session.query(func.count(ScanLog.id)).scalar() or 0

            # Recent activity (últimas 24h)
            last_24h = datetime.now(timezone.utc)
            recent = (
                session.query(func.count(Secret.id))
                .filter(Secret.scan_date >= last_24h)
                .scalar()
                or 0
            )

            return {
                "total_secrets": total_secrets,
                "validated": validated,
                "valid": valid,
                "invalid": invalid,
                "pending": pending,
                "unique_repos": unique_repos,
                "unique_types": unique_types,
                "total_scans": total_scans,
                "recent_24h": recent,
            }
        finally:
            session.close()

    def delete_duplicates(self):
        """Remove secrets duplicados (key_value repetido)."""
        session = self.get_session()
        try:
            # Encontra duplicatas
            sub = (
                session.query(
                    Secret.key_value,
                    func.min(Secret.id).label("min_id"),
                )
                .group_by(Secret.key_value)
                .having(func.count(Secret.id) > 1)
                .subquery()
            )
            duplicates = (
                session.query(Secret)
                .filter(
                    Secret.key_value == sub.c.key_value,
                    Secret.id != sub.c.min_id,
                )
                .all()
            )
            count = len(duplicates)
            for dup in duplicates:
                session.delete(dup)
            session.commit()
            return count
        except Exception as e:
            session.rollback()
            logger.error(f"Erro ao deletar duplicatas: {e}")
            return 0
        finally:
            session.close()