# 💻 Xeno CRM Frontend

This is the React client dashboard for the **Xeno Mini CRM** system. It is built using **React 19**, **Vite**, and **Tailwind CSS**.

For a full overview of the complete platform, database structures, and backend setup instructions, please refer to the main [Root README.md](../README.md).

---

## 🎨 UI Pages & Routing

All routes are declared in [main.jsx](./src/main.jsx) using `react-router-dom`:

*   **`/` ([Landing.jsx](./src/pages/Landing.jsx))**: A premium introduction landing page directing users to enter the CRM.
*   **`/home` ([Home.jsx](./src/pages/Home.jsx))**: The dashboard summary displaying customer counts, total revenue, campaign summary cards, and quick actions.
*   **`/campaigns` ([Campaigns.jsx](./src/pages/Campaigns.jsx))**: A campaign list page containing the **AI Campaign Wizard** modal to generate new drafts using natural language.
*   **`/campaigns/:id` ([CampaignDetail.jsx](./src/pages/CampaignDetail.jsx))**: A detailed view of a campaign showcasing the target audience breakdown, message templates, delivery statistics, and an interactive Recharts conversion funnel chart.
*   **`/customers` ([Customers.jsx](./src/pages/Customers.jsx))**: Customer table including filtering by city, spending range, and activity level. Also supports file upload for customer ingestion.
*   **`/analytics` ([Analytics.jsx](./src/pages/Analytics.jsx))**: Dynamic visual dashboard displaying total revenue targets, funnel breakdowns, and AI-generated campaign optimizations.

---

## 🛠️ Components

Located in the [src/components/](./src/components/) folder:
*   **`CampaignWizard.jsx`**: Modal capturing the marketer's campaign goals and communicating with the LangChain backend agent.
*   **`FunnelChart.jsx`**: Visual presentation of message delivery conversion stages using `Recharts` area/bar layouts.
*   **`InsightsPanel.jsx`**: Displays Groq-generated campaign analysis and retargeting checklists.
*   **`Navbar.jsx`**: Layout navigation header.
*   **`StatusBadge.jsx`**: Color-coded badges mapping campaign and delivery stages.

---

## ⚙️ Local Development Setup

1. Make sure you have **Node.js 18+** installed.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables by creating a `.env` file in the root of the `frontend` folder:
   ```env
   VITE_API_URL=http://localhost:8000
   ```
4. Start the Vite hot-reloading development server:
   ```bash
   npm run dev
   ```
5. Open the app in your browser at the displayed port (default is `http://localhost:5173`).
