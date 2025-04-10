const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  
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
        parts: [{
          text: `Based on the language I chose. Assume Level 1 is beginner and the Max is Level 100 (Fluent/Advanced)
        Start with Level 1 and present me a phrase/sentence in that language. I will type back the phrase in English.
        Based on my answer, provide feedback and remember my answer. You will decide if I need to stay at current level or go up.
        The memory should remember what words I missed, my understanding of grammar and structure. Don't move me up a level if I get something right, ask a few phrases before deciding if I move up or down. Remember. Level 100 is the max so it should be drawn out a bit. Use memory to remember everything I got correct and everything I got wrong. Use memory to adjust what the next phrase is. So if I get a word wrong, present the word again in the future.
          
          Language: ${language}`
        }],
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
