# ⚙️ Xeno CRM Backend

This is the core FastAPI backend application for **Xeno Mini CRM**, coordinating database persistence, running the LangChain campaign creation agent, and exposing REST routes.

For the full system setup instructions, refer to the main [Root README.md](../README.md).

---

## 🏗️ Architecture & Router Modules

The API routes are implemented in the [routes/](./routes/) directory and registered in [main.py](./main.py):

*   **`customers` ([customers.py](./routes/customers.py))**: Handles customer list queries, filters (spending, city, age, inactivity), count checks, and CSV file ingestion.
*   **`campaigns` ([campaigns.py](./routes/campaigns.py))**: Controls campaign lifecycle (creating, viewing drafts, and launching).
*   **`communications` ([communications.py](./routes/communications.py))**: Creates and dispatches messages to the channel simulator.
*   **`receipts` ([receipts.py](./routes/receipts.py))**: Accepts postback status updates (webhooks) from the simulator to update delivery metrics and compile actual revenue.
*   **`analytics` ([analytics.py](./routes/analytics.py))**: Aggregates metrics (queued, delivered, opened, read, clicked, purchased counts) and calculates conversion rates.
*   **`ai` ([ai.py](./routes/ai.py))**: Runs the campaign creation agent, personalization routines, and post-campaign insights generators.

---

## 🤖 Autonomous LangChain Campaign Agent

Located in [campaign_agent.py](./services/campaign_agent.py). The agent uses a ChatGroq `llama-3.1-8b-instant` model and implements a structured tool-calling loop:

1.  **`tool_query_customers`**: Uses SQLModel selection logic to find the exact target segment count in the SQLite database.
2.  **`tool_analyze_channel`**: Determines the highest performing marketing channel (WhatsApp, Email, SMS) for the campaign's goal.
3.  **`tool_generate_message`**: Generates a customizable campaign copy template containing a `{name}` variable placeholder.
4.  **`tool_predict_performance`**: Predicts conversion rates (delivery, read, click, purchase) and anticipated revenue based on target audience sizing and channel type.

---

## ⚙️ Local Development Setup

1. Make sure you have **Python 3.10+** installed.
2. Navigate to this directory and create a virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the environment:
   *   Windows: `venv\Scripts\activate`
   *   Mac/Linux: `source venv/bin/activate`
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Set up `.env`:
   ```env
   DATABASE_URL=sqlite:///./dev.db
   GROQ_API_KEY=your_groq_api_key_here
   CHANNEL_SIMULATOR_URL=http://localhost:8001
   ```
6. Run the application:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   API Docs will be available at `http://localhost:8000/docs`.
