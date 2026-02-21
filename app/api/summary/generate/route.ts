import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { documentName, text, requirement, language } = await request.json();

    if (!documentName || !text) {
      return NextResponse.json({ error: 'Missing documentName or text' }, { status: 400 });
    }

    // Since OpenAI API is not available, return a message about manual summarization
    const summary = `[Summary generation is not available without OpenAI API]\n\nDocument: ${documentName}\nLanguage: ${language || 'English'}\n${requirement ? `Requirements: ${requirement}` : ''}\n\nPlease manually create a summary of the document.`;

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
