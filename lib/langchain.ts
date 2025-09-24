import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { GrammarCheckRequest, GrammarCheckResponse } from "@/types";

// Inisialisasi model AI dengan konfigurasi
const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY ?? '',
  model: "gemini-2.0-flash",
  temperature: 0.3,
  maxOutputTokens: 1000,
});

export async function checkGrammar(request: GrammarCheckRequest): Promise<GrammarCheckResponse> {
  try {
    // Deteksi bahasa dari teks input
    const detectedLanguage = detectLanguage(request.text);

    // Buat prompt sistem berdasarkan gaya dan bahasa
    const systemPrompt = createSystemPrompt(request.style, detectedLanguage);

    // Buat prompt pengguna untuk memeriksa tata bahasa, ejaan, dan gaya
    const userPrompt = `
      Periksa teks berikut untuk masalah tata bahasa, ejaan, dan gaya penulisan dalam bahasa Inggris.
      Berikan hingga 5 saran perbaikan paling penting.
      Pastikan field "explanation" dalam respons berisi penjelasan dalam bahasa Indonesia.
      Field "original", "suggestion", dan "processedText" harus tetap dalam bahasa Inggris.

      Teks yang diperiksa:
      "${request.text}"

      Kembalikan respons dalam format JSON berikut:
      {
        "suggestions": [
          {
            "original": "segmen teks asli dalam bahasa Inggris",
            "suggestion": "teks yang diperbaiki dalam bahasa Inggris",
            "explanation": "penjelasan singkat tentang perbaikan dalam bahasa Indonesia",
            "startIndex": 0,
            "endIndex": 10
          }
        ],
        "detectedLanguage": "${detectedLanguage}",
        "processedText": "versi teks yang telah diperbaiki sepenuhnya dalam bahasa Inggris"
      }
    `;

    // Panggil model AI dengan prompt
    const response = await model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt),
    ]);

    // Parsing respons dari AI
    const content = response.content as string;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Format respons dari model AI tidak valid');
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);

    // Validasi dan batasi saran hingga 5
    const validatedResponse: GrammarCheckResponse = {
      suggestions: (parsedResponse.suggestions || []).slice(0, 5).map((s: any) => ({
        original: s.original || '',
        suggestion: s.suggestion || '',
        explanation: s.explanation || '',
        startIndex: Number(s.startIndex) || 0,
        endIndex: Number(s.endIndex) || 0,
      })),
      detectedLanguage: parsedResponse.detectedLanguage || detectedLanguage,
      processedText: parsedResponse.processedText || request.text,
    };

    return validatedResponse;
  } catch (error) {
    console.error('Error saat memeriksa tata bahasa:', error);
    throw new Error('Gagal memproses pemeriksaan tata bahasa');
  }
}

/**
 * Mendeteksi bahasa dari teks berdasarkan kata-kata umum
 * @param text Teks yang akan dideteksi bahasanya
 * @returns Bahasa yang terdeteksi: 'English' atau 'Indonesian'
 */
function detectLanguage(text: string): 'English' | 'Indonesian' {
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

/**
 * Membuat prompt sistem berdasarkan gaya penulisan dan bahasa
 * @param style Gaya penulisan (formal, casual, informal, gen-z, academic)
 * @param language Bahasa yang digunakan (English atau Indonesian)
 * @returns Prompt sistem untuk model AI
 */
function createSystemPrompt(style: string, language: string): string {
  const styleGuides: { [key: string]: string } = {
    formal: 'Use professional language, avoid contractions, maintain objectivity',
    casual: 'Use conversational tone, contractions are acceptable, friendly approach',
    informal: 'Relaxed language, colloquialisms allowed, personal tone',
    'gen-z': 'Modern slang acceptable, internet culture references, trendy expressions',
    academic: 'Scholarly tone, precise terminology, citation-ready format, passive voice acceptable',
  };

  const selectedStyle = styleGuides[style] || styleGuides.formal;

  return `
    Anda adalah pemeriksa tata bahasa ahli untuk bahasa Inggris.
    Pengguna menginginkan teks mereka mengikuti gaya penulisan ${style}: ${selectedStyle}.
    Berikan saran perbaikan dengan penjelasan dalam bahasa Indonesia untuk field "explanation".
    Field lain seperti "original", "suggestion", dan "processedText" harus dalam bahasa Inggris.

    Fokus pada:
    1. Kebenaran tata bahasa
    2. Akurasi ejaan
    3. Tanda baca
    4. Konsistensi gaya
    5. Kejelasan dan keterbacaan

    Berikan saran konstruktif yang mempertahankan makna asli sambil meningkatkan kualitas teks.
  `;
}
