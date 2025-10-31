// --- Filename: generative-ai.ts (or rename your old file) ---

import { Question } from '../types';

// --- 1. Update your Environment Variables ---
// Safely access OpenRouter-specific variables.
// Make sure to create these in your .env file!



// Safely access the environment variable. In the target environment, this will be populated.
const GEMINI_API_KEY =
  typeof import.meta.env.VITE_GEMINI_API_KEY !== 'undefined'
    ? import.meta.env.VITE_GEMINI_API_KEY
    : '';

// In a development environment, it's helpful to know if the key is missing.
if (!GEMINI_API_KEY && import.meta.env.DEV) {
  console.warn('VITE_GEMINI_API_KEY is not set in your .env file.');
}

// Gemini REST API base URL and a stable model version
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL = 'gemini-2.5-flash-preview-09-2025';

/**
 * @interface GeminiOptions
 * @description Defines the options for making a call to the Gemini API.
 * @property {number} [maxTokens] - The maximum number of tokens to generate.
 * @property {object} [generationConfig] - Advanced configuration for the generation request,
 * including settings like `responseMimeType` for JSON mode.
 */
interface GeminiOptions {
  maxTokens?: number;
  generationConfig?: object;
}

/**
 * A more robust and flexible function to call the Gemini API.
 * It includes detailed error logging and support for different response types.
 * @param {string} prompt - The text prompt to send to the model.
 * @param {GeminiOptions} [options={}] - Configuration for the API call.
 * @returns {Promise<string>} The text response from the model.
 */
async function callGemini(prompt: string, options: GeminiOptions = {}): Promise<string> {
  const url = `${GEMINI_BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const { maxTokens = 2048, generationConfig = {} } = options;

  // Default configuration merged with any custom options provided.
  const config = {
    maxOutputTokens: maxTokens,
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    ...generationConfig,
  };

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: config,
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error response:', errorText);
    throw new Error(`Gemini API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];

  // This is the crucial part: check *why* content might be missing.
  if (!candidate || !candidate.content?.parts?.[0]?.text) {
    const finishReason = candidate?.finishReason || 'REASON_UNSPECIFIED';
    const safetyRatings = JSON.stringify(candidate?.safetyRatings || 'N/A');
    console.error('Gemini API returned no content:', {
      finishReason,
      safetyRatings,
      responseData: data,
    });
    throw new Error(`No content returned from Gemini. Finish Reason: ${finishReason}`);
  }

  return candidate.content.parts[0].text.trim();
}




const OPENROUTER_API_KEY = typeof import.meta.env.VITE_OPENROUTER_API_KEY !== 'undefined'
  ? import.meta.env.VITE_OPENROUTER_API_KEY
  : '';

// OpenRouter requires a Referer header. 
// Set this to your app's URL in production, or localhost for dev.
const APP_URL = typeof import.meta.env.VITE_APP_URL !== 'undefined'
  ? import.meta.env.VITE_APP_URL
  : 'http://localhost:5173'; // Default for Vite dev

// Optional: Set a name for your app to see in OpenRouter logs
const APP_NAME = typeof import.meta.env.VITE_APP_NAME !== 'undefined'
  ? import.meta.env.VITE_APP_NAME
  : 'My CS Tutor App';

if (!OPENROUTER_API_KEY && import.meta.env.DEV) {
  console.warn('VITE_OPENROUTER_API_KEY is not set in your .env file.');
}

// --- 2. Update API Constants ---
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'nvidia/nemotron-nano-12b-v2-vl:free'; // Your chosen model

// --- 3. Re-add Backoff Helpers ---
const MAX_RETRIES = 5;
const INITIAL_BACKOFF_MS = 100;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * @interface AIOptions
 * @description Defines options for any AI model call via OpenRouter.
 */
interface AIOptions {
  model: string;
  maxTokens?: number;
  generationConfig?: {
    responseMimeType?: string;
    // Note: responseSchema is not supported by OpenAI-compatible APIs
    [key: string]: any; // Allow other properties
  };
}

/**
 * A robust, generic function to call any OpenAI-compatible API (like OpenRouter).
 * Includes exponential backoff for rate limits.
 * @param {string} prompt - The text prompt to send to the model.
 * @param {AIOptions} options - Configuration for the API call, including the model.
 * @returns {Promise<string>} The text response from the model.
 */
