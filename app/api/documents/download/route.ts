import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { path } = await request.json();
    
    if (!path) {
      return NextResponse.json({ error: 'No file path provided' }, { status: 400 });
    }

    // Validate path format
    if (typeof path !== 'string' || path.length === 0) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    // Download file from Supabase using the server-side client
    const { data, error } = await supabase.storage
      .from('Document')
      .download(path);

    if (error) {
      console.error('Error downloading file from Supabase:', error);
      return NextResponse.json({ error: 'Failed to download file: ' + error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'No file data returned' }, { status: 500 });
    }

    // Convert blob to text
    const text = await data.text();

    return NextResponse.json({ text });
    
  } catch (error) {
    console.error('Error downloading file:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to download file';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
