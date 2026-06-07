"""One-off database initializer.

Creates all tables and seeds the default product types and admin user. This used
to run at import time in main.py, which is wrong for serverless (it would run on
every cold start). Run it manually instead, e.g. from the app/server directory:

    python init_db.py

On the existing live Neon database the tables and admin user already exist, so
you typically only need this for a brand-new database or for local development.
"""
from database import engine, Base, SessionLocal
import models  # noqa: F401  ensures models register on Base.metadata
from seed_data import seed_all_data


def main() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_all_data(db)
    finally:
        db.close()
    print("Database initialized and seeded.")


if __name__ == "__main__":
    main()
