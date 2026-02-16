from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import models
from auth import get_password_hash


def update_users():
    db = SessionLocal()
    try:
        # Update existing admin user or create if not exists
        # Target: jemishmoradiya7@gmail.com / jemish9898

        # Check for the old default admin first
        old_admin_email = "admin@kastbhanjan.com"
        target_email = "jemishmoradiya7@gmail.com"
        target_password = "jemish9898"

        user = (
            db.query(models.User).filter(models.User.email == old_admin_email).first()
        )

        if user:
            print(f"Updating user {old_admin_email} to {target_email}...")
            user.email = target_email
            user.hashed_password = get_password_hash(target_password)
            db.commit()
            print("User updated successfully.")
        else:
            # Check if target email already exists
            user = (
                db.query(models.User).filter(models.User.email == target_email).first()
            )
            if user:
                print(f"User {target_email} already exists. Updating password...")
                user.hashed_password = get_password_hash(target_password)
                db.commit()
                print("Password updated.")
            else:
                print(f"Creating user {target_email}...")
                new_user = models.User(
                    email=target_email,
                    hashed_password=get_password_hash(target_password),
                    full_name="Jemish Moradiya",
                    is_admin=True,
                    is_active=True,
                )
                db.add(new_user)
                db.commit()
                print("User created successfully.")

        # Add second user (keeping this quiet as requested)
        # Target: jenilmoradiya7@gmail.com / jainil9898
        second_email = "jenilmoradiya7@gmail.com"
        second_password = "jainil9898"

        second_user = (
            db.query(models.User).filter(models.User.email == second_email).first()
        )
        if not second_user:
            second_user = models.User(
                email=second_email,
                hashed_password=get_password_hash(second_password),
                full_name="Jenil Moradiya",
                is_admin=True,
                is_active=True,
            )
            db.add(second_user)
            db.commit()

    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("Starting user update script...")
    update_users()
    print("Done.")
