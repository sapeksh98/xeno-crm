import json
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlmodel import Session, select
from database import get_session
from models.campaign import Campaign, CampaignCustomer
from models.customer import Customer
from services.campaign_agent import create_campaign_from_goal
from services.ai_service import generate_insights, generate_retargeting_advice, personalize_message
from datetime import datetime, timedelta

router = APIRouter(prefix="/ai", tags=["ai"])

class GoalRequest(BaseModel):
    goal: str

class PersonalizeRequest(BaseModel):
    template: str
    customer: dict

def get_matching_customers(filters: dict, session: Session):
    query = select(Customer)

    if filters.get("city"):
        query = query.where(Customer.city == filters["city"])
    if filters.get("min_age"):
        query = query.where(Customer.age >= filters["min_age"])
    if filters.get("max_age"):
        query = query.where(Customer.age <= filters["max_age"])
    if filters.get("min_spending"):
        query = query.where(Customer.total_spending >= filters["min_spending"])
    if filters.get("inactive_days"):
        cutoff = datetime.utcnow() - timedelta(days=filters["inactive_days"])
        query = query.where(Customer.last_purchase_date <= cutoff)

    return session.exec(query).all()

@router.post("/create-campaign")
def ai_create_campaign(req: GoalRequest, session: Session = Depends(get_session)):
    try:
        result = create_campaign_from_goal(req.goal)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    if "error" in result:
        raise HTTPException(status_code=500, detail=result)

    filters = result.get("filters", {})

    # Get matching customers
    customers = get_matching_customers(filters, session)

    # Limit to 500 max for performance
    customers = customers[:500]

    campaign = Campaign(
        name=result.get("name", req.goal[:50]),
        goal=result.get("goal", req.goal),
        channel=result.get("channel", "whatsapp"),
        message_template=result.get("message_template", ""),
        filters=json.dumps(filters),
        audience_count=len(customers),
        predicted_revenue=result.get("predicted_revenue", 0.0),
        status="draft",
    )
    session.add(campaign)
    session.commit()
    session.refresh(campaign)

    # Link customers to campaign
    for customer in customers:
        cc = CampaignCustomer(
            campaign_id=campaign.id,
            customer_id=customer.id
        )
        session.add(cc)
    session.commit()

    return {
    "campaign": {
        "id": campaign.id,
        "name": campaign.name,
        "goal": campaign.goal,
        "channel": campaign.channel,
        "message_template": campaign.message_template,
        "filters": campaign.filters,
        "status": campaign.status,
        "audience_count": campaign.audience_count,
        "predicted_revenue": campaign.predicted_revenue,
        "actual_revenue": campaign.actual_revenue,
        "created_at": str(campaign.created_at),
        "launched_at": str(campaign.launched_at) if campaign.launched_at else None,
    },
    "predicted_metrics": result.get("predicted_metrics", {}),
    "audience_count": len(customers)
}

@router.get("/insights/{campaign_id}")
def ai_insights(campaign_id: int, session: Session = Depends(get_session)):
    from sqlmodel import select
    from models.communication import Communication

    comms = session.exec(
        select(Communication).where(Communication.campaign_id == campaign_id)
    ).all()

    stats = {
        "total": len(comms),
        "delivered": sum(1 for c in comms if c.status in ["delivered","opened","read","clicked","purchased"]),
        "opened": sum(1 for c in comms if c.status in ["opened","read","clicked","purchased"]),
        "clicked": sum(1 for c in comms if c.status in ["clicked","purchased"]),
        "purchased": sum(1 for c in comms if c.status == "purchased"),
    }
    insights = generate_insights(stats)
    retargeting = generate_retargeting_advice(stats)
    return {"insights": insights, "retargeting_advice": retargeting}

@router.post("/personalize")
def ai_personalize(req: PersonalizeRequest):
    message = personalize_message(req.template, req.customer)
    return {"personalized_message": message}