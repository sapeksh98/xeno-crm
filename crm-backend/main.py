from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import create_db_and_tables
from routes import customers, campaigns, receipts, analytics, ai
from routes import communications
from services.seed import seed_data
import models

app = FastAPI(title="Xeno Mini CRM", version="1.0.0", redirect_slashes=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

from routes.ai import router as ai_router
app.include_router(ai_router)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    seed_data()

app.include_router(customers.router, prefix="/customers", tags=["Customers"])
app.include_router(campaigns.router, prefix="/campaigns", tags=["Campaigns"])
app.include_router(communications.router, prefix="/communications", tags=["Communications"])
app.include_router(receipts.router, prefix="/receipts", tags=["Receipts"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(ai.router, prefix="/ai", tags=["AI"])

@app.get("/health")
def health():
    return {"status": "ok", "service": "crm-backend"}