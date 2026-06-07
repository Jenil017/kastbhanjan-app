from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+psycopg://postgres:postgres@localhost:5432/kastbhanjan"
)

# Fix for Render/Neon (ensure we use psycopg3)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql://") and "+psycopg" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

# Serverless-friendly engine for Vercel functions.
#
# A Vercel function instance stays "warm" between requests and the module-level
# engine below is reused, so we keep a SMALL connection pool instead of NullPool.
# This lets a warm instance reuse its Postgres connection across requests rather
# than paying the (expensive, especially cross-region) TLS + auth handshake on
# every single request -- which is what made every DB-backed endpoint take ~2.5s.
#
#  - pool_size=1 / max_overflow=2: tiny footprint per instance (functions handle
#    one request at a time), so concurrent instances won't exhaust Neon.
#  - pool_recycle=300: drop connections before Neon's idle timeout / suspend.
#  - pool_pre_ping: replace a dead connection instead of erroring on reuse.
#  - prepare_threshold=None: disable psycopg3 server-side prepared statements so
#    this works whether DATABASE_URL is Neon's direct OR pooled (pgbouncer) host.
engine = create_engine(
    DATABASE_URL,
    pool_size=1,
    max_overflow=2,
    pool_recycle=300,
    pool_pre_ping=True,
    connect_args={"prepare_threshold": None},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
