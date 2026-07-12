# TransitOps AI Architecture

TransitOps implements a **Dual-AI Pipeline** (Layer 7) leveraging the strengths of both Groq (for speed and structured output) and Google Gemini (for conversational intelligence and narrative generation).

## Why Dual-AI?
1. **Groq (LLaMA 3.3)**: Extremely fast token generation. Ideal for taking raw fleet data and converting it into a deterministic JSON object (Risk Scores, Priorities, Flags) via strict JSON mode and low temperature.
2. **Gemini (2.5 Flash)**: Excellent at natural language understanding and narrative writing. It takes Groq's structured JSON output and generates human-readable operations briefs and insights.

---

## 1. Operations Brief Pipeline
Endpoint: `GET /api/ai/operations-brief`

The Operations Brief is a two-stage process:

1. **Stage 1 (Groq Risk Analysis):**
   - The backend aggregates a "Rich Fleet Context" (live vehicle status counts, recent trip counts, total drivers, overdue maintenance counts).
   - This raw data is sent to Groq (`llama-3.3-70b-versatile`) with a strict system prompt to output ONLY a JSON object containing a `riskScore` (1-10), `riskLevel`, `flags`, and `topPriority`.
   - *Fallback:* If Groq is completely unavailable, the backend falls back to calculating a basic heuristic risk score based on utilization and maintenance counts.

2. **Stage 2 (Gemini Narrative):**
   - Groq's structured JSON output, along with the raw fleet snapshot, is sent to Gemini (`gemini-2.5-flash`).
   - Gemini is instructed to act as a senior fleet manager and write a concise narrative and 3 specific, actionable dispatch tasks.
   - The final JSON payload returned to the frontend contains both the structured risk analysis and the human-readable narrative.

---

## 2. Maintenance Insights
Endpoint: `GET /api/ai/maintenance-insights`

The maintenance AI focuses strictly on vehicle service histories.
- The backend queries the database for the top 5 vehicles ranked by the number of maintenance records, along with their last serviced date.
- This data is fed into Gemini (`gemini-2.5-flash`).
- Gemini generates exactly 3 bullet points with actionable insights (e.g., pointing out vehicles that are frequently breaking down or overdue for service).

---

## 3. Fleet AI Chatbot
Endpoint: `POST /api/ai/chat`

The AI Chatbot is a floating assistant on the frontend UI that users can ask about their fleet.
- **Context Injection:** When the user sends a message, the backend first queries the DB for a "Live Fleet Snapshot" (last 30 days of vehicle and trip statuses).
- This snapshot is injected into the Gemini System Prompt behind the scenes.
- The LLM answers the user's question *using the live data*, allowing it to accurately respond to questions like "How many vehicles are currently in the shop?" or "Do we have any available drivers?".
- To prevent prompt injection and formatting issues in the UI, markdown formatting is strictly stripped server-side before returning the response to the client.

---

## 4. Resiliency & Key Rotation
The Groq API has aggressive rate limits (e.g., RPM and RPD quotas) on their free tier. To ensure reliability for the Operations Brief, the backend implements an **Automatic Key Rotation** system:

- Environment variables `GROQ_API_KEY_1`, `GROQ_API_KEY_2`, etc. are loaded into an array.
- A global `groqKeyIndex` tracks the current key.
- If a request to Groq fails with a `429 Too Many Requests` error, the system logs a warning, increments the index to try the next key in the array, and immediately retries the request.
- This process continues across all available keys until a successful response is received or all keys are exhausted.
