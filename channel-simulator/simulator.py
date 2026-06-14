async def simulate_delivery(communication_id: int, crm_receipt_url: str):
    for status, probability, (min_delay, max_delay) in STATUS_CHAIN:

        # Random outcome
        if random.random() > probability:
            for attempt in range(3):
                try:
                    async with httpx.AsyncClient(timeout=60.0) as client:
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
                async with httpx.AsyncClient(timeout=60.0) as client:
                    resp = await client.post(crm_receipt_url, json={
                        "communicationId": communication_id,
                        "status": status
                    })
                    if resp.status_code == 200:
                        print(f"[{datetime.now().strftime('%H:%M:%S')}] comm#{communication_id} → {status}")
                        break
            except httpx.RequestError:
                await asyncio.sleep(2 ** attempt)