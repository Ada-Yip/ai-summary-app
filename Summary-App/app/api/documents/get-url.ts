import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { path } = await request.json();
  if (!path) {
    return NextResponse.json({ error: 'No file path provided' }, { status: 400 });
  }
  const { data, error } = await supabase.storage.from('Document').getPublicUrl(path);
  if (error || !data?.publicUrl) {
    return NextResponse.json({ error: error?.message || '無法取得檔案 URL' }, { status: 500 });
  }
  return NextResponse.json({ publicUrl: data.publicUrl });
}
