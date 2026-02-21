import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { path } = await request.json();
    
    if (!path) {
      return NextResponse.json({ error: 'No file path provided' }, { status: 400 });
    }

    // Get the public URL
    const { data } = supabase.storage
      .from('Document')
      .getPublicUrl(path);

    if (!data?.publicUrl) {
      return NextResponse.json({ error: 'Failed to generate file URL' }, { status: 500 });
    }

    return NextResponse.json({ publicUrl: data.publicUrl });
    
  } catch (error) {
    console.error('Error getting file URL:', error);
    return NextResponse.json({ error: 'Failed to get file URL' }, { status: 500 });
  }
}
