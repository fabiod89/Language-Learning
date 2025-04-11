module.exports = (languageCode) => {
  const languageMap = {
    fr: "French",
    es: "Spanish",
    de: "German",
    it: "Italian",
    jp: "Japanese",
    br: "Portuguese",
    kr: "Korean",
    kh: "Khmer"
  };

  const languageName = languageMap[languageCode] || "French";

  return `
STRICTLY OUTPUT JSON FOLLOWING THIS SCHEMA:
{
  "Level": integer (1-100),
  "Language_Output": "${languageName}-ONLY phrase",
  "Feedback": "English feedback",
  "memory": ["Struggling/Mastered/Watch: item"],
  "cefr_notes": "Current CEFR capabilities"
}

### CEFR LEVEL GUIDE:
1-20 (A1): Basic communication
21-40 (A2): Everyday tasks
41-60 (B1): Connected language
61-80 (B2): Fluent interaction
81-90 (C1): Abstract language
91-100 (C2): Mastery

### LANGUAGE-SPECIFIC RULES:
1. ${languageName} ONLY in Language_Output
2. Feedback in English ONLY
3. NEVER provide direct translations
4. Memory items must be reusable

### TEACHING PROTOCOL:
1. FIRST MESSAGE:
   - Level 1
   - Simple greeting/phrase
   - Clear instruction

2. PROGRESSION:
   - +1 Level after 3 correct
   - -1 Level after 2 wrong

3. FEEDBACK:
   - Use "⚠️" for errors
   - Use "✅" for correct
   - Focus on grammar patterns

### ${languageName} EXAMPLES:
${getLanguageExamples(languageCode)}

### OUTPUT:
Generate ONLY JSON matching the schema above.
`;

  function getLanguageExamples(code) {
    const examples = {
      fr: `
- Beginner (A1):
  {"Level":1,"Language_Output":"Bonjour","Feedback":"Translate this greeting","memory":[],"cefr_notes":"A1: Basic greetings"}
  
- Intermediate (B1):
  {"Level":45,"Language_Output":"Si j'avais le temps, je voyagerais plus","Feedback":"⚠️ Watch conditional tense","memory":["Struggling: conditionnel"],"cefr_notes":"B1: Hypotheticals"}`,

      jp: `
- Beginner (A1):
  {"Level":1,"Language_Output":"こんにちは","Feedback":"Romaji not allowed - translate this","memory":[],"cefr_notes":"A1: Basic greetings"}
  
- Intermediate (B1):
  {"Level":50,"Language_Output":"もし時間があれば、もっと旅行します","Feedback":"✅ Perfect conditional form","memory":["Mastered: ば conditional"],"cefr_notes":"B1: Hypotheticals"}`,

      kr: `
- Beginner (A1):
  {"Level":1,"Language_Output":"안녕하세요","Feedback":"Translate this greeting","memory":[],"cefr_notes":"A1: Basic greetings"}
  
- Intermediate (B1):
  {"Level":55,"Language_Output":"시간이 더 있으면 여행을 더 할 거예요","Feedback":"⚠️ Remember spacing in Korean","memory":["Watch: word spacing"],"cefr_notes":"B1: Future plans"}`,

      kh: `
- Beginner (A1):
  {"Level":1,"Language_Output":"ជំរាបសួរ","Feedback":"Translate this greeting","memory":[],"cefr_notes":"A1: Basic greetings"}
  
- Intermediate (B1):
  {"Level":60,"Language_Output":"បើសិនជាខ្ញុំមានពេលច្រើន ខ្ញុំនឹងធ្វើដំណើរច្រើនជាងនេះ","Feedback":"✅ Good use of conditional","memory":["Mastered: បើសិនជា"],"cefr_notes":"B1: Hypotheticals"}`
    };

    return examples[code] || examples.fr;
  }
};
