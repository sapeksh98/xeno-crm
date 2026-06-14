from sqlmodel import Session, select
from models.campaign import Campaign
from database import engine

def analyze_channel(goal: str) -> dict:
    with Session(engine) as session:
        campaigns = session.exec(
            select(Campaign).where(Campaign.status == "launched")
        ).all()

    if not campaigns:
        return {"recommended_channel": "whatsapp", "reason": "No history, defaulting to WhatsApp"}

    channel_stats: dict[str, dict] = {}
    for c in campaigns:
        ch = c.channel
        if ch not in channel_stats:
            channel_stats[ch] = {"count": 0, "total_revenue": 0.0}
        channel_stats[ch]["count"] += 1
        channel_stats[ch]["total_revenue"] += c.actual_revenue

    best = max(channel_stats, key=lambda ch: channel_stats[ch]["total_revenue"])
    return {
        "recommended_channel": best,
        "reason": f"{best} has highest historical revenue",
        "stats": channel_stats
    }