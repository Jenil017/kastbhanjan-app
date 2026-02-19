import random
from datetime import datetime, timedelta, date
from sqlalchemy.orm import Session
from database import SessionLocal
import models
from models import PaymentType, ExpenseCategory

# Configuration
NUM_BUYERS = 50
START_DATE = date.today() - timedelta(days=365)
END_DATE = date.today()

# Data Lists
FIRST_NAMES = [
    "Rajushbhai",
    "Sameshbhai",
    "Nileshbhai",
    "Jigneshbhai",
    "Kalpeshbhai",
    "Ashishbhai",
    "Dineshbhai",
    "Maheshbhai",
    "Sureshbhai",
    "Rameshbhai",
    "Vijaybhai",
    "Prakashbhai",
    "Hiteshbhai",
    "Mukeshbhai",
    "Kiranbhai",
    "Kishorbhai",
    "Lalitbhai",
    "Manishbhai",
    "Pareshbhai",
    "Rasikbhai",
    "Sandipbhai",
    "Tusharbhai",
    "Umeshbhai",
    "Vipulbhai",
    "Yogeshbhai",
    "Arvindbhai",
    "Bharatbhai",
    "Chandubhai",
    "Dipakbhai",
    "Girishbhai",
    "Harishbhai",
    "Ishwarbhai",
    "Jayeshbhai",
    "Kamleshbhai",
    "Lakhubhai",
    "Maganbhai",
    "Nareshbhai",
    "Omprakash",
    "Parthbhai",
    "Rajulbhai",
    "Satishbhai",
    "Tarunbhai",
    "Udaybhai",
    "Valjibhai",
    "Yasheshbhai",
    "Amrishbhai",
    "Bhaveshbhai",
    "Chetanbhai",
    "Dharmendrabhai",
    "Gautambhai",
]

LAST_NAMES = [
    "Patel",
    "Shah",
    "Mehta",
    "Desai",
    "Joshi",
    "Trivedi",
    "Vyas",
    "Bhatt",
    "Pandya",
    "Thakkar",
    "Parikh",
    "Modi",
    "Soni",
    "Prajapati",
    "Parmar",
    "Solanki",
    "Chauhan",
    "Rathod",
    "Makwana",
    "Dabhi",
    "Gohil",
    "Zala",
    "Jadeja",
    "Vaghela",
    "Sarvaiya",
    "Chudasama",
    "Barot",
    "Gadhvi",
    "Ahir",
    "Rabari",
    "Bharwad",
    "Koli",
    "Thakor",
    "Vankar",
    "Harijan",
    "Darji",
    "Suthar",
    "Luhar",
    "Kumbhar",
    "Moch",
    "Dhobi",
    "Nai",
    "Valand",
    "Modh",
    "Porwal",
    "Shrimali",
    "Oswal",
    "Khandwala",
    "Zaveri",
    "Gandhi",
]

CITIES = [
    "Ahmedabad",
    "Surat",
    "Vadodara",
    "Rajkot",
    "Bhavnagar",
    "Jamnagar",
    "Junagadh",
    "Gandhinagar",
    "Anand",
    "Nadiad",
    "Mehsana",
    "Morbi",
    "Surendranagar",
    "Amreli",
    "Porbandar",
    "Bharuch",
    "Navsari",
    "Valsad",
    "Vapi",
    "Bhuj",
    "Gandhidham",
    "Veraval",
    "Palanpur",
    "Botad",
    "Gondal",
]

PRODUCT_TYPES = ["PLY", "LAFA", "JALAV", "CHAVI", "SHEET", "KHILI", "OTHER"]

EXPENSE_DESCRIPTIONS = [
    "Office Rent",
    "Electricity Bill",
    "Water Bill",
    "Loading Labour",
    "Unloading Labour",
    "Transport to GIDC",
    "Machine Repair",
    "Tea & Snacks",
    "Stationery",
    "Internet Bill",
    "Mobile Recharge",
    "Advance to Staff",
    "Petrol",
    "Diesel",
    "Vehicle Maintenance",
    "Shop Cleaning",
    "Festival Bonus",
    "Misc Expenses",
    "Tax Payment",
    "Consultant Fee",
]

SELLER_NAMES = [
    "Green Eco Recyclers",
    "Om Scrap Traders",
    "Shiv Shakti Scrap",
    "Mahavir Waste Mgmt",
    "Gujarat Raddi Depot",
    "Ahmedabad Scrap Co",
    "Recycle Hub",
    "Eco Friendly Solutions",
    "Waste Warrior",
    "Scrap King",
    "Local Collector - Raju",
    "Local Collector - Mahesh",
    "Factory Waste - GIDC",
    "Construction Site Waste",
    "Demolition Waste",
]


def generate_phone():
    return f"{random.choice(['98', '99', '97', '96', '94', '95', '90', '91', '92', '93'])}{random.randint(10000000, 99999999)}"


def random_date(start, end):
    return start + timedelta(days=random.randint(0, (end - start).days))


