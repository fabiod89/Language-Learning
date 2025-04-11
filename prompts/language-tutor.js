module.exports = (languageCode) => {
  // 1. Language Configuration
  const languages = {
    fr: {
      name: "French",
      beginner: "Bonjour",
      intermediate: "Je voudrais un café"
    },
    es: {
      name: "Spanish",
      beginner: "Hola",
      intermediate: "¿Dónde está el baño?"
    },
    de: {
      name: "German",
      beginner: "Hallo",
      intermediate: "Ich möchte bezahlen"
    },
    it: {
      name: "Italian",
      beginner: "Ciao",
      intermediate: "Quanto costa questo?"
    },
    jp: {
      name: "Japanese",
      beginner: "こんにちは",
      intermediate: "これはいくらですか？"
    },
    br: {
      name: "Portuguese",
      beginner: "Olá",
      intermediate: "Quanto custa isso?"
    },
    kr: {
      name: "Korean",
      beginner: "안녕하세요",
      intermediate: "이것은 얼마입니까?"
    },
    kh: {
      name: "Khmer",
      beginner: "ជំរាបសួរ",
      intermediate: "តើវាមានតម្លៃប៉ុន្មាន?"
    }
  };

  const lang = languages[languageCode] || languages.fr;

  // 2. Schema Definition
  const schema = {
    type: "object",
    properties: {
      Level: { 
        type: "integer", 
        minimum: 1, 
        maximum: 100 
      },
      Language_Output: { 
        type: "string",
        description: `Phrase in ${lang.name} ONLY (no translations)`
      },
      Feedback: { 
        type: "string",
        description: "Clear English feedback for the learner"
      },
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

  // 3. Prompt Template
  return `
You are teaching ${lang.name}. Follow STRICTLY:

### CORE RULES:
1. FIRST MESSAGE: Always start with: "${lang.beginner}"
2. LANGUAGE PURITY:
   - NEVER mix languages
   - ${lang.name} ONLY in Language_Output
   - English ONLY in Feedback
3. PROGRESSION:
   - Level up after 3 correct answers
   - Level down after 2 mistakes
4. MEMORY TRACKING:
   - "Struggling: [issue]" (2+ errors)
   - "Mastered: [concept]" (3+ correct)
   - "Watch: [pattern]" (emerging issue)

### RESPONSE FORMAT:
${JSON.stringify(schema, null, 2)}

### EXAMPLE SESSION:
User: "START"
{
  "Level": 1,
  "Language_Output": "${lang.beginner}",
  "Feedback": "Translate this greeting to English",
  "memory": []
}

User: "Hello"
{
  "Level": 1,
  "Language_Output": "${lang.intermediate}",
  "Feedback": "⚠️ Careful with word order in ${lang.name}",
  "memory": ["Watch: sentence structure"]
}

### STRICT REQUIREMENTS:
- ALWAYS use the schema above
- NEVER provide direct translations
- Feedback should be actionable
`;
};
