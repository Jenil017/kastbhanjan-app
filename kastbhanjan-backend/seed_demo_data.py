"""
Demo Data Seed Script
- 12 months of data (Feb 2025 to Feb 2026)
- 25 buyers (mostly Surat, some Ahmedabad)
- 200+ sale records
- Buy 50,000-70,000 kg/month, sell <= that with realistic product split
- Product split per sale: Ply 40-50%, Lafa 20-25%, Jalav 20%, Sheet 3-5%, Khili 2%, Rest ~10%
- Expenses: Tax, Rent, Labour, Transport per month
- Mixed payment types
"""

import random
import os
from datetime import date
from dateutil.relativedelta import relativedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+psycopg://postgres:jainil@localhost:5432/kastbhanjan"
)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql://") and "+psycopg" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
db = Session()

random.seed(42)

# ─── CONFIG ───────────────────────────────────────────────
START_DATE = date(2025, 2, 1)
END_DATE = date(2026, 2, 18)

# Buy 50,000 to 70,000 kg per month
MONTHLY_BUY_MIN = 50000
MONTHLY_BUY_MAX = 70000

# Products: name -> sell price per kg
PRODUCTS = {
    "Ply": 13.0,
    "Lafa": 16.0,
    "Jalav": 4.5,
    "Khili": 26.0,
    "Sheet": 23.0,
    "Other": 10.0,
}


# Product distribution (% of total kg sold per month)
# Ply: 40-50%, Lafa: 20-25%, Jalav: 20%, Sheet: 3-5%, Khili: 2%, Other: rest (~10%)
def get_product_split(total_kg):
    ply_pct = random.uniform(0.40, 0.50)
    lafa_pct = random.uniform(0.20, 0.25)
    jalav_pct = 0.20
    sheet_pct = random.uniform(0.03, 0.05)
    khili_pct = 0.02
    other_pct = 1.0 - ply_pct - lafa_pct - jalav_pct - sheet_pct - khili_pct

    return {
        "Ply": round(total_kg * ply_pct, 1),
        "Lafa": round(total_kg * lafa_pct, 1),
        "Jalav": round(total_kg * jalav_pct, 1),
        "Sheet": round(total_kg * sheet_pct, 1),
        "Khili": round(total_kg * khili_pct, 1),
        "Other": round(total_kg * other_pct, 1),
    }


# Buy price per kg (avg 3 to 3.5)
BUY_PRICE_RANGE = (3.0, 3.5)

SURAT_AREAS = [
    "Udhna, Surat",
    "Katargam, Surat",
    "Varachha, Surat",
    "Limbayat, Surat",
    "Adajan, Surat",
    "Piplod, Surat",
    "Althan, Surat",
    "Dindoli, Surat",
    "Pandesara, Surat",
    "Sachin, Surat",
    "Kamrej, Surat",
    "Bhestan, Surat",
    "Rundh, Surat",
    "Rander, Surat",
    "Pal, Surat",
    "Vesu, Surat",
    "City Light, Surat",
    "Majura Gate, Surat",
    "Ring Road, Surat",
]
AHMEDABAD_AREAS = [
    "Naroda, Ahmedabad",
    "Vatva, Ahmedabad",
    "Odhav, Ahmedabad",
    "Nikol, Ahmedabad",
    "Bapunagar, Ahmedabad",
    "Gomtipur, Ahmedabad",
]

BUYER_NAMES = [
    "Ramesh Patel",
    "Suresh Shah",
    "Mahesh Desai",
    "Dinesh Mehta",
    "Kamlesh Joshi",
    "Nilesh Parmar",
    "Hitesh Solanki",
    "Rakesh Trivedi",
    "Bhavesh Chauhan",
    "Jignesh Patel",
    "Alpesh Rana",
    "Dipesh Modi",
    "Naresh Kumar",
    "Paresh Vora",
    "Umesh Bhatt",
    "Vijay Thakkar",
    "Sanjay Contractor",
    "Ajay Kapoor",
    "Manoj Agarwal",
    "Rajesh Gupta",
    "Haresh Limbachiya",
    "Kiran Doshi",
    "Tushar Gajjar",
    "Chirag Pandya",
    "Bhavin Kothari",
]

SELLER_NAMES = [
    "Arvind Scrap Mart",
    "Bharat Waste Depot",
    "Champaklal & Sons",
    "Dhiraj Traders",
    "Eastern Scrap Co.",
    "Fatima Recyclers",
    "Ganesh Metal Works",
    "Hari Om Scrap",
    "Indo Scrap Agency",
    "Janta Waste Buyers",
]

