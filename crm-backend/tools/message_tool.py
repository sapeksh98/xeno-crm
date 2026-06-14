from groq import Groq
from config import settings

_client = Groq(api_key=settings.GROQ_API_KEY)

def generate_message(goal: str, channel: str) -> dict:
    response = _client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": f"""You are a marketing copywriter.
Write a short personalized message template for a {channel} campaign.
Campaign goal: {goal}
Use {{name}} as placeholder for customer name.
Keep it under 300 characters.
Return ONLY the message text, no explanation."""}]
    )
    template = response.choices[0].message.content.strip()
    return {"message_template": template, "channel": channel}