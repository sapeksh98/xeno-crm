from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models.communication import Communication
from models.campaign import Campaign, CampaignCustomer
from models.customer import Customer
from config import settings
from datetime import datetime
import httpx

router = APIRouter()

async def send_to_simulator(communication: Communication):
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            await client.post(f"{settings.CHANNEL_SIMULATOR_URL}/send", json={
                "communicationId": communication.id,
                "phone": communication.phone,
                "message": communication.message,
                "channel": communication.channel
            })
    except Exception as e:
        print(f"Failed to send comm#{communication.id}: {e}")

@router.post("/send/{campaign_id}")
async def send_campaign(
    campaign_id: int,
    session: Session = Depends(get_session)
):
    campaign = session.get(Campaign, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if campaign.status != "launched":
        raise HTTPException(status_code=400, detail="Campaign must be launched first")

    campaign_customers = session.exec(
        select(CampaignCustomer).where(CampaignCustomer.campaign_id == campaign_id)
    ).all()

    if not campaign_customers:
        raise HTTPException(status_code=400, detail="No customers in this campaign")

    communications_created = []

    for cc in campaign_customers:
        customer = session.get(Customer, cc.customer_id)
        if not customer:
            continue

        message = campaign.message_template.replace("{name}", customer.name.split()[0])

        communication = Communication(
            campaign_id=campaign_id,
            customer_id=customer.id,
            channel=campaign.channel,
            message=message,
            phone=customer.phone,
            status="queued"
        )
        session.add(communication)
        session.commit()
        session.refresh(communication)

        communications_created.append(communication)

    import asyncio
    batch_size = 10
    for i in range(0, len(communications_created), batch_size):
        batch = communications_created[i:i + batch_size]
        tasks = [send_to_simulator(c) for c in batch]
        await asyncio.gather(*tasks)

    return {
        "status": "sending",
        "campaign_id": campaign_id,
        "total_queued": len(communications_created)
    }