TRANSPORT_SERVICES = [
    "Surat Transport Co.",
    "Patel Logistics",
    "Om Carriers",
    "Shree Transport",
    "Jay Mataji Logistics",
]

# ─── STEP 1: Clear existing data (except users) ───────────
print("Clearing existing data...")
db.query(models.SaleItem).delete()
db.query(models.Payment).delete()
db.query(models.Sale).delete()
db.query(models.Expense).delete()
db.query(models.Purchase).delete()
db.query(models.Buyer).delete()
db.query(models.ProductType).delete()
db.commit()
print("Done clearing.")

# ─── STEP 2: Create Product Types ─────────────────────────
print("Creating product types...")
product_objs = {}
for name, price in PRODUCTS.items():
    pt = models.ProductType(name=name, description=f"Scrap {name} @ Rs.{price}/kg")
    db.add(pt)
    db.flush()
    product_objs[name] = pt
db.commit()
print(f"Created {len(product_objs)} product types.")

# ─── STEP 3: Create Buyers ────────────────────────────────
print("Creating buyers...")
buyers = []
for i, name in enumerate(BUYER_NAMES):
    if i < 19:
        address = random.choice(SURAT_AREAS)
    else:
        address = random.choice(AHMEDABAD_AREAS)

    phone = f"9{random.randint(100000000, 999999999)}"

    ob_type = random.choice(["owe_us", "owe_us", "owe_us", "advance", "zero"])
    if ob_type == "owe_us":
        opening_balance = round(random.uniform(5000, 50000), 2)
    elif ob_type == "advance":
        opening_balance = round(-random.uniform(2000, 20000), 2)
    else:
        opening_balance = 0.0

    buyer = models.Buyer(
        name=name,
        phone=phone,
        address=address,
        opening_balance=opening_balance,
        notes=f"Regular buyer from {address.split(',')[1].strip()}",
    )
    db.add(buyer)
    db.flush()
    buyers.append(buyer)

db.commit()
print(f"Created {len(buyers)} buyers.")

# ─── STEP 4: Generate monthly data ────────────────────────
print("Generating 12 months of data...")

import calendar


def random_date_in_month(year, month):
    max_day = calendar.monthrange(year, month)[1]
    if year == END_DATE.year and month == END_DATE.month:
        max_day = END_DATE.day
    return date(year, month, random.randint(1, max_day))


current = START_DATE.replace(day=1)
total_sales_count = 0

