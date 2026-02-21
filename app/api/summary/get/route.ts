import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { documentName } = await request.json();

    if (!documentName) {
      return NextResponse.json({ error: 'Missing documentName' }, { status: 400 });
    }

    console.log(`Fetching summary for document: ${documentName}`);

    // Get the summary file URL
    const { data } = supabase.storage
      .from('Summary')
      .getPublicUrl(`summaries/${documentName}.txt`);

    if (!data?.publicUrl) {
      console.log(`No public URL generated for summary: ${documentName}`);
      // Summary doesn't exist yet
      return NextResponse.json({ summary: null });
    }

    // Fetch the summary content
    try {
      console.log(`Attempting to fetch summary from URL: ${data.publicUrl}`);
      const response = await fetch(data.publicUrl);
      
      if (response.ok) {
        const summary = await response.text();
        console.log(`Successfully retrieved summary for: ${documentName}`);
        return NextResponse.json({ summary });
      } else {
        console.warn(`Failed to fetch summary. Status: ${response.status}`);
        // Summary file may not exist yet
      }
    } catch (error) {
      console.warn(`Error fetching summary content: ${error}`);
      // Summary file may not exist yet
    }

    return NextResponse.json({ summary: null });
  } catch (error) {
    console.error('Error fetching summary:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch summary';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
