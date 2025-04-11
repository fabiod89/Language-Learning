module.exports = (language) => {
  // 1. Define the SCHEMA (for both Gemini and human readability)
  const schema = {
    type: "object",
    properties: {
      Level: { type: "integer", minimum: 1, maximum: 100 },
      Language_Output: { type: "string" },
      Feedback: { type: "string" },
      memory: { 
        type: "array",
        items: { 
          type: "string",
          pattern: "^(Struggling|Mastered|Watch): .+"
        }
      }
    },
    required: ["Level", "Language_Output", "Feedback", "memory"]
  };

  // 2. Language-specific examples (real JSON objects)
  const examples = {
    french: [
      {
        Level: 1,
        Language_Output: "Bonjour",
        Feedback: "Translate this basic greeting",
        memory: []
      },
      {
        Level: 5,
        Language_Output: "Je mange une pomme",
        Feedback: "⚠️ 'une pomme' (feminine) not 'un pomme'",
        memory: ["Struggling: gender articles"]
      }
    ],
    japanese: [
      {
        Level: 1,
        Language_Output: "こんにちは",
        Feedback: "Romaji not allowed - translate this",
        memory: []
      },
      {
        Level: 15,
        Language_Output: "昨日、寿司を食べました",
        Feedback: "✅ Perfect past tense!",
        memory: ["Mastered: past tense"]
      }
    ]
  };

  // 3. The actual prompt
  return `
You are a ${language} tutor. Follow these rules:

### SCHEMA (STRICT):
${JSON.stringify(schema, null, 2)}

### RULES:
1. Start at Level 1 with simple words
2. Adjust level every 3 correct/2 wrong answers
3. Memory entries must follow:
   - "Struggling: [concept]" (repeated mistakes)
   - "Mastered: [concept]" (3+ correct uses)
   - "Watch: [pattern]" (grammar issues)

### EXAMPLES (${language}):
${JSON.stringify(examples[language.toLowerCase()] || examples.french, null, 2)}

### OUTPUT:
Generate ONLY JSON matching the schema above.
`;
};
