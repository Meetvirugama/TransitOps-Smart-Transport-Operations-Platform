/**
 * TransitOps AI Feature Test Suite
 * ─────────────────────────────────────────────
 * Generates Q&A pairs, tests Gemini API, tests
 * backend endpoints, and produces a full report.
 */

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const http = require('http');

// ── CONFIG ──────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash';
const BACKEND_PORT = process.env.PORT || 3000;
const BACKEND_HOST = 'localhost';

// ── TEST QUESTIONS ──────────────────────────────
const TEST_QUESTIONS = [
  {
    id: 'Q1',
    category: 'Fleet Status',
    question: 'What is the current fleet utilization status?',
    expectedKeywords: ['vehicle', 'fleet', 'utilization', 'available', 'active'],
  },
  {
    id: 'Q2',
    category: 'Drivers',
    question: 'How many drivers are registered in the system?',
    expectedKeywords: ['driver', 'registered', 'total'],
  },
  {
    id: 'Q3',
    category: 'Trips',
    question: 'Give me a summary of recent trip performance over the last 30 days.',
    expectedKeywords: ['trip', 'completed', 'dispatched', 'status'],
  },
  {
    id: 'Q4',
    category: 'Maintenance',
    question: 'Which vehicles are at highest risk of needing maintenance soon?',
    expectedKeywords: ['vehicle', 'maintenance', 'risk', 'service'],
  },
  {
    id: 'Q5',
    category: 'Operational Advice',
    question: 'What are the best practices for reducing fleet downtime?',
    expectedKeywords: ['maintenance', 'schedule', 'downtime', 'preventive', 'inspection'],
  },
  {
    id: 'Q6',
    category: 'Cost Optimization',
    question: 'How can we reduce fuel costs across the fleet?',
    expectedKeywords: ['fuel', 'efficiency', 'cost', 'route', 'driver'],
  },
  {
    id: 'Q7',
    category: 'Safety',
    question: 'What safety checks should dispatchers do before assigning a vehicle to a trip?',
    expectedKeywords: ['safety', 'check', 'inspection', 'driver', 'vehicle'],
  },
  {
    id: 'Q8',
    category: 'Edge Case',
    question: '',  // Empty question — should be rejected by backend
    expectedKeywords: [],
    expectError: true,
  },
  {
    id: 'Q9',
    category: 'Edge Case',
    question: 'a'.repeat(1001),  // Over 1000 chars — should be rejected
    expectedKeywords: [],
    expectError: true,
  },
];

// ── HELPERS ─────────────────────────────────────
const colors = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red:   (s) => `\x1b[31m${s}\x1b[0m`,
  yellow:(s) => `\x1b[33m${s}\x1b[0m`,
  cyan:  (s) => `\x1b[36m${s}\x1b[0m`,
  bold:  (s) => `\x1b[1m${s}\x1b[0m`,
  dim:   (s) => `\x1b[2m${s}\x1b[0m`,
};

function truncate(str, max = 120) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

// Mirror of backend stripMarkdown — applied in Phase 1 to test the sanitiser
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

// Delay between Gemini requests to avoid 429 rate limit
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const INTER_REQUEST_DELAY_MS = 3000;

function makeRequest(method, path, body, token) {
  return new Promise((resolve) => {
    const postData = body ? JSON.stringify(body) : null;
    const options = {
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (e) => {
      resolve({ status: 0, error: e.message });
    });

    if (postData) req.write(postData);
    req.end();
  });
}

// ── TESTS ────────────────────────────────────────
const report = {
  geminiDirect: [],
  backendEndpoints: [],
  edgeCases: [],
  bugs: [],
  summary: { passed: 0, failed: 0, total: 0 },
};

