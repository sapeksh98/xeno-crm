from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from database import get_session
from models.customer import Customer, Order
from typing import Optional
import csv
import io
from fastapi import UploadFile, File

router = APIRouter()

@router.get("/")
def get_customers(
    city: Optional[str] = None,
    min_age: Optional[int] = None,
    max_age: Optional[int] = None,
    min_spending: Optional[float] = None,
    inactive_days: Optional[int] = None,
    limit: int = 50,
    offset: int = 0,
    session: Session = Depends(get_session)
):
    query = select(Customer)

    if city:
        query = query.where(Customer.city == city)
    if min_age:
        query = query.where(Customer.age >= min_age)
    if max_age:
        query = query.where(Customer.age <= max_age)
    if min_spending:
        query = query.where(Customer.total_spending >= min_spending)
    if inactive_days:
        from datetime import datetime, timedelta
        cutoff = datetime.utcnow() - timedelta(days=inactive_days)
        query = query.where(Customer.last_purchase_date <= cutoff)

    query = query.offset(offset).limit(limit)
    customers = session.exec(query).all()
    return customers

@router.get("/count")
def get_customer_count(
    city: Optional[str] = None,
    min_age: Optional[int] = None,
    max_age: Optional[int] = None,
    min_spending: Optional[float] = None,
    inactive_days: Optional[int] = None,
    session: Session = Depends(get_session)
):
    query = select(Customer)

    if city:
        query = query.where(Customer.city == city)
    if min_age:
        query = query.where(Customer.age >= min_age)
    if max_age:
        query = query.where(Customer.age <= max_age)
    if min_spending:
        query = query.where(Customer.total_spending >= min_spending)
    if inactive_days:
        from datetime import datetime, timedelta
        cutoff = datetime.utcnow() - timedelta(days=inactive_days)
        query = query.where(Customer.last_purchase_date <= cutoff)

    customers = session.exec(query).all()
    return {"count": len(customers)}

@router.get("/{customer_id}")
def get_customer(customer_id: int, session: Session = Depends(get_session)):
    customer = session.get(Customer, customer_id)
    if not customer:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.post("/upload")
async def upload_customers(file: UploadFile = File(...), session: Session = Depends(get_session)):
    contents = await file.read()
    decoded = contents.decode("utf-8")
    reader = csv.DictReader(io.StringIO(decoded))
    
    created = 0
    for row in reader:
        try:
            customer = Customer(
                name=row.get("name", "Unknown"),
                email=row.get("email", ""),
                phone=row.get("phone", ""),
                city=row.get("city", ""),
                age=int(row.get("age", 25)),
                total_spending=float(row.get("total_spending", 0)),
            )
            session.add(customer)
            created += 1
        except Exception as e:
            continue
    
    session.commit()
    return {"status": "success", "customers_created": created}