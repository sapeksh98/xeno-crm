from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from database import get_session
from models.communication import Communication, CommunicationEvent
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

VALID_STATUSES = ["queued", "delivered", "failed", "opened", "read", "clicked", "purchased"]

STATUS_ORDER = {
    "queued": 0,
    "delivered": 1,
    "failed": 1,
    "opened": 2,
    "read": 3,
    "clicked": 4,
    "purchased": 5
}

class ReceiptPayload(BaseModel):
    communicationId: int
    status: str

@router.post("")
@router.post("/")
def receive_receipt(
    payload: ReceiptPayload,
    session: Session = Depends(get_session)
):
    status = payload.status.lower()

    if status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status: {status}")

    communication = session.get(Communication, payload.communicationId)
    if not communication:
        raise HTTPException(status_code=404, detail="Communication not found")

    current_order = STATUS_ORDER.get(communication.status, 0)
    new_order = STATUS_ORDER.get(status, 0)

    if new_order <= current_order:
        return {"status": "ignored", "reason": "out of order callback"}

    event = CommunicationEvent(
        communication_id=communication.id,
        status=status,
        received_at=datetime.utcnow()
    )
    session.add(event)

    communication.status = status
    communication.updated_at = datetime.utcnow()
    session.add(communication)

    if status == "purchased":
        from models.campaign import Campaign
        from models.customer import Customer
        customer = session.get(Customer, communication.customer_id)
        campaign = session.get(Campaign, communication.campaign_id)
        if campaign and customer:
            avg_order = customer.total_spending / max(1, 1)
            campaign.actual_revenue += round(avg_order * 0.1, 2)
            session.add(campaign)

    session.commit()

    return {
        "status": "updated",
        "communicationId": communication.id,
        "newStatus": status
    }