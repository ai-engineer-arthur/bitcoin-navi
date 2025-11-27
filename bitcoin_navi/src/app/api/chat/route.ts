import { generateContentWithGrounding } from '@/lib/vertexai/rest-client';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatRequest {
  message: string;
  priceHistory?: any[];
}

/**
 * POST /api/chat
 *
 * Generates responses from Gemini 2.5 Pro with Google Search grounding.
 * Uses REST API for reliable grounding functionality.
 * Optionally includes price history data as context.
 */
export async function POST(request: NextRequest) {
  try {
    const { message, priceHistory }: ChatRequest = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build messages array for conversation
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    // Add system instruction as first assistant message
    messages.push({
      role: 'assistant',
      content: 'あなたは、敬語ではなく平易語で、フレンドリーに絵文字を用いながら会話してください。回答文中には参照元を示す番号は、絶対に記載しないでください。',
    });

    // Build user message with optional price history context
    let userMessage = message;
    if (priceHistory && priceHistory.length > 0) {
      const contextData = JSON.stringify(priceHistory, null, 2);
      userMessage = `以下は最近の価格履歴データです：

${contextData}

ユーザーの質問: ${message}

【重要な指示】
- 必ずGoogle検索を使って、リアルタイムの最新情報を取得してください
- 架空の情報や予測ではなく、実際のニュースや事実に基づいて回答してください
- 検索結果がない場合は、その旨を明示してください

上記のデータと検索結果を参考にして、専門的かつフレンドリーに回答してください。`;
    } else {
      userMessage = `【重要な指示】
- 必ずGoogle検索を使って、リアルタイムの最新情報を取得してください
- 架空の情報や予測ではなく、実際のニュースや事実に基づいて回答してください
- 検索結果がない場合は、その旨を明示してください

ユーザーの質問: ${message}`;
    }

    messages.push({
      role: 'user',
      content: userMessage,
    });

    console.log('Calling Vertex AI with REST API...');

    // Call Vertex AI REST API with grounding
    const response = await generateContentWithGrounding(messages, {
      temperature: 1.0, // Google recommends 1.0 for best grounding results
      topP: 0.7,
      maxOutputTokens: 8192,
      model: 'gemini-2.5-pro',
    });

    console.log('Response received:', {
      answerLength: response.answer.length,
      groundingInfoCount: response.groundingInfo.length,
      searchQueriesCount: response.searchQueries?.length || 0,
    });

    // Return response with grounding metadata
    return NextResponse.json({
      answer: response.answer,
      groundingInfo: response.groundingInfo,
      searchQueries: response.searchQueries,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
