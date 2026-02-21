import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Attempting to list documents from Supabase...');
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    // List all files in the Document bucket
    const { data, error } = await supabase.storage
      .from('Document')
      .list('documents');

    if (error) {
      console.error('Error listing documents:', {
        message: error.message,
        status: error.status,
        statusCode: error.statusCode,
      });
      return NextResponse.json(
        { 
          error: error.message,
          details: 'Failed to list documents from Supabase. Please ensure: 1) The "Document" bucket exists in Supabase, 2) The bucket has public read access, 3) Environment variables are correct.'
        },
        { status: 500 }
      );
    }

    console.log(`Successfully listed ${data?.length || 0} documents`);
    return NextResponse.json({ files: data || [] });
  } catch (error) {
    console.error('Unexpected error listing documents:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: errorMessage,
        details: 'An unexpected error occurred while listing documents.'
      },
      { status: 500 }
    );
  }
}
