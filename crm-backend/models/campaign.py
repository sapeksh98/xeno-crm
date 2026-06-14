from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field

class Campaign(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    goal: str
    channel: str = "whatsapp"
    message_template: str = ""
    filters: str = "{}"
    status: str = "draft"
    audience_count: int = 0
    predicted_revenue: float = 0.0
    actual_revenue: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    launched_at: Optional[datetime] = None

class CampaignCustomer(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    campaign_id: int = Field(foreign_key="campaign.id")
    customer_id: int = Field(foreign_key="customer.id")