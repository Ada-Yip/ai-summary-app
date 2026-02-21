import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

const pdf = require('pdf-parse');

export async function POST(request: Request) {
  try {
    const { path } = await request.json();
    
    if (!path) {
      return NextResponse.json({ error: 'No file path provided' }, { status: 400 });
    }

    // Get the public URL for the PDF
    const { data } = supabase.storage.from('Document').getPublicUrl(path);
    
    if (!data?.publicUrl) {
      return NextResponse.json({ error: 'Failed to get file URL' }, { status: 500 });
    }

    // Download the PDF file
    const pdfRes = await fetch(data.publicUrl);
    if (!pdfRes.ok) {
      return NextResponse.json({ error: 'Failed to download PDF file' }, { status: 500 });
    }
    
    const pdfBuffer = await pdfRes.arrayBuffer();

    // Parse PDF text
    const pdfData = await pdf(Buffer.from(pdfBuffer));
    
    return NextResponse.json({ text: pdfData.text });
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return NextResponse.json({ error: 'Failed to extract text from PDF' }, { status: 500 });
  }
}
