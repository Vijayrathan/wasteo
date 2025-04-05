const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");

// POST /api/ai/chat - Send message to AI assistant
router.post("/chat", aiController.chatWithAI);

// GET /api/ai/chats - Get all chats for a user
router.get("/chats", aiController.getUserChats);

// GET /api/ai/chats/:id - Get specific chat by ID
router.get("/chats/:id", aiController.getChatById);

// POST /api/ai/analyze-habits - Analyze user habits for sustainability
router.post("/analyze-habits", aiController.analyzeHabits);

// POST /api/ai/suggestions - Get sustainability suggestions
router.post("/suggestions", aiController.getSuggestions);

// POST /api/ai/calculate-footprint - Calculate carbon footprint
router.post("/calculate-footprint", aiController.calculateFootprint);

module.exports = router;
