import { OpenAI } from 'openai';
import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { documentName, text, requirement, language } = await request.json();

    if (!documentName || !text) {
      return NextResponse.json({ error: 'Missing documentName or text' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // Build the prompt based on language and requirements
    let languageName = 'English';
    if (language === 'zh') languageName = 'Chinese';
    if (language === 'ja') languageName = 'Japanese';

    const prompt = requirement
      ? `Please summarize the following text in ${languageName}. Additional requirements: ${requirement}\n\nText:\n${text}`
      : `Please summarize the following text in ${languageName}.\n\nText:\n${text}`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const summary = completion.choices[0]?.message?.content || 'No summary generated';

    // Save to Supabase Summary bucket
    const summaryFileName = `summaries/${documentName}.txt`;
    const { error } = await supabase.storage
      .from('Summary')
      .upload(summaryFileName, new Blob([summary]), {
        contentType: 'text/plain',
        upsert: true,
      });

    if (error) {
      console.error('Error saving summary:', error);
      // Don't fail completely if summary save fails - return the summary anyway
    }

    return NextResponse.json({ summary, success: true });
  } catch (error) {
    console.error('Error generating summary:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate summary';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
