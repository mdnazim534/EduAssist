'use strict';

const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');
console.log(process.env.GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const TYPE_PROMPTS = {
  summary: `
Write a clean summary with:
- Main topic
- Key points
- Conclusion
`,

  mcq: `
Generate 10 MCQs in JSON format:
[
 {
   "question":"...",
   "options":["A","B","C","D"],
   "correctIndex":0
 }
]
`,

  shortq: `
Generate short questions and answers.
`,

  broadq: `
Generate broad/essay questions.
`,

  viva: `
Generate viva questions.
`,

  topics: `
Generate key topics list in JSON array.
`,

  explain: `
Explain simply for beginners.
`,
};

function buildPrompt(inputText, requestedTypes) {
  const sections = requestedTypes
    .map((t) => TYPE_PROMPTS[t] || '')
    .join('\n\n');

  return `
You are EduAssist AI.

Study this content carefully and generate:

${sections}

CONTENT:
${inputText}
`;
}

function parseResults(text, requestedTypes) {
  const results = {};

  for (const type of requestedTypes) {
    results[type] = text;
  }

  return results;
}

async function generateStudyContent({
  inputText,
  requestedTypes,
}) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
    });

    const prompt = buildPrompt(inputText, requestedTypes);

    const result = await model.generateContent(prompt);

    const response = await result.response;

    const text = response.text();

    const results = parseResults(text, requestedTypes);

    return {
      results,
      provider: 'gemini',
      model: 'gemini-1.5-flash',
      tokensUsed: 0,
    };

  } catch (err) {
    logger.error(err.message);
    throw err;
  }
}

async function extractTextFromImageViaAI() {
  return 'Image OCR temporarily disabled';
}

module.exports = {
  generateStudyContent,
  extractTextFromImageViaAI,
};