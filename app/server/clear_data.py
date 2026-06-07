"""
Clear all data from the database, keeping only users Jenil and Jemish.
Deletes: sale_items, sales, payments, purchases, expenses, buyers, product_types
Keeps: users (Jenil & Jemish only)
"""

import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, engine
from models import User, ProductType, Buyer, Purchase, Sale, SaleItem, Payment, Expense


def clear_all_data():
    db = SessionLocal()
    try:
        # Count before
        print("=== BEFORE CLEANUP ===")
        print(f"Users: {db.query(User).count()}")
        print(f"Product Types: {db.query(ProductType).count()}")
        print(f"Buyers: {db.query(Buyer).count()}")
        print(f"Purchases: {db.query(Purchase).count()}")
        print(f"Sales: {db.query(Sale).count()}")
        print(f"Sale Items: {db.query(SaleItem).count()}")
        print(f"Payments: {db.query(Payment).count()}")
        print(f"Expenses: {db.query(Expense).count()}")

        # Show users
        users = db.query(User).all()
        print("\nAll users:")
        for u in users:
            print(f"  ID={u.id}, email={u.email}, name={u.full_name}")

        # Delete in order (respect foreign keys)
        print("\n=== DELETING DATA ===")

        deleted = db.query(SaleItem).delete()
        print(f"Deleted {deleted} sale items")

        deleted = db.query(Payment).delete()
        print(f"Deleted {deleted} payments")

        deleted = db.query(Sale).delete()
        print(f"Deleted {deleted} sales")

        deleted = db.query(Purchase).delete()
        print(f"Deleted {deleted} purchases")

        deleted = db.query(Expense).delete()
        print(f"Deleted {deleted} expenses")

        deleted = db.query(Buyer).delete()
        print(f"Deleted {deleted} buyers")

        deleted = db.query(ProductType).delete()
        print(f"Deleted {deleted} product types")

        # Delete users except Jenil and Jemish
        users_to_keep = (
            db.query(User)
            .filter(
                User.email.in_(
                    ["jenilmoradiya7@gmail.com", "jemishmoradiya7@gmail.com"]
                )
            )
            .all()
        )

        keep_ids = [u.id for u in users_to_keep]
        print(f"\nKeeping users: {[(u.email, u.full_name) for u in users_to_keep]}")

        if keep_ids:
            deleted = (
                db.query(User)
                .filter(User.id.notin_(keep_ids))
                .delete(synchronize_session="fetch")
            )
            print(f"Deleted {deleted} other users")

        db.commit()

        # Count after
        print("\n=== AFTER CLEANUP ===")
        print(f"Users: {db.query(User).count()}")
        print(f"Product Types: {db.query(ProductType).count()}")
        print(f"Buyers: {db.query(Buyer).count()}")
        print(f"Purchases: {db.query(Purchase).count()}")
        print(f"Sales: {db.query(Sale).count()}")
        print(f"Sale Items: {db.query(SaleItem).count()}")
        print(f"Payments: {db.query(Payment).count()}")
        print(f"Expenses: {db.query(Expense).count()}")

        remaining_users = db.query(User).all()
        print("\nRemaining users:")
        for u in remaining_users:
            print(f"  ID={u.id}, email={u.email}, name={u.full_name}")

        print("\n✅ All data cleared successfully!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    clear_all_data()
