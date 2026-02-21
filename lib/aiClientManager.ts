/**
 * AI Client Manager
 * Intelligently selects the best available AI provider
 * Priority: Groq > Ollama > Google Generative AI > Fallback
 */

import { generateSummary as generateWithGroq } from './groqAiClient';
import { generateSummary as generateWithOllama } from './ollamaClient';
import { generateSummary as generateWithGoogle } from './googleAiClient';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate';
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;

export async function generateSummary(
  text: string,
  requirement: string = '',
  language: string = 'English'
): Promise<{ summary: string; provider: string; error?: string }> {
  if (!text || text.trim().length === 0) {
    return {
      summary: 'No text provided for summarization.',
      provider: 'fallback',
      error: 'Empty text',
    };
  }

  // Try Groq first (recommended - no IP restrictions)
  if (GROQ_API_KEY) {
    try {
      console.log('Attempting to generate summary with Groq...');
      const summary = await generateWithGroq(text, requirement, language);
      console.log('✓ Successfully generated summary with Groq');
      return {
        summary,
        provider: 'Groq',
      };
    } catch (error) {
      console.warn('Groq failed, trying next provider:', error);
    }
  }

  // Try Ollama second (local, no API key needed)
  try {
    console.log('Attempting to generate summary with Ollama...');
    const summary = await generateWithOllama(text, requirement, language);
    console.log('✓ Successfully generated summary with Ollama');
    return {
      summary,
      provider: 'Ollama',
    };
  } catch (error) {
    console.warn('Ollama failed, trying next provider:', error);
  }

  // Try Google Generative AI third
  if (GOOGLE_AI_API_KEY) {
    try {
      console.log('Attempting to generate summary with Google Generative AI...');
      const summary = await generateWithGoogle(text, requirement, language);
      console.log('✓ Successfully generated summary with Google Generative AI');
      return {
        summary,
        provider: 'Google Generative AI',
      };
    } catch (error) {
      console.warn('Google Generative AI failed, using fallback:', error);
    }
  }

  // Fallback to simple summary
  console.warn('All AI providers failed, using fallback summary');
  const maxLength = 500;
  let summary = `Summary (${language}):\n${text.substring(0, maxLength)}...`;
  if (requirement) {
    summary += `\n\nSpecial Requirement: ${requirement}`;
  }

  return {
    summary,
    provider: 'fallback',
    error: 'All configured AI providers are unavailable. Using fallback summary.',
  };
}
