import json
from groq import Groq
from config import settings

_client = Groq(api_key=settings.GROQ_API_KEY)

def generate_insights(stats: dict) -> list[str]:
    response = _client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": f"""You are a CRM analytics expert.
Given these campaign stats, generate exactly 4 short insight strings (one sentence each).
Stats: {json.dumps(stats, indent=2)}
Return ONLY a JSON array of 4 strings, nothing else."""}]
    )
    text = response.choices[0].message.content.strip().removeprefix("```json").removesuffix("```").strip()
    try:
        return json.loads(text)[:4]
    except Exception:
        return [text]

def personalize_message(template: str, customer: dict) -> str:
    response = _client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": f"""Personalize this message for the customer.
Template: {template}
Customer: {json.dumps(customer)}
Replace {{name}} with their name, add a small personal touch.
Return ONLY the final message text."""}]
    )
    return response.choices[0].message.content.strip()

def generate_retargeting_advice(stats: dict) -> list[str]:
    response = _client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": f"""You are a CRM strategist.
Given these campaign stats, suggest 3 retargeting actions.
Stats: {json.dumps(stats, indent=2)}
Return ONLY a JSON array of 3 short suggestion strings, nothing else."""}]
    )
    text = response.choices[0].message.content.strip().removeprefix("```json").removesuffix("```").strip()
    try:
        return json.loads(text)[:3]
    except Exception:
        return [text]