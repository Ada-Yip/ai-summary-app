import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { documentName } = await request.json();

    if (!documentName) {
      return NextResponse.json({ error: 'Missing documentName' }, { status: 400 });
    }

    // Get the summary file URL
    const { data } = supabase.storage
      .from('Summary')
      .getPublicUrl(`summaries/${documentName}.txt`);

    if (!data?.publicUrl) {
      // Summary doesn't exist yet
      return NextResponse.json({ summary: null });
    }

    // Fetch the summary content
    try {
      const response = await fetch(data.publicUrl);
      if (response.ok) {
        const summary = await response.text();
        return NextResponse.json({ summary });
      }
    } catch (error) {
      // Summary file may not exist yet
    }

    return NextResponse.json({ summary: null });
  } catch (error) {
    console.error('Error fetching summary:', error);
    return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 });
  }
}
