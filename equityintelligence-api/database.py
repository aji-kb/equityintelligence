import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

# Format: postgresql://user:password@host:port/dbname
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# The 'engine' is what was missing! 
# It handles the connection to your Postgres server.
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# SessionLocal is a factory for individual database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for your models to inherit from
Base = declarative_base()

# Dependency to get a DB session for each API request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()