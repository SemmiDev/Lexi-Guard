import { z } from 'zod';

// Writing style enum
export const WritingStyle = z.enum([
  'formal',
  'casual',
  'informal',
  'gen-z',
  'academic'
]);

export type WritingStyleType = z.infer<typeof WritingStyle>;

// Grammar check request schema
export const GrammarCheckRequestSchema = z.object({
  text: z.string().min(1).max(5000),
  style: WritingStyle,
  language: z.enum(['en', 'id']).optional()
});

export type GrammarCheckRequest = z.infer<typeof GrammarCheckRequestSchema>;

// Grammar suggestion schema
export const GrammarSuggestionSchema = z.object({
  original: z.string(),
  suggestion: z.string(),
  explanation: z.string(),
  startIndex: z.number(),
  endIndex: z.number()
});

export type GrammarSuggestion = z.infer<typeof GrammarSuggestionSchema>;

// Grammar check response schema
export const GrammarCheckResponseSchema = z.object({
  suggestions: z.array(GrammarSuggestionSchema).max(5),
  detectedLanguage: z.enum(['English', 'Indonesian']),
  processedText: z.string()
});

export type GrammarCheckResponse = z.infer<typeof GrammarCheckResponseSchema>;

// User schema for MongoDB
export const UserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  image: z.string().optional(),
  lastLogin: z.date(),
  createdAt: z.date(),
  checksPerformed: z.number().default(0)
});

export type User = z.infer<typeof UserSchema>;
