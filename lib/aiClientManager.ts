/**
 * AI Client Manager
 * Groq AI Client for document summary
 */

import { generateSummary as generateWithGroq } from './groqAiClient';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

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


  // Only use Groq
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
      console.warn('Groq failed, using fallback:', error);
    }
  }

  // Fallback to simple summary
  console.warn('Groq failed, using fallback summary');
  const maxLength = 500;
  let summary = `Summary (${language}):\n${text.substring(0, maxLength)}...`;
  if (requirement) {
    summary += `\n\nSpecial Requirement: ${requirement}`;
  }
  return {
    summary,
    provider: 'fallback',
    error: 'Groq is unavailable. Using fallback summary.',
  };
}
