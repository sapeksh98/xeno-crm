import asyncio
import random
import httpx
from datetime import datetime

STATUS_CHAIN = [
    ("delivered", 0.85, (2, 5)),
    ("opened",    0.80, (5, 15)),
    ("read",      0.90, (3, 8)),
    ("clicked",   0.25, (10, 30)),
    ("purchased", 0.30, (15, 45)),
]

async def simulate_delivery(communication_id: int, crm_receipt_url: str):
    async with httpx.AsyncClient(timeout=10.0) as client:
        for status, probability, (min_delay, max_delay) in STATUS_CHAIN:

            # Random outcome
            if random.random() > probability:
                # Send failed and stop
                for attempt in range(3):
                    try:
                        await client.post(crm_receipt_url, json={
                            "communicationId": communication_id,
                            "status": "failed"
                        })
                        break
                    except httpx.RequestError:
                        await asyncio.sleep(2 ** attempt)
                return

            # Wait random delay
            await asyncio.sleep(random.uniform(min_delay, max_delay))

            # Send status callback with retries
            for attempt in range(3):
                try:
                    resp = await client.post(crm_receipt_url, json={
                        "communicationId": communication_id,
                        "status": status
                    })
                    if resp.status_code == 200:
                        print(f"[{datetime.now().strftime('%H:%M:%S')}] comm#{communication_id} → {status}")
                        break
                except httpx.RequestError:
                    await asyncio.sleep(2 ** attempt)