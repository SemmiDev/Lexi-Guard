import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { GrammarCheckRequest, GrammarCheckResponse } from "@/types";

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY!,
  model: "gemini-1.5-flash",
  temperature: 0.3,
  maxOutputTokens: 1000,
});

export async function checkGrammar(request: GrammarCheckRequest): Promise<GrammarCheckResponse> {
  // Detect language
  const detectedLanguage = detectLanguage(request.text);

  // Create prompt based on style and language
  const systemPrompt = createSystemPrompt(request.style, detectedLanguage);

  const userPrompt = `
    Please check the following text for grammar, spelling, and style issues.
    Provide up to 5 most important suggestions.

    Text to check:
    "${request.text}"

    Return the response in the following JSON format:
    {
      "suggestions": [
        {
          "original": "original text segment",
          "suggestion": "corrected text",
          "explanation": "brief explanation of the correction",
          "startIndex": 0,
          "endIndex": 10
        }
      ],
      "detectedLanguage": "${detectedLanguage}",
      "processedText": "the fully corrected version of the text"
    }
  `;

  try {
    const response = await model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt)
    ]);

    // Parse the response
    const content = response.content as string;

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI model');
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);

    // Validate and limit suggestions to 5
    const validatedResponse: GrammarCheckResponse = {
      suggestions: (parsedResponse.suggestions || []).slice(0, 5).map((s: any) => ({
        original: s.original || '',
        suggestion: s.suggestion || '',
        explanation: s.explanation || '',
        startIndex: s.startIndex || 0,
        endIndex: s.endIndex || 0
      })),
      detectedLanguage: parsedResponse.detectedLanguage || detectedLanguage,
      processedText: parsedResponse.processedText || request.text
    };

    return validatedResponse;
  } catch (error) {
    console.error('Error in checkGrammar:', error);
    throw new Error('Failed to process grammar check');
  }
}

function detectLanguage(text: string): 'English' | 'Indonesian' {
  // Simple language detection based on common words
  const indonesianWords = ['yang', 'dan', 'di', 'ke', 'dari', 'untuk', 'dengan', 'adalah', 'pada', 'ini', 'itu'];
  const englishWords = ['the', 'is', 'are', 'was', 'were', 'been', 'have', 'has', 'had', 'will', 'would'];

  const lowerText = text.toLowerCase();
  let indonesianCount = 0;
  let englishCount = 0;

  indonesianWords.forEach(word => {
    if (lowerText.includes(` ${word} `)) indonesianCount++;
  });

  englishWords.forEach(word => {
    if (lowerText.includes(` ${word} `)) englishCount++;
  });

  return indonesianCount > englishCount ? 'Indonesian' : 'English';
}

function createSystemPrompt(style: string, language: string): string {
  const styleGuides = {
    formal: 'Use professional language, avoid contractions, maintain objectivity',
    casual: 'Use conversational tone, contractions are acceptable, friendly approach',
    informal: 'Relaxed language, colloquialisms allowed, personal tone',
    'gen-z': 'Modern slang acceptable, internet culture references, trendy expressions',
    academic: 'Scholarly tone, precise terminology, citation-ready format, passive voice acceptable'
  };

  return `You are an expert grammar checker for ${language} language.
    The user wants their text to follow a ${style} writing style: ${styleGuides[style as keyof typeof styleGuides]}.

    Focus on:
    1. Grammar correctness
    2. Spelling accuracy
    3. Punctuation
    4. Style consistency
    5. Clarity and readability

    Provide constructive suggestions that maintain the intended meaning while improving the text quality.`;
}
