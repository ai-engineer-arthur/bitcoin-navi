import { GoogleAuth } from 'google-auth-library';

/**
 * Vertex AI REST API Client for Gemini
 *
 * This client directly calls the Vertex AI REST API endpoint
 * to ensure proper Google Search grounding functionality.
 */

interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

interface GroundingChunk {
  web?: {
    uri: string;
    title?: string;
  };
}

interface GroundingMetadata {
  webSearchQueries?: string[];
  groundingChunks?: GroundingChunk[];
  groundingSupports?: Array<{
    segment: {
      startIndex: number;
      endIndex: number;
      text: string;
    };
    groundingChunkIndices: number[];
    confidenceScores: number[];
  }>;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
      role: string;
    };
    groundingMetadata?: GroundingMetadata;
    finishReason: string;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export interface ChatResponse {
  answer: string;
  groundingInfo: Array<{
    uri: string;
    title: string;
  }>;
  searchQueries?: string[];
}

/**
 * Get access token using Application Default Credentials
 */
async function getAccessToken(): Promise<string> {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const client = await auth.getClient();
  const token = await client.getAccessToken();

  if (!token.token) {
    throw new Error('Failed to get access token');
  }

  return token.token;
}

/**
 * Call Vertex AI Gemini API with Google Search grounding
 *
 * @param messages - Conversation history
 * @param options - Generation options
 * @returns Chat response with grounding information
 */
export async function generateContentWithGrounding(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  options: {
    temperature?: number;
    topP?: number;
    maxOutputTokens?: number;
    model?: string;
  } = {}
): Promise<ChatResponse> {
  const {
    temperature = 1.0, // Google recommends 1.0 for grounding
    topP = 0.7,
    maxOutputTokens = 8192,
    model = 'gemini-2.5-pro',
  } = options;

  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

  if (!projectId) {
    throw new Error('GOOGLE_CLOUD_PROJECT is not set');
  }

  // Build endpoint URL
  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;

  // Convert messages to Gemini format
  const contents: GeminiMessage[] = messages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  // Build request body
  const requestBody = {
    contents,
    generationConfig: {
      temperature,
      topP,
      maxOutputTokens,
    },
    tools: [
      {
        googleSearch: {}, // Enable Google Search grounding
      },
    ],
  };

  console.log('Vertex AI Request:', {
    endpoint,
    model,
    messageCount: messages.length,
    temperature,
    topP,
  });

  // Get access token
  const token = await getAccessToken();

  // Call REST API
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Vertex AI API Error:', errorText);
    throw new Error(`Vertex AI API error: ${response.status} ${response.statusText}`);
  }

  const json: GeminiResponse = await response.json();

  console.log('Vertex AI Response received:', {
    hasCandidates: !!json.candidates,
    candidateCount: json.candidates?.length,
    hasGroundingMetadata: !!json.candidates?.[0]?.groundingMetadata,
  });

  // Parse response
  if (!json.candidates || json.candidates.length === 0) {
    throw new Error('No candidates in response');
  }

  const candidate = json.candidates[0];

  // Extract answer text
  let answer = '';
  if (candidate.content && candidate.content.parts) {
    answer = candidate.content.parts
      .filter((part) => part.text)
      .map((part) => part.text)
      .join('\n');
  }

  // Remove reference numbers like [1], [2] from answer
  answer = answer.replace(/\[\d+\]\s*/g, '');

  // Extract grounding information
  const groundingInfo: Array<{ uri: string; title: string }> = [];
  const searchQueries: string[] = [];

  if (candidate.groundingMetadata) {
    const metadata = candidate.groundingMetadata;

    console.log('Grounding Metadata:', {
      hasWebSearchQueries: !!metadata.webSearchQueries,
      queryCount: metadata.webSearchQueries?.length || 0,
      hasGroundingChunks: !!metadata.groundingChunks,
      chunkCount: metadata.groundingChunks?.length || 0,
    });

    // Extract search queries
    if (metadata.webSearchQueries) {
      searchQueries.push(...metadata.webSearchQueries);
    }

    // Extract grounding chunks (up to 15)
    if (metadata.groundingChunks) {
      for (let i = 0; i < Math.min(15, metadata.groundingChunks.length); i++) {
        const chunk = metadata.groundingChunks[i];
        if (chunk.web?.uri) {
          groundingInfo.push({
            uri: chunk.web.uri,
            title: chunk.web.title || 'No Title',
          });
        }
      }
    }
  } else {
    console.warn('No grounding metadata in response - search may not have been performed');
  }

  return {
    answer: answer || 'No answer generated',
    groundingInfo,
    searchQueries,
  };
}
