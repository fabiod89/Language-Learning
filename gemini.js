const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  const languageTutorPrompt = require("./prompts/language-tutor");
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-lite",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        Level: { type: "integer" },
        Language_Output: { type: "string" },
        Feedback: { type: "string" },
        memory: { type: "array", items: { type: "string" } }
      },
      required: ["Level", "Language_Output", "Feedback", "memory"]
    },
  };
  
  async function startChatSession(language) {
    return model.startChat({
      generationConfig,
      history: [{
        role: "user",
        parts: [{ text: languageTutorPrompt(language) }],
      }],
    });
  }
  
  async function sendMessage(chatSession, userMessage) {
    try {
      const result = await chatSession.sendMessage(userMessage);
      return JSON.parse(result.response.text());
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw new Error('Failed to process message');
    }
  }
  
  module.exports = {
    startChatSession,
    sendMessage
  };
