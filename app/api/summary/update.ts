import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { documentName, summary } = await request.json();
  if (!documentName || !summary) {
    return NextResponse.json({ error: 'Missing documentName or summary' }, { status: 400 });
  }
  // 更新 Supabase Summary bucket
  const { error } = await supabase.storage
    .from('Summary')
    .upload(`summaries/${documentName}.txt`, new Blob([summary]), {
      contentType: 'text/plain',
      upsert: true,
    });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
