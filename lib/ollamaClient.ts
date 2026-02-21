/**
 * Ollama Client for generating summaries locally without API keys
 * Ollama must be running locally on port 11434
 * 
 * To install and run Ollama:
 * 1. Download from https://ollama.ai
 * 2. Run: ollama serve
 * 3. In another terminal, pull a model: ollama pull mistral (or another model)
 */

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate';

async function generateSummaryWithOllama(text: string, requirement: string, language: string): Promise<string> {
  try {
    // Limit text to avoid token overflow (Ollama models have context limits)
    const maxLength = 4000;
    const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    
    const prompt = `You are a professional summarizer. Please provide a concise and informative summary in ${language}.
${requirement ? `\nSpecial requirement: ${requirement}` : ''}

Text to summarize:
${truncatedText}

Summary:`;

    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral', // Default model - can be changed to other models
        prompt: prompt,
        stream: false,
        temperature: 0.3, // Lower temperature for more focused summaries
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API returned status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.response) {
      throw new Error('No response from Ollama');
    }

    return data.response.trim();
  } catch (error) {
    console.error('Ollama generation error:', error);
    throw error;
  }
}

// Fallback function if Ollama is not available
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
    // Try Ollama first
    return await generateSummaryWithOllama(text, requirement, language);
  } catch (error) {
    console.warn('Ollama is not available, using fallback summary:', error);
    // Fallback to simple text extraction if Ollama is not available
    return generateFallbackSummary(text, requirement, language);
  }
}
