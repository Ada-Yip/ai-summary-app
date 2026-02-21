import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Only allow txt and pdf
    const allowedTypes = ['text/plain', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only txt and PDF are allowed.' }, { status: 400 });
    }

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 50MB limit' }, { status: 400 });
    }

    console.log(`Uploading file: ${file.name}, size: ${file.size}, type: ${file.type}`);

    // Upload to Supabase Storage Document bucket
    const { data, error } = await supabase.storage
      .from('Document')
      .upload(`documents/${file.name}`, file, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error('Error uploading file:', {
        message: error.message,
        status: error.status,
        statusCode: error.statusCode,
      });
      return NextResponse.json(
        { 
          error: error.message,
          details: 'Failed to upload file to Supabase. Please ensure: 1) The "Document" bucket exists in Supabase, 2) The bucket has write access, 3) Environment variables are correct.'
        },
        { status: 500 }
      );
    }

    console.log(`File uploaded successfully: ${data.path}`);
    return NextResponse.json({ path: data.path, success: true });
  } catch (error) {
    console.error('Error uploading file:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
