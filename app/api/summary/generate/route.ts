import { supabase } from '@/lib/supabaseClient';
import { generateSummary } from '@/lib/ollamaClient';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { documentName, text, requirement, language } = await request.json();

    if (!documentName || !text) {
      return NextResponse.json({ error: 'Missing documentName or text' }, { status: 400 });
    }

    // Generate summary using Ollama (local AI without API keys)
    const summary = await generateSummary(text, requirement || '', language || 'English');

    // Save to Supabase Summary bucket
    const summaryFileName = `summaries/${documentName}.txt`;
    const { error } = await supabase.storage
      .from('Summary')
      .upload(summaryFileName, new Blob([summary]), {
        contentType: 'text/plain',
        upsert: true,
      });

    if (error) {
      console.error('Error saving summary:', error);
      // Don't fail completely if summary save fails - return the summary anyway
    }

    return NextResponse.json({ summary, success: true });
  } catch (error) {
    console.error('Error generating summary:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate summary';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
