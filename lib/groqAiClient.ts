/**
 * Groq AI Client for generating summaries
 * Uses Groq's fast LLM API (free tier available, no IP restrictions)
 * 
 * To set up:
 * 1. Go to https://console.groq.com
 * 2. Sign up for free
 * 3. Create an API key
 * 4. Add it to your .env.local as GROQ_API_KEY
 */

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function generateSummaryWithGroq(text: string, requirement: string, language: string): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured. Please add it to .env.local');
  }

  try {
    // Limit text to avoid token overflow
    const maxLength = 12000;
    const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    
    const prompt = `You are a professional summarizer. Please provide a concise and informative summary in ${language}.
${requirement ? `\nSpecial requirement: ${requirement}` : ''}

Text to summarize:
${truncatedText}

Summary:`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768', // Fast, capable model
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Groq API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error('No response from Groq');
    }

    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Groq AI generation error:', error);
    throw error;
  }
}

// Fallback function if Groq is not available
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
    // Try Groq first
    return await generateSummaryWithGroq(text, requirement, language);
  } catch (error) {
    console.warn('Groq is not available, using fallback summary:', error);
    // Fallback to simple text extraction if Groq is not available
    return generateFallbackSummary(text, requirement, language);
  }
}
