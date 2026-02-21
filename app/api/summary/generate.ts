import { supabase } from '@/lib/supabaseClient';
import { generateDetailedSummary } from '@/lib/localSummaryEngine';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { documentName, text, requirement, language } = await request.json();
  if (!documentName || !text) {
    return NextResponse.json({ error: 'Missing documentName or text' }, { status: 400 });
  }
  
  try {
    const { summary } = generateDetailedSummary(
      text,
      0.30,
      requirement || '',
      language || 'English'
    );

    // 儲存到 Supabase Summary bucket
    const { error } = await supabase.storage
      .from('Summary')
      .upload(`summaries/${documentName}.txt`, new Blob([summary]), {
        contentType: 'text/plain',
        upsert: true,
      });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ summary, provider: 'Local NLP Engine' });
  } catch (error) {
    console.error('Summary generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate summary';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
