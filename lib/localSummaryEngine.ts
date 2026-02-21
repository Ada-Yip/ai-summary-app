/**
 * Local Summarization Engine
 * Pure JavaScript/Node.js implementation
 * No external APIs, no keywords needed
 * Uses TF-IDF algorithm to extract key sentences
 */

interface TextAnalysis {
  sentences: string[];
  words: Map<string, number>;
  wordPositions: Map<string, number[]>;
}

/**
 * Extract sentences from text
 */
function extractSentences(text: string): string[] {
  // Split by sentence boundariesanoia [\\.!\\?] but preserve them
  const sentenceRegex = /([^.!?]*[.!?]+)/g;
  const sentences: string[] = [];
  
  let match;
  while ((match = sentenceRegex.exec(text)) !== null) {
    const sentence = match[1].trim();
    if (sentence.length > 20) { // Filter very short sentences
      sentences.push(sentence);
    }
  }
  
  return sentences.length > 0 ? sentences : text.split('\n').filter(s => s.trim().length > 20);
}

/**
 * Tokenize text into words
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2); // Filter short words
}

/**
 * Calculate TF (Term Frequency)
 */
function calculateTF(words: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  const totalWords = words.length;
  
  words.forEach(word => {
    tf.set(word, (tf.get(word) || 0) + 1);
  });
  
  // Normalize by total words
  tf.forEach((count, word) => {
    tf.set(word, count / totalWords);
  });
  
  return tf;
}

/**
 * Calculate sentence scores based on word frequencies
 */
function scoreSentences(sentences: string[], tf: Map<string, number>): number[] {
  return sentences.map((sentence) => {
    const words = tokenize(sentence);
    let score = 0;
    
    words.forEach(word => {
      score += tf.get(word) || 0;
    });
    
    // Normalize by sentence length
    return words.length > 0 ? score / words.length : 0;
  });
}

/**
 * Select top sentences while maintaining order
 */
function selectTopSentences(
  sentences: string[],
  scores: number[],
  summaryLength: number
): string[] {
  // Create array of [index, sentence, score]
  const indexed = sentences.map((sentence, index) => ({
    index,
    sentence,
    score: scores[index],
  }));
  
  // Sort by score and select top N
  const topSentences = indexed
    .sort((a, b) => b.score - a.score)
    .slice(0, summaryLength)
    .sort((a, b) => a.index - b.index) // Restore original order
    .map(item => item.sentence);
  
  return topSentences;
}

/**
 * Generate a summary by extracting key sentences
 */
export function generateLocalSummary(
  text: string,
  summaryRatio: number = 0.3, // Default: 30% of original length
  requirement: string = ''
): string {
  if (!text || text.trim().length === 0) {
    return 'No text provided for summarization.';
  }

  try {
    // Extract sentences
    const sentences = extractSentences(text);
    
    if (sentences.length === 0) {
      return `Unable to extract sentences from text. Original text length: ${text.length} characters.`;
    }

    // Tokenize all words
    const allWords = tokenize(text);
    if (allWords.length === 0) {
      return text.substring(0, 500) + '...';
    }

    // Calculate term frequency
    const tf = calculateTF(allWords);

    // Score sentences
    const scores = scoreSentences(sentences, tf);

    // Calculate number of sentences for summary
    const summaryLength = Math.max(
      2, // At least 2 sentences
      Math.ceil(sentences.length * summaryRatio)
    );

    // Select top sentences
    const summarysentences = selectTopSentences(sentences, scores, summaryLength);

    // Combine summary
    let summary = summarysentences.join(' ');

    // Add requirement if provided
    if (requirement) {
      summary += `\n\n[Note: ${requirement}]`;
    }

    return summary;
  } catch (error) {
    console.error('Error in local summarization:', error);
    // Fallback: return first part of text
    return text.substring(0, 500) + '...';
  }
}

/**
 * Generate a detailed summary with statistics
 */
export function generateDetailedSummary(
  text: string,
  summaryRatio: number = 0.25,
  requirement: string = '',
  language: string = 'English'
): { summary: string; stats: any } {
  const summary = generateLocalSummary(text, summaryRatio, requirement);
  
  const originalSentences = extractSentences(text);
  const summaryOrithm = extractSentences(summary);

  return {
    summary,
    stats: {
      originalLength: text.length,
      summaryLength: summary.length,
      compressionRatio: ((1 - summary.length / text.length) * 100).toFixed(1) + '%',
      originalSentences: originalSentences.length,
      summarySentences: summaryOrithm.length,
      language,
    },
  };
}
