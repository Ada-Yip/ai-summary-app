import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // List all files in the Document bucket
    const { data, error } = await supabase.storage
      .from('Document')
      .list('documents');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ files: data || [] });
  } catch (error) {
    console.error('Error listing documents:', error);
    return NextResponse.json({ error: 'Failed to list documents' }, { status: 500 });
  }
}
