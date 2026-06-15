# 📡 Xeno CRM Channel Simulator

This is a lightweight microservice that simulates real-world communication dispatch channels (such as WhatsApp, SMS, or Email) and handles message delivery loops asynchronously.

For the full system setup instructions, refer to the main [Root README.md](../README.md).

---

## ⚙️ How the Simulator Works

1.  **Receive Messages**: The CRM Backend posts payload details to the `/send` endpoint of this service.
2.  **Asynchronous Thread Simulation**: The simulator spawns a non-blocking background task ([main.py](./main.py)) running the simulator sequence ([simulator.py](./simulator.py)).
3.  **Progression Model**: Each message flows through a randomized probability sequence. At each stage (e.g., delivered, opened, read, clicked, purchased), the simulator waits for a short, randomized delay to emulate real user behavior:
    *   **Delivered**: 85% success probability (delays 2–5s)
    *   **Opened**: 80% success probability (delays 5–15s)
    *   **Read**: 90% success probability (delays 3–8s)
    *   **Clicked**: 25% success probability (delays 10–30s)
    *   **Purchased**: 30% success probability (delays 15–45s)
    *   If a stage fails, it posts a `failed` status back to the CRM and exits.
4.  **Postbacks (Webhooks)**: Updates are sent to the CRM's receipt endpoint asynchronously using an HTTP client (`httpx`).

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
   CRM_RECEIPT_URL=http://localhost:8000/receipts/
   ```
6. Run the application:
   ```bash
   uvicorn main:app --reload --port 8001
   ```
