from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
from contextlib import asynccontextmanager
from simulator import simulate_delivery
from config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(title="Channel Simulator", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class SendPayload(BaseModel):
    communicationId: int
    phone: str
    message: str
    channel: str

background_tasks = set()

@app.post("/send")
async def send_message(payload: SendPayload):
    task = asyncio.create_task(
        simulate_delivery(payload.communicationId, settings.CRM_RECEIPT_URL)
    )
    background_tasks.add(task)
    task.add_done_callback(background_tasks.discard)
    
    return {
        "status": "queued",
        "communicationId": payload.communicationId
    }

@app.get("/health")
def health():
    return {"status": "ok", "service": "channel-simulator"}