import json
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.tools import tool
from config import settings
from tools.customer_tool import query_customers
from tools.channel_tool import analyze_channel
from tools.message_tool import generate_message
from tools.predict_tool import predict_performance
from langchain_groq import ChatGroq

llm = ChatGroq(
    model="llama-3.1-8b-instant",
    groq_api_key=settings.GROQ_API_KEY,
    temperature=0.3,
)

@tool
def tool_query_customers(filters_json: str) -> str:
    """Query the customer database with filters.
    Input: JSON string with optional keys: city, min_age, max_age,
    min_spending, max_spending, inactive_days.
    Returns audience count and sample customers."""
    try:
        filters = json.loads(filters_json)
    except Exception:
        filters = {}
    result = query_customers(filters)
    return json.dumps(result)

@tool
def tool_analyze_channel(goal: str) -> str:
    """Analyze past campaign performance and recommend the best channel.
    Input: campaign goal string.
    Returns recommended channel and reasoning."""
    result = analyze_channel(goal)
    return json.dumps(result)

@tool
def tool_generate_message(goal_and_channel: str) -> str:
    """Generate a personalized message template.
    Input: JSON string with keys 'goal' and 'channel'.
    Returns message template."""
    try:
        data = json.loads(goal_and_channel)
        goal = data.get("goal", "")
        channel = data.get("channel", "whatsapp")
    except Exception:
        goal = goal_and_channel
        channel = "whatsapp"
    result = generate_message(goal, channel)
    return json.dumps(result)

@tool
def tool_predict_performance(audience_and_channel: str) -> str:
    """Predict campaign funnel metrics and revenue.
    Input: JSON string with keys 'audience_count' and 'channel'.
    Returns predicted funnel metrics and revenue."""
    try:
        data = json.loads(audience_and_channel)
        audience_count = int(data.get("audience_count", 100))
        channel = data.get("channel", "whatsapp")
    except Exception:
        audience_count = 100
        channel = "whatsapp"
    result = predict_performance(audience_count, channel)
    return json.dumps(result)


SYSTEM_PROMPT = """You are an AI campaign creation agent for a CRM system.
When given a marketing goal, you MUST call all 4 tools in order:
1. tool_query_customers — find the right audience
2. tool_analyze_channel — pick the best channel
3. tool_generate_message — write the message template
4. tool_predict_performance — estimate funnel metrics

After all 4 tools, return a JSON object with EXACTLY these keys:
{{
  "name": "campaign name based on goal",
  "goal": "the original goal",
  "filters": {{filters used}},
  "audience_count": <number>,
  "channel": "whatsapp|sms|email",
  "message_template": "the message",
  "predicted_revenue": <number>,
  "predicted_metrics": {{...funnel numbers}}
}}
Return ONLY valid JSON, no markdown, no explanation."""

prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])

agent = create_tool_calling_agent(
    llm=llm,
    tools=[tool_query_customers, tool_analyze_channel,
           tool_generate_message, tool_predict_performance],
    prompt=prompt,
)

agent_executor = AgentExecutor(
    agent=agent,
    tools=[tool_query_customers, tool_analyze_channel,
           tool_generate_message, tool_predict_performance],
    verbose=True,
    max_iterations=8,
)


def create_campaign_from_goal(goal: str) -> dict:
    result = agent_executor.invoke({"input": goal})
    output = result.get("output", "{}")
    # Strip markdown fences if present
    clean = output.strip().removeprefix("```json").removesuffix("```").strip()
    try:
        return json.loads(clean)
    except Exception:
        return {"raw_output": output, "error": "Could not parse agent output as JSON"}