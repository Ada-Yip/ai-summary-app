import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { documentName, summary } = await request.json();

    if (!documentName || !summary) {
      return NextResponse.json({ error: 'Missing documentName or summary' }, { status: 400 });
    }

    console.log(`Updating summary for: ${documentName}, length: ${summary.length}`);

    // Save the updated summary to Supabase
    const summaryFileName = `summaries/${documentName}.txt`;
    const { error } = await supabase.storage
      .from('Summary')
      .upload(summaryFileName, new Blob([summary]), {
        contentType: 'text/plain',
        upsert: true,
      });

    if (error) {
      console.error('Error updating summary in Supabase:', {
        message: error.message,
        status: error.status,
        statusCode: error.statusCode,
      });
      return NextResponse.json(
        { 
          error: error.message,
          details: 'Failed to save summary. Ensure the "Summary" bucket exists in Supabase.'
        },
        { status: 500 }
      );
    }

    console.log(`Summary updated successfully: ${summaryFileName}`);
    return NextResponse.json({ success: true, message: 'Summary updated successfully' });
  } catch (error) {
    console.error('Error updating summary:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update summary';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