def seed_demo_data():
    db = SessionLocal()
    try:
        print("Starting seed process...")

        # 1. Ensure Product Types exist
        print("Checking Product Types...")
        existing_products = {p.name: p for p in db.query(models.ProductType).all()}
        for p_name in PRODUCT_TYPES:
            if p_name not in existing_products:
                new_product = models.ProductType(
                    name=p_name, description=f"{p_name} material"
                )
                db.add(new_product)
        db.commit()

        product_types = db.query(models.ProductType).all()
        product_map = {p.name: p for p in product_types}

        # 2. Creates Buyers
        print(f"Creating {NUM_BUYERS} buyers...")
        buyers = []
        for _ in range(NUM_BUYERS):
            buyer = models.Buyer(
                name=f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
                phone=generate_phone(),
                address=f"{random.randint(1, 99)}, {random.choice(['GIDC', 'Market Yard', 'Main Road', 'Station Road'])}, {random.choice(CITIES)}",
                notes="Regular customer" if random.random() > 0.7 else None,
                opening_balance=0.0,
            )
            db.add(buyer)
            buyers.append(buyer)
        db.commit()

        # Reload buyers with IDs
        buyers = db.query(models.Buyer).all()

        # 3. Generate Transactions (Sales, Payments, Purchases, Expenses)
        print("Generating transactions for the past year...")

        curr_date = START_DATE
        while curr_date <= END_DATE:
            is_weekend = curr_date.weekday() >= 5
            day_activity = 0.5 if is_weekend else 1.0  # Less activity on weekends

            # --- SALES ---
            # Random 0 to 5 sales per day
            num_sales = int(random.randint(0, 5) * day_activity)
            for _ in range(num_sales):
                buyer = random.choice(buyers)
                payment_type = random.choice(
                    [PaymentType.PAID, PaymentType.CREDIT, PaymentType.PARTIAL]
                )

                # Create Sale
                sale = models.Sale(
                    date=curr_date,
                    buyer_id=buyer.id,
                    payment_type=payment_type,
                    notes=f"Order on {curr_date}",
                )
                db.add(sale)
                db.flush()  # Get sale ID

                # Add Sale Items
                sale_total = 0
                num_items = random.randint(1, 4)
                for _ in range(num_items):
                    p_type = random.choice(product_types)
                    qty = round(random.uniform(10, 500), 2)
                    price = round(random.uniform(20, 150), 2)  # Random price per unit
                    total_price = qty * price

                    sale_item = models.SaleItem(
                        sale_id=sale.id,
                        product_type_id=p_type.id,
                        quantity=qty,
                        unit="kg",
                        price_per_unit=price,
                        total_price=total_price,
                    )
                    db.add(sale_item)
                    sale_total += total_price

                sale.total_amount = sale_total

                if payment_type == PaymentType.PAID:
                    sale.payment_received_now = sale_total
                elif payment_type == PaymentType.PARTIAL:
                    sale.payment_received_now = round(
                        sale_total * random.uniform(0.3, 0.7), 2
                    )
                else:  # CREDIT
                    sale.payment_received_now = 0

            # --- PAYMENTS (for credit sales) ---
            # Random 0 to 3 payments per day
            num_payments = int(random.randint(0, 3) * day_activity)
            for _ in range(num_payments):
                buyer = random.choice(buyers)
                # Only if buyer has outstanding balance (roughly simulated)
                amount = round(random.uniform(1000, 50000), 0)

                payment = models.Payment(
                    date=curr_date,
                    buyer_id=buyer.id,
                    amount=amount,
                    payment_method=random.choice(
                        ["Cash", "UPI", "Bank Transfer", "Cheque"]
                    ),
                    notes="Account settlement",
                )
                db.add(payment)

            # --- PURCHASES (Inventory In) ---
            # Random 0 to 2 purchases per day
            if random.random() < 0.4 * day_activity:
                seller = random.choice(SELLER_NAMES)
                qty = round(random.uniform(500, 5000), 2)
                price = round(random.uniform(15, 80), 2)
                total_cost = qty * price

                purchase = models.Purchase(
                    date=curr_date,
                    seller_name=seller,
                    seller_phone=generate_phone(),
                    pickup_location=random.choice(CITIES),
                    scrap_type=random.choice(
                        ["Mixed Wood", "Plywood Scrap", "Timber Waste"]
                    ),
                    transport_service="Local Transport",
                    transport_cost=round(random.uniform(500, 5000), 0),
                    quantity=qty,
                    unit="kg",
                    price_per_unit=price,
                    total_purchase_cost=total_cost,
                    actual_paid_amount=total_cost,
                    notes="Bulk purchase",
                )
                db.add(purchase)

            # --- EXPENSES ---
            # Random expense every few days
            if random.random() < 0.3 * day_activity:
                cat = random.choice(list(ExpenseCategory))
                amount = round(random.uniform(100, 10000), 0)
                desc = random.choice(EXPENSE_DESCRIPTIONS)

                expense = models.Expense(
                    date=curr_date, category=cat, amount=amount, description=desc
                )
                db.add(expense)

            # Commit day's transactions
            if curr_date.day == 1:  # Commit periodically to avoid huge transaction logs
                print(f"Processed {curr_date}...")
                db.commit()

            curr_date += timedelta(days=1)

        print("Finalizing DB commit...")
        db.commit()
        print("Seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding data: {e}")
        import traceback

        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_data()
