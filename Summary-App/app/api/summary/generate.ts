import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

// 假設有 AI 摘要服務，這裡用 mock
async function generateSummary(text: string, requirement: string, language: string) {
  // TODO: 串接 AI 摘要 API
  let summary = `Summary (${language}):\n${text.slice(0, 200)}...`;
  if (requirement) summary += `\nRequirement: ${requirement}`;
  return summary;
}

export async function POST(request: Request) {
  const { documentName, text, requirement, language } = await request.json();
  if (!documentName || !text) {
    return NextResponse.json({ error: 'Missing documentName or text' }, { status: 400 });
  }
  const summary = await generateSummary(text, requirement || '', language || 'en');

  // 儲存到 Supabase Summary bucket
  const { error } = await supabase.storage
    .from('Summary')
    .upload(`summaries/${documentName}.txt`, new Blob([summary]), {
      contentType: 'text/plain',
      upsert: true,
    });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ summary });
}
