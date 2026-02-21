import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { path } = await request.json();

    if (!path) {
      return NextResponse.json({ error: 'No file path provided' }, { status: 400 });
    }

    if (typeof path !== 'string' || path.length === 0) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    // Delete the file from the Document bucket
    const { error } = await supabase.storage
      .from('Document')
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: error.message || 'Failed to delete file' }, { status: 500 });
    }

    // Also try to delete the associated summary if it exists
    // Extract document name from path (e.g., "documents/file.pdf" -> "file.pdf")
    const docName = path.split('/').pop();
    if (docName) {
      try {
        const { error: summaryError } = await supabase.storage
          .from('Summary')
          .remove([`summaries/${docName}.txt`]);
        
        if (summaryError) {
          console.warn('Summary deletion warning:', summaryError.message);
          // Ignore errors if summary doesn't exist - this is expected behavior
        } else {
          console.log(`Associated summary deleted for: ${docName}`);
        }
      } catch (summaryDeleteError) {
        console.warn('Could not delete associated summary:', summaryDeleteError);
        // Don't fail the whole operation if summary deletion fails
      }
    }

    return NextResponse.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete document';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
