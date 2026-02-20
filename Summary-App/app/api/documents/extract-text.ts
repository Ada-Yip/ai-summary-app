import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';
const pdf = require('pdf-parse');

export async function POST(request: Request) {
  const { path } = await request.json();
  if (!path) {
    return NextResponse.json({ error: 'No file path provided' }, { status: 400 });
  }

  // 取得 PDF 檔案的 public URL
  const { data } = await supabase.storage.from('Document').getPublicUrl(path);
  if (!data?.publicUrl) {
    return NextResponse.json({ error: '無法取得檔案 URL' }, { status: 500 });
  }

  // 下載 PDF 檔案
  const pdfRes = await fetch(data.publicUrl);
  if (!pdfRes.ok) {
    return NextResponse.json({ error: '無法下載 PDF 檔案' }, { status: 500 });
  }
  const pdfBuffer = await pdfRes.arrayBuffer();

  // 解析 PDF 文字
  const pdfData = await pdf(Buffer.from(pdfBuffer));
  return NextResponse.json({ text: pdfData.text });
}
