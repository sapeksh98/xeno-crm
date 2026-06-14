import random
from datetime import datetime, timedelta
from sqlmodel import Session
from database import engine
from models.customer import Customer, Order

NAMES = [
    "Rahul Sharma", "Priya Singh", "Amit Kumar", "Neha Gupta", "Raj Patel",
    "Anjali Verma", "Vikram Malhotra", "Pooja Iyer", "Arjun Nair", "Sneha Reddy",
    "Rohit Joshi", "Kavya Menon", "Suresh Pillai", "Divya Bose", "Karan Mehta",
    "Ananya Chatterjee", "Nikhil Rao", "Shreya Desai", "Aditya Shah", "Riya Kapoor",
    "Manish Tiwari", "Swati Mishra", "Deepak Agarwal", "Pallavi Jain", "Sanjay Nair",
    "Meera Krishnan", "Vivek Pandey", "Tanvi Saxena", "Ashish Yadav", "Priti Dubey"
]

CITIES = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad",
          "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Lucknow"]

def random_phone():
    return f"+91{random.randint(7000000000, 9999999999)}"

def random_email(name):
    clean = name.lower().replace(" ", ".")
    domains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"]
    return f"{clean}{random.randint(1,999)}@{random.choice(domains)}"

def random_date(days_back=365):
    return datetime.utcnow() - timedelta(days=random.randint(0, days_back))

def seed_data():
    with Session(engine) as session:

        # Check if already seeded
        from sqlmodel import select
        existing = session.exec(select(Customer)).first()
        if existing:
            print("Data already seeded.")
            return

        print("Seeding customers and orders...")

        customers = []
        for i in range(500):
            name = random.choice(NAMES)
            name = f"{name.split()[0]} {name.split()[1]}{i}"
            customer = Customer(
                name=name,
                email=random_email(name),
                phone=random_phone(),
                city=random.choice(CITIES),
                age=random.randint(18, 55),
                total_spending=0.0,
                last_purchase_date=None,
            )
            session.add(customer)
            customers.append(customer)

        session.commit()

        # Refresh to get IDs
        for c in customers:
            session.refresh(c)

        print("Customers created. Now seeding orders...")

        for i in range(2000):
            customer = random.choice(customers)
            amount = round(random.uniform(500, 15000), 2)
            order_date = random_date(400)

            order = Order(
                customer_id=customer.id,
                amount=amount,
                status=random.choice(["completed", "completed", "completed", "returned"]),
                ordered_at=order_date,
            )
            session.add(order)

            # Update customer spending and last purchase
            customer.total_spending += amount
            if customer.last_purchase_date is None or order_date > customer.last_purchase_date:
                customer.last_purchase_date = order_date

            session.add(customer)

        session.commit()
        print("✅ Seeding complete — 500 customers, 2000 orders created.")

if __name__ == "__main__":
    from database import create_db_and_tables
    create_db_and_tables()
    seed_data()