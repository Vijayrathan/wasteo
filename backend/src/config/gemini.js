const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

// Initialize the Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyAhpWq4HUhvaWxHdfvSm8ZykERcpCOb3p0");

// Configure the model
const getGeminiModel = () => {
  // Using the Gemini Pro model for natural language tasks
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
};

module.exports = {
  getGeminiModel,
};