async function testGeminiDirect() {
  console.log(colors.bold('\n━━━ PHASE 1: Direct Gemini API Q&A Tests ━━━'));
  console.log(colors.dim(`   (${INTER_REQUEST_DELAY_MS/1000}s delay between requests to avoid rate limits)\n`));
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: `You are an AI assistant for TransitOps, a fleet management platform.
Current fleet context: 5 vehicles (3 Available, 1 On Trip, 1 In Maintenance), 2 active trips, 8 registered drivers.
Be concise, professional, and data-driven.
OUTPUT FORMAT: Plain text only. No markdown. No **bold**. No *italic*. No # headings. Use • for bullet points. Max 150 words.`,
  });

  const normalQuestions = TEST_QUESTIONS.filter(q => !q.expectError && q.question);

  for (const q of normalQuestions) {
    const startTime = Date.now();
    try {
      // Wait between requests to avoid 429 rate limiting
      if (normalQuestions.indexOf(q) > 0) await sleep(INTER_REQUEST_DELAY_MS);

      console.log(colors.cyan(`\n[${q.id}] ${q.category}: "${q.question}"`));
      const result = await model.generateContent(q.question);
      // Apply stripMarkdown (same as backend) to sanitise response
      const answer = stripMarkdown(result.response.text());
      const elapsed = Date.now() - startTime;

      // Check markdown leakage
      const hasMarkdown = /\*\*|\*[^*]|^#{1,6}\s|^-\s/m.test(result.response.text());
      if (hasMarkdown) {
        report.bugs.push({ location: `Gemini response (${q.id})`, issue: 'Raw response contained markdown — stripMarkdown() corrected it', severity: 'LOW' });
      }

      // Check if answer contains expected keywords (case insensitive)
      const lowerAnswer = answer.toLowerCase();
      const matchedKeywords = q.expectedKeywords.filter(k => lowerAnswer.includes(k.toLowerCase()));
      const relevanceScore = Math.round((matchedKeywords.length / q.expectedKeywords.length) * 100);
      const passed = answer.length > 10 && matchedKeywords.length >= 1;

      console.log(colors.dim(`   Answer: ${truncate(answer, 200)}`));
      if (hasMarkdown) console.log(colors.yellow('   ⚠ Raw response had markdown — stripped server-side ✓'));
      console.log(`   Keywords matched: ${matchedKeywords.join(', ')} (${relevanceScore}%)`);
      console.log(`   Response time: ${elapsed}ms | Status: ${passed ? colors.green('PASS ✓') : colors.red('FAIL ✗')}`);

      report.geminiDirect.push({
        id: q.id,
        category: q.category,
        question: q.question,
        answer: truncate(answer, 300),
        responseMs: elapsed,
        relevanceScore,
        matchedKeywords,
        passed,
      });

      report.summary.total++;
      passed ? report.summary.passed++ : report.summary.failed++;
    } catch (err) {
      const elapsed = Date.now() - startTime;
      console.log(colors.red(`   ERROR: ${err.message.split('\n')[0]}`));
      report.geminiDirect.push({
        id: q.id,
        category: q.category,
        question: q.question,
        answer: null,
        error: err.message.split('\n')[0],
        responseMs: elapsed,
        passed: false,
      });
      report.summary.total++;
      report.summary.failed++;
    }
  }
}

