const express = require('express');
const router = express.Router();
const aiController = require('./ai.controller');
const authenticate = require('../../middleware/auth.middleware');

// All AI routes require authentication
router.use(authenticate);

// POST /api/ai/chat — send a message to the fleet AI assistant
router.post('/chat', aiController.chat);

// GET /api/ai/maintenance-insights — Gemini maintenance analysis
router.get('/maintenance-insights', aiController.maintenanceInsights);

// GET /api/ai/operations-brief — Groq risk analysis + Gemini narrative
router.get('/operations-brief', aiController.operationsBrief);

module.exports = router;
