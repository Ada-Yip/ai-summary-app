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

    console.log(`Getting public URL for: ${path}`);

    // Get the public URL
    const { data } = supabase.storage
      .from('Document')
      .getPublicUrl(path);

    if (!data?.publicUrl) {
      console.error('Failed to generate public URL for:', path);
      return NextResponse.json(
        { 
          error: 'Failed to generate file URL',
          details: 'The file may not exist or the bucket may not have public access enabled.'
        },
        { status: 500 }
      );
    }

    // Verify the URL is valid
    try {
      new URL(data.publicUrl);
    } catch (e) {
      console.error('Invalid URL generated:', data.publicUrl);
      return NextResponse.json({ error: 'Generated URL is invalid' }, { status: 500 });
    }

    console.log(`Generated public URL: ${data.publicUrl}`);
    return NextResponse.json({ publicUrl: data.publicUrl });
    
  } catch (error) {
    console.error('Error getting file URL:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get file URL';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