async function testBackendHealth(token) {
  console.log(colors.bold('\n━━━ PHASE 2: Backend Endpoint Tests ━━━'));

  // 2a — Health check
  {
    console.log(colors.cyan('\n[EP1] GET /health'));
    const res = await makeRequest('GET', '/health');
    const passed = res.status === 200 && res.body?.status === 'UP';
    console.log(`   Status: ${res.status} | DB Connected: ${res.body?.dbConnected} | ${passed ? colors.green('PASS ✓') : colors.red('FAIL ✗')}`);
    if (!passed && res.status === 0) {
      report.bugs.push({ location: 'Backend Server', issue: 'Backend not running. Start with: cd backend && npm run dev', severity: 'CRITICAL' });
    }
    report.backendEndpoints.push({ endpoint: 'GET /health', status: res.status, passed, detail: JSON.stringify(res.body) });
    report.summary.total++;
    passed ? report.summary.passed++ : report.summary.failed++;
  }

  if (!token) {
    console.log(colors.yellow('\n   No auth token — skipping authenticated endpoint tests'));
    console.log(colors.yellow('   (Backend must be running to test /api/ai/* endpoints)\n'));
    return;
  }

  // 2b — Chat endpoint with valid message
  {
    console.log(colors.cyan('\n[EP2] POST /api/ai/chat (valid message)'));
    const res = await makeRequest('POST', '/api/ai/chat', { message: 'How many vehicles are available?' }, token);
    const passed = res.status === 200 && res.body?.success && res.body?.data?.reply;
    console.log(`   Status: ${res.status} | Reply: ${truncate(res.body?.data?.reply, 80)} | ${passed ? colors.green('PASS ✓') : colors.red('FAIL ✗')}`);
    if (!passed) report.bugs.push({ location: 'POST /api/ai/chat', issue: `Unexpected response: ${JSON.stringify(res.body)}`, severity: 'HIGH' });
    report.backendEndpoints.push({ endpoint: 'POST /api/ai/chat (valid)', status: res.status, passed, detail: truncate(res.body?.data?.reply, 200) });
    report.summary.total++;
    passed ? report.summary.passed++ : report.summary.failed++;
  }

  // 2c — Chat with empty message (should return 400)
  {
    console.log(colors.cyan('\n[EP3] POST /api/ai/chat (empty message — expect 400)'));
    const res = await makeRequest('POST', '/api/ai/chat', { message: '' }, token);
    const passed = res.status === 400;
    console.log(`   Status: ${res.status} | Message: ${res.body?.message} | ${passed ? colors.green('PASS ✓') : colors.red('FAIL ✗')}`);
    if (!passed) report.bugs.push({ location: 'POST /api/ai/chat validation', issue: 'Empty message should return 400 but got ' + res.status, severity: 'MEDIUM' });
    report.backendEndpoints.push({ endpoint: 'POST /api/ai/chat (empty)', status: res.status, passed });
    report.summary.total++;
    passed ? report.summary.passed++ : report.summary.failed++;
  }

  // 2d — Chat with oversized message (should return 400)
  {
    console.log(colors.cyan('\n[EP4] POST /api/ai/chat (1001 char message — expect 400)'));
    const res = await makeRequest('POST', '/api/ai/chat', { message: 'a'.repeat(1001) }, token);
    const passed = res.status === 400;
    console.log(`   Status: ${res.status} | Message: ${res.body?.message} | ${passed ? colors.green('PASS ✓') : colors.red('FAIL ✗')}`);
    if (!passed) report.bugs.push({ location: 'POST /api/ai/chat validation', issue: 'Oversized message should return 400 but got ' + res.status, severity: 'MEDIUM' });
    report.backendEndpoints.push({ endpoint: 'POST /api/ai/chat (oversized)', status: res.status, passed });
    report.summary.total++;
    passed ? report.summary.passed++ : report.summary.failed++;
  }

  // 2e — Maintenance insights
  {
    console.log(colors.cyan('\n[EP5] GET /api/ai/maintenance-insights'));
    const res = await makeRequest('GET', '/api/ai/maintenance-insights', null, token);
    const passed = res.status === 200 && res.body?.success && res.body?.data?.insight;
    console.log(`   Status: ${res.status} | Insight: ${truncate(res.body?.data?.insight, 80)} | ${passed ? colors.green('PASS ✓') : colors.red('FAIL ✗')}`);
    if (!passed) report.bugs.push({ location: 'GET /api/ai/maintenance-insights', issue: `Unexpected response: ${JSON.stringify(res.body)}`, severity: 'HIGH' });
    report.backendEndpoints.push({ endpoint: 'GET /api/ai/maintenance-insights', status: res.status, passed, detail: truncate(res.body?.data?.insight, 200) });
    report.summary.total++;
    passed ? report.summary.passed++ : report.summary.failed++;
  }

  // 2f — Unauthenticated request (should return 401)
  {
    console.log(colors.cyan('\n[EP6] POST /api/ai/chat (no token — expect 401)'));
    const res = await makeRequest('POST', '/api/ai/chat', { message: 'hello' });
    const passed = res.status === 401;
    console.log(`   Status: ${res.status} | ${passed ? colors.green('PASS ✓') : colors.red('FAIL ✗')}`);
    if (!passed) report.bugs.push({ location: 'POST /api/ai/chat auth', issue: 'Unauthenticated request should return 401 but got ' + res.status, severity: 'HIGH' });
    report.backendEndpoints.push({ endpoint: 'POST /api/ai/chat (no auth)', status: res.status, passed });
    report.summary.total++;
    passed ? report.summary.passed++ : report.summary.failed++;
  }

  // 2g — Operations brief
  {
    console.log(colors.cyan('\n[EP7] GET /api/ai/operations-brief'));
    const res = await makeRequest('GET', '/api/ai/operations-brief', null, token);
    const passed = res.status === 200 && res.body?.success && res.body?.data?.groq?.riskLevel;
    console.log(`   Status: ${res.status} | Risk Level: ${res.body?.data?.groq?.riskLevel} | ${passed ? colors.green('PASS ✓') : colors.red('FAIL ✗')}`);
    if (!passed) report.bugs.push({ location: 'GET /api/ai/operations-brief', issue: `Unexpected response: ${JSON.stringify(res.body)}`, severity: 'HIGH' });
    report.backendEndpoints.push({ endpoint: 'GET /api/ai/operations-brief', status: res.status, passed, detail: `Risk Score: ${res.body?.data?.groq?.riskScore}, Level: ${res.body?.data?.groq?.riskLevel}` });
    report.summary.total++;
    passed ? report.summary.passed++ : report.summary.failed++;
  }
}

