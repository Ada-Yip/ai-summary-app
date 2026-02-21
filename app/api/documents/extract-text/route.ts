import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

let pdf: any;
try {
  pdf = require('pdf-parse');
} catch (e) {
  console.warn('pdf-parse not available, will use fallback');
}

export async function POST(request: Request) {
  try {
    const { path } = await request.json();
    
    if (!path) {
      return NextResponse.json({ error: 'No file path provided' }, { status: 400 });
    }

    console.log(`Extracting text from PDF: ${path}`);

    // Get the file from Supabase storage directly using authenticated method
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
        { status: 500 }
      );
    }

    // Convert blob to buffer
    const pdfBuffer = await fileData.arrayBuffer();
    
    // Check if buffer is empty
    if (pdfBuffer.byteLength === 0) {
      return NextResponse.json({ error: 'PDF file is empty' }, { status: 400 });
    }

    // Parse PDF text with error handling
    if (!pdf) {
      return NextResponse.json({ error: 'PDF parsing library not available' }, { status: 500 });
    }

    let pdfData;
    try {
      pdfData = await pdf(Buffer.from(pdfBuffer));
    } catch (parseError) {
      console.error('PDF parsing failed:', parseError);
      return NextResponse.json({ error: 'Failed to parse PDF file - it may be corrupted or invalid' }, { status: 400 });
    }
    
    if (!pdfData?.text) {
      return NextResponse.json({ error: 'No text found in PDF' }, { status: 400 });
    }
    
    console.log(`Successfully extracted ${pdfData.text.length} characters from PDF`);
    return NextResponse.json({ text: pdfData.text });
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to extract text from PDF';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
