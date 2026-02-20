import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { path } = await request.json();
    
    if (!path) {
      return NextResponse.json({ error: 'No file path provided' }, { status: 400 });
    }

    // 獲取公開 URL
    const { data } = supabase.storage
      .from('Document')
      .getPublicUrl(path);

    // 檢查 URL 是否有效（基本的格式檢查）
    if (!data?.publicUrl) {
      return NextResponse.json({ error: '無法產生檔案 URL' }, { status: 500 });
    }

    // 可選：嘗試 HEAD 請求檢查檔案是否存在
    try {
      const response = await fetch(data.publicUrl, { method: 'HEAD' });
      if (!response.ok) {
        return NextResponse.json({ error: '檔案不存在或無法存取' }, { status: 404 });
      }
    } catch (fetchError) {
      console.warn('無法驗證檔案存在性:', fetchError);
      // 即使無法驗證，仍然回傳 URL，讓前端處理
    }

    return NextResponse.json({ publicUrl: data.publicUrl });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}