async function testGroqDirect() {
  console.log(colors.bold('\n━━━ PHASE 4: Direct Groq API Connectivity Tests ━━━'));
  const keys = [
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    process.env.GROQ_API_KEY_4
  ].filter(Boolean);

  console.log(`  Found ${keys.length} Groq API keys to test.`);
  
  if (keys.length === 0) {
    console.log(colors.red('  ❌ No Groq API keys configured.'));
    report.bugs.push({ location: 'Groq API keys config', issue: 'No keys found in environment variables', severity: 'HIGH' });
    report.summary.total++;
    report.summary.failed++;
    return;
  }

  const Groq = require('groq-sdk');
  
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const maskedKey = key.slice(0, 8) + '...' + key.slice(-6);
    console.log(colors.cyan(`\n[GQ${i+1}] Testing Groq Key ${i+1} (${maskedKey}):`));
    
    try {
      const groq = new Groq({ apiKey: key });
      const startTime = Date.now();
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'Say OK' }],
        max_tokens: 10
      });
      const elapsed = Date.now() - startTime;
      const reply = completion.choices[0]?.message?.content?.trim();
      const passed = reply && reply.toLowerCase().includes('ok');
      
      console.log(`   Reply: "${reply}" | Time: ${elapsed}ms | Status: ${passed ? colors.green('PASS ✓') : colors.red('FAIL ✗')}`);
      
      report.backendEndpoints.push({
        endpoint: `Direct Groq Key ${i+1}`,
        status: 200,
        passed,
        detail: `Masked key: ${maskedKey}, elapsed: ${elapsed}ms`
      });
      report.summary.total++;
      passed ? report.summary.passed++ : report.summary.failed++;
    } catch (err) {
      console.log(colors.red(`   ERROR: ${err.message}`));
      report.bugs.push({ location: `Groq Key ${i+1} Direct Connection`, issue: err.message, severity: 'MEDIUM' });
      report.backendEndpoints.push({
        endpoint: `Direct Groq Key ${i+1}`,
        status: err.status || 500,
        passed: false,
        detail: err.message
      });
      report.summary.total++;
      report.summary.failed++;
    }
  }
}

async function testWeatherAPI() {
  console.log(colors.bold('\n━━━ PHASE 3: Open-Meteo Weather API Test ━━━'));
  console.log(colors.cyan('\n[WX1] Fetching Mumbai weather (lat: 19.076, lon: 72.877)'));

  try {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=19.076&longitude=72.877&current=temperature_2m,wind_speed_10m,weather_code&wind_speed_unit=kmh&timezone=auto';
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) throw new Error(data.reason || 'API error');

    const { temperature_2m, wind_speed_10m, weather_code } = data.current;
    const passed = typeof temperature_2m === 'number' && typeof weather_code === 'number';

    console.log(`   Temp: ${temperature_2m}°C | Wind: ${wind_speed_10m} km/h | WMO Code: ${weather_code}`);
    console.log(`   Status: ${passed ? colors.green('PASS ✓') : colors.red('FAIL ✗')}`);

    report.backendEndpoints.push({
      endpoint: 'Open-Meteo /v1/forecast (Mumbai)',
      status: 200,
      passed,
      detail: `${temperature_2m}°C, wind ${wind_speed_10m} km/h, code ${weather_code}`,
    });
    report.summary.total++;
    passed ? report.summary.passed++ : report.summary.failed++;
  } catch (err) {
    console.log(colors.red(`   ERROR: ${err.message}`));
    report.bugs.push({ location: 'WeatherAlert.jsx / Open-Meteo API', issue: err.message, severity: 'MEDIUM' });
    report.backendEndpoints.push({ endpoint: 'Open-Meteo /v1/forecast (Mumbai)', status: 0, passed: false, detail: err.message });
    report.summary.total++;
    report.summary.failed++;
  }
}

