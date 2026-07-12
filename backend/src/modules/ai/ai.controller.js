const aiService = require('./ai.service');

/**
 * POST /api/ai/chat
 * Body: { message: string }
 */
async function chat(req, res, next) {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }
    if (message.trim().length > 1000) {
      return res.status(400).json({ success: false, message: 'Message is too long (max 1000 characters).' });
    }
    const { reply, hasKey } = await aiService.chatWithAssistant(message.trim());
    return res.json({ success: true, data: { reply, hasKey } });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/ai/maintenance-insights
 */
async function maintenanceInsights(req, res, next) {
  try {
    const insight = await aiService.getMaintenanceInsight();
    return res.json({ success: true, data: { insight } });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/ai/operations-brief
 * Dual-AI pipeline: Groq (risk analysis) → Gemini (narrative)
 */
async function operationsBrief(req, res, next) {
  try {
    const brief = await aiService.generateOperationsBrief();
    return res.json({ success: true, data: brief });
  } catch (err) {
    next(err);
  }
}

module.exports = { chat, maintenanceInsights, operationsBrief };
