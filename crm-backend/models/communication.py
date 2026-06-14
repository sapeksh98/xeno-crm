from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field

class Communication(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    campaign_id: int = Field(foreign_key="campaign.id")
    customer_id: int = Field(foreign_key="customer.id")
    channel: str
    message: str
    phone: str
    status: str = "queued"
    sent_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CommunicationEvent(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    communication_id: int = Field(foreign_key="communication.id")
    status: str
    received_at: datetime = Field(default_factory=datetime.utcnow)