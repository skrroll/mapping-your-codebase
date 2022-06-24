import sqlalchemy as db
from sqlalchemy.orm import sessionmaker, declarative_base
import os

path = os.path.dirname(os.path.abspath(__file__))
engine = db.create_engine(f"sqlite:///{path}/database.db")
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()
