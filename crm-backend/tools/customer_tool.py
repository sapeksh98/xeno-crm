from sqlmodel import Session, select
from models.customer import Customer
from database import engine
from datetime import datetime, timedelta

def query_customers(filters: dict) -> dict:
    with Session(engine) as session:
        query = select(Customer)
        
        if filters.get("city"):
            query = query.where(Customer.city == filters["city"])
        if filters.get("min_age"):
            query = query.where(Customer.age >= filters["min_age"])
        if filters.get("max_age"):
            query = query.where(Customer.age <= filters["max_age"])
        if filters.get("min_spending"):
            query = query.where(Customer.total_spending >= filters["min_spending"])
        if filters.get("max_spending"):
            query = query.where(Customer.total_spending <= filters["max_spending"])
        if filters.get("inactive_days"):
            cutoff = datetime.utcnow() - timedelta(days=filters["inactive_days"])
            query = query.where(Customer.last_purchase_date <= cutoff)

        customers = session.exec(query).all()
        sample = [
            {"id": c.id, "name": c.name, "city": c.city,
             "age": c.age, "total_spending": c.total_spending}
            for c in customers[:5]
        ]
        return {"count": len(customers), "sample": sample, "filters_used": filters}