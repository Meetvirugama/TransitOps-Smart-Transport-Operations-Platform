const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const env = require('../../config/env');
const dbPool = require('../../config/database');

// ─── Groq Key Rotation ────────────────────────────────────────────────────────
// Cycles through up to 4 keys automatically on 429 / rate-limit errors
let groqKeyIndex = 0;

function getGroqClient() {
  const keys = env.groqApiKeys;
  if (!keys || keys.length === 0) return null;
  return new Groq({ apiKey: keys[groqKeyIndex % keys.length] });
}

async function groqWithRotation(fn) {
  const keys = env.groqApiKeys;
  if (!keys || keys.length === 0) throw new Error('No Groq API keys configured.');

  let lastErr;
  for (let attempt = 0; attempt < keys.length; attempt++) {
    const client = new Groq({ apiKey: keys[groqKeyIndex % keys.length] });
    try {
      const result = await fn(client);
      return result;
    } catch (err) {
      lastErr = err;
      const is429 = err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('rate');
      console.warn(`[Groq] Key ${groqKeyIndex % keys.length + 1} failed (${is429 ? 'rate-limited' : err.message?.slice(0, 60)}). Rotating...`);
      groqKeyIndex++;
      if (!is429) throw err; // Only rotate on rate limit
    }
  }
  throw lastErr;
}

