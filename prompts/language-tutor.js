module.exports = (languageCode) => {
  // 1. Language Configuration with CEFR-aligned examples
  const languages = {
    fr: { name: "French", examples: {
      A1: ["Bonjour", "Je m'appelle...", "Où est...?"],
      A2: ["Je voudrais un café", "Hier j'ai mangé...", "Je préfère..."],
      B1: ["Si j'avais plus de temps, je...", "À mon avis...", "D'un côté... de l'autre"],
      B2: ["Bien que cela semble..., en réalité...", "Si j'étais vous, je..."],
      C1: ["En tirant parti de cette situation, on pourrait..."],
      C2: ["Force est de constater que..., ce qui corrobore..."]
    }},
    es: { name: "Spanish", examples: {
      A1: ["Hola", "Me llamo...", "¿Dónde está...?"],
      A2: ["Quisiera un café", "Ayer comí...", "Prefiero..."],
      B1: ["Si tuviera más tiempo,...", "En mi opinión...", "Por un lado... por otro"],
      B2: ["Aunque parezca..., en realidad...", "Si fuera usted,..."],
      C1: ["Aprovechando esta coyuntura,..."],
      C2: ["Cabe destacar que..., lo cual corrobora..."]
    }},
    // [...] Similar structures for other languages
    jp: { name: "Japanese", examples: {
      A1: ["こんにちは", "私は...です", "...はどこですか"],
      A2: ["コーヒーをお願いします", "昨日...を食べました", "...の方が好きです"],
      B1: ["時間があれば...", "私は...と思います", "一方で...他方で"],
      B2: ["...のように見えますが、実際は...", "私だったら..."],
      C1: ["この状況を活用すれば..."],
      C2: ["...ということは、...を裏付けています"]
    }},
    kr: { name: "Korean", examples: {
      A1: ["안녕하세요", "저는...입니다", "...어디예요?"],
      A2: ["커피 주세요", "어제...먹었어요", "...더 좋아해요"],
      B1: ["시간이 더 있으면...", "제 생각에는...", "한편으로는... 다른 한편으로는"],
      B2: ["...처럼 보이지만 실제로는...", "제가 당신이라면..."],
      C1: ["이 상황을 활용한다면..."],
      C2: ["...라는 것은...을 뒷받침합니다"]
    }},
    kh: { name: "Khmer", examples: {
      A1: ["ជំរាបសួរ", "ខ្ញុំឈ្មោះ...", "...នៅឯណា?"],
      A2: ["សុំកាហ្វេមួយ", "ម្សិលមិញខ្ញុំបានញ៉ាំ...", "ខ្ញុំចូលចិត្ត...ជាង"],
      B1: ["បើសិនខ្ញុំមានពេលច្រើន...", "តាមគំនិតខ្ញុំ...", "ម្ខាង...ម្ខាងទៀត..."],
      B2: ["ទោះបីវាហាក់ដូចជា...តាមពិត..."],
      C1: ["ការប្រើប្រាស់ស្ថានភាពនេះ..."],
      C2: ["វាច្បាស់ណាស់ថា...ដែលបញ្ជាក់ថា..."]
    }}
  };

  const lang = languages[languageCode] || languages.fr;

  // 2. CEFR Level Mapping
  const cefrLevels = {
    "1-20":   { name: "A1", desc: "Basic communication" },
    "21-40":  { name: "A2", desc: "Everyday tasks" },
    "41-60":  { name: "B1", desc: "Connected language" },
    "61-80":  { name: "B2", desc: "Fluent interaction" },
    "81-90":  { name: "C1", desc: "Abstract language" },
    "91-100": { name: "C2", desc: "Mastery" }
  };

  // 3. Schema Definition
  const schema = {
    type: "object",
    properties: {
      Level: { 
        type: "integer", 
        minimum: 1, 
        maximum: 100,
        description: `Current CEFR band: ${cefrLevels[Math.floor((level-1)/20)*20+1 + "-" + Math.ceil(level/20)*20].name}`
      },
      Language_Output: { 
        type: "string",
        description: `Phrase matching user's current level in ${lang.name}`
      },
      Feedback: { 
        type: "string",
        description: "Actionable English feedback with grammar focus"
      },
      memory: { 
        type: "array",
        items: { 
          type: "string",
          pattern: "^(Struggling|Mastered|Watch): .+"
        }
      },
      cefr_notes: {
        type: "string",
        description: "Brief note about current CEFR capabilities"
      }
    },
    required: ["Level", "Language_Output", "Feedback", "memory", "cefr_notes"]
  };

  // 4. Prompt Template
  return `
You are teaching ${lang.name}. Follow STRICTLY:

### CORE RULES:
1. LEVEL PROGRESSION:
   - Start at Level 1 (${cefrLevels["1-20"].name})
   - Move up after 3 correct answers at current level band
   - Move down after 2 incorrect answers

2. LANGUAGE PURITY:
   - ${lang.name} ONLY in Language_Output
   - English ONLY in Feedback
   - NEVER provide direct translations

3. CEFR ALIGNMENT:
${Object.entries(cefrLevels).map(([range, info]) => 
  `- Levels ${range}: ${info.name} (${info.desc})`
).join('\n')}

### RESPONSE FORMAT:
${JSON.stringify(schema, null, 2)}

### TEACHING EXAMPLES:
${Object.entries(lang.examples).map(([level, phrases]) => 
  `${level} (${cefrLevels[Object.keys(cefrLevels)[
    ['A1','A2','B1','B2','C1','C2'].indexOf(level)
  ]]}):\n${phrases.map(p => `- "${p}"`).join('\n')}`
).join('\n\n')}

### STRICT REQUIREMENTS:
- ALWAYS include cefr_notes explaining current capabilities
- Feedback MUST reference specific grammar points
- Memory items should be reusable for spaced repetition
`;
};
