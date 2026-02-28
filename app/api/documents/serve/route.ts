import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    
    if (!path) {
      return NextResponse.json({ error: 'No file path provided' }, { status: 400 });
    }

    // Validate path format
    if (typeof path !== 'string' || path.length === 0) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    console.log(`Serving file from Supabase: ${path}`);

    // Download the file from Supabase storage (authenticated request)
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('Document')
      .download(path);
    
    if (downloadError || !fileData) {
      console.error('Supabase download error:', downloadError);
      return NextResponse.json(
        { 
          error: `Failed to download file: ${downloadError?.message || 'Unknown error'}`,
          details: 'Ensure the file exists in the "Document" bucket and has proper permissions.'
        },
        { status: downloadError?.status || 500 }
      );
    }

    // Determine MIME type based on file extension
    const fileExtension = path.toLowerCase().split('.').pop();
    let mimeType = 'application/octet-stream';
    
    if (fileExtension === 'pdf') {
      mimeType = 'application/pdf';
    } else if (fileExtension === 'txt') {
      mimeType = 'text/plain';
    }

    console.log(`Successfully serving file: ${path} (${mimeType})`);

    // Convert blob to Buffer and return with proper headers
    const buffer = await fileData.arrayBuffer();
    
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': buffer.byteLength.toString(),
        'Cache-Control': 'private, max-age=3600',
        'Content-Disposition': `inline; filename="${path.split('/').pop()}"`,
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to serve file';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
