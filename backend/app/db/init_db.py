from sqlalchemy.orm import Session

from app import models


def init_db(_: Session) -> None:
    _ = models