async function callGenerativeAI(prompt: string, options: AIOptions): Promise<string> {
  const { model, maxTokens = 2048, generationConfig = {} } = options;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'HTTP-Referer': APP_URL, // Required by OpenRouter
    'X-Title': APP_NAME,     // Optional, for logging
  };

  // --- 4. Build the OpenAI-compatible Payload ---
  const payload: any = {
    model: model,
    messages: [
      { role: 'user', content: prompt }
    ],
    max_tokens: maxTokens,
    temperature: 0.7,
    top_p: 0.95,
  };

  // --- 5. Translate Google's JSON mode to OpenAI's JSON mode ---
  if (generationConfig.responseMimeType === 'application/json') {
    payload.response_format = { type: 'json_object' };
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(OPENROUTER_BASE_URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
      });

      // Handle rate limits (429)
      if (response.status === 429) {
        const backoffTime = INITIAL_BACKOFF_MS * Math.pow(2, attempt) + Math.random() * 1000;
        console.warn(`[AI API] Rate limit hit. Retrying in ${Math.round(backoffTime / 1000)}s...`);
        lastError = new Error(`AI API request failed: ${response.status} ${response.statusText} (Rate Limited)`);
        await sleep(backoffTime);
        continue;
      }

      // Handle other errors
      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI API error response:', errorText);
        lastError = new Error(`AI API request failed: ${response.status} ${response.statusText}`);
        break;
      }

      const data = await response.json();

      // --- 6. Parse the OpenAI-compatible Response ---
      const content = data.choices?.[0]?.message?.content;
      const finishReason = data.choices?.[0]?.finish_reason;

      if (!content) {
        console.error('AI API returned no content:', { finishReason, responseData: data });
        lastError = new Error(`No content returned from AI. Finish Reason: ${finishReason || 'REASON_UNSPECIFIED'}`);
        if (finishReason === 'safety' || finishReason === 'content_filter') {
          break; // Don't retry safety blocks
        }
        throw lastError;
      }

      // Success!
      return content.trim();

    } catch (error) {
      // Type-safe error handling
      let errorMessage = "An unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
        lastError = error;
      } else {
        lastError = new Error(String(error));
        errorMessage = String(error);
      }
      console.error(`[AI API] Network or unexpected error on attempt ${attempt + 1}:`, errorMessage);

    
    }
  }

  // If we've failed all retries
  console.error("[AI API] Call failed after all retries.");
  throw lastError || new Error("AI API call failed after all retries.");
}

// --- 7. Update Exported Functions to use the new callGenerativeAI ---

/**
 * Fetches educational content for a given subject and topic.
 */
export async function fetchLearnContent(subject: string, topic: string): Promise<string> {
  const prompt = `You are an expert computer science tutor. Provide a clear, structured explanation of the topic "${topic}" in ${subject}.
Include:
1. Definition (concise, 2-3 sentences)
2. Key Concepts (3-5 bullet points)
3. Example (with code if applicable)
4. Common Use Cases (2-3 scenarios)
IMPORTANT: The entire response must be in English.
Keep the explanation educational, accurate, and suitable for undergraduate CS students. Use clear formatting with headers and bullet points.`;

  // Use the new function and default model
  return callGenerativeAI(prompt, {
    model: DEFAULT_MODEL,
    maxTokens: 4096
  });
}

/**
 * Fetches multiple-choice quiz questions using reliable JSON mode.
 */
/**
 * Fetches multiple-choice quiz questions using Gemini's reliable JSON mode.
 */
export async function fetchTestQuestions(
  subject: string,
  topic: string
): Promise<Question[]> {
  const prompt = `Generate exactly 5 multiple-choice quiz questions about "${topic}" in "${subject}".`;

  // Define the schema for the expected JSON output. This makes the response reliable.
  const schema = {
    type: 'ARRAY',
    description: 'A list of 5 multiple-choice questions.',
    items: {
      type: 'OBJECT',
      properties: {
        question: { type: 'STRING', description: 'The question text.' },
        options: {
          type: 'ARRAY',
          description: 'An array of exactly 4 possible answer strings.',
          items: { type: 'STRING' },
        },
        correct: {
          type: 'STRING',
          description: "The letter of the correct option (e.g., 'A', 'B', 'C', 'D').",
        },
        explanation: {
          type: 'STRING',
          description: 'A detailed explanation for the correct answer.',
        },
      },
      required: ['question', 'options', 'correct', 'explanation'],
    },
  };

  const responseText = await callGemini(prompt, {
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: schema,
    },
    maxTokens: 8192, // Use a higher token limit for potentially large JSON responses
  });

  try {
    const parsed = JSON.parse(responseText);

    if (!Array.isArray(parsed)) {
      throw new Error('AI response was not a valid array of questions.');
    }

    // The original validation logic is still a good safeguard.
    const validated: Question[] = [];
    for (const item of parsed) {
      if (
        typeof item === 'object' &&
        item !== null &&
        typeof item.question === 'string' &&
        Array.isArray(item.options) &&
        item.options.length === 4 &&
        item.options.every((opt: unknown) => typeof opt === 'string') &&
        typeof item.correct === 'string' &&
        ['A', 'B', 'C', 'D'].includes(item.correct) &&
        typeof item.explanation === 'string'
      ) {
        // Ensure options are consistently formatted (e.g., "A) ...")
        const letters = ['A', 'B', 'C', 'D'];
        const formattedOptions = item.options.map((opt: string, index: number) => {
          return opt.match(/^[A-D]\)\s/) ? opt : `${letters[index]}) ${opt}`;
        });
        validated.push({ ...item, options: formattedOptions });
      }
    }

    if (validated.length === 0) {
      throw new Error('No valid questions could be parsed from the AI response.');
    }

    return validated;
  } catch (error) {
    console.error('Failed to parse AI JSON response:', responseText, error);
    throw new Error('Failed to generate valid quiz questions due to a parsing error.');
  }
}

/**
 * Fetches an answer to a specific student question.
 */
export async function askQuestion(subject: string, topic: string, question: string): Promise<string> {
  const prompt = `You are an expert computer science tutor. The student is learning about "${topic}" in ${subject}.
Student question: ${question}
Provide a clear, concise, and accurate answer. Be pedagogical and helpful. If relevant, include examples or code snippets. Keep your response focused and under 300 words.`;

  return callGenerativeAI(prompt, {
    model: DEFAULT_MODEL,
    maxTokens: 1000
  });
}