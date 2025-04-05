const { getGeminiModel } = require("../config/gemini");
const Chat = require("../models/Chat");
const User = require("../models/User");
const Habit = require("../models/Habit");

// Chat with AI
exports.chatWithAI = async (req, res) => {
  try {
    const { userId, message, chatId } = req.body;

    if (!userId || !message) {
      return res
        .status(400)
        .json({ message: "User ID and message are required" });
    }

    // Find or create a chat
    let chat;
    if (chatId) {
      chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }
    } else {
      // Create a new chat session
      chat = new Chat({
        user: userId,
        messages: [],
      });
    }

    // Add user message to chat
    chat.messages.push({
      role: "user",
      content: message,
      timestamp: Date.now(),
    });

    // Get user context for more personalized responses
    const user = await User.findById(userId);

    // Prepare chat history for Gemini
    const chatHistory = chat.messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // System prompt with context about the user
    const systemPrompt = {
      role: "system",
      parts: [
        {
          text: `You are EcoWise AI, a personal sustainability coach.
        Your goal is to help users reduce their carbon footprint through personalized advice.
        Be friendly, motivating, and educational. Suggest small, actionable steps.
        The user's name is ${user.firstName || "there"}.
        Their sustainability score is ${user.sustainabilityScore}/100.
        They have ${user.greenPoints} green points.
        Their preferences: Diet: ${user.goalPreferences?.diet || "standard"}, 
        Transport: ${user.goalPreferences?.transport || "car"}, 
        Energy: ${user.goalPreferences?.energyUse || "standard"}, 
        Waste: ${user.goalPreferences?.wasteManagement || "standard"}.
        They have earned these badges: ${user.badges?.join(", ") || "none yet"}.
        Encourage them to improve their habits and earn more points and badges.`,
        },
      ],
    };

    // Initialize the generative model
    const model = getGeminiModel();

    // Create a chat session
    const geminiChat = model.startChat({
      history: [systemPrompt, ...chatHistory.slice(0, -1)], // Include all but the latest message
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1000,
      },
    });

    // Generate response from Gemini
    const result = await geminiChat.sendMessage(message);
    const aiResponse = result.response.text();

    // Add AI response to chat
    chat.messages.push({
      role: "ai",
      content: aiResponse,
      timestamp: Date.now(),
    });

    // Update chat metadata
    chat.lastMessageAt = Date.now();
    await chat.save();

    // Send response back
    res.status(200).json({
      chatId: chat._id,
      message: aiResponse,
      userContext: {
        sustainabilityScore: user.sustainabilityScore,
        greenPoints: user.greenPoints,
        badges: user.badges,
      },
    });
  } catch (error) {
    console.error("Error in AI chat:", error);
    res.status(500).json({
      message: "Error communicating with AI service",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get all chats for a user
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const chats = await Chat.find({ user: userId })
      .sort({ lastMessageAt: -1 })
      .select("_id sessionTopic startedAt lastMessageAt messages");

    res.status(200).json(chats);
  } catch (error) {
    console.error("Error getting user chats:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get specific chat by ID
exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error("Error getting chat:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Analyze user habits and provide suggestions
exports.analyzeHabits = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Get user and recent habits
    const user = await User.findById(userId);
    const recentHabits = await Habit.find({ user: userId })
      .sort({ date: -1 })
      .limit(20);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Format habits for analysis
    const habitsText = recentHabits
      .map(
        (h) =>
          `- ${h.category}: ${h.description} (Carbon Footprint: ${h.carbonFootprint})`
      )
      .join("\n");

    // Create prompt for habit analysis
    const analysisPrompt = `
      Analyze the following sustainability habits and provide personalized suggestions:
      
      User Profile:
      Name: ${user.firstName || "User"}
      Current Sustainability Score: ${user.sustainabilityScore}/100
      Green Points: ${user.greenPoints}
      Diet Preference: ${user.goalPreferences?.diet || "standard"}
      Transport Preference: ${user.goalPreferences?.transport || "car"}
      Energy Use: ${user.goalPreferences?.energyUse || "standard"}
      Waste Management: ${user.goalPreferences?.wasteManagement || "standard"}
      
      Recent Habits:
      ${habitsText || "No recent habits recorded"}
      
      Please provide:
      1. A brief analysis of their current habits
      2. Three specific, actionable suggestions to improve sustainability
      3. One habit they could start today to make an immediate impact
      4. An estimate of potential carbon reduction (in CO2kg) if they follow your advice
    `;

    // Get response from Gemini
    const model = getGeminiModel();
    const result = await model.generateContent(analysisPrompt);
    const analysis = result.response.text();

    res.status(200).json({
      analysis,
      userProfile: {
        sustainabilityScore: user.sustainabilityScore,
        greenPoints: user.greenPoints,
        badges: user.badges,
      },
      habitCount: recentHabits.length,
    });
  } catch (error) {
    console.error("Error analyzing habits:", error);
    res.status(500).json({ message: "Error analyzing habits" });
  }
};

// Get sustainability suggestions
exports.getSuggestions = async (req, res) => {
  try {
    const { userId, category } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Get user info
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create suggestion prompt
    let suggestionPrompt = `
      Generate 5 personalized sustainability tips for a user with these preferences:
      Name: ${user.firstName || "User"}
      Current Sustainability Score: ${user.sustainabilityScore}/100
      Diet Preference: ${user.goalPreferences?.diet || "standard"}
      Transport Preference: ${user.goalPreferences?.transport || "car"}
      Energy Use: ${user.goalPreferences?.energyUse || "standard"}
      Waste Management: ${user.goalPreferences?.wasteManagement || "standard"}
    `;

    // If category specified, focus on that
    if (category) {
      suggestionPrompt += `\nPlease focus on the '${category}' category.`;
    }

    suggestionPrompt += `
      For each tip, provide:
      1. A short, actionable suggestion title
      2. A brief explanation (max 2 sentences)
      3. The potential carbon reduction (in CO2kg)
      4. Difficulty level (Easy, Medium, Hard)
      
      Format each tip in clear sections.
    `;

    // Get response from Gemini
    const model = getGeminiModel();
    const result = await model.generateContent(suggestionPrompt);
    const suggestions = result.response.text();

    res.status(200).json({
      suggestions,
      category: category || "all",
      userProfile: {
        sustainabilityScore: user.sustainabilityScore,
        greenPoints: user.greenPoints,
      },
    });
  } catch (error) {
    console.error("Error getting suggestions:", error);
    res.status(500).json({ message: "Error generating suggestions" });
  }
};

// Calculate carbon footprint
exports.calculateFootprint = async (req, res) => {
  try {
    const { userId, description } = req.body;

    if (!userId || !description) {
      return res.status(400).json({
        message: "User ID and activity description are required",
      });
    }

    // Prompt for carbon footprint calculation
    const calculationPrompt = `
      Estimate the approximate carbon footprint (in kg of CO2) for the following activity:
      "${description}"
      
      Please provide:
      1. The estimated carbon footprint in kg CO2
      2. A brief explanation of how you calculated this
      3. A suggestion for a more sustainable alternative
      4. The potential carbon savings from the alternative
      
      Format your response with clear section headings.
    `;

    // Get response from Gemini
    const model = getGeminiModel();
    const result = await model.generateContent(calculationPrompt);
    const footprintAnalysis = result.response.text();

    // Extract numerical carbon footprint - this is a simplified extraction
    // In a real app, you'd want more sophisticated parsing
    const footprintMatch = footprintAnalysis.match(
      /(\d+(\.\d+)?)\s*(kg|kilograms?)\s*(of)?\s*(CO2|carbon dioxide)/i
    );
    let numericFootprint = 0;

    if (footprintMatch && footprintMatch[1]) {
      numericFootprint = parseFloat(footprintMatch[1]);
    }

    res.status(200).json({
      description,
      footprintAnalysis,
      estimatedFootprint: numericFootprint,
      analysisDate: new Date(),
    });
  } catch (error) {
    console.error("Error calculating footprint:", error);
    res.status(500).json({ message: "Error calculating carbon footprint" });
  }
};
