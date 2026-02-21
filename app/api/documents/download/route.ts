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

    console.log('Attempting to download file from Supabase:', path);
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

    // First, verify the file exists using list
    const { data: listData, error: listError } = await supabase.storage
      .from('Document')
      .list('documents');

    if (listError) {
      console.error('Error listing bucket contents:', listError);
      return NextResponse.json(
        { error: `Cannot access Supabase bucket: ${listError.message}` },
        { status: 403 }
      );
    }

    // Check if file path matches any existing file
    const fileName = path.split('/').pop();
    const fileExists = listData?.some((file) => file.name === fileName || path.includes(file.name));
    console.log('File exists check:', fileExists, 'Files in bucket:', listData?.map((f) => f.name) || []);

    // Try to get the public URL as a fallback method
    const { data: urlData } = supabase.storage
      .from('Document')
      .getPublicUrl(path);

    if (urlData?.publicUrl) {
      console.log('Got public URL, fetching file content:', urlData.publicUrl);
      try {
        const fileResponse = await fetch(urlData.publicUrl);
        if (fileResponse.ok) {
          const text = await fileResponse.text();
          return NextResponse.json({ text });
        }
      } catch (fetchError) {
        console.error('Error fetching from public URL:', fetchError);
      }
    }

    // Fallback: Try direct download if public URL didn't work
    const { data, error } = await supabase.storage
      .from('Document')
      .download(path);

    if (error) {
      console.error('Error downloading file from Supabase:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        statusCode: error.statusCode,
      });
      return NextResponse.json(
        {
          error: `Failed to download file: ${error.message}. Ensure the file exists in the Supabase "Document" bucket and the bucket has proper access permissions.`,
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: 'No file data returned from Supabase' }, { status: 500 });
    }

    // Convert blob to text
    const text = await data.text();

    if (!text) {
      return NextResponse.json({ error: 'File is empty' }, { status: 400 });
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Error downloading file:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to download file';

    // Check if it's a network error
    if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
      return NextResponse.json(
        {
          error: `Network error accessing Supabase: ${errorMessage}. Check your internet connection and Supabase configuration.`,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