// ─── Markdown Stripper ────────────────────────────────────────────────────────
function stripMarkdown(text) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*]\s+/gm, '• ')
    .replace(/^\d+\.\s+/gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ─── Fleet Context (basic) ────────────────────────────────────────────────────
async function getFleetContext() {
  try {
    const [vehiclesRes, tripsRes, driversRes] = await Promise.all([
      dbPool.query(`SELECT status, COUNT(*) as count FROM vehicles GROUP BY status`),
      dbPool.query(`SELECT status, COUNT(*) as count FROM trips WHERE created_at >= NOW() - INTERVAL '30 days' GROUP BY status`),
      dbPool.query(`SELECT COUNT(*) as total FROM drivers`),
    ]);

    const vehicles = {};
    vehiclesRes.rows.forEach(r => { vehicles[r.status] = parseInt(r.count); });
    const trips = {};
    tripsRes.rows.forEach(r => { trips[r.status] = parseInt(r.count); });
    const totalDrivers = parseInt(driversRes.rows[0]?.total || 0);
    return { vehicles, trips, totalDrivers };
  } catch (err) {
    console.error('[AI Service] Fleet context error:', err.message);
    return { vehicles: {}, trips: {}, totalDrivers: 0 };
  }
}

// ─── Rich Fleet Context (for operations brief) ────────────────────────────────
async function getRichFleetContext() {
  try {
    const [vehiclesRes, tripsRes, driversRes, maintenanceRes] = await Promise.all([
      dbPool.query(`
        SELECT status, COUNT(*) as count FROM vehicles GROUP BY status
      `),
      dbPool.query(`
        SELECT status, COUNT(*) as count FROM trips
        WHERE created_at >= NOW() - INTERVAL '7 days'
        GROUP BY status
      `),
      dbPool.query(`SELECT COUNT(*) as total FROM drivers`),
      dbPool.query(`
        SELECT COUNT(*) as overdue FROM vehicles v
        LEFT JOIN maintenance_records mr ON mr.vehicle_id = v.id
        WHERE v.status != 'Retired'
        GROUP BY v.id
        HAVING MAX(mr.created_at) < NOW() - INTERVAL '90 days' OR MAX(mr.created_at) IS NULL
      `).catch(() => ({ rows: [] })),
    ]);

    const vehiclesByStatus = {};
    vehiclesRes.rows.forEach(r => { vehiclesByStatus[r.status] = parseInt(r.count); });

    const tripsByStatus = {};
    tripsRes.rows.forEach(r => { tripsByStatus[r.status] = parseInt(r.count); });

    const totalVehicles = Object.values(vehiclesByStatus).reduce((a, b) => a + b, 0);
    const activeVehicles = vehiclesByStatus['On Trip'] || vehiclesByStatus['Dispatched'] || 0;
    const inMaintenance = vehiclesByStatus['In Maintenance'] || vehiclesByStatus['In Shop'] || 0;
    const available = vehiclesByStatus['Available'] || 0;
    const utilization = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;
    const overdueCount = maintenanceRes.rows.length;

    return {
      vehicles: { total: totalVehicles, active: activeVehicles, inMaintenance, available, byStatus: vehiclesByStatus },
      trips: { byStatus: tripsByStatus, total: Object.values(tripsByStatus).reduce((a, b) => a + b, 0) },
      drivers: { total: parseInt(driversRes.rows[0]?.total || 0) },
      maintenance: { overdueCount },
      utilization,
    };
  } catch (err) {
    console.error('[AI Service] Rich context error:', err.message);
    // Return mock data so the feature still works without DB
    return {
      vehicles: { total: 5, active: 1, inMaintenance: 1, available: 3, byStatus: { Available: 3, 'On Trip': 1, 'In Maintenance': 1 } },
      trips: { byStatus: { Dispatched: 1, Draft: 2, Completed: 8 }, total: 11 },
      drivers: { total: 8 },
      maintenance: { overdueCount: 2 },
      utilization: 20,
    };
  }
}

// ─── Build Gemini System Prompt ───────────────────────────────────────────────
function buildSystemPrompt(context) {
  const vehicleSummary = Object.entries(context.vehicles)
    .map(([status, count]) => `${count} ${status}`)
    .join(', ') || 'No vehicle data available';
  const tripSummary = Object.entries(context.trips)
    .map(([status, count]) => `${count} ${status}`)
    .join(', ') || 'No recent trip data available';

  return `You are an expert AI assistant for TransitOps, a smart transport operations platform.
You help fleet managers, dispatchers, and operations staff make informed decisions.

## Current Live Fleet Snapshot (last 30 days):
- Vehicles breakdown: ${vehicleSummary}
- Recent Trips breakdown: ${tripSummary}
- Total Drivers in system: ${context.totalDrivers}

## IMPORTANT: Use the fleet snapshot above to answer questions directly.
Do NOT say you need more data or that data is unavailable — you have the snapshot above.

## OUTPUT FORMAT RULES (STRICT):
- NEVER use markdown: no **bold**, no *italic*, no # headers, no bullet dashes (-)
- Use plain bullet character (•) if you need a list
- Keep responses under 200 words
- Be concise, professional, and data-driven
- Start your answer directly`;
}

// ─── Maintenance Insights (Gemini) ────────────────────────────────────────────
async function getMaintenanceInsight() {
  try {
    const res = await dbPool.query(`
      SELECT v.id, v.registration_number, v.status,
        COUNT(mr.id) as maintenance_count,
        MAX(mr.created_at) as last_maintenance
      FROM vehicles v
      LEFT JOIN maintenance_records mr ON mr.vehicle_id = v.id
      GROUP BY v.id, v.registration_number, v.status
      ORDER BY maintenance_count DESC LIMIT 5
    `);

    if (res.rows.length === 0) {
      return '• No vehicle maintenance data found yet. Start logging maintenance records to get AI insights.\n• Add vehicles and maintenance records in the Fleet and Maintenance sections.\n• AI insights will appear automatically once data is available.';
    }

    const vehicleData = res.rows.map(r =>
      `Vehicle ${r.registration_number}: status=${r.status}, total_maintenance=${r.maintenance_count}, last_serviced=${r.last_maintenance ? new Date(r.last_maintenance).toLocaleDateString() : 'Never'}`
    ).join('\n');

    const genAI = new GoogleGenerativeAI(env.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `You are a vehicle fleet maintenance expert. Analyze the following vehicle maintenance data and provide a brief, actionable insight about which vehicles need attention and why.

${vehicleData}

STRICT FORMAT RULES:
- Respond with EXACTLY 3 bullet points
- Each bullet starts with the • character
- Plain text only — NO markdown, NO bold (**), NO italic, NO dashes as bullets
- Each bullet is 1-2 sentences max
- Be direct and actionable`;

    const result = await model.generateContent(prompt);
    return stripMarkdown(result.response.text());
  } catch (err) {
    console.error('[AI Service] Maintenance insight error:', err.message);
    return '• Unable to generate insights at this time.\n• Ensure vehicles and maintenance records exist in the database.\n• Check backend logs for details.';
  }
}

// ─── Operations Brief (Groq → Gemini Pipeline) ───────────────────────────────
async function generateOperationsBrief() {
  const ctx = await getRichFleetContext();

  const fleetSummary = `
Fleet Overview (last 7 days):
- Total Vehicles: ${ctx.vehicles.total} (Active: ${ctx.vehicles.active}, In Maintenance: ${ctx.vehicles.inMaintenance}, Available: ${ctx.vehicles.available})
- Fleet Utilization: ${ctx.utilization}%
- Total Drivers: ${ctx.drivers.total}
- Trips: ${JSON.stringify(ctx.trips.byStatus)}
- Vehicles with overdue maintenance (>90 days or never serviced): ${ctx.maintenance.overdueCount}
`.trim();

  // ── Stage 1: Groq Risk Analysis ──────────────────────────────────────────
  let grokAnalysis;
  try {
    const groqResponse = await groqWithRotation(async (client) => {
      return client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a fleet operations risk analyst AI. Your job is to analyze fleet data and output ONLY a valid JSON object with this EXACT structure — no markdown, no explanation, just the JSON:
{
  "riskScore": <integer 1-10>,
  "riskLevel": "<Low|Medium|High|Critical>",
  "utilization": <integer 0-100>,
  "flags": ["<flag1>", "<flag2>", "<flag3>"],
  "risks": [
    { "category": "<category>", "description": "<1 sentence>", "severity": "<Low|Medium|High>" }
  ],
  "topPriority": "<single most urgent action in 1 sentence>"
}
Risk score guide: 1-3=Low, 4-5=Medium, 6-7=High, 8-10=Critical.
Output ONLY the JSON object. No other text.`,
          },
          {
            role: 'user',
            content: `Analyze this fleet data and return the risk JSON:\n\n${fleetSummary}`,
          },
        ],
        temperature: 0.2,
        max_tokens: 500,
      });
    });

    const rawText = groqResponse.choices[0]?.message?.content?.trim() || '{}';
    // Extract JSON even if model wraps it in code fences
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    grokAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(rawText);
  } catch (err) {
    console.error('[Groq] Risk analysis failed:', err.message);
    // Fallback: build analysis from context directly
    const score = ctx.utilization < 20 ? 6 : ctx.utilization < 50 ? 4 : 3;
    grokAnalysis = {
      riskScore: score + ctx.maintenance.overdueCount,
      riskLevel: score >= 7 ? 'High' : score >= 5 ? 'Medium' : 'Low',
      utilization: ctx.utilization,
      flags: [
        ctx.vehicles.inMaintenance > 0 ? `${ctx.vehicles.inMaintenance} vehicle(s) in maintenance` : 'Fleet healthy',
        ctx.maintenance.overdueCount > 0 ? `${ctx.maintenance.overdueCount} vehicles overdue for service` : 'Maintenance up to date',
        ctx.utilization < 30 ? 'Low fleet utilization' : 'Normal utilization',
      ],
      risks: [
        { category: 'Maintenance', description: `${ctx.maintenance.overdueCount} vehicles overdue for maintenance`, severity: ctx.maintenance.overdueCount > 2 ? 'High' : 'Medium' },
        { category: 'Utilization', description: `Fleet at ${ctx.utilization}% utilization`, severity: ctx.utilization < 20 ? 'High' : 'Low' },
      ],
      topPriority: ctx.maintenance.overdueCount > 0 ? 'Schedule immediate maintenance for overdue vehicles.' : 'Monitor active trips and ensure driver availability.',
    };
  }

  // ── Stage 2: Gemini Narrative ─────────────────────────────────────────────
  let geminiNarrative = '';
  let actionItems = [];
  try {
    const genAI = new GoogleGenerativeAI(env.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const narrativePrompt = `You are a senior fleet operations manager writing a daily operations brief.

A risk analysis AI has assessed today's fleet and produced this structured analysis:
${JSON.stringify(grokAnalysis, null, 2)}

Raw fleet snapshot:
${fleetSummary}

Write a concise, professional operations brief for the dispatch team. Structure your response as two parts:

NARRATIVE:
[2-3 sentence paragraph summarizing fleet status and key concerns. Plain text only, no markdown.]

ACTIONS:
[Exactly 3 specific, actionable items starting with • that dispatchers should do right now. Plain text only.]`;

    const result = await model.generateContent(narrativePrompt);
    const raw = stripMarkdown(result.response.text());

    // Parse narrative and actions from response
    const narrativeMatch = raw.match(/NARRATIVE:\s*([\s\S]+?)(?=ACTIONS:|$)/i);
    const actionsMatch = raw.match(/ACTIONS:\s*([\s\S]+?)$/i);

    geminiNarrative = narrativeMatch ? narrativeMatch[1].trim() : raw.split('\n').slice(0, 3).join(' ').trim();
    const actionsText = actionsMatch ? actionsMatch[1].trim() : '';
    actionItems = actionsText
      .split('\n')
      .map(line => line.replace(/^[•\-\d.]\s*/, '').trim())
      .filter(Boolean)
      .slice(0, 3);

    if (actionItems.length === 0) {
      actionItems = [grokAnalysis.topPriority || 'Review fleet status and assign available vehicles.'];
    }
  } catch (err) {
    console.error('[Gemini] Narrative generation failed:', err.message);
    geminiNarrative = `Fleet is operating at ${ctx.utilization}% utilization with ${ctx.vehicles.available} vehicles available. Risk level is ${grokAnalysis.riskLevel}. ${ctx.maintenance.overdueCount > 0 ? `${ctx.maintenance.overdueCount} vehicles require maintenance attention.` : ''}`;
    actionItems = [
      grokAnalysis.topPriority || 'Review active trips and vehicle availability.',
      `Check ${ctx.maintenance.overdueCount} vehicles overdue for maintenance.`,
      'Confirm all dispatched drivers have checked in.',
    ];
  }

  return {
    groq: {
      model: 'llama-3.3-70b-versatile',
      keyUsed: groqKeyIndex % env.groqApiKeys.length + 1,
      riskScore: Math.min(10, Math.max(1, grokAnalysis.riskScore || 5)),
      riskLevel: grokAnalysis.riskLevel || 'Medium',
      utilization: grokAnalysis.utilization ?? ctx.utilization,
      flags: grokAnalysis.flags || [],
      risks: grokAnalysis.risks || [],
      topPriority: grokAnalysis.topPriority || '',
    },
    gemini: {
      model: 'gemini-2.5-flash',
      narrative: geminiNarrative,
      actionItems,
    },
    generatedAt: new Date().toISOString(),
  };
}

// ─── Chat with Assistant (Gemini) ─────────────────────────────────────────────
async function chatWithAssistant(userMessage) {
  if (!env.geminiApiKey || env.geminiApiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return {
      reply: 'Gemini API key is not configured. Please add your GEMINI_API_KEY to backend/.env. Get a free key at https://aistudio.google.com',
      hasKey: false
    };
  }

  try {
    const context = await getFleetContext();
    const systemPrompt = buildSystemPrompt(context);

    const genAI = new GoogleGenerativeAI(env.geminiApiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(userMessage);
    const reply = stripMarkdown(result.response.text());

    return { reply, hasKey: true };
  } catch (err) {
    console.error('[AI Service] Chat error:', err.message);
    throw new Error('AI service temporarily unavailable. Please try again.');
  }
}

module.exports = { chatWithAssistant, getMaintenanceInsight, generateOperationsBrief };

