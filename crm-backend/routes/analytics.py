from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models.campaign import Campaign
from models.communication import Communication, CommunicationEvent

router = APIRouter()

@router.get("/")
def get_global_analytics(session: Session = Depends(get_session)):
    campaigns = session.exec(select(Campaign)).all()
    communications = session.exec(select(Communication)).all()

    total_sent = len(communications)
    delivered = len([c for c in communications if c.status in ["delivered", "opened", "read", "clicked", "purchased"]])
    failed = len([c for c in communications if c.status == "failed"])
    opened = len([c for c in communications if c.status in ["opened", "read", "clicked", "purchased"]])
    clicked = len([c for c in communications if c.status in ["clicked", "purchased"]])
    purchased = len([c for c in communications if c.status == "purchased"])
    total_revenue = sum(c.actual_revenue for c in campaigns)

    return {
        "total_campaigns": len(campaigns),
        "total_sent": total_sent,
        "delivered": delivered,
        "failed": failed,
        "opened": opened,
        "clicked": clicked,
        "purchased": purchased,
        "total_revenue": total_revenue,
        "delivery_rate": round(delivered / total_sent * 100, 1) if total_sent > 0 else 0,
        "open_rate": round(opened / delivered * 100, 1) if delivered > 0 else 0,
        "click_rate": round(clicked / opened * 100, 1) if opened > 0 else 0,
        "purchase_rate": round(purchased / clicked * 100, 1) if clicked > 0 else 0,
    }

@router.get("/{campaign_id}")
def get_campaign_analytics(campaign_id: int, session: Session = Depends(get_session)):
    campaign = session.get(Campaign, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    communications = session.exec(
        select(Communication).where(Communication.campaign_id == campaign_id)
    ).all()

    total_sent = len(communications)
    delivered = len([c for c in communications if c.status in ["delivered", "opened", "read", "clicked", "purchased"]])
    failed = len([c for c in communications if c.status == "failed"])
    opened = len([c for c in communications if c.status in ["opened", "read", "clicked", "purchased"]])
    read = len([c for c in communications if c.status in ["read", "clicked", "purchased"]])
    clicked = len([c for c in communications if c.status in ["clicked", "purchased"]])
    purchased = len([c for c in communications if c.status == "purchased"])

    return {
        "campaign": campaign,
        "funnel": {
            "sent": total_sent,
            "delivered": delivered,
            "failed": failed,
            "opened": opened,
            "read": read,
            "clicked": clicked,
            "purchased": purchased,
        },
        "rates": {
            "delivery_rate": round(delivered / total_sent * 100, 1) if total_sent > 0 else 0,
            "open_rate": round(opened / delivered * 100, 1) if delivered > 0 else 0,
            "click_rate": round(clicked / opened * 100, 1) if opened > 0 else 0,
            "purchase_rate": round(purchased / clicked * 100, 1) if clicked > 0 else 0,
        },
        "revenue": {
            "predicted": campaign.predicted_revenue,
            "actual": campaign.actual_revenue,
        }
    }