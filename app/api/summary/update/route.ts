import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { documentName, summary } = await request.json();

    if (!documentName || !summary) {
      return NextResponse.json({ error: 'Missing documentName or summary' }, { status: 400 });
    }

    // Save the updated summary to Supabase
    const summaryFileName = `summaries/${documentName}.txt`;
    const { error } = await supabase.storage
      .from('Summary')
      .upload(summaryFileName, new Blob([summary]), {
        contentType: 'text/plain',
        upsert: true,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Summary updated successfully' });
  } catch (error) {
    console.error('Error updating summary:', error);
    return NextResponse.json({ error: 'Failed to update summary' }, { status: 500 });
  }
}
