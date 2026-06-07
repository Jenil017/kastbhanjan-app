"""
Script to add the actual_paid_amount column to the purchases table
Run this once to update your existing database schema
"""

from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+psycopg://postgres:jainil@localhost:5432/kastbhanjan"
)

# Fix for Render (SQLAlchemy requires postgresql:// but Render provides postgres://)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as conn:
        # Add the column if it doesn't exist
        conn.execute(
            text(
                """
            ALTER TABLE purchases 
            ADD COLUMN IF NOT EXISTS actual_paid_amount FLOAT;
        """
            )
        )
        conn.commit()
        print("✓ Successfully added actual_paid_amount column to purchases table!")
except Exception as e:
    print(f"✗ Error: {e}")
    print("\nNote: If the column already exists, you can ignore this error.")