function printFinalReport() {
  const divider = '━'.repeat(60);
  console.log('\n' + colors.bold(divider));
  console.log(colors.bold('  📋 TRANSITOPS AI FEATURE TEST REPORT'));
  console.log(colors.bold(divider));

  // Summary
  const pct = Math.round((report.summary.passed / report.summary.total) * 100);
  const summaryColor = pct >= 80 ? colors.green : pct >= 50 ? colors.yellow : colors.red;
  console.log(`\n  Total Tests : ${report.summary.total}`);
  console.log(`  Passed      : ${colors.green(report.summary.passed)}`);
  console.log(`  Failed      : ${colors.red(report.summary.failed)}`);
  console.log(`  Pass Rate   : ${summaryColor(pct + '%')}`);

  // Gemini Q&A table
  console.log('\n' + colors.bold('  ── Direct Gemini Q&A Results ──'));
  for (const r of report.geminiDirect) {
    const status = r.passed ? colors.green('✓') : colors.red('✗');
    const relevance = r.relevanceScore !== undefined ? ` [rel: ${r.relevanceScore}%]` : '';
    console.log(`  ${status} [${r.id}] ${r.category}${relevance} — ${r.responseMs}ms`);
    if (r.answer) console.log(colors.dim(`       A: ${truncate(r.answer, 130)}`));
    if (r.error)  console.log(colors.red(`       ERR: ${r.error}`));
  }

  // Endpoint results
  console.log('\n' + colors.bold('  ── Endpoint Tests ──'));
  for (const r of report.backendEndpoints) {
    const status = r.passed ? colors.green('✓') : colors.red('✗');
    console.log(`  ${status} ${r.endpoint} → HTTP ${r.status}`);
    if (r.detail) console.log(colors.dim(`       ${truncate(r.detail, 120)}`));
  }

  // Bugs
  if (report.bugs.length > 0) {
    console.log('\n' + colors.bold(colors.red('  ── Bugs Found ──')));
    for (const b of report.bugs) {
      const sev = b.severity === 'CRITICAL' ? colors.red : b.severity === 'HIGH' ? colors.yellow : colors.dim;
      console.log(`  🐛 [${sev(b.severity)}] ${b.location}`);
      console.log(colors.dim(`       ${b.issue}`));
    }
  } else {
    console.log('\n  ' + colors.green('✓ No bugs detected!'));
  }

  console.log('\n' + colors.bold(divider) + '\n');
  return report;
}

// ── MAIN ─────────────────────────────────────────
(async () => {
  console.log(colors.bold('\n🚀 TransitOps AI Test Suite Starting...\n'));
  console.log(`  API Key    : ${GEMINI_API_KEY ? colors.green('SET ✓') : colors.red('MISSING ✗')}`);
  console.log(`  Model      : ${MODEL}`);
  console.log(`  Backend    : http://${BACKEND_HOST}:${BACKEND_PORT}`);

  if (!GEMINI_API_KEY) {
    console.log(colors.red('\nFATAL: GEMINI_API_KEY not set in .env. Aborting.'));
    process.exit(1);
  }

  await testGeminiDirect();
  await testBackendHealth(null); // No auth token — tests health + unauthed requests
  await testGroqDirect();
  await testWeatherAPI();

  const finalReport = printFinalReport();

  // Exit with error code if tests failed
  if (finalReport.summary.failed > 0 && finalReport.bugs.some(b => b.severity === 'CRITICAL')) {
    process.exit(1);
  }
})();
