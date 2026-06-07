"""One-off PRODUCTION reset.

Deletes ALL data (sale items, payments, sales, purchases, expenses, buyers,
product types) AND ALL users, then re-seeds the default product types and a
single admin user.

Credentials and confirmation are read from the environment so nothing sensitive
is committed:

    RESET_CONFIRM=YES ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=secret \
        python reset_db.py

DATABASE_URL must point at the database you intend to reset (e.g. the Neon
production database). Double-check it before running -- this is IRREVERSIBLE.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, engine, Base
import models
from auth import get_password_hash
from seed_data import seed_product_types

# FK-safe deletion order (children before parents)
DELETE_ORDER = (
    models.SaleItem,
    models.Payment,
    models.Sale,
    models.Purchase,
    models.Expense,
    models.Buyer,
    models.ProductType,
    models.User,
)

COUNT_MODELS = (
    models.User,
    models.ProductType,
    models.Buyer,
    models.Purchase,
    models.Sale,
    models.SaleItem,
    models.Payment,
    models.Expense,
)


def _counts(db):
    for M in COUNT_MODELS:
        print(f"  {M.__name__}: {db.query(M).count()}")


def main():
    # Print the target DB host first (no credentials) so a dry run -- running
    # without RESET_CONFIRM=YES -- can be used to verify you are pointed at the
    # intended database before anything is deleted.
    from database import DATABASE_URL

    host = DATABASE_URL.split("@")[-1].split("/")[0] if "@" in DATABASE_URL else "?"
    print(f"Target database host: {host}")

    if os.getenv("RESET_CONFIRM") != "YES":
        print("Refusing to run: set RESET_CONFIRM=YES to confirm the wipe.")
        sys.exit(1)

    email = os.getenv("ADMIN_EMAIL")
    password = os.getenv("ADMIN_PASSWORD")
    name = os.getenv("ADMIN_NAME", "Admin")
    if not email or not password:
        print("Refusing to run: ADMIN_EMAIL and ADMIN_PASSWORD must be set.")
        sys.exit(1)

    # Make sure tables exist (no-op if they already do).
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("\n=== BEFORE ===")
        _counts(db)

        print("\n=== DELETING ===")
        for M in DELETE_ORDER:
            n = db.query(M).delete()
            print(f"Deleted {n} {M.__name__}")
        db.commit()

        # Re-seed default product types
        seed_product_types(db)

        # Create the single admin user
        admin = models.User(
            email=email,
            hashed_password=get_password_hash(password),
            full_name=name,
            is_admin=True,
            is_active=True,
        )
        db.add(admin)
        db.commit()
        print(f"\nCreated admin user: {email}")

        print("\n=== AFTER ===")
        _counts(db)
        print("\nDone. Reset complete.")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
