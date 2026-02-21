import { supabase } from '@/lib/supabaseClient';
import { generateDetailedSummary } from '@/lib/localSummaryEngine';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { documentName, text, requirement, language } = await request.json();

    if (!documentName || !text) {
      return NextResponse.json({ error: 'Missing documentName or text' }, { status: 400 });
    }

    console.log(`Generating summary for: ${documentName}, text length: ${text.length}`);

    // Generate summary using local NLP engine (no API needed)
    const { summary, stats } = generateDetailedSummary(
      text,
      0.30, // 30% of original text
      requirement || '',
      language || 'English'
    );

    console.log(`Summary generated: ${stats.compressionRatio} compression, ${stats.summarySentences} sentences`);

    // Save to Supabase Summary bucket (optional - for history)
    const summaryFileName = `summaries/${documentName}.txt`;
    const { error } = await supabase.storage
      .from('Summary')
      .upload(summaryFileName, new Blob([summary]), {
        contentType: 'text/plain',
        upsert: true,
      });

    if (error) {
      console.error('Error saving summary to Supabase:', {
        message: error.message,
        status: error.status,
        statusCode: error.statusCode,
      });
      // Don't fail - local summary generation is more important
      // But log the warning
    } else {
      console.log(`Summary saved to Supabase: ${summaryFileName}`);
    }

    return NextResponse.json({
      summary,
      success: true,
      provider: 'Local NLP Engine',
      stats: {
        compressionRatio: stats.compressionRatio,
        sentences: stats.summarySentences,
        processingTime: 'instant',
      },
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate summary';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