while current <= END_DATE:
    year = current.year
    month = current.month
    month_label = current.strftime("%b %Y")
    print(f"  Processing {month_label}...")

    # ── How much we buy this month ───────────────────────
    monthly_buy_kg = round(random.uniform(MONTHLY_BUY_MIN, MONTHLY_BUY_MAX))

    # ── Purchases (split into 8-14 trips) ────────────────
    purchase_count = random.randint(8, 14)
    remaining_buy = monthly_buy_kg

    for i in range(purchase_count):
        if i == purchase_count - 1:
            kg = remaining_buy
        else:
            avg = remaining_buy / (purchase_count - i)
            kg = round(random.uniform(avg * 0.6, avg * 1.4), 1)
            kg = min(kg, remaining_buy - (purchase_count - i - 1) * 500)
        remaining_buy -= kg
        kg = max(kg, 500)

        buy_price = round(random.uniform(*BUY_PRICE_RANGE), 2)
        total_cost = round(kg * buy_price, 2)
        transport_cost = round(total_cost * 0.20, 2)
        actual_paid = round(total_cost * random.uniform(0.88, 1.0), 2)

        db.add(
            models.Purchase(
                date=random_date_in_month(year, month),
                seller_name=random.choice(SELLER_NAMES),
                seller_phone=f"9{random.randint(100000000, 999999999)}",
                pickup_location=random.choice(SURAT_AREAS + AHMEDABAD_AREAS[:2]),
                scrap_type="Mixed Scrap",
                transport_service=random.choice(TRANSPORT_SERVICES),
                transport_cost=transport_cost,
                quantity=kg,
                unit="kg",
                price_per_unit=buy_price,
                total_purchase_cost=total_cost,
                actual_paid_amount=actual_paid,
                notes=f"Market purchase {month_label}",
            )
        )

    # ── Sales: sell 80-95% of what we bought ─────────────
    sell_kg_total = round(monthly_buy_kg * random.uniform(0.80, 0.95))

    # Get product-wise kg split for this month
    product_split = get_product_split(sell_kg_total)

    # We'll distribute each product's kg across multiple sales
    # Build a pool of (product_name, kg_chunk) to assign to sales
    sale_chunks = []
    for pname, total_pkg in product_split.items():
        remaining = total_pkg
        while remaining > 50:
            chunk = round(random.uniform(200, min(3000, remaining)), 1)
            chunk = min(chunk, remaining)
            sale_chunks.append((pname, chunk))
            remaining -= chunk
        if remaining > 10:
            sale_chunks.append((pname, remaining))

    random.shuffle(sale_chunks)

    # Group chunks into sales (each sale has 1-3 products)
    sales_this_month = []
    i = 0
    while i < len(sale_chunks):
        num_items = random.randint(1, 3)
        items = sale_chunks[i : i + num_items]
        sales_this_month.append(items)
        i += num_items

    for sale_items_data in sales_this_month:
        buyer = random.choice(buyers)
        sale_date = random_date_in_month(year, month)

        total_amount = sum(
            round(kg * PRODUCTS[pname], 2) for pname, kg in sale_items_data
        )

        payment_type_choice = random.choices(
            ["Paid", "Partial", "Credit"], weights=[40, 35, 25]
        )[0]

        if payment_type_choice == "Paid":
            payment_received = total_amount
        elif payment_type_choice == "Partial":
            payment_received = round(total_amount * random.uniform(0.3, 0.8), 2)
        else:
            payment_received = 0.0

        sale = models.Sale(
            date=sale_date,
            buyer_id=buyer.id,
            payment_type=models.PaymentType(payment_type_choice),
            payment_received_now=payment_received,
            total_amount=total_amount,
        )
        db.add(sale)
        db.flush()

        for pname, kg in sale_items_data:
            db.add(
                models.SaleItem(
                    sale_id=sale.id,
                    product_type_id=product_objs[pname].id,
                    quantity=kg,
                    unit="kg",
                    price_per_unit=PRODUCTS[pname],
                    total_price=round(kg * PRODUCTS[pname], 2),
                )
            )

        total_sales_count += 1

    # ── Payments (8-12 buyers pay standalone this month) ──
    for buyer in random.sample(buyers, k=random.randint(8, 12)):
        db.add(
            models.Payment(
                date=random_date_in_month(year, month),
                buyer_id=buyer.id,
                amount=round(random.uniform(5000, 80000), 2),
                payment_method=random.choice(
                    ["Cash", "UPI", "Bank Transfer", "Cheque"]
                ),
                notes=f"Payment received {month_label}",
            )
        )

    # ── Expenses ──────────────────────────────────────────
    # Rent - every month
    db.add(
        models.Expense(
            date=date(year, month, 1),
            category=models.ExpenseCategory.RENT,
            amount=17000.0,
            description=f"Monthly rent - {month_label}",
        )
    )
    # Labour - every month
    db.add(
        models.Expense(
            date=date(year, month, 1),
            category=models.ExpenseCategory.LABOUR,
            amount=80000.0,
            description=f"Monthly labour wages - {month_label}",
        )
    )
    # Tax - quarterly (Mar, Jun, Sep, Dec)
    if month in [3, 6, 9, 12]:
        db.add(
            models.Expense(
                date=date(year, month, 15),
                category=models.ExpenseCategory.TAX,
                amount=48000.0,
                description=f"Quarterly tax payment - {month_label}",
            )
        )
    # Electricity
    db.add(
        models.Expense(
            date=date(year, month, 5),
            category=models.ExpenseCategory.ELECTRICITY,
            amount=round(random.uniform(3000, 6000), 2),
            description=f"Electricity bill - {month_label}",
        )
    )
    # Water
    db.add(
        models.Expense(
            date=date(year, month, 5),
            category=models.ExpenseCategory.WATER,
            amount=round(random.uniform(500, 1500), 2),
            description=f"Water bill - {month_label}",
        )
    )

    db.commit()
    current = (current + relativedelta(months=1)).replace(day=1)

print(f"\nTotal sales records created: {total_sales_count}")

# ─── STEP 5: Summary ──────────────────────────────────────
print("\n=== SEED COMPLETE ===")
print(f"Buyers:        {db.query(models.Buyer).count()}")
print(f"Product Types: {db.query(models.ProductType).count()}")
print(f"Purchases:     {db.query(models.Purchase).count()}")
print(f"Sales:         {db.query(models.Sale).count()}")
print(f"Sale Items:    {db.query(models.SaleItem).count()}")
print(f"Payments:      {db.query(models.Payment).count()}")
print(f"Expenses:      {db.query(models.Expense).count()}")

db.close()
