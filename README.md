# ⚡ Xeno AI-Native Mini CRM

A marketer types a business goal in plain English. The system finds the right audience, picks the best channel, generates personalized messages, launches the campaign, simulates delivery, and surfaces AI-powered analytics. All in one loop.

**Live Demo:** [https://xeno-crm-gules.vercel.app](https://xeno-crm-gules.vercel.app)

---

## 🌟 What It Does

Instead of filling complex forms and manually writing SQL queries, a marketer simply types:
> *"Re-engage inactive premium customers in Mumbai who haven't bought in 30 days"*

The AI agent automatically:
1. **Queries** the customer database using dynamically derived SQL filters.
2. **Analyzes** historical campaign performance to recommend the best delivery channel.
3. **Generates** a personalized message template.
4. **Predicts** full funnel metrics and projected campaign revenue.
5. **Launches** the campaign and dispatches messages.
6. **Tracks** message delivery in real-time via asynchronous callbacks.
7. **Generates** AI-powered post-campaign insights and analytics.

---

## 🏗️ System Architecture & Data Flow

```
     [ Frontend (Vercel) ]
               │
               ▼
      [ CRM Backend (Render) ] ──────► [ Channel Simulator (Render) ]
               │                                      │
               │                                      │ async callbacks
               ▼                                      │
     [ PostgreSQL Database ] ◄────────────────────────┘
```

### Two Separate Services — Intentional Decision
The **Channel Simulator** is run as a completely isolated microservice from the **CRM Backend**—directly mirroring how real channel delivery works in production (e.g., Twilio, AWS SNS, Meta WhatsApp API). The CRM fires out dispatch requests and processes incoming webhook callbacks. Swapping the simulator for real Twilio/SendGrid APIs is a one-line configuration change.

### Callback Loop & State Machine

```
  [ Campaign Launch ]
          │
          ▼
  CRM loops through audience
  POST /send ──► [ Channel Simulator (per customer) ]
                           │
                           ▼
                 Simulator queues async task
                           │
                           ▼
                 State Machine (random delays + probabilities):
                 QUEUED ──(85%)──► DELIVERED
                                      │
                                      ├──► OPENED (80% of delivered)
                                              │
                                              └──► READ (90% of opened)
                                                      │
                                                      └──► CLICKED (25% of read)
                                                              │
                                                              └──► PURCHASED (30% of clicked)
                           │
                           ▼
  POST /receipts ◄─────────┘ (3 retries with exponential backoff)
          │
          ▼
  CRM Backend Receipts handler:
  - Enforces strict state ordering (e.g., CLICKED cannot arrive before OPENED).
  - Out-of-order callbacks are silently ignored.
  - Updates the Analytics dashboard live.
```

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React + Tailwind CSS + Vite (Hosted on Vercel) |
| **CRM Backend** | FastAPI + SQLModel (Hosted on Render) |
| **Channel Simulator** | FastAPI + HTTPX (Hosted on Render) |
| **Database** | PostgreSQL (Render) / SQLite (Local development) |
| **AI Agent** | LangChain + Groq (`llama-3.1-8b-instant`) |
| **AI Direct Calls** | Groq SDK (for Insights, Personalization, and Retargeting advice) |
| **HTTP Client** | HTTPX (handles asynchronous postback delivery receipts) |

---

## 🤖 AI Agent Architecture

```
                 POST /ai/create-campaign
                           │
                           ▼
              LangChain Agent (campaign_agent.py)
                           │
    ┌──────────────────────┼──────────────────────┬──────────────────────┐
    │                      │                      │                      │
 ┌──┴─────────────────┐ ┌──┴────────────────┐  ┌──┴───────────────┐   ┌──┴──────────────────┐
 │ Tool 1:            │ │ Tool 2:           │  │ Tool 3:          │   │ Tool 4:             │
 │ query_customers()  │ │ analyze_channel() │  │ generate_msg()   │   │ predict_perf()      │
 ├────────────────────┤ ├───────────────────┤  ├──────────────────┤   ├─────────────────────┤
 │ NL Filters ➔ SQL   │ │ Reads past CTR    │  │ Creates message  │   │ Estimates funnel    │
 │ to get audience    │ │ metrics to select │  │ template with    │   │ metrics & projected │
 │ count & sample.    │ │ WhatsApp/SMS/Email│  │ placeholders.    │   │ campaign revenue.   │
 └────────────────────┘ └───────────────────┘  └──────────────────┘   └─────────────────────┘
```

Everything else is powered by **Direct Groq LLM API Calls** ([ai_service.py](file:///C:/Users/LENOVO/Desktop/xeno-crm/crm-backend/services/ai_service.py)):
*   `generate_insights()` ➔ Analyzes campaign analytics to create a post-campaign AI narrative.
*   `personalize_message()` ➔ Interpolates custom attributes to create a per-customer personalized message copy.
*   `generate_retargeting_advice()` ➔ Analyzes performance drops to suggest strategic next steps.

> **Key Decision:** LangChain is used in exactly one place—campaign creation—because that's the only workflow that genuinely needs dynamic multi-tool orchestration. Everything else uses direct Groq API completions, keeping 95% of the codebase simple, fast, and maintainable.

---

## 🗄️ Database Schema

*   **`customers`** ➔ `id`, `name`, `email`, `phone`, `city`, `age`, `total_spending`, `last_purchase_date`
*   **`orders`** ➔ `id`, `customer_id`, `amount`, `status`, `ordered_at`
*   **`campaigns`** ➔ `id`, `name`, `goal`, `channel`, `message_template`, `filters` (JSON), `status`, `audience_count`, `predicted_revenue`, `actual_revenue`, `launched_at`
*   **`campaign_customers`** ➔ `id`, `campaign_id`, `customer_id`
*   **`communications`** ➔ `id`, `campaign_id`, `customer_id`, `channel`, `message`, `status`, `sent_at`
*   **`communication_events`** ➔ `id`, `communication_id`, `status`, `received_at` *(append-only log)*

---

## 📂 Project Structure

```
xeno-crm/
├── crm-backend/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models/
│   │   ├── customer.py
│   │   ├── campaign.py
│   │   └── communication.py
│   ├── routes/
│   │   ├── customers.py
│   │   ├── campaigns.py
│   │   ├── communications.py
│   │   ├── receipts.py
│   │   ├── analytics.py
│   │   └── ai.py
│   ├── services/
│   │   ├── campaign_agent.py   ← LangChain lives here only
│   │   ├── ai_service.py       ← Direct Groq calls
│   │   └── seed.py
│   ├── tools/
│   │   ├── customer_tool.py
│   │   ├── channel_tool.py
│   │   ├── message_tool.py
│   │   └── predict_tool.py
│   └── requirements.txt
│
├── channel-simulator/
│   ├── main.py
│   ├── simulator.py
│   ├── config.py
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Landing.jsx
    │   │   ├── Home.jsx
    │   │   ├── Campaigns.jsx
    │   │   ├── CampaignDetail.jsx
    │   │   ├── Customers.jsx
    │   │   └── Analytics.jsx
    │   ├── components/
    │   │   └── Navbar.jsx
    │   └── lib/
    │       └── api.js
    └── package.json
```

---

## 💻 Running Locally

### Prerequisites
*   **Python 3.11+**
*   **Node.js** (with NPM)

### Terminal 1 — CRM Backend
```bash
cd crm-backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### Terminal 2 — Channel Simulator
```bash
cd channel-simulator
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8001
```

### Terminal 3 — Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## ⚙️ Environment Variables

### `crm-backend/.env`
```env
DATABASE_URL=sqlite:///./dev.db
GROQ_API_KEY=your-groq-key
CHANNEL_SIMULATOR_URL=http://localhost:8001
```

### `channel-simulator/.env`
```env
CRM_RECEIPT_URL=http://localhost:8000/receipts/
```

### `frontend/.env.local` (or `frontend/.env`)
```env
VITE_API_URL=http://localhost:8000
```

---

## 🧠 Key Design Decisions

1.  **Async HTTP over Message Queues (RabbitMQ)**
    For this scope—handling hundreds of customers and demo traffic—async HTTP with exponential retries manages potential delivery drops correctly. At production scale, we would introduce RabbitMQ with two designated queues: `campaign_sends` and `receipt_events`. We know exactly when to introduce MQ overhead and when to keep it lean.
2.  **State Machine Validation in `receipts.py`**
    Every incoming delivery callback status is validated against a sequential `STATUS_ORDER` check. A `CLICKED` callback status cannot arrive or overwrite a database record before `OPENED` has registered. Out-of-order calls caused by network latency are silently discarded.
3.  **Append-only Event Log**
    Every status update creates a new immutable row in the `communication_events` table, while the main `communication` record tracks the aggregate current state. This provides a robust audit log and mirrors stream-processing architectures (which can easily scale into Kafka topics).
4.  **Flexible SQL Database Layer**
    Uses SQLModel's ORM abstraction enabling zero code changes when switching from local `SQLite` to production-grade `PostgreSQL`—it is managed entirely by changing the `DATABASE_URL` environment variable.
5.  **Sub-second Inference via Groq**
    Selected Groq's high-speed completion endpoint over standard OpenAI/Anthropic APIs for free-tier sub-second inference. The agent architecture is model-agnostic; swapping from Llama to Claude Sonnet is a single line change in [campaign_agent.py](file:///C:/Users/LENOVO/Desktop/xeno-crm/crm-backend/services/campaign_agent.py).

---

## 🚀 Deployment

| Service | Platform | Deployment URL |
| :--- | :--- | :--- |
| **CRM Backend** | Render | [https://xeno-crm-i41a.onrender.com](https://xeno-crm-i41a.onrender.com) |
| **Channel Simulator** | Render | [https://xeno-crm-1-0bc8.onrender.com](https://xeno-crm-1-0bc8.onrender.com) |
| **Frontend** | Vercel | [https://xeno-crm-gules.vercel.app](https://xeno-crm-gules.vercel.app) |

---

## 🔌 API Endpoints Reference

*   `GET  /health`
*   `GET  /customers/?city=X&min_spending=X&inactive_days=X`
*   `GET  /customers/count`
*   `GET  /campaigns/`
*   `POST /campaigns/`
*   `GET  /campaigns/{id}`
*   `POST /campaigns/{id}/launch`
*   `DELETE /campaigns/{id}`
*   `POST /communications/send/{campaign_id}`
*   `POST /receipts/`
*   `GET  /analytics/`
*   `GET  /analytics/{campaign_id}`
*   `POST /ai/create-campaign`
*   `GET  /ai/insights/{campaign_id}`
*   `POST /ai/personalize`

---
*Built for Xeno Engineering Assignment — June 2026*
