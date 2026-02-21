import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { path } = await request.json();

    if (!path) {
      return NextResponse.json({ error: 'No file path provided' }, { status: 400 });
    }

    // Delete the file from the Document bucket
    const { error } = await supabase.storage
      .from('Document')
      .remove([path]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also try to delete the associated summary if it exists
    const docName = path.split('/').pop();
    if (docName) {
      await supabase.storage
        .from('Summary')
        .remove([`summaries/${docName}.txt`])
        .catch(() => {
          // Ignore errors if summary doesn't exist
        });
    }

    return NextResponse.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
