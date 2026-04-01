import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase

DB_PATH = os.getenv("DB_PATH", "prelegal.db")
engine = create_engine(f"sqlite:///{DB_PATH}", echo=False)


class Base(DeclarativeBase):
    pass


def init_db():
    Base.metadata.create_all(engine)
