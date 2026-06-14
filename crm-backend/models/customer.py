from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field

class Customer(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str
    phone: str
    city: str
    age: int
    total_spending: float = 0.0
    last_purchase_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="customer.id")
    amount: float
    status: str = "completed"
    ordered_at: datetime = Field(default_factory=datetime.utcnow)