/**
 * Google Generative AI Client for generating summaries
 * Uses Google's Gemini API (free tier available)
 * 
 * To set up:
 * 1. Go to https://makersuite.google.com/app/apikeys
 * 2. Create a new API key
 * 3. Add it to your .env.local as GOOGLE_AI_API_KEY
 */

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const GOOGLE_AI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

async function generateSummaryWithGoogle(text: string, requirement: string, language: string): Promise<string> {
  if (!GOOGLE_AI_API_KEY) {
    throw new Error('GOOGLE_AI_API_KEY is not configured. Please add it to .env.local');
  }

  try {
    // Limit text to avoid token overflow
    const maxLength = 8000;
    const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    
    const prompt = `You are a professional summarizer. Please provide a concise and informative summary in ${language}.
${requirement ? `\nSpecial requirement: ${requirement}` : ''}

Text to summarize:
${truncatedText}

Summary:`;

    const response = await fetch(`${GOOGLE_AI_URL}?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Google AI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('No response from Google Generative AI');
    }

    return data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error('Google AI generation error:', error);
    throw error;
  }
}

// Fallback function if Google AI is not available
function generateFallbackSummary(text: string, requirement: string, language: string): string {
  const maxLength = 500;
  let summary = `Summary (${language}):\n${text.substring(0, maxLength)}...`;
  if (requirement) {
    summary += `\n\nSpecial Requirement: ${requirement}`;
  }
  return summary;
}

export async function generateSummary(text: string, requirement: string = '', language: string = 'English'): Promise<string> {
  if (!text || text.trim().length === 0) {
    return 'No text provided for summarization.';
  }

  try {
    // Try Google Generative AI
    return await generateSummaryWithGoogle(text, requirement, language);
  } catch (error) {
    console.warn('Google Generative AI is not available, using fallback summary:', error);
    // Fallback to simple text extraction if AI is not available
    return generateFallbackSummary(text, requirement, language);
  }
}
