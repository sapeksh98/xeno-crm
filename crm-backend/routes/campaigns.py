from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models.campaign import Campaign, CampaignCustomer
from models.customer import Customer
from typing import Optional
from datetime import datetime, timedelta
from pydantic import BaseModel

router = APIRouter()

class CampaignCreate(BaseModel):
    name: str
    goal: str
    channel: str = "whatsapp"
    message_template: str = ""
    filters: str = "{}"
    audience_count: int = 0
    predicted_revenue: float = 0.0

@router.get("/")
def get_campaigns(session: Session = Depends(get_session)):
    campaigns = session.exec(select(Campaign)).all()
    return campaigns

@router.get("/{campaign_id}")
def get_campaign(campaign_id: int, session: Session = Depends(get_session)):
    campaign = session.get(Campaign, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

@router.post("/")
def create_campaign(data: CampaignCreate, session: Session = Depends(get_session)):
    campaign = Campaign(
        name=data.name,
        goal=data.goal,
        channel=data.channel,
        message_template=data.message_template,
        filters=data.filters,
        audience_count=data.audience_count,
        predicted_revenue=data.predicted_revenue,
        status="draft"
    )
    session.add(campaign)
    session.commit()
    session.refresh(campaign)
    return campaign

@router.post("/{campaign_id}/launch")
def launch_campaign(campaign_id: int, session: Session = Depends(get_session)):
    campaign = session.get(Campaign, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if campaign.status == "launched":
        raise HTTPException(status_code=400, detail="Campaign already launched")

    campaign.status = "launched"
    campaign.launched_at = datetime.utcnow()
    session.add(campaign)
    session.commit()
    session.refresh(campaign)
    return campaign

@router.delete("/{campaign_id}")
def delete_campaign(campaign_id: int, session: Session = Depends(get_session)):
    campaign = session.get(Campaign, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    session.delete(campaign)
    session.commit()
    return {"status": "deleted"}